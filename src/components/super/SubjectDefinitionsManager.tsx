import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, Trash2, Edit2, RefreshCw, Sparkles } from 'lucide-react';
import { fetchSystemSubjectDefinitions, saveSystemSubjectDefinition, deleteSystemSubjectDefinition, seedDefaultSubjects, SystemSubjectDefinition, fetchSystemClassDefinitions } from '@/lib/supabase-class-definitions';
import { DEFAULT_CLASSES, DEFAULT_SUBJECTS } from '@/lib/curriculum-defaults';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

export const SubjectDefinitionsManager: React.FC = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<SystemSubjectDefinition[]>([]);
  const [classes, setClasses] = useState<{ grade_level: string; name: string }[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<SystemSubjectDefinition | null>(null);
  const [form, setForm] = useState({ name: '', code: '', applicable_classes: [] as string[], display_order: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [subjs, clss] = await Promise.all([fetchSystemSubjectDefinitions(), fetchSystemClassDefinitions()]);
    setSubjects(subjs);
    setClasses(clss.map(c => ({ grade_level: c.grade_level, name: c.name })));
    setLoading(false);
  };

  const handleSubmit = async () => {
    const result = await saveSystemSubjectDefinition({ ...form, id: editing?.id, created_by: user?.id, is_active: true });
    if (result) {
      toast({ title: editing ? 'Subject Updated' : 'Subject Added' });
      loadData();
      setIsOpen(false);
      setEditing(null);
      setForm({ name: '', code: '', applicable_classes: [], display_order: 0 });
    }
  };

  const handleDelete = async (id: string) => {
    if (id.startsWith('default-')) {
      toast({ title: 'Cannot delete default subject', variant: 'destructive' });
      return;
    }
    if (confirm('Delete this subject?')) {
      await deleteSystemSubjectDefinition(id);
      toast({ title: 'Subject Deleted' });
      loadData();
    }
  };

  const openEdit = (subj: SystemSubjectDefinition) => {
    setEditing(subj);
    setForm({ name: subj.name, code: subj.code, applicable_classes: subj.applicable_classes || [], display_order: subj.display_order });
    setIsOpen(true);
  };

  const toggleClass = (gradeLevel: string) => {
    setForm(f => ({
      ...f,
      applicable_classes: f.applicable_classes.includes(gradeLevel)
        ? f.applicable_classes.filter(c => c !== gradeLevel)
        : [...f.applicable_classes, gradeLevel]
    }));
  };

  const resetToDefaults = async () => {
    if (confirm('Reset all subjects to NaCCA curriculum defaults (14 subjects)?')) {
      for (const subj of subjects) {
        if (!subj.id.startsWith('default-')) await deleteSystemSubjectDefinition(subj.id);
      }
      await seedDefaultSubjects(user?.id);
      loadData();
      toast({ title: 'Subjects reset to NaCCA defaults' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2"><BookOpen className="w-5 h-5" /> System Subjects ({subjects.length})</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={resetToDefaults} className="text-amber-400 border-amber-400/50"><RefreshCw className="w-4 h-4 mr-1" /> Reset</Button>
          <Button size="sm" onClick={() => { setEditing(null); setForm({ name: '', code: '', applicable_classes: [], display_order: subjects.length + 1 }); setIsOpen(true); }}><Plus className="w-4 h-4 mr-1" /> Add</Button>
        </div>
      </div>
      <p className="text-sm text-gray-400 flex items-center gap-1"><Sparkles className="w-4 h-4 text-amber-400" /> {DEFAULT_SUBJECTS.length} subjects from NaCCA curriculum for 13 classes (Nursery 1 to JHS 3).</p>

      {loading ? <p className="text-gray-400">Loading...</p> : (
        <div className="grid md:grid-cols-2 gap-3">
          {subjects.map(subj => (
            <div key={subj.id} className="bg-white/10 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-medium text-white">{subj.name}</div>
                  <div className="text-xs text-emerald-400">{subj.code}</div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(subj)} className="h-7 w-7 p-0"><Edit2 className="w-3 h-3" /></Button>
                  {!subj.id.startsWith('default-') && <Button size="sm" variant="ghost" onClick={() => handleDelete(subj.id)} className="h-7 w-7 p-0 text-red-400"><Trash2 className="w-3 h-3" /></Button>}
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {subj.applicable_classes?.map(cls => (
                  <Badge key={cls} variant="secondary" className="text-xs bg-white/20">{cls}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
          <DialogHeader><DialogTitle className="text-white">{editing ? 'Edit' : 'Add'} Subject</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Subject Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-white/10 border-white/20 text-white" />
            <Input placeholder="Code (e.g., MATH)" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} className="bg-white/10 border-white/20 text-white" />
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Applicable Classes (13 classes)</label>
              <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                {classes.map(cls => (
                  <Badge key={cls.grade_level} variant={form.applicable_classes.includes(cls.grade_level) ? 'default' : 'outline'}
                    className="cursor-pointer" onClick={() => toggleClass(cls.grade_level)}>{cls.name}</Badge>
                ))}
              </div>
            </div>
            <Button onClick={handleSubmit} disabled={!form.name || !form.code} className="w-full">{editing ? 'Update' : 'Add'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
