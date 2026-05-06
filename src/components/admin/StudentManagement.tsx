import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Student } from '@/types/student';
import { CLASS_LEVELS } from '@/types/user';
import { fetchStudents, createStudent, updateStudent, deleteStudent } from '@/lib/supabase-students';
import { Edit2, Trash2, UserPlus, Loader2, Search, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';


export const StudentManagement: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentSchool } = useSchool();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [form, setForm] = useState({ first_name: '', last_name: '', class_level: 'KG 1', student_id: '', date_of_birth: '', guardian1_name: '', guardian1_whatsapp: '', guardian2_name: '', guardian2_whatsapp: '' });




  useEffect(() => { loadStudents(); }, [currentSchool]);

  const loadStudents = async () => {
    setLoading(true);
    const data = await fetchStudents(currentSchool?.id);
    setStudents(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, { ...form, name: `${form.first_name} ${form.last_name}` });
        toast({ title: 'Student updated!' });
      } else {
        await createStudent({ ...form, name: `${form.first_name} ${form.last_name}`, teacher_id: user?.id || '', school_id: currentSchool?.id });
        toast({ title: 'Student created!' });
      }
      loadStudents();
      setShowForm(false);
    } catch (err: any) {
      toast({ title: err.message || 'Error saving student', variant: 'destructive' });
    }
    setSaving(false);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setForm({ first_name: student.first_name, last_name: student.last_name, class_level: student.class_level, student_id: student.student_id || '', date_of_birth: student.date_of_birth || '', guardian1_name: student.guardian1_name || '', guardian1_whatsapp: student.guardian1_whatsapp || '', guardian2_name: student.guardian2_name || '', guardian2_whatsapp: student.guardian2_whatsapp || '' });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this student?')) {
      await deleteStudent(id);
      toast({ title: 'Student deleted' });
      loadStudents();
    }
  };

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchClass = filterClass === 'All' || s.class_level === filterClass;
    return matchSearch && matchClass;
  });

  const classCounts = CLASS_LEVELS.reduce((acc, c) => { acc[c] = students.filter(s => s.class_level === c).length; return acc; }, {} as Record<string, number>);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><Users className="w-5 h-5" /> Student Management</h2>
        <Button onClick={() => { setEditingStudent(null); setForm({ first_name: '', last_name: '', class_level: 'KG 1', student_id: '', date_of_birth: '', guardian1_name: '', guardian1_whatsapp: '', guardian2_name: '', guardian2_whatsapp: '' }); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="w-4 h-4 mr-2" /> Add Student
        </Button>
      </div>
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." className="pl-10 bg-white/10 border-white/20 text-white" />
        </div>
        <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20">
          <option value="All" className="text-gray-900">All Classes ({students.length})</option>
          {CLASS_LEVELS.map(c => <option key={c} value={c} className="text-gray-900">{c} ({classCounts[c] || 0})</option>)}
        </select>
      </div>
      {loading ? <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-white" /></div> : (
        <div className="grid gap-2 max-h-[400px] overflow-y-auto">
          {filtered.map(s => (
            <div key={s.id} className="bg-white/10 rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">{s.name}</div>
                <div className="text-xs text-gray-400">{s.class_level} • ID: {s.student_id || 'N/A'}</div>
                {s.guardian1_whatsapp && <div className="text-xs text-green-400">Guardian: {s.guardian1_whatsapp}</div>}
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => handleEdit(s)} className="text-blue-400 p-1" title="Edit"><Edit2 className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(s.id)} className="text-red-400 p-1" title="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-gray-900">{editingStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-gray-700">First Name</Label><Input value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} required className="bg-gray-50 border-gray-300 text-gray-900" /></div>
              <div><Label className="text-gray-700">Last Name</Label><Input value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} required className="bg-gray-50 border-gray-300 text-gray-900" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-gray-700">Class</Label><select value={form.class_level} onChange={e => setForm({ ...form, class_level: e.target.value })} className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900">{CLASS_LEVELS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div><Label className="text-gray-700">Student ID</Label><Input value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })} className="bg-gray-50 border-gray-300 text-gray-900" /></div>
            </div>
            <div><Label className="text-gray-700">Date of Birth</Label><Input type="date" value={form.date_of_birth} onChange={e => setForm({ ...form, date_of_birth: e.target.value })} className="bg-gray-50 border-gray-300 text-gray-900" /></div>
            <div className="border-t border-gray-200 pt-3"><Label className="text-emerald-600 font-semibold">Guardian 1</Label></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-gray-700">Name</Label><Input value={form.guardian1_name} onChange={e => setForm({ ...form, guardian1_name: e.target.value })} className="bg-gray-50 border-gray-300 text-gray-900" /></div>
              <div><Label className="text-gray-700">WhatsApp</Label><Input value={form.guardian1_whatsapp} onChange={e => setForm({ ...form, guardian1_whatsapp: e.target.value })} placeholder="+233..." className="bg-gray-50 border-gray-300 text-gray-900" /></div>
            </div>
            <div className="border-t border-gray-200 pt-3"><Label className="text-emerald-600 font-semibold">Guardian 2</Label></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-gray-700">Name</Label><Input value={form.guardian2_name} onChange={e => setForm({ ...form, guardian2_name: e.target.value })} className="bg-gray-50 border-gray-300 text-gray-900" /></div>
              <div><Label className="text-gray-700">WhatsApp</Label><Input value={form.guardian2_whatsapp} onChange={e => setForm({ ...form, guardian2_whatsapp: e.target.value })} placeholder="+233..." className="bg-gray-50 border-gray-300 text-gray-900" /></div>
            </div>
            <Button type="submit" disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white">{saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}{editingStudent ? 'Update' : 'Create'} Student</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
