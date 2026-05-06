import React, { useState, useEffect } from 'react';

interface TimerWidgetProps {
  onClose?: () => void;
  initialDuration?: number;
  embedded?: boolean;
}

export const TimerWidget: React.FC<TimerWidgetProps> = ({ onClose, initialDuration = 300, embedded = false }) => {
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const content = (
    <div className="text-center">
      <div className="text-8xl font-bold text-[#00d4aa] mb-6">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => setIsRunning(true)}
          disabled={isRunning}
          className="bg-[#00d4aa] text-white px-8 py-4 rounded-xl text-2xl font-semibold hover:bg-[#00b894] disabled:opacity-50"
        >
          Start
        </button>
        <button
          onClick={() => setIsRunning(false)}
          disabled={!isRunning}
          className="bg-[#ff6b6b] text-white px-8 py-4 rounded-xl text-2xl font-semibold hover:bg-[#ee5a52] disabled:opacity-50"
        >
          Pause
        </button>
        <button
          onClick={() => { setIsRunning(false); setTimeLeft(initialDuration); }}
          className="bg-gray-500 text-white px-8 py-4 rounded-xl text-2xl font-semibold hover:bg-gray-600"
        >
          Reset
        </button>
      </div>
    </div>
  );

  if (embedded) return content;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-12 shadow-2xl max-w-2xl w-full">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold text-[#1a2332]">Timer</h2>
          <button onClick={onClose} className="text-4xl text-gray-500 hover:text-gray-700">×</button>
        </div>
        {content}
      </div>
    </div>
  );
};
