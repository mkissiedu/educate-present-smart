import React, { useState } from 'react';
import { Lesson, LESSONS_PER_WEEK, TOTAL_WEEKS } from '@/types/lesson';
import { LessonCardWithPlanning } from './LessonCardWithPlanning';
import { usePlanningStatus } from '@/hooks/usePlanningStatus';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronDown, ChevronUp, Calendar, Plus, CheckCircle, BookOpen } from 'lucide-react';

interface WeeklyLessonViewProps {
  lessons: Lesson[];
  subject: string;
  classLevel: string;
  onSelectLesson: (lesson: Lesson) => void;
  onEditLesson?: (lesson: Lesson) => void;
  onCreateLesson?: (week: number, lessonNumber: number) => void;
  canEdit?: boolean;
}

export const WeeklyLessonView: React.FC<WeeklyLessonViewProps> = ({
  lessons, subject, classLevel, onSelectLesson, onEditLesson, onCreateLesson, canEdit
}) => {
  const [expandedWeeks, setExpandedWeeks] = useState<number[]>([1]);
  const lessonsPerWeek = LESSONS_PER_WEEK[subject] || 5;
  const { user } = useAuth();
  const { getPlanningSessionForLesson } = usePlanningStatus(user?.id);

  const toggleWeek = (week: number) => {
    setExpandedWeeks(prev => prev.includes(week) ? prev.filter(w => w !== week) : [...prev, week]);
  };

  const getLessonsForWeek = (week: number) => {
    return lessons.filter(l => l.week === week && l.subject === subject && (classLevel === 'All' || l.class === classLevel))
      .sort((a, b) => a.lessonNumber - b.lessonNumber);
  };

  const getMissingSlots = (week: number, existingLessons: Lesson[]) => {
    const slots: number[] = [];
    for (let i = 1; i <= lessonsPerWeek; i++) {
      if (!existingLessons.find(l => l.lessonNumber === i)) slots.push(i);
    }
    return slots;
  };

  const getWeekPlanningStatus = (weekLessons: Lesson[]) => {
    const planned = weekLessons.filter(l => getPlanningSessionForLesson(l.id)?.status === 'completed').length;
    return { planned, total: weekLessons.length };
  };

  return (
    <div className="space-y-3">
      {Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1).map(week => {
        const weekLessons = getLessonsForWeek(week);
        const isExpanded = expandedWeeks.includes(week);
        const missingSlots = getMissingSlots(week, weekLessons);
        const progress = (weekLessons.length / lessonsPerWeek) * 100;
        const planningStatus = getWeekPlanningStatus(weekLessons);

        return (
          <div key={week} className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-3 md:p-4 cursor-pointer hover:bg-white/5" onClick={() => toggleWeek(week)}>
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm md:text-base">Week {week}</h3>
                  <p className="text-white/60 text-xs">{weekLessons.length}/{lessonsPerWeek} lessons</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Planning Status for Week */}
                {weekLessons.length > 0 && !canEdit && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1 text-green-400">
                      <CheckCircle className="w-3 h-3" />
                      <span>{planningStatus.planned}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      <BookOpen className="w-3 h-3" />
                      <span>{planningStatus.total - planningStatus.planned}</span>
                    </div>
                  </div>
                )}
                <div className="w-20 md:w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-white" /> : <ChevronDown className="w-5 h-5 text-white" />}
              </div>
            </div>
            
            {isExpanded && (
              <div className="p-3 md:p-4 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                  {weekLessons.map(lesson => (
                    <LessonCardWithPlanning 
                      key={lesson.id} 
                      lesson={lesson} 
                      planningSession={getPlanningSessionForLesson(lesson.id)}
                      onClick={() => onSelectLesson(lesson)}
                      onPlan={() => onSelectLesson(lesson)}
                      onEdit={onEditLesson ? () => onEditLesson(lesson) : undefined} 
                      canEdit={canEdit} 
                    />
                  ))}
                  {canEdit && missingSlots.map(slot => (
                    <div key={`empty-${slot}`} onClick={() => onCreateLesson?.(week, slot)}
                      className="bg-white/5 border-2 border-dashed border-white/30 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-all min-h-[200px]">
                      <Plus className="w-10 h-10 text-white/50 mb-2" />
                      <span className="text-white/50 font-bold text-sm">Lesson {slot}</span>
                      <span className="text-white/30 text-xs">Click to create</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
