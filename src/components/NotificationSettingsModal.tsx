import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { NotificationSettings, DEFAULT_TEMPLATES } from '@/types/notification';
import { fetchNotificationSettings, saveNotificationSettings } from '@/lib/supabase-notifications';
import { useToast } from '@/hooks/use-toast';
import { Settings, Bell, MessageSquare, Save } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  classLevel: string;
  teacherId: string;
}

export const NotificationSettingsModal: React.FC<Props> = ({ isOpen, onClose, classLevel, teacherId }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Partial<NotificationSettings>>({
    notify_on_absence: true,
    notify_on_late: false,
    consecutive_absence_threshold: 3,
    weekly_summary_enabled: false,
    preferred_channel: 'whatsapp',
    message_templates: DEFAULT_TEMPLATES
  });

  useEffect(() => {
    if (isOpen) loadSettings();
  }, [isOpen, classLevel]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await fetchNotificationSettings(teacherId, classLevel);
      if (data) setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveNotificationSettings({ ...settings, teacher_id: teacherId, class_level: classLevel });
      toast({ title: 'Settings saved!' });
      onClose();
    } catch (err) {
      toast({ title: 'Error saving settings', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-slate-900 border-slate-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Settings className="w-5 h-5" /> Notification Settings</DialogTitle>
        </DialogHeader>
        
        {loading ? <div className="text-center py-8">Loading...</div> : (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2"><Bell className="w-4 h-4" /> Triggers</h4>
              <div className="flex items-center justify-between">
                <Label>Notify on absence</Label>
                <Switch checked={settings.notify_on_absence} onCheckedChange={v => setSettings(p => ({ ...p, notify_on_absence: v }))} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Notify on late arrival</Label>
                <Switch checked={settings.notify_on_late} onCheckedChange={v => setSettings(p => ({ ...p, notify_on_late: v }))} />
              </div>
              <div className="space-y-2">
                <Label>Consecutive absence threshold</Label>
                <Input type="number" min={1} max={10} value={settings.consecutive_absence_threshold} onChange={e => setSettings(p => ({ ...p, consecutive_absence_threshold: parseInt(e.target.value) || 3 }))} className="bg-slate-800 border-slate-600" />
                <p className="text-xs text-slate-400">Alert after this many consecutive absences</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Channel</h4>
              <div className="flex gap-2">
                {(['whatsapp', 'sms'] as const).map(ch => (
                  <button key={ch} onClick={() => setSettings(p => ({ ...p, preferred_channel: ch }))}
                    className={`px-4 py-2 rounded-lg capitalize ${settings.preferred_channel === ch ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full bg-gradient-to-r from-green-500 to-emerald-500">
              <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
