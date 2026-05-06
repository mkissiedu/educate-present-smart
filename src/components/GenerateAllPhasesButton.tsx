import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Wand2, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CurriculumInfo } from '@/types/lesson';

interface GenerateAllPhasesButtonProps {
  lessonTitle: string;
  subject: string;
  classLevel: string;
  curriculumInfo?: CurriculumInfo;
  onGeneratePhase: (phaseType: string, bullets: string[]) => void;
  disabled?: boolean;
}

export const GenerateAllPhasesButton: React.FC<GenerateAllPhasesButtonProps> = ({
  lessonTitle, subject, classLevel, curriculumInfo, onGeneratePhase, disabled
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [completed, setCompleted] = useState(false);

  const phases = [
    { type: 'starter', label: 'Starter' },
    { type: 'development', label: 'Concept Development' },
    { type: 'skill', label: 'Skill Development' },
    { type: 'practice', label: 'Practice' },
    { type: 'wrapup', label: 'Wrap-Up' }
  ];

  const handleGenerateAll = async () => {
    if (!lessonTitle || lessonTitle === 'New Lesson') return;

    setIsGenerating(true);
    setCompleted(false);

    for (const phase of phases) {
      setProgress(`Generating ${phase.label}...`);
      try {
        const { data } = await supabase.functions.invoke('ai-lesson-generator', {
          body: { lessonTitle, subject, classLevel, curriculumInfo, phaseType: phase.type }
        });

        if (data?.bullets && data.bullets.length > 0) {
          const filtered = data.bullets.filter((b: string) => 
            !b.startsWith('#') && !b.startsWith('**') && b.length > 20
          ).slice(0, 6);
          onGeneratePhase(phase.type, filtered);
        }
      } catch (err) {
        console.error(`Error generating ${phase.type}:`, err);
      }
    }

    setProgress('');
    setIsGenerating(false);
    setCompleted(true);
    setTimeout(() => setCompleted(false), 3000);
  };

  return (
    <Button
      onClick={handleGenerateAll}
      disabled={disabled || isGenerating || !lessonTitle || lessonTitle === 'New Lesson'}
      className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:from-purple-700 hover:via-pink-600 hover:to-orange-600 text-white font-bold py-3"
    >
      {isGenerating ? (
        <><Loader2 className="w-5 h-5 mr-2 animate-spin" />{progress}</>
      ) : completed ? (
        <><CheckCircle className="w-5 h-5 mr-2" />All Phases Generated!</>
      ) : (
        <><Wand2 className="w-5 h-5 mr-2" /><Sparkles className="w-4 h-4 mr-2" />Generate All Phase Content with AI</>
      )}
    </Button>
  );
};
