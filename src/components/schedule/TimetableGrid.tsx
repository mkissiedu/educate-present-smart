import React from 'react';
import { ClassPeriod, ScheduleEntry, DAYS_OF_WEEK } from '@/types/schedule';
import { Plus, Coffee } from 'lucide-react';

interface Props {
  periods: ClassPeriod[];
  entries: ScheduleEntry[];
  teachers: { id: string; name: string }[];
  onCellClick: (day: number, periodId: string) => void;
  onEntryClick: (entry: ScheduleEntry) => void;
}

export const TimetableGrid: React.FC<Props> = ({ periods, entries, teachers, onCellClick, onEntryClick }) => {
  const getEntry = (day: number, periodId: string) => entries.find(e => e.day_of_week === day && e.period_id === periodId);
  const getTeacherName = (id?: string) => teachers.find(t => t.id === id)?.name || '';

  const subjectColors: Record<string, string> = {
    'English Language': 'bg-blue-500/30 border-blue-500',
    'Mathematics': 'bg-purple-500/30 border-purple-500',
    'Science': 'bg-green-500/30 border-green-500',
    'Social Studies': 'bg-orange-500/30 border-orange-500',
    'Religious & Moral Education': 'bg-pink-500/30 border-pink-500',
    'Creative Arts': 'bg-yellow-500/30 border-yellow-500',
    'Physical Education': 'bg-red-500/30 border-red-500',
    'Computing': 'bg-cyan-500/30 border-cyan-500',
    'French': 'bg-indigo-500/30 border-indigo-500',
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[800px]">
        <thead>
          <tr>
            <th className="p-2 bg-slate-700/50 text-white text-left w-24 rounded-tl-lg">Time</th>
            {DAYS_OF_WEEK.map(d => (
              <th key={d.value} className="p-2 bg-slate-700/50 text-white text-center">{d.label}</th>
            ))}
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
                if (period.is_break) {
                  return <td key={day.value} className="p-2 border-b border-white/10 text-center text-amber-400/60 text-sm">Break</td>;
                }
                return (
                  <td key={day.value} className="p-1 border-b border-white/10">
                    {entry ? (
                      <div onClick={() => onEntryClick(entry)}
                        className={`p-2 rounded-lg cursor-pointer border-l-4 hover:opacity-80 transition-opacity ${subjectColors[entry.subject] || 'bg-slate-600/30 border-slate-500'}`}>
                        <div className="font-medium text-white text-sm truncate">{entry.subject}</div>
                        {entry.teacher_id && <div className="text-xs text-gray-300 truncate">{getTeacherName(entry.teacher_id)}</div>}
                        {entry.room_number && <div className="text-xs text-gray-400">Room {entry.room_number}</div>}
                      </div>
                    ) : (
                      <div onClick={() => onCellClick(day.value, period.id)}
                        className="h-16 flex items-center justify-center rounded-lg border-2 border-dashed border-white/20 cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all">
                        <Plus className="w-5 h-5 text-gray-500" />
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
