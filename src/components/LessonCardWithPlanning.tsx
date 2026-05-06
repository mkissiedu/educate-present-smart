import React from 'react';
import { Lesson } from '../types/lesson';
import { PlanningSession } from '@/types/planning';
import { Button } from './ui/button';
import { Clock, GraduationCap, Edit, Calendar, BookOpen, Play, CheckCircle } from 'lucide-react';
import { getSubjectThumbnail } from './CatalystMascot';

interface Props {
  lesson: Lesson;
  planningSession?: PlanningSession;
  onClick: () => void;
  onPlan: () => void;
  onEdit?: () => void;
  canEdit?: boolean;
}

const classColors: Record<string, string> = {
  'PreK 1/Nursery 1': 'bg-pink-400', 'PreK 2/Nursery 2': 'bg-pink-500',
  'KG 1': 'bg-blue-500', 'KG 2': 'bg-green-500',
  'Class 1': 'bg-yellow-500', 'Class 2': 'bg-purple-500', 'Class 3': 'bg-teal-500',
  'Class 4': 'bg-orange-500', 'Class 5': 'bg-indigo-500', 'Class 6': 'bg-rose-500',
  'JHS 1': 'bg-cyan-600', 'JHS 2': 'bg-emerald-600', 'JHS 3': 'bg-violet-600',
};

const subjectColors: Record<string, string> = {
  'Language & Literacy': 'bg-blue-500', 'Numeracy': 'bg-green-500',
  'Our World Our People': 'bg-amber-500', "Ananse's Phonics": 'bg-purple-500',
  'English Language': 'bg-blue-600', 'Mathematics': 'bg-purple-600', 'Science': 'bg-emerald-500',
};

export const LessonCardWithPlanning: React.FC<Props> = ({ lesson, planningSession, onClick, onPlan, onEdit, canEdit }) => {
  const subjectThumb = getSubjectThumbnail(lesson.subject);
  const isPlanned = planningSession?.status === 'completed';
  const isPlanning = planningSession?.status === 'planning';

  return (
    <div className={`bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-4 ${isPlanned ? 'border-green-400' : isPlanning ? 'border-amber-400' : 'border-gray-200'}`}>
      <div className="relative h-36 md:h-44 overflow-hidden cursor-pointer" onClick={isPlanned ? onClick : onPlan}>
        <img src={lesson.thumbnailUrl || subjectThumb} alt={lesson.title} className="w-full h-full object-cover" />
        {/* Status Badge */}
        <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-black shadow-lg flex items-center gap-1 ${isPlanned ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}>
          {isPlanned ? <><CheckCircle className="w-3 h-3" /> Ready to Teach</> : <><BookOpen className="w-3 h-3" /> Plan</>}
        </div>
        <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-black shadow-lg ${subjectColors[lesson.subject] || 'bg-blue-500'} text-white`}>
          {lesson.subject}
        </div>
        <div className="absolute bottom-2 right-2 bg-gradient-to-r from-gray-700 to-gray-900 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
          <Calendar className="w-3 h-3" /> W{lesson.week} | L{lesson.lessonNumber}
        </div>
        {lesson.class && (
          <div className={`absolute bottom-2 left-2 px-2 py-1 rounded-full text-xs font-black shadow-lg ${classColors[lesson.class] || 'bg-gray-500'} text-white flex items-center gap-1`}>
            <GraduationCap className="w-3 h-3" /> {lesson.class}
          </div>
        )}
      </div>
      <div className="p-3 md:p-4">
        <h3 className="text-base md:text-lg font-black text-gray-800 mb-2 line-clamp-2">{lesson.title}</h3>
        <div className="flex items-center gap-2 text-gray-600 mb-3">
          <Clock className="w-4 h-4 text-red-500" />
          <span className="text-sm font-bold">{lesson.duration}</span>
        </div>
        <div className="flex gap-2">
          {isPlanned ? (
            <Button onClick={(e) => { e.stopPropagation(); onClick(); }} 
              className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm py-2 font-bold shadow-lg">
              <Play className="mr-1 w-4 h-4" /> Teach Now
            </Button>
          ) : (
            <Button onClick={(e) => { e.stopPropagation(); onPlan(); }} 
              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm py-2 font-bold shadow-lg">
              <BookOpen className="mr-1 w-4 h-4" /> Start Planning
            </Button>
          )}
          {canEdit && onEdit && (
            <Button onClick={(e) => { e.stopPropagation(); onEdit(); }} variant="outline"
              className="px-3 py-2 rounded-full border-2 border-gray-300 text-gray-600 hover:bg-gray-50">
              <Edit className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
