import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User } from '@/types/user';
import { TeacherAttendanceStatus, TeacherAttendanceRecord } from '@/types/admin';
import { fetchAllUsers, fetchTeacherAttendance, bulkSaveTeacherAttendance } from '@/lib/supabase-admin';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Check, X, AlertCircle, Loader2, Save, ChevronLeft, ChevronRight } from 'lucide-react';

const STATUS_CONFIG: Record<TeacherAttendanceStatus, { label: string; color: string; icon: React.ReactNode }> = {
  present: { label: 'Present', color: 'bg-green-500', icon: <Check className="w-4 h-4" /> },
  absent: { label: 'Absent', color: 'bg-red-500', icon: <X className="w-4 h-4" /> },
  late: { label: 'Late', color: 'bg-yellow-500', icon: <Clock className="w-4 h-4" /> },
  on_leave: { label: 'Leave', color: 'bg-blue-500', icon: <Calendar className="w-4 h-4" /> },
  sick: { label: 'Sick', color: 'bg-orange-500', icon: <AlertCircle className="w-4 h-4" /> },
};

export const TeacherAttendance: React.FC = () => {
  const { user } = useAuth();
  const { currentSchool } = useSchool();
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<Record<string, { status: TeacherAttendanceStatus; check_in_time: string; notes: string }>>({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, [date, currentSchool]);

  const loadData = async () => {
    setLoading(true);
    const [users, records] = await Promise.all([
      fetchAllUsers(currentSchool?.id),
      fetchTeacherAttendance(date, currentSchool?.id)
    ]);
    setTeachers(users.filter(u => u.role === 'teacher' || u.role === 'super_teacher'));
    const attMap: Record<string, { status: TeacherAttendanceStatus; check_in_time: string; notes: string }> = {};
    records.forEach(r => { attMap[r.teacher_id] = { status: r.status as TeacherAttendanceStatus, check_in_time: r.check_in_time || '', notes: r.notes || '' }; });
    setAttendance(attMap);
    setLoading(false);
  };

  const updateStatus = (teacherId: string, status: TeacherAttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [teacherId]: { ...prev[teacherId], status, check_in_time: prev[teacherId]?.check_in_time || '', notes: prev[teacherId]?.notes || '' } }));
  };

  const updateCheckIn = (teacherId: string, time: string) => {
    setAttendance(prev => ({ ...prev, [teacherId]: { ...prev[teacherId], check_in_time: time } }));
  };

  const saveAll = async () => {
    setSaving(true);
    const records = teachers.filter(t => attendance[t.id]).map(t => ({
      teacher_id: t.id, date, status: attendance[t.id].status,
      check_in_time: attendance[t.id].check_in_time || undefined,
      notes: attendance[t.id].notes || undefined, recorded_by: user?.id
    }));
    const success = await bulkSaveTeacherAttendance(records);
    if (success) toast({ title: 'Attendance saved!' });
    else toast({ title: 'Error saving', variant: 'destructive' });
    setSaving(false);
  };

  const changeDate = (days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().split('T')[0]);
  };

  const stats = { present: 0, absent: 0, late: 0, on_leave: 0, sick: 0 };
  Object.values(attendance).forEach(a => { if (a.status) stats[a.status]++; });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Teacher Attendance</h2>
        <Button onClick={saveAll} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Save All
        </Button>
      </div>
      <div className="flex items-center justify-center gap-4 mb-4">
        <Button variant="ghost" onClick={() => changeDate(-1)} className="text-white"><ChevronLeft className="w-5 h-5" /></Button>
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-auto bg-white/10 border-white/20 text-white" />
        <Button variant="ghost" onClick={() => changeDate(1)} className="text-white"><ChevronRight className="w-5 h-5" /></Button>
      </div>
      <div className="grid grid-cols-5 gap-2 mb-4">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} className={`${cfg.color} rounded-lg p-2 text-center text-white`}>
            <div className="text-2xl font-bold">{stats[key as TeacherAttendanceStatus]}</div>
            <div className="text-xs">{cfg.label}</div>
          </div>
        ))}
      </div>
      {loading ? <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-white" /></div> : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {teachers.map(t => (
            <div key={t.id} className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-bold text-white">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.assignedClasses?.join(', ') || 'No classes'}</div>
                </div>
                <Input type="time" value={attendance[t.id]?.check_in_time || ''} onChange={e => updateCheckIn(t.id, e.target.value)} className="w-28 bg-white/10 border-white/20 text-white text-sm" />
              </div>
              <div className="flex gap-1 flex-wrap">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <Button key={key} size="sm" onClick={() => updateStatus(t.id, key as TeacherAttendanceStatus)}
                    className={`${attendance[t.id]?.status === key ? cfg.color : 'bg-white/10'} text-white text-xs px-2 py-1`}>
                    {cfg.icon} <span className="ml-1">{cfg.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
