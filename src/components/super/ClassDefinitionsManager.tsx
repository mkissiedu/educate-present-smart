import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { School, Plus, Trash2, Edit2, RefreshCw, Sparkles } from 'lucide-react';
import { fetchSystemClassDefinitions, saveSystemClassDefinition, deleteSystemClassDefinition, resetToDefaultClasses, SystemClassDefinition } from '@/lib/supabase-class-definitions';
import { DEFAULT_CLASSES } from '@/lib/curriculum-defaults';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

const CATEGORIES = ['Pre-School', 'Kindergarten', 'Lower Primary', 'Upper Primary', 'JHS'];

export const ClassDefinitionsManager: React.FC = () => {
  const { user } = useAuth();
  const [definitions, setDefinitions] = useState<SystemClassDefinition[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<SystemClassDefinition | null>(null);
  const [form, setForm] = useState({ name: '', grade_level: '', category: '', display_order: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDefinitions(); }, []);

  const loadDefinitions = async () => {
    setLoading(true);
    const defs = await fetchSystemClassDefinitions();
    setDefinitions(defs);
    setLoading(false);
  };

  const handleSubmit = async () => {
    const result = await saveSystemClassDefinition({ ...form, id: editing?.id, created_by: user?.id, is_active: true });
    if (result) {
      toast({ title: editing ? 'Class Updated' : 'Class Added' });
      loadDefinitions();
      setIsOpen(false);
      setEditing(null);
      setForm({ name: '', grade_level: '', category: '', display_order: 0 });
    }
  };

  const handleDelete = async (id: string) => {
    if (id.startsWith('default-')) {
      toast({ title: 'Cannot delete default class', variant: 'destructive' });
      return;
    }
    if (confirm('Delete this class definition?')) {
      await deleteSystemClassDefinition(id);
      toast({ title: 'Class Deleted' });
      loadDefinitions();
    }
  };

  const openEdit = (def: SystemClassDefinition) => {
    setEditing(def);
    setForm({ name: def.name, grade_level: def.grade_level, category: def.category || '', display_order: def.display_order });
    setIsOpen(true);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', grade_level: '', category: '', display_order: definitions.length + 1 });
    setIsOpen(true);
  };

  const handleResetToDefaults = async () => {
    if (confirm('Reset all classes to NaCCA curriculum defaults (13 classes: Nursery 1 to JHS 3)?')) {
      await resetToDefaultClasses(user?.id);
      loadDefinitions();
      toast({ title: 'Classes reset to 13 NaCCA defaults' });
    }
  };

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = definitions.filter(d => d.category === cat);
    return acc;
  }, {} as Record<string, SystemClassDefinition[]>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2"><School className="w-5 h-5" /> System Classes (13 Classes)</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleResetToDefaults} className="text-amber-400 border-amber-400/50"><RefreshCw className="w-4 h-4 mr-1" /> Reset</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" /> Add</Button>
        </div>
      </div>
      <p className="text-sm text-gray-400 flex items-center gap-1"><Sparkles className="w-4 h-4 text-amber-400" /> 13 classes from NaCCA curriculum (Nursery 1 to JHS 3). School admins select from this list.</p>

      {loading ? <p className="text-gray-400">Loading...</p> : (
        <div className="space-y-4">
          {CATEGORIES.map(cat => grouped[cat]?.length > 0 && (
            <div key={cat}>
              <h4 className="text-sm font-medium text-amber-400 mb-2">{cat}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {grouped[cat].map(def => (
                  <div key={def.id} className="bg-white/10 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white text-sm">{def.name}</div>
                      <div className="text-xs text-emerald-400">{def.grade_level}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(def)} className="h-7 w-7 p-0"><Edit2 className="w-3 h-3" /></Button>
                      {!def.id.startsWith('default-') && <Button size="sm" variant="ghost" onClick={() => handleDelete(def.id)} className="h-7 w-7 p-0 text-red-400"><Trash2 className="w-3 h-3" /></Button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader><DialogTitle className="text-white">{editing ? 'Edit' : 'Add'} Class</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Class Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-white/10 border-white/20 text-white" />
            <Input placeholder="Grade Level Code" value={form.grade_level} onChange={e => setForm({ ...form, grade_level: e.target.value })} className="bg-white/10 border-white/20 text-white" />
            <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="number" placeholder="Order" value={form.display_order} onChange={e => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} className="bg-white/10 border-white/20 text-white" />
            <Button onClick={handleSubmit} disabled={!form.name || !form.grade_level} className="w-full">{editing ? 'Update' : 'Add'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
