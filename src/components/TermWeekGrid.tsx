import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WeekStatus } from '@/types/term';
import { Lesson } from '@/types/lesson';
import { CheckCircle, Clock, AlertCircle, Plus, BookOpen, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  weekStatuses: WeekStatus[];
  lessons: Lesson[];
  subject: string;
  classLevel: string;
  onSelectLesson: (lesson: Lesson) => void;
}

const SUBJECT_COLORS: Record<string, string> = {
  'Language & Literacy': 'border-l-blue-500',
  'Numeracy': 'border-l-green-500',
  'Creative Arts': 'border-l-purple-500',
  'Our World Our People': 'border-l-orange-500',
  "Ananse's Phonics": 'border-l-amber-500',
  'English Language': 'border-l-indigo-500',
  'Mathematics': 'border-l-violet-500',
  'Science': 'border-l-teal-500',
  'Social Studies': 'border-l-red-500',
  'Computing': 'border-l-cyan-500',
  'French': 'border-l-rose-500',
  'Ghanaian Language': 'border-l-yellow-500',
  'Religious & Moral Education': 'border-l-purple-400',
  'Career Technology': 'border-l-gray-500',
  'Physical Education': 'border-l-lime-500',
};

export const TermWeekGrid: React.FC<Props> = ({ weekStatuses, lessons, subject, classLevel, onSelectLesson }) => {
  const navigate = useNavigate();

  const getLessonsForWeek = (week: number) => {
    return lessons.filter(l => l.week === week && (subject === 'All' || l.subject === subject) && (classLevel === 'All' || l.class === classLevel));
  };

  const getWeekStatusColor = (status: WeekStatus) => {
    if (status.isCurrentWeek) return 'border-yellow-400 bg-yellow-400/10';
    if (status.isPast && status.lessonsPlanned === 0) return 'border-red-400/50 bg-red-400/5';
    if (status.isPast) return 'border-green-400/50 bg-green-400/5';
    return 'border-slate-600 bg-slate-800/50';
  };

  const getWeekIcon = (status: WeekStatus) => {
    if (status.isCurrentWeek) return <Clock className="w-4 h-4 text-yellow-400" />;
    if (status.isPast && status.lessonsCompleted > 0) return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (status.isPast && status.lessonsPlanned === 0) return <AlertCircle className="w-4 h-4 text-red-400" />;
    return <BookOpen className="w-4 h-4 text-slate-400" />;
  };

  const handleCreateLesson = (week: number) => {
    const params = new URLSearchParams({ week: week.toString(), class: classLevel });
    if (subject !== 'All') params.set('subject', subject);
    navigate(`/editor/new?${params.toString()}`);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {weekStatuses.map((status) => {
        const weekLessons = getLessonsForWeek(status.week);
        const scheduledCount = weekLessons.filter(l => l.scheduledDate).length;
        return (
          <div key={status.week} className={`rounded-xl border-2 p-3 transition-all hover:scale-[1.02] ${getWeekStatusColor(status)}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getWeekIcon(status)}
                <span className="font-bold text-white">Week {status.week}</span>
              </div>
              {status.isCurrentWeek && (
                <span className="text-[10px] bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold">NOW</span>
              )}
            </div>
            
            <div className="text-xs text-slate-400 mb-2">
              {new Date(status.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(status.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>

            {scheduledCount > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-green-400 mb-2">
                <CalendarCheck className="w-3 h-3" />
                <span>{scheduledCount} scheduled</span>
              </div>
            )}

            <div className="space-y-1.5 mb-3 max-h-32 overflow-y-auto">
              {weekLessons.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No lessons planned</p>
              ) : (
                weekLessons.slice(0, 4).map(lesson => (
                  <div key={lesson.id} onClick={() => onSelectLesson(lesson)} className={`bg-white/10 rounded-lg px-2 py-1.5 cursor-pointer hover:bg-white/20 transition-colors border-l-4 ${SUBJECT_COLORS[lesson.subject] || 'border-l-slate-500'}`}>
                    <p className="text-xs text-white font-medium truncate">{lesson.title}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-slate-400 truncate">{lesson.subject}</p>
                      {lesson.scheduledDate && (
                        <span className="text-[9px] text-green-400">{lesson.scheduledTime || 'Scheduled'}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
              {weekLessons.length > 4 && (
                <p className="text-xs text-blue-400">+{weekLessons.length - 4} more</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-400">{weekLessons.length} lessons</span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => handleCreateLesson(status.week)} className="h-7 px-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                <Plus className="w-3 h-3 mr-1" /> Add
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
