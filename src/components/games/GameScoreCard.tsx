import React from 'react';
import { GameScore } from '@/types/phonics-games';
import { Star, Clock, Target, Trophy } from 'lucide-react';

interface Props {
  scores: GameScore[];
  gameType: 'sound_match' | 'word_builder' | 'rhyme_time';
}

const gameNames = {
  sound_match: 'Sound Match',
  word_builder: 'Word Builder',
  rhyme_time: 'Rhyme Time'
};

const gameColors = {
  sound_match: 'from-purple-500 to-pink-500',
  word_builder: 'from-green-500 to-teal-500',
  rhyme_time: 'from-pink-500 to-rose-500'
};

export const GameScoreCard: React.FC<Props> = ({ scores, gameType }) => {
  const gameScores = scores.filter(s => s.game_type === gameType);
  const bestScore = gameScores.length > 0 
    ? Math.max(...gameScores.map(s => s.accuracy)) 
    : 0;
  const totalPlays = gameScores.length;
  const avgAccuracy = gameScores.length > 0
    ? Math.round(gameScores.reduce((acc, s) => acc + s.accuracy, 0) / gameScores.length)
    : 0;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-gray-100">
      <div className={`text-lg font-bold bg-gradient-to-r ${gameColors[gameType]} bg-clip-text text-transparent mb-3`}>
        {gameNames[gameType]}
      </div>
      
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-yellow-50 rounded-xl p-2">
          <Trophy className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
          <div className="text-lg font-black text-yellow-600">{bestScore}%</div>
          <div className="text-xs text-gray-500">Best</div>
        </div>
        
        <div className="bg-blue-50 rounded-xl p-2">
          <Target className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <div className="text-lg font-black text-blue-600">{avgAccuracy}%</div>
          <div className="text-xs text-gray-500">Avg</div>
        </div>
        
        <div className="bg-green-50 rounded-xl p-2">
          <Star className="w-5 h-5 text-green-500 mx-auto mb-1" />
          <div className="text-lg font-black text-green-600">{totalPlays}</div>
          <div className="text-xs text-gray-500">Plays</div>
        </div>
      </div>
      
      {gameScores.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-1">Recent scores:</div>
          <div className="flex gap-1">
            {gameScores.slice(-5).map((s, i) => (
              <div 
                key={i} 
                className={`flex-1 h-2 rounded-full ${s.accuracy >= 70 ? 'bg-green-400' : s.accuracy >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                title={`${s.accuracy}%`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
