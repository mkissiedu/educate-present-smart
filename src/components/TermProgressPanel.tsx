import React from 'react';
import { TermProgress, SubjectProgress } from '@/types/term';
import { Progress } from '@/components/ui/progress';
import { BookOpen, CheckCircle, Clock, Target } from 'lucide-react';
import { SUBJECT_COLORS } from '@/types/user';

interface Props {
  progress: TermProgress;
}

// Map subject colors to gradient classes
const getSubjectGradient = (subject: string): string => {
  const gradients: Record<string, string> = {
    'Language & Literacy': 'from-blue-500 to-blue-600',
    'Numeracy': 'from-green-500 to-green-600',
    'Creative Arts': 'from-purple-500 to-purple-600',
    'Our World Our People': 'from-orange-500 to-orange-600',
    "Ananse's Phonics": 'from-amber-500 to-amber-600',
    'English Language': 'from-blue-500 to-indigo-600',
    'Mathematics': 'from-purple-500 to-violet-600',
    'Science': 'from-emerald-500 to-teal-600',
    'Social Studies': 'from-orange-500 to-red-500',
    'Computing': 'from-cyan-500 to-blue-500',
    'French': 'from-red-500 to-rose-600',
    'Ghanaian Language': 'from-yellow-500 to-amber-600',
    'Religious & Moral Education': 'from-indigo-500 to-purple-600',
    'Career Technology': 'from-slate-500 to-gray-600',
    'Physical Education': 'from-lime-500 to-green-600',
  };
  return gradients[subject] || 'from-gray-500 to-gray-600';
};

export const TermProgressPanel: React.FC<Props> = ({ progress }) => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-4">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-blue-400" />
        Term Progress
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-3 border border-blue-500/30">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-blue-300">Current Week</span>
          </div>
          <p className="text-2xl font-black text-white">{progress.currentWeek}/12</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg p-3 border border-green-500/30">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-green-400" />
            <span className="text-xs text-green-300">Total Lessons</span>
          </div>
          <p className="text-2xl font-black text-white">{progress.totalLessons}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg p-3 border border-purple-500/30">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-purple-300">Completed</span>
          </div>
          <p className="text-2xl font-black text-white">{progress.completedLessons}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg p-3 border border-orange-500/30">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-orange-300">Progress</span>
          </div>
          <p className="text-2xl font-black text-white">{progress.percentComplete}%</p>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-bold text-slate-300">Subject Breakdown ({progress.subjectProgress.length} subjects)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
          {progress.subjectProgress.map((sp: SubjectProgress) => (
            <div key={sp.subject} className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white truncate">{sp.subject}</span>
                <span className="text-xs text-slate-400 whitespace-nowrap ml-2">{sp.lessonsPlanned}/{sp.totalExpected}</span>
              </div>
              <Progress value={sp.percentComplete} className="h-2" />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-slate-500">{sp.indicatorsCovered.length} indicators</span>
                <span className="text-xs text-slate-400">{sp.percentComplete}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
