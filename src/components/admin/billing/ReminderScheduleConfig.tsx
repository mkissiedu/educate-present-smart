import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { saveReminderSchedule } from '@/lib/supabase-reminders';
import type { ReminderSchedule } from '@/types/reminder';
import { Save, Loader2, Calendar, Clock, AlertTriangle } from 'lucide-react';

interface Props {
  schedule: ReminderSchedule | null;
  schoolId: string;
  onRefresh: () => void;
}

const DEFAULT_DAYS = [-7, -3, -1, 1, 3, 7];

export function ReminderScheduleConfig({ schedule, schoolId, onRefresh }: Props) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    schedule_name: 'Default Schedule',
    is_active: true,
    reminder_days: DEFAULT_DAYS,
    overdue_repeat_days: 7,
    max_overdue_reminders: 4
  });

  useEffect(() => {
    if (schedule) {
      setForm({
        schedule_name: schedule.schedule_name,
        is_active: schedule.is_active,
        reminder_days: schedule.reminder_days,
        overdue_repeat_days: schedule.overdue_repeat_days,
        max_overdue_reminders: schedule.max_overdue_reminders
      });
    }
  }, [schedule]);

  const toggleDay = (day: number) => {
    setForm(f => ({
      ...f,
      reminder_days: f.reminder_days.includes(day)
        ? f.reminder_days.filter(d => d !== day)
        : [...f.reminder_days, day].sort((a, b) => a - b)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveReminderSchedule({ ...form, school_id: schoolId });
      toast({ title: 'Schedule Saved', description: 'Reminder schedule updated successfully' });
      onRefresh();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
    setSaving(false);
  };

  const beforeDays = [-14, -7, -5, -3, -2, -1];
  const afterDays = [1, 2, 3, 5, 7, 14];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" /> Reminder Schedule
            </CardTitle>
            <CardDescription>Configure when reminders are sent</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
            <Label className="text-sm">{form.is_active ? 'Active' : 'Paused'}</Label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <Label className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4" /> Before Due Date
          </Label>
          <div className="flex flex-wrap gap-2">
            {beforeDays.map(day => (
              <Badge
                key={day}
                variant={form.reminder_days.includes(day) ? 'default' : 'outline'}
                className="cursor-pointer px-3 py-1"
                onClick={() => toggleDay(day)}
              >
                {Math.abs(day)} day{Math.abs(day) > 1 ? 's' : ''}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> After Due Date (Overdue)
          </Label>
          <div className="flex flex-wrap gap-2">
            {afterDays.map(day => (
              <Badge
                key={day}
                variant={form.reminder_days.includes(day) ? 'destructive' : 'outline'}
                className="cursor-pointer px-3 py-1"
                onClick={() => toggleDay(day)}
              >
                {day} day{day > 1 ? 's' : ''}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <Label>Repeat Overdue Every (days)</Label>
            <Input
              type="number"
              min={1}
              max={30}
              value={form.overdue_repeat_days}
              onChange={e => setForm(f => ({ ...f, overdue_repeat_days: parseInt(e.target.value) || 7 }))}
            />
          </div>
          <div>
            <Label>Max Overdue Reminders</Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={form.max_overdue_reminders}
              onChange={e => setForm(f => ({ ...f, max_overdue_reminders: parseInt(e.target.value) || 4 }))}
            />
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg text-sm">
          <p className="font-medium text-blue-800 mb-1">Current Schedule:</p>
          <p className="text-blue-700">
            Reminders will be sent {form.reminder_days.filter(d => d < 0).map(d => `${Math.abs(d)} days`).join(', ')} before due date,
            and {form.reminder_days.filter(d => d > 0).map(d => `${d} days`).join(', ')} after if overdue.
            Overdue reminders repeat every {form.overdue_repeat_days} days (max {form.max_overdue_reminders} times).
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Schedule
        </Button>
      </CardContent>
    </Card>
  );
}
