import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { QuizData, QuizOption } from '@/types/lesson';

interface QuizBuilderProps {
  quizData: QuizData;
  onChange: (data: QuizData) => void;
}

export const QuizBuilder: React.FC<QuizBuilderProps> = ({ quizData, onChange }) => {
  const addOption = () => {
    onChange({
      ...quizData,
      options: [...quizData.options, { id: Date.now().toString(), text: '', isCorrect: false }]
    });
  };

  const updateOption = (id: string, text: string) => {
    onChange({
      ...quizData,
      options: quizData.options.map(opt => opt.id === id ? { ...opt, text } : opt)
    });
  };

  const toggleCorrect = (id: string) => {
    onChange({
      ...quizData,
      options: quizData.options.map(opt => opt.id === id ? { ...opt, isCorrect: !opt.isCorrect } : opt)
    });
  };

  const removeOption = (id: string) => {
    onChange({ ...quizData, options: quizData.options.filter(opt => opt.id !== id) });
  };

  return (
    <div className="space-y-4">
      <Input 
        placeholder="Enter quiz question" 
        value={quizData.question}
        onChange={(e) => onChange({ ...quizData, question: e.target.value })}
        className="text-lg"
      />
      <div className="space-y-2">
        {quizData.options.map((option) => (
          <div key={option.id} className="flex gap-2 items-center">
            <Checkbox checked={option.isCorrect} onCheckedChange={() => toggleCorrect(option.id)} />
            <Input value={option.text} onChange={(e) => updateOption(option.id, e.target.value)} placeholder="Option text" />
            <Button size="sm" variant="destructive" onClick={() => removeOption(option.id)}>Remove</Button>
          </div>
        ))}
      </div>
      <Button onClick={addOption}>Add Option</Button>
    </div>
  );
};
