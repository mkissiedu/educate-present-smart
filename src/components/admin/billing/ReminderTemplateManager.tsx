import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { createReminderTemplate, updateReminderTemplate, deleteReminderTemplate } from '@/lib/supabase-reminders';
import type { ReminderTemplate } from '@/types/reminder';
import { Plus, Edit2, Trash2, MessageSquare, Phone, Loader2 } from 'lucide-react';

interface Props {
  templates: ReminderTemplate[];
  schoolId: string;
  onRefresh: () => void;
}

export function ReminderTemplateManager({ templates, schoolId, onRefresh }: Props) {
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ReminderTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ template_name: '', template_type: 'before_due' as const, days_offset: -7, channel: 'whatsapp' as const, message_template: '', is_active: true });

  const openNew = () => { setEditing(null); setForm({ template_name: '', template_type: 'before_due', days_offset: -7, channel: 'whatsapp', message_template: '', is_active: true }); setShowModal(true); };
  const openEdit = (t: ReminderTemplate) => { setEditing(t); setForm({ template_name: t.template_name, template_type: t.template_type, days_offset: t.days_offset, channel: t.channel, message_template: t.message_template, is_active: t.is_active }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.template_name || !form.message_template) { toast({ title: 'Error', description: 'Fill all fields', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      if (editing) { await updateReminderTemplate(editing.id, form); toast({ title: 'Updated' }); }
      else { await createReminderTemplate({ ...form, school_id: schoolId }); toast({ title: 'Created' }); }
      setShowModal(false); onRefresh();
    } catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    try { await deleteReminderTemplate(id); toast({ title: 'Deleted' }); onRefresh(); }
    catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const getTypeLabel = (t: ReminderTemplate) => {
    if (t.template_type === 'overdue') return `${t.days_offset} day${t.days_offset > 1 ? 's' : ''} overdue`;
    return `${Math.abs(t.days_offset)} day${Math.abs(t.days_offset) > 1 ? 's' : ''} before`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Message Templates</CardTitle>
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Add Template</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {templates.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No templates yet. Add one to get started.</p>}
        {templates.map(t => (
          <div key={t.id} className={`p-3 border rounded-lg ${t.is_active ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{t.template_name}</span>
                  <Badge variant={t.template_type === 'overdue' ? 'destructive' : 'secondary'}>{getTypeLabel(t)}</Badge>
                  <Badge variant="outline" className="gap-1">{t.channel === 'whatsapp' ? <MessageSquare className="h-3 w-3" /> : t.channel === 'sms' ? <Phone className="h-3 w-3" /> : 'Both'} {t.channel}</Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{t.message_template}</p>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => openEdit(t)}><Edit2 className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(t.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Edit Template' : 'New Template'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Template Name</Label><Input value={form.template_name} onChange={e => setForm(f => ({ ...f, template_name: e.target.value }))} placeholder="e.g., 7 Days Before Due" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Type</Label><Select value={form.template_type} onValueChange={v => setForm(f => ({ ...f, template_type: v as any }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="before_due">Before Due</SelectItem><SelectItem value="on_due">On Due Date</SelectItem><SelectItem value="overdue">Overdue</SelectItem></SelectContent></Select></div>
              <div><Label>Days Offset</Label><Input type="number" value={Math.abs(form.days_offset)} onChange={e => setForm(f => ({ ...f, days_offset: form.template_type === 'overdue' ? parseInt(e.target.value) : -parseInt(e.target.value) }))} /></div>
            </div>
            <div><Label>Channel</Label><Select value={form.channel} onValueChange={v => setForm(f => ({ ...f, channel: v as any }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="whatsapp">WhatsApp</SelectItem><SelectItem value="sms">SMS</SelectItem><SelectItem value="both">Both</SelectItem></SelectContent></Select></div>
            <div><Label>Message Template</Label><Textarea rows={5} value={form.message_template} onChange={e => setForm(f => ({ ...f, message_template: e.target.value }))} placeholder="Use {{student_name}}, {{balance}}, {{due_date}}, {{bill_code}}, {{days_overdue}}" /><p className="text-xs text-muted-foreground mt-1">Variables: student_name, class_name, balance, total_amount, due_date, bill_code, days_overdue</p></div>
            <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} /><Label>Active</Label></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleSave} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
