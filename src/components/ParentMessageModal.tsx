import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Student } from '@/types/student';
import { Send, MessageCircle, Loader2, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  classLevel: string;
  teacherId: string;
  notificationType: 'absence' | 'late' | 'custom';
  date: string;
}

const TEMPLATES = {
  absence: (name: string, date: string) => `Dear Parent/Guardian,\n\nThis is to inform you that ${name} was marked absent on ${date}. Please let us know if there are any concerns.\n\nThank you.`,
  late: (name: string, date: string) => `Dear Parent/Guardian,\n\nThis is to inform you that ${name} arrived late to school on ${date}. Please ensure timely arrival.\n\nThank you.`,
  custom: (name: string) => `Dear Parent/Guardian,\n\nThis is a message regarding ${name}.\n\nThank you.`
};

type Channel = 'whatsapp' | 'sms' | 'email';

export const ParentMessageModal: React.FC<Props> = ({ isOpen, onClose, student, classLevel, teacherId, notificationType, date }) => {
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [channel, setChannel] = useState<Channel>('whatsapp');

  React.useEffect(() => {
    if (student && isOpen) {
      const name = student.name || `${student.first_name} ${student.last_name}`;
      const formattedDate = new Date(date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
      setMessage(notificationType === 'custom' ? TEMPLATES.custom(name) : TEMPLATES[notificationType](name, formattedDate));
    }
  }, [student, notificationType, date, isOpen]);

  const sendMessage = async () => {
    if (!student) return;
    const phone = student.guardian1_whatsapp || student.guardian2_whatsapp;
    const email = (student as any).guardian1_email || (student as any).guardian2_email;
    const guardianName = student.guardian1_name || student.guardian2_name || 'Parent/Guardian';
    
    if (channel === 'email' && !email) { toast({ title: 'No email address available', variant: 'destructive' }); return; }
    if ((channel === 'sms' || channel === 'whatsapp') && !phone) { toast({ title: 'No phone number available', variant: 'destructive' }); return; }
    
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-parent-notification', {
        body: { phone, email, message, channel, studentId: student.id, guardianName, notificationType, teacherId, classLevel, subject: `School Notification: ${notificationType}` }
      });
      
      if (error) throw error;
      
      if (channel === 'whatsapp' && data?.whatsappLink) {
        window.open(data.whatsappLink, '_blank');
        toast({ title: 'WhatsApp opened!' });
      } else if (channel === 'sms') {
        toast({ title: data?.smsSent ? 'SMS sent successfully!' : 'Failed to send SMS', variant: data?.smsSent ? 'default' : 'destructive' });
      } else if (channel === 'email') {
        toast({ title: data?.emailSent ? 'Email sent successfully!' : 'Failed to send email', variant: data?.emailSent ? 'default' : 'destructive' });
      }
      
      if (data?.smsSent || data?.emailSent || channel === 'whatsapp') onClose();
    } catch (err: any) {
      console.error(err);
      toast({ title: err.message || 'Error sending message', variant: 'destructive' });
    } finally { setSending(false); }
  };

  if (!student) return null;
  const phone = student.guardian1_whatsapp || student.guardian2_whatsapp;
  const email = (student as any).guardian1_email || (student as any).guardian2_email;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-gray-200 text-gray-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <MessageCircle className="w-5 h-5 text-purple-600" /> Message Parent
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-gray-100 p-3 rounded-lg">
            <p className="font-medium text-gray-900">{student.name || `${student.first_name} ${student.last_name}`}</p>
            <p className="text-sm text-gray-600">{classLevel}</p>
            {phone && <p className="text-sm text-green-600 flex items-center gap-1"><Phone className="w-3 h-3" />{phone}</p>}
            {email && <p className="text-sm text-blue-600 flex items-center gap-1"><Mail className="w-3 h-3" />{email}</p>}
          </div>
          
          <div>
            <Label className="text-gray-700 mb-2 block">Send via</Label>
            <div className="flex gap-2">
              <Button type="button" variant={channel === 'whatsapp' ? 'default' : 'outline'} onClick={() => setChannel('whatsapp')} className={channel === 'whatsapp' ? 'bg-green-600 hover:bg-green-700' : 'border-gray-300 text-gray-700'} disabled={!phone}>
                <MessageCircle className="w-4 h-4 mr-1" />WhatsApp
              </Button>
              <Button type="button" variant={channel === 'sms' ? 'default' : 'outline'} onClick={() => setChannel('sms')} className={channel === 'sms' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-300 text-gray-700'} disabled={!phone}>
                <Phone className="w-4 h-4 mr-1" />SMS
              </Button>
              <Button type="button" variant={channel === 'email' ? 'default' : 'outline'} onClick={() => setChannel('email')} className={channel === 'email' ? 'bg-purple-600 hover:bg-purple-700' : 'border-gray-300 text-gray-700'} disabled={!email}>
                <Mail className="w-4 h-4 mr-1" />Email
              </Button>
            </div>
          </div>
          
          <Textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} className="bg-gray-50 border-gray-300 text-gray-900" />
          <Button onClick={sendMessage} disabled={sending || !message} className="w-full bg-purple-600 hover:bg-purple-700">
            {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
            Send Message
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
