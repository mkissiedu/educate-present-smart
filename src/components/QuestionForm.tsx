import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';
import { Question, QuestionType, Difficulty } from '@/types/question-bank';

interface OptionInput { text: string; isCorrect: boolean; }

interface Props {
  curriculumData: { subject: string; grade: string; strand: string; subStrand: string; indicatorCode: string; indicatorText: string; };
  onSubmit: (question: Partial<Question>, options: OptionInput[]) => void;
  onCancel: () => void;
}

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'true_false', label: 'True/False' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'fill_blank', label: 'Fill in the Blank' },
  { value: 'essay', label: 'Essay' },
];

export function QuestionForm({ curriculumData, onSubmit, onCancel }: Props) {
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>('multiple_choice');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [marks, setMarks] = useState(1);
  const [explanation, setExplanation] = useState('');
  const [options, setOptions] = useState<OptionInput[]>([{ text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }]);

  const handleSubmit = () => {
    if (!questionText.trim()) return;
    const question: Partial<Question> = {
      question_text: questionText, question_type: questionType, difficulty, marks, explanation,
      curriculum_type: 'NaCCA', subject: curriculumData.subject, grade_level: curriculumData.grade,
      strand: curriculumData.strand, sub_strand: curriculumData.subStrand,
      indicator_code: curriculumData.indicatorCode, indicator_text: curriculumData.indicatorText, is_approved: true
    };
    onSubmit(question, questionType === 'multiple_choice' || questionType === 'true_false' ? options.filter(o => o.text) : []);
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 rounded-lg text-sm">
        <p className="font-medium text-blue-800">{curriculumData.subject} - {curriculumData.grade}</p>
        <p className="text-blue-600">{curriculumData.indicatorCode}: {curriculumData.indicatorText}</p>
      </div>
      <div><Label>Question</Label><Textarea value={questionText} onChange={e => setQuestionText(e.target.value)} placeholder="Enter question..." rows={3} /></div>
      <div className="grid grid-cols-3 gap-3">
        <div><Label>Type</Label><Select value={questionType} onValueChange={v => setQuestionType(v as QuestionType)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{QUESTION_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
        <div><Label>Difficulty</Label><Select value={difficulty} onValueChange={v => setDifficulty(v as Difficulty)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem></SelectContent></Select></div>
        <div><Label>Marks</Label><Input type="number" value={marks} onChange={e => setMarks(Number(e.target.value))} min={1} /></div>
      </div>
      {(questionType === 'multiple_choice' || questionType === 'true_false') && (
        <div className="space-y-2"><Label>Options</Label>
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <Checkbox checked={opt.isCorrect} onCheckedChange={c => setOptions(options.map((o, j) => j === i ? { ...o, isCorrect: !!c } : o))} />
              <Input value={opt.text} onChange={e => setOptions(options.map((o, j) => j === i ? { ...o, text: e.target.value } : o))} placeholder={`Option ${i + 1}`} />
              {options.length > 2 && <Button variant="ghost" size="sm" onClick={() => setOptions(options.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4" /></Button>}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setOptions([...options, { text: '', isCorrect: false }])}><Plus className="w-4 h-4 mr-1" />Add Option</Button>
        </div>
      )}
      <div><Label>Explanation (Optional)</Label><Textarea value={explanation} onChange={e => setExplanation(e.target.value)} placeholder="Explain the answer..." rows={2} /></div>
      <div className="flex gap-2 justify-end"><Button variant="outline" onClick={onCancel}>Cancel</Button><Button onClick={handleSubmit}>Add Question</Button></div>
    </div>
  );
}
