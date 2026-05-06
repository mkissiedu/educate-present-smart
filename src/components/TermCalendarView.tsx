import React, { useState, useMemo } from 'react';
import { useTermContext } from '@/contexts/TermContext';
import { useLessonContext } from '@/contexts/LessonContext';
import { Lesson } from '@/types/lesson';
import { CalendarDayCell } from './CalendarDayCell';
import { UnscheduledLessonsSidebar } from './UnscheduledLessonsSidebar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TIME_SLOTS } from '@/types/term';

interface TermCalendarViewProps {
  classLevel: string;
  subjectFilter: string;
  onSelectLesson: (lesson: Lesson) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const TermCalendarView: React.FC<TermCalendarViewProps> = ({ classLevel, subjectFilter, onSelectLesson }) => {
  const { selectedTerm, scheduleLessonOnDate, getScheduleConflicts } = useTermContext();
  const { lessons } = useLessonContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [conflictModal, setConflictModal] = useState<{ lessonId: string; date: string; conflicts: any[] } | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('09:00');
  const [draggedLesson, setDraggedLesson] = useState<Lesson | null>(null);

  const filteredLessons = useMemo(() => {
    return lessons.filter(l => {
      if (classLevel !== 'All' && l.class !== classLevel) return false;
      if (subjectFilter !== 'All' && l.subject !== subjectFilter) return false;
      return true;
    });
  }, [lessons, classLevel, subjectFilter]);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const days: Date[] = [];
    for (let i = startPad - 1; i >= 0; i--) days.push(new Date(year, month, -i));
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    const endPad = 42 - days.length;
    for (let i = 1; i <= endPad; i++) days.push(new Date(year, month + 1, i));
    return days;
  }, [currentDate]);

  const isTermDay = (date: Date): boolean => {
    if (!selectedTerm) return true;
    const d = date.toISOString().split('T')[0];
    return d >= selectedTerm.startDate && d <= selectedTerm.endDate;
  };

  const handleDrop = async (lessonId: string, date: string) => {
    const conflicts = getScheduleConflicts(date, selectedTime, lessonId);
    if (conflicts.length > 0) {
      setConflictModal({ lessonId, date, conflicts });
    } else {
      await scheduleLessonOnDate(lessonId, date, selectedTime);
    }
    setDraggedLesson(null);
  };

  const handleForceSchedule = async () => {
    if (conflictModal) {
      await scheduleLessonOnDate(conflictModal.lessonId, conflictModal.date, selectedTime);
      setConflictModal(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, lesson: Lesson) => {
    e.dataTransfer.setData('lessonId', lesson.id);
    setDraggedLesson(lesson);
  };

  const conflictMap = useMemo(() => {
    const map = new Map<string, boolean>();
    filteredLessons.forEach(l => {
      if (l.scheduledDate && l.scheduledTime) {
        const conflicts = getScheduleConflicts(l.scheduledDate, l.scheduledTime, l.id);
        if (conflicts.length > 0) map.set(l.id, true);
      }
    });
    return map;
  }, [filteredLessons, getScheduleConflicts]);

  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="flex gap-4">
      <div className="flex-1 bg-white/10 backdrop-blur-md rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="text-white hover:bg-white/10">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h3 className="text-lg font-bold text-white min-w-[180px] text-center">{monthYear}</h3>
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="text-white hover:bg-white/10">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-300">Time:</span>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger className="w-24 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-0">
          {WEEKDAYS.map(day => (
            <div key={day} className="text-center text-xs font-bold text-slate-400 py-2 border-b border-white/10">{day}</div>
          ))}
          {calendarDays.map((date, idx) => {
            const dateStr = date.toISOString().split('T')[0];
            const dayLessons = filteredLessons.filter(l => l.scheduledDate === dateStr);
            return (
              <CalendarDayCell key={idx} date={date} lessons={dayLessons} isCurrentMonth={date.getMonth() === currentDate.getMonth()} isToday={date.toDateString() === new Date().toDateString()} isTermDay={isTermDay(date)} onDrop={handleDrop} onLessonClick={onSelectLesson} onDragStart={handleDragStart} conflicts={conflictMap} />
            );
          })}
        </div>

        {draggedLesson && (
          <div className="mt-3 p-2 bg-blue-500/20 rounded-lg text-sm text-blue-300 text-center">
            Dragging: <strong>{draggedLesson.title}</strong>
          </div>
        )}
      </div>

      <div className="w-64 flex-shrink-0">
        <UnscheduledLessonsSidebar lessons={filteredLessons} onDragStart={handleDragStart} />
      </div>

      <Dialog open={!!conflictModal} onOpenChange={() => setConflictModal(null)}>
        <DialogContent className="bg-slate-900 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" /> Schedule Conflict
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-slate-300">Another lesson is scheduled at this time:</p>
            {conflictModal?.conflicts.map(c => (
              <div key={c.lessonId} className="p-2 bg-yellow-500/20 rounded text-yellow-300 text-sm">{c.lessonTitle} at {c.scheduledTime}</div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button onClick={() => setConflictModal(null)} variant="outline" className="flex-1">Cancel</Button>
              <Button onClick={handleForceSchedule} className="flex-1 bg-yellow-600 hover:bg-yellow-700">Schedule Anyway</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
