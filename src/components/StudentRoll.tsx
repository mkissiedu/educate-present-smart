import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createStudent, fetchStudents, updateStudent, deleteStudent } from '../lib/supabase-students';
import { Student } from '../types/student';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { CLASS_LEVELS, ClassLevel } from '@/types/user';
import { User, Phone, Calendar, Edit2, Trash2, X, Save } from 'lucide-react';

interface Props {
  assignedClasses?: ClassLevel[];
}

export const StudentRoll: React.FC<Props> = ({ assignedClasses }) => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [showForm, setShowForm] = useState(false);
  const availableClasses = assignedClasses && assignedClasses.length > 0 ? assignedClasses : CLASS_LEVELS;
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', class_level: availableClasses[0] || 'KG 1', date_of_birth: '',
    guardian1_name: '', guardian1_whatsapp: '', guardian2_name: '', guardian2_whatsapp: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => { loadStudents(); }, [user, assignedClasses]);

  const loadStudents = async () => {
    if (!user) return;
    try {
      const data = await fetchStudents(user.id);
      // Filter by assigned classes if provided
      const filtered = assignedClasses && assignedClasses.length > 0
        ? data.filter(s => assignedClasses.includes(s.class_level as ClassLevel))
        : data;
      setStudents(filtered);
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      if (editingId) await updateStudent(editingId, formData);
      else await createStudent({ ...formData, teacher_id: user.id });
      loadStudents(); resetForm();
    } catch (e) { console.error(e); }
  };

  const handleEdit = (s: Student) => {
    setFormData({
      first_name: s.first_name, last_name: s.last_name, class_level: s.class_level,
      date_of_birth: s.date_of_birth || '', guardian1_name: s.guardian1_name || '',
      guardian1_whatsapp: s.guardian1_whatsapp || '', guardian2_name: s.guardian2_name || '',
      guardian2_whatsapp: s.guardian2_whatsapp || ''
    });
    setEditingId(s.id); setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ first_name: '', last_name: '', class_level: availableClasses[0] || 'KG 1', date_of_birth: '',
      guardian1_name: '', guardian1_whatsapp: '', guardian2_name: '', guardian2_whatsapp: '' });
    setShowForm(false); setEditingId(null);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-white">Student Roll</h2>
        <Button onClick={() => setShowForm(!showForm)} size="sm">{showForm ? <X className="w-4 h-4" /> : 'Add Student'}</Button>
      </div>

      {showForm && (
        <Card className="p-4 mb-4 bg-white/90">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="First Name *" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} required />
              <Input placeholder="Last Name *" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select className="w-full p-2 border rounded text-sm" value={formData.class_level} onChange={(e) => setFormData({...formData, class_level: e.target.value})}>
                {availableClasses.map(level => <option key={level} value={level}>{level}</option>)}
              </select>
              <Input type="date" placeholder="Date of Birth" value={formData.date_of_birth} onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})} />
            </div>
            <div className="border-t pt-3 mt-3">
              <p className="text-sm font-semibold text-gray-700 mb-2">Parent/Guardian 1</p>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Name" value={formData.guardian1_name} onChange={(e) => setFormData({...formData, guardian1_name: e.target.value})} />
                <Input placeholder="WhatsApp" value={formData.guardian1_whatsapp} onChange={(e) => setFormData({...formData, guardian1_whatsapp: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm"><Save className="w-4 h-4 mr-1" />{editingId ? 'Update' : 'Save'}</Button>
              <Button type="button" variant="outline" size="sm" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {students.map(s => (
          <Card key={s.id} className="p-3 bg-white/90">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-gray-800">{s.first_name} {s.last_name}</h3>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{s.class_level}</span>
                </div>
                {s.guardian1_name && <p className="text-xs text-gray-600 flex items-center gap-1 mt-1"><Phone className="w-3 h-3 text-green-600" />{s.guardian1_name}</p>}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(s)}><Edit2 className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => deleteStudent(s.id).then(loadStudents)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
              </div>
            </div>
          </Card>
        ))}
        {students.length === 0 && <p className="text-center text-white/60 py-8">No students in your assigned classes</p>}
      </div>
    </div>
  );
};
