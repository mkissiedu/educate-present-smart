import React, { useState, useEffect } from 'react';
import { SchoolClass } from '@/types/schedule';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Trash2, Edit2, School } from 'lucide-react';
import { fetchSystemClassDefinitions, getStudentCountsByClasses, SystemClassDefinition } from '@/lib/supabase-class-definitions';
import { DEFAULT_CLASSES } from '@/lib/curriculum-defaults';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  classes: SchoolClass[];
  teachers: { id: string; name: string }[];
  onSave: (cls: Partial<SchoolClass>) => void;
  onDelete: (id: string) => void;
}

export const ClassManager: React.FC<Props> = ({ classes, teachers, onSave, onDelete }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<SchoolClass | null>(null);
  const [form, setForm] = useState({ name: '', grade_level: '', section: '', capacity: 40, room_number: '', class_teacher_id: '' });
  const [classDefs, setClassDefs] = useState<SystemClassDefinition[]>([]);
  const [studentCounts, setStudentCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadClassDefinitions();
    loadStudentCounts();
  }, [user?.school_id]);

  const loadClassDefinitions = async () => {
    const defs = await fetchSystemClassDefinitions();
    if (defs.length > 0) {
      setClassDefs(defs);
    } else {
      // Fallback to default classes from curriculum
      const fallbackDefs: SystemClassDefinition[] = DEFAULT_CLASSES.map((c, i) => ({
        id: `default-${i}`,
        name: c.name,
        grade_level: c.grade_level,
        category: c.category,
        display_order: c.display_order,
        is_active: true
      }));
      setClassDefs(fallbackDefs);
    }
  };

  const loadStudentCounts = async () => {
    const counts = await getStudentCountsByClasses(user?.school_id);
    setStudentCounts(counts);
  };

  const handleClassSelect = (defId: string) => {
    const def = classDefs.find(d => d.id === defId);
    if (def) {
      setForm({ ...form, name: def.name, grade_level: def.grade_level });
    }
  };

  const handleSubmit = () => {
    onSave({ ...form, id: editing?.id, is_active: true });
    setIsOpen(false);
    setEditing(null);
    setForm({ name: '', grade_level: '', section: '', capacity: 40, room_number: '', class_teacher_id: '' });
  };

  const openEdit = (c: SchoolClass) => {
    setEditing(c);
    setForm({ name: c.name, grade_level: c.grade_level, section: c.section || '', capacity: c.capacity, room_number: c.room_number || '', class_teacher_id: c.class_teacher_id || '' });
    setIsOpen(true);
  };

  const getEnrollment = (gradeLevel: string) => studentCounts[gradeLevel] || 0;

  // Group classes by category
  const groupedClasses = classDefs.reduce((acc, cls) => {
    const cat = cls.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(cls);
    return acc;
  }, {} as Record<string, SystemClassDefinition[]>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2"><School className="w-5 h-5" /> Classes</h3>
        <Button size="sm" onClick={() => { setEditing(null); setForm({ name: '', grade_level: '', section: '', capacity: 40, room_number: '', class_teacher_id: '' }); setIsOpen(true); }}>
          <Plus className="w-4 h-4 mr-1" /> Add Class
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {classes.map((c) => (
          <div key={c.id} className="bg-white/10 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-white">{c.name}</div>
                <div className="text-sm text-emerald-400">{c.grade_level} {c.section && `- ${c.section}`}</div>
                <div className="text-xs text-gray-400 mt-1">Room: {c.room_number || 'N/A'}</div>
                <div className="text-xs text-blue-400 mt-1 flex items-center gap-1">
                  <Users className="w-3 h-3" /> On Roll: {getEnrollment(c.grade_level)}
                </div>
                {c.class_teacher_id && <div className="text-xs text-amber-400 mt-1">Teacher: {teachers.find(t => t.id === c.class_teacher_id)?.name || 'Assigned'}</div>}
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => openEdit(c)}><Edit2 className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" className="text-red-400" onClick={() => onDelete(c.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {classes.length === 0 && <p className="text-gray-400 text-center py-4">No classes defined. Add classes to create schedules.</p>}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader><DialogTitle className="text-white">{editing ? 'Edit Class' : 'Add Class'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-300 mb-1 block">Select Class (13 Classes: Nursery 1 to JHS 3)</label>
              <Select value={classDefs.find(d => d.name === form.name)?.id || ''} onValueChange={handleClassSelect}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue placeholder="Select a class" /></SelectTrigger>
                <SelectContent className="max-h-80">
                  {Object.entries(groupedClasses).map(([category, items]) => (
                    <div key={category}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-100">{category}</div>
                      {items.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Section (A, B, etc.)" value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} className="bg-white/10 border-white/20 text-white" />
              <Input placeholder="Room Number" value={form.room_number} onChange={e => setForm({ ...form, room_number: e.target.value })} className="bg-white/10 border-white/20 text-white" />
            </div>
            <Select value={form.class_teacher_id} onValueChange={v => setForm({ ...form, class_teacher_id: v })}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue placeholder="Assign Class Teacher" /></SelectTrigger>
              <SelectContent>{teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
            </Select>
            <Button onClick={handleSubmit} disabled={!form.name} className="w-full">{editing ? 'Update' : 'Add'} Class</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
