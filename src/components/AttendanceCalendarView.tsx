import React, { useMemo } from 'react';
import { AttendanceRecord, AttendanceStatus } from '@/types/attendance';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  records: AttendanceRecord[];
  month: Date;
  onMonthChange: (date: Date) => void;
  onDateSelect: (date: string) => void;
  selectedDate: string;
}

export const AttendanceCalendarView: React.FC<Props> = ({ records, month, onMonthChange, onDateSelect, selectedDate }) => {
  const statusColors: Record<AttendanceStatus, string> = {
    present: 'bg-green-500',
    absent: 'bg-red-500',
    late: 'bg-yellow-500',
    excused: 'bg-blue-500',
  };

  const calendarDays = useMemo(() => {
    const year = month.getFullYear();
    const m = month.getMonth();
    const firstDay = new Date(year, m, 1);
    const lastDay = new Date(year, m + 1, 0);
    const days: { date: Date; isCurrentMonth: boolean }[] = [];
    
    const startPadding = firstDay.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
      days.push({ date: new Date(year, m, -i), isCurrentMonth: false });
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push({ date: new Date(year, m, d), isCurrentMonth: true });
    }
    const endPadding = 42 - days.length;
    for (let i = 1; i <= endPadding; i++) {
      days.push({ date: new Date(year, m + 1, i), isCurrentMonth: false });
    }
    return days;
  }, [month]);

  const recordsByDate = useMemo(() => {
    const map: Record<string, AttendanceRecord[]> = {};
    records.forEach(r => {
      if (!map[r.date]) map[r.date] = [];
      map[r.date].push(r);
    });
    return map;
  }, [records]);

  const getDaySummary = (dateStr: string) => {
    const dayRecords = recordsByDate[dateStr] || [];
    if (dayRecords.length === 0) return null;
    const counts = { present: 0, absent: 0, late: 0, excused: 0 };
    dayRecords.forEach(r => counts[r.status]++);
    return counts;
  };

  const formatDateStr = (date: Date) => date.toISOString().split('T')[0];

  return (
    <div className="bg-white/5 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h3 className="text-lg font-bold text-white">
          {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <Button variant="ghost" size="sm" onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-xs text-slate-400 font-medium py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(({ date, isCurrentMonth }, i) => {
          const dateStr = formatDateStr(date);
          const summary = getDaySummary(dateStr);
          const isSelected = dateStr === selectedDate;
          const isToday = formatDateStr(new Date()) === dateStr;
          return (
            <button key={i} onClick={() => onDateSelect(dateStr)}
              className={`p-1 rounded-lg text-center transition-all min-h-[60px] ${isCurrentMonth ? 'hover:bg-white/10' : 'opacity-30'} ${isSelected ? 'ring-2 ring-blue-500 bg-blue-500/20' : ''} ${isToday ? 'border border-yellow-400' : ''}`}>
              <div className={`text-sm ${isCurrentMonth ? 'text-white' : 'text-slate-500'}`}>{date.getDate()}</div>
              {summary && (
                <div className="flex gap-0.5 justify-center mt-1 flex-wrap">
                  {summary.present > 0 && <span className={`w-2 h-2 rounded-full ${statusColors.present}`} title={`${summary.present} present`} />}
                  {summary.absent > 0 && <span className={`w-2 h-2 rounded-full ${statusColors.absent}`} title={`${summary.absent} absent`} />}
                  {summary.late > 0 && <span className={`w-2 h-2 rounded-full ${statusColors.late}`} title={`${summary.late} late`} />}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
