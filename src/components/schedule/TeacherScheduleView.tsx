import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import { ClassPeriod, ScheduleEntry, SchoolClass, DAYS_OF_WEEK } from '@/types/schedule';
import { fetchClassPeriods, fetchScheduleEntries, fetchSchoolClasses } from '@/lib/supabase-schedule';
import { Button } from '@/components/ui/button';
import { Calendar, Printer, Coffee } from 'lucide-react';
import { ClassLevel } from '@/types/user';

interface Props {
  assignedClasses?: ClassLevel[];
}

export const TeacherScheduleView: React.FC<Props> = ({ assignedClasses }) => {
  const { user } = useAuth();
  const { currentSchool } = useSchool();
  const [periods, setPeriods] = useState<ClassPeriod[]>([]);
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [currentSchool?.id, user?.id, assignedClasses]);

  const loadData = async () => {
    setLoading(true);
    const [p, e, c] = await Promise.all([
      fetchClassPeriods(currentSchool?.id),
      fetchScheduleEntries(currentSchool?.id),
      fetchSchoolClasses(currentSchool?.id)
    ]);
    setPeriods(p);
    
    // Filter entries by teacher and assigned classes
    let filteredEntries = e.filter(entry => entry.teacher_id === user?.id);
    
    // If assigned classes are provided, filter by those classes
    if (assignedClasses && assignedClasses.length > 0) {
      const assignedClassIds = c
        .filter(cls => assignedClasses.includes(cls.name as ClassLevel))
        .map(cls => cls.id);
      filteredEntries = filteredEntries.filter(entry => 
        entry.class_id && assignedClassIds.includes(entry.class_id)
      );
    }
    
    setEntries(filteredEntries);
    setClasses(c);
    setLoading(false);
  };

  const getEntry = (day: number, periodId: string) => entries.find(e => e.day_of_week === day && e.period_id === periodId);
  const getClassName = (id?: string) => classes.find(c => c.id === id)?.name || '';

  const subjectColors: Record<string, string> = {
    'English Language': 'bg-blue-500/30 border-blue-500',
    'Mathematics': 'bg-purple-500/30 border-purple-500',
    'Science': 'bg-green-500/30 border-green-500',
    'Social Studies': 'bg-orange-500/30 border-orange-500',
    'Language & Literacy': 'bg-blue-500/30 border-blue-500',
    'Numeracy': 'bg-purple-500/30 border-purple-500',
    'Our World Our People': 'bg-amber-500/30 border-amber-500',
    "Ananse's Phonics": 'bg-pink-500/30 border-pink-500',
  };

  const handlePrint = () => window.print();

  if (loading) return <div className="p-6 text-center text-white">Loading schedule...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Calendar className="w-7 h-7 text-blue-400" /> My Schedule
        </h2>
        <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="w-4 h-4 mr-1" /> Print</Button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-xl">
          <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No schedule for your assigned classes yet.</p>
          <p className="text-gray-500 text-sm">Contact your school admin to set up your timetable.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr>
                <th className="p-2 bg-slate-700/50 text-white text-left w-24 rounded-tl-lg">Time</th>
                {DAYS_OF_WEEK.map(d => <th key={d.value} className="p-2 bg-slate-700/50 text-white text-center">{d.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {periods.map((period, idx) => (
                <tr key={period.id} className={period.is_break ? 'bg-amber-500/10' : ''}>
                  <td className={`p-2 border-b border-white/10 ${idx === periods.length - 1 ? 'rounded-bl-lg' : ''}`}>
                    <div className="flex items-center gap-2">
                      {period.is_break && <Coffee className="w-3 h-3 text-amber-400" />}
                      <div>
                        <div className="text-sm font-medium text-white">{period.name}</div>
                        <div className="text-xs text-gray-400">{period.start_time}-{period.end_time}</div>
                      </div>
                    </div>
                  </td>
                  {DAYS_OF_WEEK.map(day => {
                    const entry = getEntry(day.value, period.id);
                    if (period.is_break) return <td key={day.value} className="p-2 border-b border-white/10 text-center text-amber-400/60 text-sm">Break</td>;
                    return (
                      <td key={day.value} className="p-1 border-b border-white/10">
                        {entry ? (
                          <div className={`p-2 rounded-lg border-l-4 ${subjectColors[entry.subject] || 'bg-slate-600/30 border-slate-500'}`}>
                            <div className="font-medium text-white text-sm truncate">{entry.subject}</div>
                            <div className="text-xs text-gray-300 truncate">{getClassName(entry.class_id)}</div>
                            {entry.room_number && <div className="text-xs text-gray-400">Room {entry.room_number}</div>}
                          </div>
                        ) : <div className="h-14 flex items-center justify-center text-gray-600 text-sm">-</div>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
