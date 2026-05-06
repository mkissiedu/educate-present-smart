import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchGlobalCalendarEvents, createCalendarEvent, deleteCalendarEvent } from '@/lib/supabase-calendar';
import { AcademicCalendarEvent } from '@/types/assessment-types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Calendar, Plus, Trash2, X, GraduationCap, Palmtree, BookOpen, PartyPopper } from 'lucide-react';

const EVENT_TYPES = [
  { value: 'term_start', label: 'Term Start', icon: GraduationCap, color: 'bg-green-500' },
  { value: 'term_end', label: 'Term End', icon: BookOpen, color: 'bg-blue-500' },
  { value: 'holiday', label: 'Holiday', icon: PartyPopper, color: 'bg-purple-500' },
  { value: 'exam_period', label: 'Exam Period', icon: BookOpen, color: 'bg-red-500' },
  { value: 'vacation', label: 'Vacation', icon: Palmtree, color: 'bg-amber-500' },
  { value: 'event', label: 'Event', icon: Calendar, color: 'bg-cyan-500' },
];

export function AcademicCalendarManager() {
  const { user } = useAuth();
  const [events, setEvents] = useState<AcademicCalendarEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '', start_date: '', end_date: '', event_type: 'event' as const });

  useEffect(() => { loadEvents(); }, []);

  const loadEvents = async () => {
    setLoading(true);
    const data = await fetchGlobalCalendarEvents();
    setEvents(data);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!form.title || !form.start_date) return;
    const result = await createCalendarEvent({
      title: form.title, description: form.description, start_date: form.start_date,
      end_date: form.end_date || undefined, event_type: form.event_type as any,
      is_global: true, created_by: user?.id
    });
    if (result) {
      toast({ title: 'Event Created' });
      setShowForm(false);
      setForm({ title: '', description: '', start_date: '', end_date: '', event_type: 'event' });
      loadEvents();
    }
  };

  const handleDelete = async (id: string) => {
    if (await deleteCalendarEvent(id)) {
      toast({ title: 'Event Deleted' });
      loadEvents();
    }
  };

  const getEventType = (type: string) => EVENT_TYPES.find(t => t.value === type) || EVENT_TYPES[5];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><Calendar className="w-6 h-6" /> Academic Calendar</h2>
        <Button onClick={() => setShowForm(true)} className="bg-purple-600 hover:bg-purple-700"><Plus className="w-4 h-4 mr-2" /> Add Event</Button>
      </div>

      {showForm && (
        <div className="bg-white/10 rounded-xl p-4 mb-6 border border-white/20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white">New Calendar Event</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}><X className="w-4 h-4 text-white" /></Button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label className="text-white">Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="bg-white/10 border-white/20 text-white" /></div>
            <div><Label className="text-white">Event Type</Label>
              <Select value={form.event_type} onValueChange={v => setForm({ ...form, event_type: v as any })}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>{EVENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-white">Start Date</Label><Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} className="bg-white/10 border-white/20 text-white" /></div>
            <div><Label className="text-white">End Date</Label><Input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} className="bg-white/10 border-white/20 text-white" /></div>
            <div className="md:col-span-2"><Label className="text-white">Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-white/10 border-white/20 text-white" rows={2} /></div>
          </div>
          <Button onClick={handleCreate} className="mt-4 bg-green-600 hover:bg-green-700">Create Event</Button>
        </div>
      )}

      {loading ? <p className="text-white/60">Loading...</p> : (
        <div className="space-y-3">
          {events.map(event => {
            const type = getEventType(event.event_type);
            return (
              <div key={event.id} className="bg-white/10 rounded-xl p-4 border border-white/20 flex items-center gap-4">
                <div className={`w-10 h-10 ${type.color} rounded-lg flex items-center justify-center`}>
                  <type.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white">{event.title}</h3>
                  <p className="text-white/60 text-sm">{new Date(event.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {event.end_date && ` - ${new Date(event.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                  </p>
                </div>
                <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">{type.label}</span>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(event.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
              </div>
            );
          })}
          {events.length === 0 && <p className="text-center text-white/60 py-8">No calendar events. Add your first event above.</p>}
        </div>
      )}
    </div>
  );
}
