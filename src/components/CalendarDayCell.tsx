import React from 'react';
import { Lesson } from '@/types/lesson';
import { cn } from '@/lib/utils';
import { Clock, AlertTriangle, GripVertical } from 'lucide-react';

interface CalendarDayCellProps {
  date: Date;
  lessons: Lesson[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isTermDay: boolean;
  onDrop: (lessonId: string, date: string) => void;
  onLessonClick: (lesson: Lesson) => void;
  onDragStart: (e: React.DragEvent, lesson: Lesson) => void;
  conflicts: Map<string, boolean>;
}

const SUBJECT_COLORS: Record<string, string> = {
  'Language & Literacy': 'bg-blue-500',
  'Numeracy': 'bg-green-500',
  'Creative Arts': 'bg-purple-500',
  'Our World Our People': 'bg-orange-500',
};

export const CalendarDayCell: React.FC<CalendarDayCellProps> = ({
  date, lessons, isCurrentMonth, isToday, isTermDay, onDrop, onLessonClick, onDragStart, conflicts
}) => {
  const dateStr = date.toISOString().split('T')[0];
  const dayNum = date.getDate();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-blue-500/20');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-blue-500/20');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-blue-500/20');
    const lessonId = e.dataTransfer.getData('lessonId');
    if (lessonId) onDrop(lessonId, dateStr);
  };

  return (
    <div
      className={cn(
        'min-h-[100px] p-1 border border-white/10 transition-colors',
        isCurrentMonth ? 'bg-white/5' : 'bg-white/[0.02]',
        isToday && 'ring-2 ring-blue-500 ring-inset',
        !isTermDay && 'opacity-50'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={cn(
        'text-xs font-bold mb-1',
        isToday ? 'text-blue-400' : isCurrentMonth ? 'text-white' : 'text-slate-500'
      )}>
        {dayNum}
      </div>
      
      <div className="space-y-1 max-h-[80px] overflow-y-auto scrollbar-thin">
        {lessons.slice(0, 3).map(lesson => {
          const hasConflict = conflicts.get(lesson.id);
          return (
            <div
              key={lesson.id}
              draggable
              onDragStart={(e) => onDragStart(e, lesson)}
              onClick={() => onLessonClick(lesson)}
              className={cn(
                'text-[10px] p-1 rounded cursor-pointer flex items-center gap-1 group',
                SUBJECT_COLORS[lesson.subject] || 'bg-slate-500',
                'hover:brightness-110 transition-all'
              )}
            >
              <GripVertical className="w-2 h-2 opacity-0 group-hover:opacity-100 flex-shrink-0" />
              <span className="truncate flex-1 text-white font-medium">{lesson.title}</span>
              {lesson.scheduledTime && <Clock className="w-2 h-2 text-white/70" />}
              {hasConflict && <AlertTriangle className="w-2 h-2 text-yellow-300" />}
            </div>
          );
        })}
        {lessons.length > 3 && (
          <div className="text-[9px] text-slate-400 text-center">+{lessons.length - 3} more</div>
        )}
      </div>
    </div>
  );
};
