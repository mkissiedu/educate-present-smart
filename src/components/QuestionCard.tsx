import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, CheckCircle, Circle } from 'lucide-react';
import { Question } from '@/types/question-bank';

interface Props {
  question: Question;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
  showAnswer?: boolean;
}

const typeLabels: Record<string, string> = {
  multiple_choice: 'MCQ', true_false: 'T/F', short_answer: 'Short', fill_blank: 'Fill', essay: 'Essay'
};

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-100 text-green-700', medium: 'bg-yellow-100 text-yellow-700', hard: 'bg-red-100 text-red-700'
};

export function QuestionCard({ question, selectable, selected, onSelect, onDelete, showAnswer = true }: Props) {
  return (
    <Card className={`transition-all ${selected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {selectable && (
            <Checkbox checked={selected} onCheckedChange={() => onSelect?.(question.id)} className="mt-1" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge variant="outline">{typeLabels[question.question_type]}</Badge>
              <Badge className={difficultyColors[question.difficulty]}>{question.difficulty}</Badge>
              <Badge variant="secondary">{question.marks} mark{question.marks > 1 ? 's' : ''}</Badge>
              <span className="text-xs text-slate-500">{question.indicator_code}</span>
            </div>
            
            <p className="font-medium text-slate-800 mb-2">{question.question_text}</p>
            
            {showAnswer && question.options && question.options.length > 0 && (
              <div className="space-y-1 mt-2">
                {question.options.map((opt, i) => (
                  <div key={opt.id || i} className={`flex items-center gap-2 text-sm ${opt.is_correct ? 'text-green-700 font-medium' : 'text-slate-600'}`}>
                    {opt.is_correct ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Circle className="w-4 h-4 text-slate-300" />}
                    <span>{String.fromCharCode(65 + i)}. {opt.option_text}</span>
                  </div>
                ))}
              </div>
            )}
            
            {question.explanation && showAnswer && (
              <p className="text-sm text-slate-500 mt-2 italic">Explanation: {question.explanation}</p>
            )}
            
            <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
              <span>{question.subject}</span>
              <span>•</span>
              <span>{question.grade_level}</span>
              {question.strand && <><span>•</span><span>{question.strand}</span></>}
            </div>
          </div>
          
          {onDelete && (
            <Button variant="ghost" size="sm" onClick={() => onDelete(question.id)} className="text-red-500 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
