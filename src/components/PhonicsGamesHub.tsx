import React, { useState, useEffect } from 'react';
import { CATALYST_LOGO } from './CatalystMascot';
import { Button } from './ui/button';
import { SoundMatchGame } from './games/SoundMatchGame';
import { WordBuilderGame } from './games/WordBuilderGame';
import { RhymeTimeGame } from './games/RhymeTimeGame';
import { GameScoreCard } from './games/GameScoreCard';
import { GameScore } from '@/types/phonics-games';
import { Gamepad2, Music2, Puzzle, BookOpen, Trophy, X } from 'lucide-react';


interface Props {
  onClose: () => void;
  studentId?: string;
}

type GameType = 'hub' | 'sound_match' | 'word_builder' | 'rhyme_time';

export const PhonicsGamesHub: React.FC<Props> = ({ onClose, studentId }) => {
  const [currentGame, setCurrentGame] = useState<GameType>('hub');
  const [scores, setScores] = useState<GameScore[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('phonics_scores');
    if (saved) setScores(JSON.parse(saved));
  }, []);

  const saveScore = (gameType: GameScore['game_type'], score: number, total: number) => {
    const newScore: GameScore = {
      student_id: studentId,
      game_type: gameType,
      score,
      total_questions: total,
      accuracy: Math.round((score / total) * 100),
      time_spent: 0,
      level: 1,
      played_at: new Date().toISOString()
    };
    const updated = [...scores, newScore];
    setScores(updated);
    localStorage.setItem('phonics_scores', JSON.stringify(updated));
  };

  const games = [
    { id: 'sound_match' as GameType, name: 'Sound Match', desc: 'Match letters to sounds', icon: Music2, color: 'from-purple-500 to-pink-500', bg: 'from-purple-100 to-pink-100' },
    { id: 'word_builder' as GameType, name: 'Word Builder', desc: 'Build words from letters', icon: Puzzle, color: 'from-green-500 to-teal-500', bg: 'from-green-100 to-teal-100' },
    { id: 'rhyme_time' as GameType, name: 'Rhyme Time', desc: 'Find rhyming words', icon: BookOpen, color: 'from-pink-500 to-rose-500', bg: 'from-pink-100 to-rose-100' }
  ];

  if (currentGame === 'sound_match') return <div className="bg-white rounded-3xl shadow-2xl max-w-2xl mx-auto"><SoundMatchGame onComplete={(s, t) => saveScore('sound_match', s, t)} onBack={() => setCurrentGame('hub')} /></div>;
  if (currentGame === 'word_builder') return <div className="bg-white rounded-3xl shadow-2xl max-w-2xl mx-auto"><WordBuilderGame onComplete={(s, t) => saveScore('word_builder', s, t)} onBack={() => setCurrentGame('hub')} /></div>;
  if (currentGame === 'rhyme_time') return <div className="bg-white rounded-3xl shadow-2xl max-w-2xl mx-auto"><RhymeTimeGame onComplete={(s, t) => saveScore('rhyme_time', s, t)} onBack={() => setCurrentGame('hub')} /></div>;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <img src={CATALYST_LOGO} alt="Catalyst" className="h-16 object-contain bg-white rounded-lg px-2 py-1" />
          <div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Learning Games</h2>
            <p className="text-blue-200">Interactive games to boost learning!</p>
          </div>
        </div>
        <Button onClick={onClose} variant="ghost" size="icon" className="text-white hover:bg-white/20"><X /></Button>
      </div>


      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {games.map(game => (
          <button key={game.id} onClick={() => setCurrentGame(game.id)}
            className={`p-6 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/30 shadow-xl hover:scale-105 transition-all text-left`}>
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center mb-4 shadow-lg`}>
              <game.icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-black text-white mb-1">{game.name}</h3>
            <p className="text-sm text-blue-200">{game.desc}</p>
          </button>
        ))}
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex items-center gap-2 mb-4"><Trophy className="w-6 h-6 text-amber-400" /><h3 className="text-xl font-bold text-white">Your Progress</h3></div>
        <div className="grid md:grid-cols-3 gap-4">
          {games.map(g => <GameScoreCard key={g.id} scores={scores} gameType={g.id as GameScore['game_type']} />)}
        </div>
      </div>
    </div>
  );
};
