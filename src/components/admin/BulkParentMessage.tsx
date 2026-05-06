import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Student } from '@/types/student';
import { useSchool } from '@/contexts/SchoolContext';
import { Send, MessageCircle, Users, Loader2, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
}

type Channel = 'whatsapp' | 'sms' | 'email';

export const BulkParentMessage: React.FC<Props> = ({ isOpen, onClose, students }) => {
  const { toast } = useToast();
  const { currentSchool } = useSchool();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [channel, setChannel] = useState<Channel>('whatsapp');
  const [progress, setProgress] = useState(0);

  const schoolName = currentSchool?.name || 'The School';

  const TEMPLATES = {
    general: `Dear Parent/Guardian,\n\nThis is a message from ${schoolName} regarding your child {student_name}.\n\nThank you.`,
    attendance: `Dear Parent/Guardian,\n\nWe noticed {student_name} was absent from ${schoolName}. Please let us know if there are any concerns.\n\nThank you.`,
    fee_reminder: `Dear Parent/Guardian,\n\nThis is a friendly reminder that school fees for this term at ${schoolName} are due.\n\nThank you.`,
    event: `Dear Parent/Guardian,\n\nWe are pleased to invite you to our upcoming event at ${schoolName}.\n\nThank you.`
  };

  const withPhone = students.filter(s => s.guardian1_whatsapp || s.guardian2_whatsapp);
  const withEmail = students.filter(s => (s as any).guardian1_email || (s as any).guardian2_email);
  const available = channel === 'email' ? withEmail : withPhone;

  useEffect(() => {
    if (isOpen) {
      setSelected(available.map(s => s.id));
      setMessage(TEMPLATES.general);
      setProgress(0);
    }
  }, [isOpen, students, currentSchool, channel]);

  const toggle = (id: string) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const send = async () => {
    setSending(true);
    const toSend = available.filter(s => selected.includes(s.id));
    let sent = 0, failed = 0;
    
    for (let i = 0; i < toSend.length; i++) {
      const s = toSend[i];
      const phone = s.guardian1_whatsapp || s.guardian2_whatsapp;
      const email = (s as any).guardian1_email || (s as any).guardian2_email;
      const msg = message.replace(/{student_name}/g, s.name);
      const guardianName = s.guardian1_name || s.guardian2_name || 'Parent/Guardian';
      
      try {
        if (channel === 'whatsapp' && phone) {
          window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
          sent++;
          await new Promise(r => setTimeout(r, 500));
        } else if (channel === 'sms' || channel === 'email') {
          const { data, error } = await supabase.functions.invoke('send-parent-notification', {
            body: { phone, email, message: msg, channel, studentId: s.id, guardianName, notificationType: 'bulk', subject: `Message from ${schoolName}` }
          });
          if (data?.smsSent || data?.emailSent) sent++;
          else failed++;
        }
      } catch (e) { failed++; }
      setProgress(Math.round(((i + 1) / toSend.length) * 100));
    }
    
    toast({ title: `Sent to ${sent} parents${failed > 0 ? `, ${failed} failed` : ''}` });
    setSending(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <MessageCircle className="w-5 h-5 text-purple-600" /> Bulk Message
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-gray-700 mb-2 block">Send via</Label>
            <div className="flex gap-2">
              <Button type="button" variant={channel === 'whatsapp' ? 'default' : 'outline'} onClick={() => setChannel('whatsapp')} className={channel === 'whatsapp' ? 'bg-green-600' : 'border-gray-300 text-gray-700'}>
                <MessageCircle className="w-4 h-4 mr-1" />WhatsApp
              </Button>
              <Button type="button" variant={channel === 'sms' ? 'default' : 'outline'} onClick={() => setChannel('sms')} className={channel === 'sms' ? 'bg-blue-600' : 'border-gray-300 text-gray-700'}>
                <Phone className="w-4 h-4 mr-1" />SMS
              </Button>
              <Button type="button" variant={channel === 'email' ? 'default' : 'outline'} onClick={() => setChannel('email')} className={channel === 'email' ? 'bg-purple-600' : 'border-gray-300 text-gray-700'}>
                <Mail className="w-4 h-4 mr-1" />Email
              </Button>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(TEMPLATES).map(([k, v]) => (
              <Button key={k} size="sm" variant="outline" onClick={() => setMessage(v)} className="text-xs capitalize border-gray-300 text-gray-700">{k.replace('_', ' ')}</Button>
            ))}
          </div>
          <div>
            <Label className="text-gray-700">Message (use {'{student_name}'} for personalization)</Label>
            <Textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} className="bg-gray-50 border-gray-300 text-gray-900 mt-1" />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-gray-700"><Users className="w-4 h-4 inline mr-1" /> Recipients ({selected.length}/{available.length})</Label>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setSelected(available.map(s => s.id))} className="text-xs text-gray-600">All</Button>
                <Button size="sm" variant="ghost" onClick={() => setSelected([])} className="text-xs text-gray-600">None</Button>
              </div>
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1 bg-gray-100 rounded-lg p-2">
              {available.length === 0 ? <p className="text-sm text-gray-500 text-center py-4">No students with {channel === 'email' ? 'email' : 'phone'}</p> : available.map(s => (
                <label key={s.id} className="flex items-center gap-2 p-1 hover:bg-gray-200 rounded cursor-pointer">
                  <input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggle(s.id)} className="rounded" />
                  <span className="text-sm text-gray-900">{s.name}</span>
                  <span className="text-xs text-gray-500 ml-auto">{channel === 'email' ? ((s as any).guardian1_email || (s as any).guardian2_email) : (s.guardian1_whatsapp || s.guardian2_whatsapp)}</span>
                </label>
              ))}
            </div>
          </div>
          {sending && <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-purple-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} /></div>}
          <Button onClick={send} disabled={sending || selected.length === 0} className="w-full bg-purple-600 hover:bg-purple-700">
            {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
            Send to {selected.length} Parents
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
