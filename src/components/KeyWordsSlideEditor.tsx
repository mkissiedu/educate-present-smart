import React, { useState, useRef } from 'react';
import { KeyWord, KeyWordsData } from '@/types/lesson';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, Upload, Search, Volume2, X, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface KeyWordsSlideEditorProps {
  keyWordsData: KeyWordsData;
  onChange: (data: KeyWordsData) => void;
}

export const KeyWordsSlideEditor: React.FC<KeyWordsSlideEditorProps> = ({ keyWordsData, onChange }) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const addKeyWord = () => {
    const newKeyword: KeyWord = { id: `kw-${Date.now()}`, word: '', pronunciation: '', meaning: '' };
    onChange({ keywords: [...keyWordsData.keywords, newKeyword] });
  };

  const updateKeyWord = (id: string, updates: Partial<KeyWord>) => {
    onChange({ keywords: keyWordsData.keywords.map(kw => kw.id === id ? { ...kw, ...updates } : kw) });
  };

  const removeKeyWord = (id: string) => {
    onChange({ keywords: keyWordsData.keywords.filter(kw => kw.id !== id) });
  };

  const handleFileUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => updateKeyWord(id, { audioUrl: reader.result as string, audioSource: 'file' });
    reader.readAsDataURL(file);
  };

  const searchGooglePronunciation = async (id: string, word: string) => {
    if (!word.trim()) return;
    setLoadingId(id);
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(word)}&tl=en&client=tw-ob`;
    updateKeyWord(id, { audioUrl: googleTtsUrl, audioSource: 'google' });
    setLoadingId(null);
  };

  const generateMeaning = async (id: string, word: string) => {
    if (!word.trim()) return;
    setGeneratingId(id);
    try {
      const { data, error } = await supabase.functions.invoke('ai-lesson-generator', {
        body: { type: 'meaning', prompt: `Generate a simple, child-friendly definition for the word "${word}" suitable for young children (ages 4-8). Keep it short (1-2 sentences), use simple words, and make it engaging.`, word }
      });
      if (!error && data?.meaning) updateKeyWord(id, { meaning: data.meaning });
      else updateKeyWord(id, { meaning: `${word} is a special word we use when learning!` });
    } catch { updateKeyWord(id, { meaning: `${word} is an important word in our lesson!` }); }
    setGeneratingId(null);
  };

  const playAudio = (audioUrl: string) => new Audio(audioUrl).play().catch(console.error);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={addKeyWord} size="sm" className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-1" /> Add Word
        </Button>
      </div>
      
      <div className="space-y-3">
        {keyWordsData.keywords.map((kw, index) => (
          <Card key={kw.id} className="p-3 bg-purple-50 border-purple-200">
            <div className="flex items-start gap-2">
              <span className="text-purple-600 font-bold mt-2">{index + 1}.</span>
              <div className="flex-1 space-y-2">
                <Input placeholder="Enter key word..." value={kw.word} onChange={(e) => updateKeyWord(kw.id, { word: e.target.value })} className="font-medium" />
                <div className="flex gap-2">
                  <Textarea placeholder="Child-friendly meaning..." value={kw.meaning || ''} onChange={(e) => updateKeyWord(kw.id, { meaning: e.target.value })} className="text-sm min-h-16 flex-1" />
                  <Button size="sm" variant="secondary" onClick={() => generateMeaning(kw.id, kw.word)} disabled={generatingId === kw.id || !kw.word.trim()} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600">
                    {generatingId === kw.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4 mr-1" /> AI</>}
                  </Button>
                </div>
                <Input placeholder="Pronunciation (optional)..." value={kw.pronunciation || ''} onChange={(e) => updateKeyWord(kw.id, { pronunciation: e.target.value })} className="text-sm italic" />
                <div className="flex flex-wrap gap-2">
                  <input type="file" accept="audio/*" ref={el => fileInputRefs.current[kw.id] = el} className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(kw.id, e.target.files[0])} />
                  <Button size="sm" variant="outline" onClick={() => fileInputRefs.current[kw.id]?.click()}><Upload className="w-3 h-3 mr-1" /> Audio</Button>
                  <Button size="sm" variant="outline" onClick={() => searchGooglePronunciation(kw.id, kw.word)} disabled={loadingId === kw.id || !kw.word.trim()}>
                    {loadingId === kw.id ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Search className="w-3 h-3 mr-1" />} TTS
                  </Button>
                  {kw.audioUrl && (<><Button size="sm" variant="secondary" onClick={() => playAudio(kw.audioUrl!)}><Volume2 className="w-3 h-3" /></Button><Button size="sm" variant="ghost" onClick={() => updateKeyWord(kw.id, { audioUrl: undefined, audioSource: undefined })}><X className="w-3 h-3" /></Button></>)}
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => removeKeyWord(kw.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
            </div>
          </Card>
        ))}
      </div>
      
      {keyWordsData.keywords.length === 0 && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-purple-200 rounded-lg">
          <p>No key words added yet.</p>
          <p className="text-sm">Click "Add Word" to start building your vocabulary list.</p>
        </div>
      )}
    </div>
  );
};
