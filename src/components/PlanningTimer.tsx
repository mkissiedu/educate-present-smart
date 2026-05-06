import React, { useState, useEffect, useCallback } from 'react';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { MIN_PLANNING_TIME_SECONDS } from '@/types/planning';

interface PlanningTimerProps {
  startTime: Date;
  onTimeUpdate: (seconds: number) => void;
  isComplete: boolean;
}

export const PlanningTimer: React.FC<PlanningTimerProps> = ({ startTime, onTimeUpdate, isComplete }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const minTime = MIN_PLANNING_TIME_SECONDS;

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsedSeconds(elapsed);
      onTimeUpdate(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, onTimeUpdate]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const progress = Math.min((elapsedSeconds / minTime) * 100, 100);
  const canComplete = elapsedSeconds >= minTime;
  const remainingSeconds = Math.max(minTime - elapsedSeconds, 0);

  return (
    <div className={`rounded-xl p-4 ${canComplete ? 'bg-green-50 border-2 border-green-400' : 'bg-amber-50 border-2 border-amber-300'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className={`w-5 h-5 ${canComplete ? 'text-green-600' : 'text-amber-600'}`} />
          <span className="font-bold text-gray-700">Planning Time</span>
        </div>
        <div className={`text-2xl font-bold ${canComplete ? 'text-green-600' : 'text-amber-600'}`}>
          {formatTime(elapsedSeconds)}
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
        <div 
          className={`h-3 rounded-full transition-all duration-500 ${canComplete ? 'bg-green-500' : 'bg-amber-500'}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        {canComplete ? (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span className="font-bold">Ready to Teach</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-amber-600">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">{formatTime(remainingSeconds)} remaining</span>
          </div>
        )}
        <span className="text-gray-500">Min: {formatTime(minTime)}</span>
      </div>

      {canComplete && (
        <div className="mt-3 p-2 bg-green-100 rounded-lg text-center">
          <p className="text-green-700 text-xs font-medium">
            You can now save and mark this lesson as Ready to Teach
          </p>
        </div>
      )}
    </div>
  );
};
