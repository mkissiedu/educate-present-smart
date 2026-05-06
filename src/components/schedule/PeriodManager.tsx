import React, { useState } from 'react';
import { ClassPeriod } from '@/types/schedule';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Clock, Plus, Trash2, Coffee, Edit2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface Props {
  periods: ClassPeriod[];
  onSave: (period: Partial<ClassPeriod>) => void;
  onDelete: (id: string) => void;
}

export const PeriodManager: React.FC<Props> = ({ periods, onSave, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<ClassPeriod | null>(null);
  const [form, setForm] = useState({ name: '', start_time: '08:00', end_time: '08:45', is_break: false });

  const handleSubmit = () => {
    onSave({ ...form, id: editing?.id, period_number: editing?.period_number || periods.length + 1 });
    setIsOpen(false);
    setEditing(null);
    setForm({ name: '', start_time: '08:00', end_time: '08:45', is_break: false });
  };

  const openEdit = (p: ClassPeriod) => {
    setEditing(p);
    setForm({ name: p.name, start_time: p.start_time, end_time: p.end_time, is_break: p.is_break });
    setIsOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Clock className="w-5 h-5" /> Class Periods
        </h3>
        <Button size="sm" onClick={() => { setEditing(null); setForm({ name: '', start_time: '08:00', end_time: '08:45', is_break: false }); setIsOpen(true); }}>
          <Plus className="w-4 h-4 mr-1" /> Add Period
        </Button>
      </div>

      <div className="space-y-2">
        {periods.map((p) => (
          <div key={p.id} className={`flex items-center justify-between p-3 rounded-lg ${p.is_break ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-white/10'}`}>
            <div className="flex items-center gap-3">
              {p.is_break ? <Coffee className="w-4 h-4 text-amber-400" /> : <span className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold">{p.period_number}</span>}
              <div>
                <div className="font-medium text-white">{p.name}</div>
                <div className="text-sm text-gray-400">{p.start_time} - {p.end_time}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Edit2 className="w-4 h-4" /></Button>
              <Button size="sm" variant="ghost" className="text-red-400" onClick={() => onDelete(p.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          </div>
        ))}
        {periods.length === 0 && <p className="text-gray-400 text-center py-4">No periods defined. Add periods to create a timetable.</p>}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader><DialogTitle className="text-white">{editing ? 'Edit Period' : 'Add Period'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Period Name (e.g., Period 1)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-white/10 border-white/20 text-white" />
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm text-gray-400">Start Time</label><Input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} className="bg-white/10 border-white/20 text-white" /></div>
              <div><label className="text-sm text-gray-400">End Time</label><Input type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} className="bg-white/10 border-white/20 text-white" /></div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={form.is_break} onCheckedChange={(c) => setForm({ ...form, is_break: !!c })} />
              <label className="text-sm text-gray-300">This is a break period</label>
            </div>
            <Button onClick={handleSubmit} className="w-full">{editing ? 'Update' : 'Add'} Period</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
