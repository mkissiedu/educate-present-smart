import React from 'react';
import { Lesson } from '@/types/lesson';
import { PlanningSession, MIN_PLANNING_TIME_SECONDS } from '@/types/planning';
import { Button } from './ui/button';
import { X, BookOpen, Play, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';

interface Props {
  lesson: Lesson;
  planningSession?: PlanningSession;
  onPlan: () => void;
  onTeach: () => void;
  onClose: () => void;
}

export const LessonActionModal: React.FC<Props> = ({ lesson, planningSession, onPlan, onTeach, onClose }) => {
  const isPlanned = planningSession?.status === 'completed';
  const isPlanning = planningSession?.status === 'planning';
  const plannedTime = planningSession?.planningDurationSeconds || 0;
  const remainingTime = Math.max(MIN_PLANNING_TIME_SECONDS - plannedTime, 0);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 text-sm text-white/80 mb-2">
            <Calendar className="w-4 h-4" />
            <span>Week {lesson.week} • Lesson {lesson.lessonNumber}</span>
          </div>
          <h2 className="text-2xl font-bold">{lesson.title}</h2>
          <p className="text-white/80 mt-1">{lesson.subject} • {lesson.class}</p>
        </div>

        {/* Status */}
        <div className="p-6 border-b">
          <div className={`flex items-center gap-3 p-4 rounded-xl ${isPlanned ? 'bg-green-50 border-2 border-green-300' : 'bg-amber-50 border-2 border-amber-300'}`}>
            {isPlanned ? (
              <>
                <CheckCircle className="w-10 h-10 text-green-600" />
                <div>
                  <p className="font-bold text-green-800 text-lg">Ready to Teach</p>
                  <p className="text-sm text-green-600">Planning complete - you can now teach this lesson</p>
                </div>
              </>
            ) : isPlanning ? (
              <>
                <Clock className="w-10 h-10 text-amber-600" />
                <div>
                  <p className="font-bold text-amber-800 text-lg">Planning in Progress</p>
                  <p className="text-sm text-amber-600">{formatTime(remainingTime)} remaining to unlock "Ready to Teach"</p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="w-10 h-10 text-amber-600" />
                <div>
                  <p className="font-bold text-amber-800 text-lg">Planning Required</p>
                  <p className="text-sm text-amber-600">Review for 5 minutes to mark as Ready to Teach</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 space-y-3">
          {isPlanned ? (
            <>
              <Button onClick={onTeach} className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-bold rounded-xl">
                <Play className="w-6 h-6 mr-2" /> Start Teaching
              </Button>
              <Button onClick={onPlan} variant="outline" className="w-full py-4 text-base border-2 border-gray-300">
                <BookOpen className="w-5 h-5 mr-2" /> Review Lesson Again
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onPlan} className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-bold rounded-xl">
                <BookOpen className="w-6 h-6 mr-2" /> {isPlanning ? 'Continue Planning' : 'Start Planning'}
              </Button>
              <p className="text-center text-sm text-gray-500">
                Complete 5 minutes of planning to unlock "Ready to Teach"
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
