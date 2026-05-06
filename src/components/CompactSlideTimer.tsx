import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';

interface CompactSlideTimerProps {
  duration: number; // in seconds
  autoStart?: boolean;
  onComplete?: () => void;
}

export const CompactSlideTimer: React.FC<CompactSlideTimerProps> = ({ 
  duration, 
  autoStart = false,
  onComplete 
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setTimeLeft(duration);
    setIsRunning(autoStart);
    setIsComplete(false);
  }, [duration, autoStart]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setIsComplete(true);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete]);

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setTimeLeft(duration);
    setIsRunning(false);
    setIsComplete(false);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percentage = (timeLeft / duration) * 100;

  const getTimerColor = () => {
    if (isComplete) return 'text-red-600 bg-red-100';
    if (timeLeft <= 10) return 'text-red-600 bg-red-100';
    if (timeLeft <= 30) return 'text-orange-600 bg-orange-100';
    return 'text-blue-600 bg-blue-100';
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getTimerColor()} transition-colors`}>
      <Timer className="w-4 h-4" />
      <span className="font-black text-sm min-w-[3rem] text-center">
        {minutes}:{seconds.toString().padStart(2, '0')}
      </span>
      <div className="flex gap-1">
        <button onClick={toggleTimer} className="hover:scale-110 transition-transform">
          {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        </button>
        <button onClick={resetTimer} className="hover:scale-110 transition-transform">
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
