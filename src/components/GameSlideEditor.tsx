import React from 'react';
import { GameData } from '@/types/lesson';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gamepad2, Target, Clock, Sparkles } from 'lucide-react';
import { ANANSE_IMAGE } from './AnanseMascot';

interface GameSlideEditorProps {
  gameData: GameData;
  onChange: (data: GameData) => void;
}

export const GameSlideEditor: React.FC<GameSlideEditorProps> = ({ gameData, onChange }) => {
  const gameTypes = [
    { value: 'sound-match', label: 'Sound Match', desc: 'Match letters to their sounds' },
    { value: 'word-builder', label: 'Word Builder', desc: 'Build words from phonemes' },
    { value: 'rhyme-time', label: 'Rhyme Time', desc: 'Find rhyming words' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
        <img src={ANANSE_IMAGE} alt="Ananse" className="w-12 h-12 object-contain" />
        <div>
          <p className="font-bold text-purple-700">Ananse's Game Corner!</p>
          <p className="text-sm text-purple-600">Add interactive games to make learning fun</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {gameTypes.map((game) => (
          <button
            key={game.value}
            onClick={() => onChange({ ...gameData, gameType: game.value as any })}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              gameData.gameType === game.value
                ? 'border-purple-500 bg-purple-50 shadow-lg'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <Gamepad2 className={`w-6 h-6 mb-2 ${gameData.gameType === game.value ? 'text-purple-600' : 'text-gray-400'}`} />
            <p className="font-bold text-gray-800">{game.label}</p>
            <p className="text-xs text-gray-500">{game.desc}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Difficulty</Label>
          <Select value={gameData.difficulty} onValueChange={(v: any) => onChange({ ...gameData, difficulty: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy (Ages 3-4)</SelectItem>
              <SelectItem value="medium">Medium (Ages 5-6)</SelectItem>
              <SelectItem value="hard">Hard (Ages 7+)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="flex items-center gap-2"><Target className="w-4 h-4" /> Target Score</Label>
          <Input type="number" value={gameData.targetScore || 5} onChange={(e) => onChange({ ...gameData, targetScore: parseInt(e.target.value) })} />
        </div>
      </div>

      <div>
        <Label className="flex items-center gap-2"><Clock className="w-4 h-4" /> Time Limit (seconds, 0 = no limit)</Label>
        <Input type="number" value={gameData.timeLimit || 0} onChange={(e) => onChange({ ...gameData, timeLimit: parseInt(e.target.value) })} />
      </div>

      <Input placeholder="Custom game title" value={gameData.title} onChange={(e) => onChange({ ...gameData, title: e.target.value })} className="font-bold" />
    </div>
  );
};
