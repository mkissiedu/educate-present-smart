import React, { useState, useEffect, useMemo } from 'react';
import { Student } from '@/types/student';
import { AttendanceRecord, AttendanceStatus } from '@/types/attendance';
import { fetchStudents } from '@/lib/supabase-students';
import { fetchAttendanceByDate, fetchAttendanceByDateRange, bulkSaveAttendance } from '@/lib/supabase-attendance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AttendanceCalendarView } from './AttendanceCalendarView';
import { AttendanceReportModal } from './AttendanceReportModal';
import { AttendanceStatusBadge } from './AttendanceStatusBadge';
import { NotificationSettingsModal } from './NotificationSettingsModal';
import { ParentMessageModal } from './ParentMessageModal';
import { Check, X, Clock, Save, Users, BarChart3, Search, Bell, MessageSquare, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  classLevel: string;
}

export const AttendanceTracker: React.FC<Props> = ({ classLevel }) => {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [allRecords, setAllRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'daily' | 'calendar'>('daily');
  const [messageStudent, setMessageStudent] = useState<Student | null>(null);
  const [messageType, setMessageType] = useState<'absence' | 'late' | 'custom'>('custom');

  const teacherId = 'teacher-1'; // Would come from auth context

  useEffect(() => { loadStudents(); }, [classLevel]);
  useEffect(() => { if (students.length > 0) { loadAttendance(); loadMonthRecords(); } }, [selectedDate, students, calendarMonth]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await fetchStudents();
      setStudents(data.filter(s => s.class_level === classLevel));
    } catch (err) {
      toast({ title: 'Error loading students', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const loadAttendance = async () => {
    try {
      const records = await fetchAttendanceByDate(classLevel, selectedDate);
      const attMap: Record<string, AttendanceStatus> = {};
      const notesMap: Record<string, string> = {};
      records.forEach(r => { attMap[r.student_id] = r.status; if (r.notes) notesMap[r.student_id] = r.notes; });
      setAttendance(attMap);
      setNotes(notesMap);
    } catch (err) { console.error(err); }
  };

  const loadMonthRecords = async () => {
    const start = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    const end = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0);
    try {
      const records = await fetchAttendanceByDateRange(classLevel, start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
      setAllRecords(records);
    } catch (err) { console.error(err); }
  };

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const markAllPresent = () => {
    const newAtt: Record<string, AttendanceStatus> = {};
    students.forEach(s => newAtt[s.id] = 'present');
    setAttendance(newAtt);
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const records = students.filter(s => attendance[s.id]).map(s => ({
        student_id: s.id, class_level: classLevel, date: selectedDate, status: attendance[s.id], notes: notes[s.id] || undefined,
      }));
      await bulkSaveAttendance(records);
      toast({ title: 'Attendance saved!' });
      loadMonthRecords();
    } catch (err) {
      toast({ title: 'Error saving', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const openMessageModal = (student: Student, type: 'absence' | 'late' | 'custom') => {
    setMessageStudent(student);
    setMessageType(type);
  };

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    const term = searchTerm.toLowerCase();
    return students.filter(s => `${s.first_name} ${s.last_name}`.toLowerCase().includes(term));
  }, [students, searchTerm]);

  const summary = useMemo(() => {
    const counts = { present: 0, absent: 0, late: 0, excused: 0, unmarked: 0 };
    students.forEach(s => { const status = attendance[s.id]; if (status) counts[status]++; else counts.unmarked++; });
    return counts;
  }, [attendance, students]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-bold text-white">Attendance - {classLevel}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowSettings(true)} variant="ghost" size="sm" className="text-slate-300"><Settings className="w-4 h-4" /></Button>
          <div className="flex bg-white/10 rounded-lg p-1">
            <button onClick={() => setView('daily')} className={`px-3 py-1 rounded text-xs font-bold ${view === 'daily' ? 'bg-blue-500 text-white' : 'text-slate-300'}`}>Daily</button>
            <button onClick={() => setView('calendar')} className={`px-3 py-1 rounded text-xs font-bold ${view === 'calendar' ? 'bg-blue-500 text-white' : 'text-slate-300'}`}>Calendar</button>
          </div>
          <Button onClick={() => setShowReport(true)} variant="outline" size="sm"><BarChart3 className="w-4 h-4 mr-1" /> Report</Button>
        </div>
      </div>

      {view === 'calendar' && <AttendanceCalendarView records={allRecords} month={calendarMonth} onMonthChange={setCalendarMonth} onDateSelect={d => { setSelectedDate(d); setView('daily'); }} selectedDate={selectedDate} />}

      {view === 'daily' && (
        <>
          <div className="flex flex-wrap items-center gap-3 bg-white/5 rounded-lg p-3">
            <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-auto bg-white/10 border-0 text-white" />
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Search students..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 bg-white/10 border-0 text-white" />
            </div>
            <Button onClick={markAllPresent} variant="outline" size="sm"><Check className="w-4 h-4 mr-1" /> All Present</Button>
            <Button onClick={saveAttendance} disabled={saving} className="bg-gradient-to-r from-green-500 to-emerald-500"><Save className="w-4 h-4 mr-1" /> {saving ? 'Saving...' : 'Save'}</Button>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-sm">
            <div className="bg-green-500/20 rounded-lg p-2"><span className="text-green-400 font-bold">{summary.present}</span><div className="text-slate-400 text-xs">Present</div></div>
            <div className="bg-red-500/20 rounded-lg p-2"><span className="text-red-400 font-bold">{summary.absent}</span><div className="text-slate-400 text-xs">Absent</div></div>
            <div className="bg-yellow-500/20 rounded-lg p-2"><span className="text-yellow-400 font-bold">{summary.late}</span><div className="text-slate-400 text-xs">Late</div></div>
            <div className="bg-slate-500/20 rounded-lg p-2"><span className="text-slate-400 font-bold">{summary.unmarked}</span><div className="text-slate-400 text-xs">Unmarked</div></div>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredStudents.map(student => (
              <div key={student.id} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">{student.first_name} {student.last_name}</div>
                  {student.guardian1_whatsapp && <div className="text-xs text-green-400">WhatsApp available</div>}
                </div>
                <button onClick={() => openMessageModal(student, attendance[student.id] === 'absent' ? 'absence' : attendance[student.id] === 'late' ? 'late' : 'custom')} 
                  className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/40 text-green-400" title="Message Parent">
                  <MessageSquare className="w-4 h-4" />
                </button>
                <div className="flex gap-1">
                  {(['present', 'absent', 'late', 'excused'] as AttendanceStatus[]).map(status => (
                    <button key={status} onClick={() => setStatus(student.id, status)}
                      className={`p-2 rounded-lg transition-all ${attendance[student.id] === status ? 'ring-2 ring-white scale-110' : 'opacity-50 hover:opacity-100'}`}>
                      <AttendanceStatusBadge status={status} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {filteredStudents.length === 0 && <div className="text-center text-slate-400 py-8">No students found</div>}
          </div>
        </>
      )}

      <AttendanceReportModal isOpen={showReport} onClose={() => setShowReport(false)} records={allRecords} students={students} classLevel={classLevel}
        dateRange={{ start: new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).toISOString().split('T')[0], end: new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).toISOString().split('T')[0] }} />
      <NotificationSettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} classLevel={classLevel} teacherId={teacherId} />
      <ParentMessageModal isOpen={!!messageStudent} onClose={() => setMessageStudent(null)} student={messageStudent} classLevel={classLevel} teacherId={teacherId} notificationType={messageType} date={selectedDate} />
    </div>
  );
};
