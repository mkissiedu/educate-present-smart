import React, { useState, useEffect } from 'react';
import { ScheduleEntry, SUBJECTS, DAYS_OF_WEEK, ScheduleConflict } from '@/types/schedule';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  entry?: ScheduleEntry | null;
  dayOfWeek: number;
  periodId: string;
  periodName: string;
  teachers: { id: string; name: string }[];
  conflicts: ScheduleConflict[];
  onSave: (entry: Partial<ScheduleEntry>) => void;
  onDelete?: (id: string) => void;
}

export const ScheduleEntryModal: React.FC<Props> = ({ isOpen, onClose, entry, dayOfWeek, periodId, periodName, teachers, conflicts, onSave, onDelete }) => {
  const [form, setForm] = useState({ subject: '', teacher_id: '', room_number: '', notes: '' });

  useEffect(() => {
    if (entry) {
      setForm({ subject: entry.subject, teacher_id: entry.teacher_id || '', room_number: entry.room_number || '', notes: entry.notes || '' });
    } else {
      setForm({ subject: '', teacher_id: '', room_number: '', notes: '' });
    }
  }, [entry, isOpen]);

  const handleSubmit = () => {
    onSave({ ...form, id: entry?.id, day_of_week: dayOfWeek, period_id: periodId, is_active: true });
    onClose();
  };

  const dayName = DAYS_OF_WEEK.find(d => d.value === dayOfWeek)?.label || '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">{entry ? 'Edit Schedule' : 'Add Schedule'}</DialogTitle>
          <p className="text-sm text-gray-400">{dayName} - {periodName}</p>
        </DialogHeader>
        
        {conflicts.length > 0 && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-400 font-medium mb-1">
              <AlertTriangle className="w-4 h-4" /> Conflicts Detected
            </div>
            {conflicts.map((c, i) => <p key={i} className="text-sm text-red-300">{c.message}</p>)}
          </div>
        )}

        <div className="space-y-4">
          <Select value={form.subject} onValueChange={v => setForm({ ...form, subject: v })}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue placeholder="Select Subject" /></SelectTrigger>
            <SelectContent>{SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>

          <Select value={form.teacher_id} onValueChange={v => setForm({ ...form, teacher_id: v })}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue placeholder="Assign Teacher" /></SelectTrigger>
            <SelectContent>{teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
          </Select>

          <Input placeholder="Room Number" value={form.room_number} onChange={e => setForm({ ...form, room_number: e.target.value })} className="bg-white/10 border-white/20 text-white" />
          <Input placeholder="Notes (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="bg-white/10 border-white/20 text-white" />

          <div className="flex gap-2">
            <Button onClick={handleSubmit} className="flex-1" disabled={!form.subject}>{entry ? 'Update' : 'Add'}</Button>
            {entry && onDelete && (
              <Button variant="destructive" onClick={() => { onDelete(entry.id); onClose(); }}><Trash2 className="w-4 h-4" /></Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
