import React from 'react';
import { Lesson } from '@/types/lesson';
import { BookOpen, GripVertical, Clock } from 'lucide-react';

interface Props {
  lessons: Lesson[];
  onDragStart: (e: React.DragEvent, lesson: Lesson) => void;
}

const SUBJECT_COLORS: Record<string, string> = {
  'Language & Literacy': 'border-blue-500 bg-blue-500/10',
  'Numeracy': 'border-green-500 bg-green-500/10',
  'Creative Arts': 'border-purple-500 bg-purple-500/10',
  'Our World Our People': 'border-orange-500 bg-orange-500/10',
};

export const UnscheduledLessonsSidebar: React.FC<Props> = ({ lessons, onDragStart }) => {
  const unscheduledLessons = lessons.filter(l => !l.scheduledDate);

  if (unscheduledLessons.length === 0) {
    return (
      <div className="bg-white/5 rounded-lg p-4 text-center">
        <BookOpen className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <p className="text-sm text-slate-400">All lessons scheduled!</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-lg p-3">
      <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4 text-yellow-400" />
        Unscheduled ({unscheduledLessons.length})
      </h4>
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {unscheduledLessons.map(lesson => (
          <div
            key={lesson.id}
            draggable
            onDragStart={(e) => onDragStart(e, lesson)}
            className={`p-2 rounded-lg border-l-4 cursor-grab active:cursor-grabbing hover:bg-white/10 transition-colors ${SUBJECT_COLORS[lesson.subject] || 'border-slate-500 bg-slate-500/10'}`}
          >
            <div className="flex items-start gap-2">
              <GripVertical className="w-3 h-3 text-slate-500 mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{lesson.title}</p>
                <p className="text-[10px] text-slate-400">Week {lesson.week} • {lesson.subject}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-slate-500 mt-3 text-center">
        Drag lessons to calendar dates
      </p>
    </div>
  );
};
