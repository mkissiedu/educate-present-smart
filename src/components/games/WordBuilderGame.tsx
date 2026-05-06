import React, { useState, useEffect } from 'react';
import { CATALYST_IMAGE } from '../CatalystMascot';
import { Button } from '../ui/button';
import { WORD_BUILDER_DATA, WordBuilderItem } from '@/types/phonics-games';
import { Star, RefreshCw, Lightbulb, Volume2 } from 'lucide-react';

interface Props {
  onComplete: (score: number, total: number) => void;
  onBack: () => void;
}

export const WordBuilderGame: React.FC<Props> = ({ onComplete, onBack }) => {
  const [items, setItems] = useState<WordBuilderItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [available, setAvailable] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const shuffled = [...WORD_BUILDER_DATA].sort(() => Math.random() - 0.5).slice(0, 6);
    setItems(shuffled);
  }, []);

  useEffect(() => {
    if (items.length > 0 && currentIndex < items.length) {
      const extra = ['x', 'z', 'q'].sort(() => Math.random() - 0.5).slice(0, 2);
      setAvailable([...items[currentIndex].phonemes, ...extra].sort(() => Math.random() - 0.5));
      setSelected([]);
      setShowHint(false);
    }
  }, [currentIndex, items]);

  const speak = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.7;
    speechSynthesis.speak(u);
  };

  const addLetter = (letter: string, idx: number) => {
    setSelected([...selected, letter]);
    setAvailable(available.filter((_, i) => i !== idx));
  };

  const removeLetter = (idx: number) => {
    const letter = selected[idx];
    setAvailable([...available, letter]);
    setSelected(selected.filter((_, i) => i !== idx));
  };

  const checkWord = () => {
    const word = selected.join('');
    const isCorrect = word === items[currentIndex].word;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) { setScore(s => s + 1); speak('Great job!'); }
    
    setTimeout(() => {
      setFeedback(null);
      if (currentIndex + 1 >= items.length) {
        setShowResult(true);
        onComplete(score + (isCorrect ? 1 : 0), items.length);
      } else {
        setCurrentIndex(i => i + 1);
      }
    }, 1500);
  };

  if (showResult) {
    return (
      <div className="text-center p-8">
        <img src={CATALYST_IMAGE} alt="Catalyst" className="w-32 h-32 mx-auto mb-4 rounded-2xl border-4 border-blue-400" />
        <h2 className="text-4xl font-black text-blue-600 mb-4">{score >= items.length * 0.7 ? 'Word Master!' : 'Keep Practicing!'}</h2>
        <div className="flex justify-center gap-1 mb-4">{Array(score).fill(0).map((_, i) => <Star key={i} className="w-8 h-8 text-yellow-400 fill-yellow-400" />)}</div>
        <p className="text-2xl font-bold text-gray-700 mb-6">Score: {score}/{items.length}</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={onBack} variant="outline" size="lg">Back</Button>
          <Button onClick={() => window.location.reload()} size="lg" className="bg-gradient-to-r from-green-500 to-teal-500"><RefreshCw className="mr-2" />Again</Button>
        </div>
      </div>
    );
  }

  if (!items.length) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Button onClick={onBack} variant="ghost">Back</Button>
        <div className="flex items-center gap-2"><Star className="text-yellow-400" /><span className="font-bold text-xl">{score}</span></div>
        <span className="text-gray-500 font-bold">{currentIndex + 1}/{items.length}</span>
      </div>
      <div className={`text-center p-8 rounded-3xl ${feedback === 'correct' ? 'bg-green-100' : feedback === 'wrong' ? 'bg-red-100' : 'bg-gradient-to-br from-green-100 to-teal-100'}`}>
        <p className="text-xl text-green-700 font-bold mb-2">Build the word!</p>
        <Button onClick={() => setShowHint(!showHint)} variant="ghost" size="sm" className="mb-4"><Lightbulb className="mr-1 w-4 h-4" />Hint</Button>
        {showHint && <p className="text-lg text-gray-600 mb-4 italic">{items[currentIndex]?.hint}</p>}
        <div className="min-h-[80px] flex justify-center gap-2 mb-6 p-4 bg-white rounded-2xl border-4 border-dashed border-green-300">
          {selected.map((l, i) => <button key={i} onClick={() => removeLetter(i)} className="w-14 h-14 text-2xl font-black bg-green-500 text-white rounded-xl shadow-lg hover:bg-green-600">{l}</button>)}
          {selected.length === 0 && <span className="text-gray-400 self-center">Tap letters below</span>}
        </div>
        <div className="flex justify-center gap-2 flex-wrap mb-6">
          {available.map((l, i) => <button key={i} onClick={() => addLetter(l, i)} className="w-14 h-14 text-2xl font-black bg-white border-4 border-green-300 rounded-xl shadow hover:bg-green-50">{l}</button>)}
        </div>
        <Button onClick={checkWord} disabled={selected.length < 2} size="lg" className="bg-gradient-to-r from-green-500 to-teal-500">Check Word</Button>
      </div>
    </div>
  );
};
