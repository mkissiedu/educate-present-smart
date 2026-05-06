import React, { useState, useEffect } from 'react';
import { CATALYST_IMAGE } from '../CatalystMascot';
import { Button } from '../ui/button';
import { SOUND_MATCH_DATA, SoundMatchItem } from '@/types/phonics-games';
import { Volume2, Star, RefreshCw } from 'lucide-react';

interface Props {
  onComplete: (score: number, total: number) => void;
  onBack: () => void;
}

export const SoundMatchGame: React.FC<Props> = ({ onComplete, onBack }) => {
  const [items, setItems] = useState<SoundMatchItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const shuffled = [...SOUND_MATCH_DATA].sort(() => Math.random() - 0.5).slice(0, 8);
    setItems(shuffled);
  }, []);

  useEffect(() => {
    if (items.length > 0 && currentIndex < items.length) {
      const correct = items[currentIndex].letter;
      const others = SOUND_MATCH_DATA.filter(i => i.letter !== correct).sort(() => Math.random() - 0.5).slice(0, 3).map(i => i.letter);
      setOptions([correct, ...others].sort(() => Math.random() - 0.5));
    }
  }, [currentIndex, items]);

  const speakSound = () => {
    if (items[currentIndex]) {
      const utterance = new SpeechSynthesisUtterance(items[currentIndex].word);
      utterance.rate = 0.7;
      speechSynthesis.speak(utterance);
    }
  };

  const handleSelect = (letter: string) => {
    const isCorrect = letter === items[currentIndex].letter;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) setScore(s => s + 1);
    
    setTimeout(() => {
      setFeedback(null);
      if (currentIndex + 1 >= items.length) {
        setShowResult(true);
        onComplete(score + (isCorrect ? 1 : 0), items.length);
      } else {
        setCurrentIndex(i => i + 1);
      }
    }, 1000);
  };

  if (showResult) {
    return (
      <div className="text-center p-8">
        <img src={CATALYST_IMAGE} alt="Catalyst" className="w-32 h-32 mx-auto mb-4 rounded-2xl border-4 border-blue-400" />
        <h2 className="text-4xl font-black text-blue-600 mb-4">{score >= items.length * 0.7 ? 'Amazing!' : 'Good Try!'}</h2>
        <div className="flex justify-center gap-1 mb-4">{Array(score).fill(0).map((_, i) => <Star key={i} className="w-8 h-8 text-yellow-400 fill-yellow-400" />)}</div>
        <p className="text-2xl font-bold text-gray-700 mb-6">Score: {score}/{items.length}</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={onBack} variant="outline" size="lg">Back to Games</Button>
          <Button onClick={() => window.location.reload()} size="lg" className="bg-gradient-to-r from-blue-500 to-indigo-500"><RefreshCw className="mr-2" />Play Again</Button>
        </div>
      </div>
    );
  }

  if (!items.length) return <div className="text-center p-8">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Button onClick={onBack} variant="ghost">Back</Button>
        <div className="flex items-center gap-2"><Star className="text-yellow-400" /><span className="font-bold text-xl">{score}</span></div>
        <span className="text-gray-500 font-bold">{currentIndex + 1}/{items.length}</span>
      </div>
      <div className={`text-center p-8 rounded-3xl transition-all ${feedback === 'correct' ? 'bg-green-100' : feedback === 'wrong' ? 'bg-red-100' : 'bg-gradient-to-br from-blue-100 to-indigo-100'}`}>
        <p className="text-xl text-blue-600 font-bold mb-4">Which letter makes this sound?</p>
        <Button onClick={speakSound} size="lg" className="mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full px-8"><Volume2 className="mr-2" />Play Sound: "{items[currentIndex]?.word}"</Button>
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          {options.map(letter => (
            <button key={letter} onClick={() => handleSelect(letter)} disabled={feedback !== null}
              className="p-6 text-4xl font-black rounded-2xl bg-white border-4 border-blue-300 hover:border-blue-500 hover:bg-blue-50 transition-all shadow-lg disabled:opacity-50">
              {letter}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
