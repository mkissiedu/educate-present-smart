import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CurriculumInfo } from '@/types/lesson';

interface AIContentGeneratorProps {
  lessonTitle: string;
  subject: string;
  classLevel: string;
  curriculumInfo?: CurriculumInfo;
  phaseType: 'starter' | 'development' | 'skill' | 'practice' | 'wrapup';
  onGenerate: (bullets: string[]) => void;
  disabled?: boolean;
}

export const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({
  lessonTitle, subject, classLevel, curriculumInfo, phaseType, onGenerate, disabled
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phaseLabels: Record<string, string> = {
    starter: 'Starter Activities',
    development: 'Concept Development',
    skill: 'Skill Development',
    practice: 'Practice Exercises',
    wrapup: 'Wrap-Up Activities'
  };

  const handleGenerate = async () => {
    if (!lessonTitle || lessonTitle === 'New Lesson') {
      setError('Please enter a lesson title first');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-lesson-generator', {
        body: { lessonTitle, subject, classLevel, curriculumInfo, phaseType }
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      if (data?.bullets && data.bullets.length > 0) {
        const filtered = data.bullets.filter((b: string) => 
          !b.startsWith('#') && !b.startsWith('**') && b.length > 20
        );
        onGenerate(filtered.slice(0, 6));
      } else {
        setError('No content generated. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mb-3">
      <Button
        onClick={handleGenerate}
        disabled={disabled || isGenerating}
        variant="outline"
        size="sm"
        className="w-full bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:from-purple-100 hover:to-pink-100 text-purple-700"
      >
        {isGenerating ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating {phaseLabels[phaseType]}...</>
        ) : (
          <><Wand2 className="w-4 h-4 mr-2" /><Sparkles className="w-3 h-3 mr-1" />Generate {phaseLabels[phaseType]} with AI</>
        )}
      </Button>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};
