import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Wand2, Gamepad2, HelpCircle, Loader2, X } from 'lucide-react';
import { CATALYST_LOGO } from './CatalystMascot';
import { supabase } from '@/lib/supabase';
import { GameData } from '@/types/lesson';

interface AILessonAssistantProps {
  lessonTitle: string;
  lessonSubject: string;
  onGenerateGame: (gameData: GameData) => void;
  onGenerateQuiz: (quizData: any) => void;
  onGenerateContent: (content: string) => void;
  onClose: () => void;
}

export const AILessonAssistant: React.FC<AILessonAssistantProps> = ({
  lessonTitle, lessonSubject, onGenerateGame, onGenerateQuiz, onGenerateContent, onClose
}) => {
  const [prompt, setPrompt] = useState('');
  const [genType, setGenType] = useState<'game' | 'quiz' | 'content'>('game');
  const [gameType, setGameType] = useState<'sound-match' | 'word-builder' | 'rhyme-time'>('sound-match');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('ai-lesson-generator', {
        body: { type: genType, prompt: genType === 'game' ? `Create a ${gameType} game: ${prompt}` : prompt, lessonContext: `${lessonTitle} - ${lessonSubject}`, difficulty }
      });
      if (error) throw error;
      setResult(data.content);
    } catch (err) {
      setResult({ error: 'Failed to generate content' });
    }
    setLoading(false);
  };

  const applyResult = () => {
    if (!result) return;
    if (genType === 'game') {
      onGenerateGame({ gameType, title: result.title || 'AI Generated Game', difficulty, customItems: result.items || [], targetScore: 5, timeLimit: 0 });
    } else if (genType === 'quiz') {
      onGenerateQuiz(result);
    } else {
      onGenerateContent(result.rawContent || JSON.stringify(result));
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={CATALYST_LOGO} alt="Catalyst" className="h-12 object-contain bg-white rounded-lg px-2 py-1" />
            <div className="text-white">
              <h2 className="text-2xl font-black flex items-center gap-2"><Sparkles className="w-6 h-6" /> AI Assistant</h2>
              <p className="text-blue-100">Generate games, quizzes & content!</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20"><X /></Button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {[{ t: 'game', i: Gamepad2, l: 'Game' }, { t: 'quiz', i: HelpCircle, l: 'Quiz' }, { t: 'content', i: Wand2, l: 'Content' }].map(({ t, i: Icon, l }) => (
              <button key={t} onClick={() => setGenType(t as any)} className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${genType === t ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-50 border-2 border-transparent hover:border-blue-200'}`}>
                <Icon className={`w-6 h-6 ${genType === t ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className={`text-sm font-bold ${genType === t ? 'text-blue-600' : 'text-gray-500'}`}>{l}</span>
              </button>
            ))}
          </div>

          {genType === 'game' && (
            <div className="grid grid-cols-2 gap-3">
              <Select value={gameType} onValueChange={(v: any) => setGameType(v)}>
                <SelectTrigger><SelectValue placeholder="Game Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sound-match">Sound Match</SelectItem>
                  <SelectItem value="word-builder">Word Builder</SelectItem>
                  <SelectItem value="rhyme-time">Rhyme Time</SelectItem>
                </SelectContent>
              </Select>
              <Select value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
                <SelectTrigger><SelectValue placeholder="Difficulty" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Textarea placeholder="Describe what you want to create..." value={prompt} onChange={(e) => setPrompt(e.target.value)} className="min-h-24" />

          <Button onClick={handleGenerate} disabled={loading || !prompt} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-lg py-6">
            {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="w-5 h-5 mr-2" /> Generate with AI</>}
          </Button>

          {result && !result.error && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
              <h3 className="font-bold text-green-700 mb-2">Generated Content</h3>
              <pre className="text-xs bg-white p-3 rounded-lg overflow-auto max-h-40">{JSON.stringify(result, null, 2)}</pre>
              <Button onClick={applyResult} className="mt-3 w-full bg-green-500 hover:bg-green-600">Apply to Lesson</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
