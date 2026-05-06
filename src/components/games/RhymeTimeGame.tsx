import React, { useState, useEffect } from 'react';
import { CATALYST_IMAGE } from '../CatalystMascot';
import { Button } from '../ui/button';
import { RHYME_DATA, RhymeItem } from '@/types/phonics-games';
import { Star, RefreshCw, Music, Volume2 } from 'lucide-react';

interface Props {
  onComplete: (score: number, total: number) => void;
  onBack: () => void;
}

export const RhymeTimeGame: React.FC<Props> = ({ onComplete, onBack }) => {
  const [items, setItems] = useState<RhymeItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const shuffled = [...RHYME_DATA].sort(() => Math.random() - 0.5).slice(0, 8);
    setItems(shuffled);
  }, []);

  const speak = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.7;
    speechSynthesis.speak(u);
  };

  const handleSelect = (answer: string) => {
    setSelectedAnswer(answer);
    const isCorrect = answer === items[currentIndex].correctAnswer;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) { setScore(s => s + 1); speak('Excellent!'); }
    
    setTimeout(() => {
      setFeedback(null);
      setSelectedAnswer(null);
      if (currentIndex + 1 >= items.length) {
        setShowResult(true);
        onComplete(score + (isCorrect ? 1 : 0), items.length);
      } else {
        setCurrentIndex(i => i + 1);
      }
    }, 1200);
  };

  if (showResult) {
    return (
      <div className="text-center p-8">
        <img src={CATALYST_IMAGE} alt="Catalyst" className="w-32 h-32 mx-auto mb-4 rounded-2xl border-4 border-blue-400" />
        <h2 className="text-4xl font-black text-blue-600 mb-4">{score >= items.length * 0.7 ? 'Rhyme Star!' : 'Nice Effort!'}</h2>
        <div className="flex justify-center gap-1 mb-4">{Array(score).fill(0).map((_, i) => <Star key={i} className="w-8 h-8 text-yellow-400 fill-yellow-400" />)}</div>
        <p className="text-2xl font-bold text-gray-700 mb-6">Score: {score}/{items.length}</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={onBack} variant="outline" size="lg">Back to Games</Button>
          <Button onClick={() => window.location.reload()} size="lg" className="bg-gradient-to-r from-pink-500 to-rose-500"><RefreshCw className="mr-2" />Play Again</Button>
        </div>
      </div>
    );
  }

  if (!items.length) return <div className="text-center p-8">Loading...</div>;

  const current = items[currentIndex];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Button onClick={onBack} variant="ghost">Back</Button>
        <div className="flex items-center gap-2"><Star className="text-yellow-400" /><span className="font-bold text-xl">{score}</span></div>
        <span className="text-gray-500 font-bold">{currentIndex + 1}/{items.length}</span>
      </div>
      
      <div className={`text-center p-8 rounded-3xl transition-all ${feedback === 'correct' ? 'bg-green-100' : feedback === 'wrong' ? 'bg-red-100' : 'bg-gradient-to-br from-pink-100 to-rose-100'}`}>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Music className="w-8 h-8 text-pink-500" />
          <p className="text-xl text-pink-700 font-bold">Find the rhyming word!</p>
        </div>
        
        <div className="mb-8">
          <Button onClick={() => speak(current.targetWord)} variant="ghost" className="mb-2"><Volume2 className="mr-2" />Hear Word</Button>
          <div className="inline-block px-12 py-6 bg-white rounded-2xl border-4 border-pink-400 shadow-xl">
            <span className="text-5xl font-black text-pink-600">{current.targetWord}</span>
          </div>
        </div>
        
        <p className="text-lg text-gray-600 mb-4">Which word rhymes with <strong>{current.targetWord}</strong>?</p>
        
        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
          {current.options.map(option => (
            <button key={option} onClick={() => handleSelect(option)} disabled={feedback !== null}
              className={`p-5 text-2xl font-bold rounded-2xl transition-all shadow-lg ${
                selectedAnswer === option
                  ? feedback === 'correct' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  : 'bg-white border-4 border-pink-300 hover:border-pink-500 hover:bg-pink-50'
              } disabled:opacity-60`}>
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
