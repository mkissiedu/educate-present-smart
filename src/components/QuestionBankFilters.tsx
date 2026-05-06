import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { allCurriculums } from '@/data/nacca-all-subjects';
import { QuestionFilter, QuestionType, Difficulty } from '@/types/question-bank';

interface Props {
  filter: QuestionFilter;
  onFilterChange: (filter: QuestionFilter) => void;
  assignedSubjects?: string[];
  assignedClasses?: string[];
}

const GRADE_LEVELS = ['KG1', 'KG2', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'JHS1', 'JHS2', 'JHS3'];
const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'true_false', label: 'True/False' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'fill_blank', label: 'Fill in the Blank' },
  { value: 'essay', label: 'Essay' },
];

// Map class levels to grade codes
const CLASS_TO_GRADE: Record<string, string> = {
  'KG 1': 'KG1', 'KG 2': 'KG2',
  'Class 1': 'B1', 'Class 2': 'B2', 'Class 3': 'B3', 'Class 4': 'B4', 'Class 5': 'B5', 'Class 6': 'B6',
  'JHS 1': 'JHS1', 'JHS 2': 'JHS2', 'JHS 3': 'JHS3',
};

export function QuestionBankFilters({ filter, onFilterChange, assignedSubjects, assignedClasses }: Props) {
  const allSubjects = Object.keys(allCurriculums);
  const subjects = assignedSubjects && assignedSubjects.length > 0 
    ? allSubjects.filter(s => assignedSubjects.includes(s))
    : allSubjects;

  // Convert assigned classes to grade codes
  const assignedGrades = assignedClasses?.map(c => CLASS_TO_GRADE[c]).filter(Boolean) || [];
  const grades = assignedGrades.length > 0 ? GRADE_LEVELS.filter(g => assignedGrades.includes(g)) : GRADE_LEVELS;

  const curriculum = filter.subject ? allCurriculums[filter.subject] : null;
  const strands = curriculum?.strands || [];
  const strand = strands.find(s => s.name === filter.strand);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-lg">
      <Select value={filter.subject || ''} onValueChange={v => onFilterChange({ ...filter, subject: v, strand: undefined, sub_strand: undefined })}>
        <SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger>
        <SelectContent>{subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
      </Select>

      <Select value={filter.grade_level || ''} onValueChange={v => onFilterChange({ ...filter, grade_level: v })}>
        <SelectTrigger><SelectValue placeholder="Grade" /></SelectTrigger>
        <SelectContent>{grades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
      </Select>

      <Select value={filter.strand || ''} onValueChange={v => onFilterChange({ ...filter, strand: v, sub_strand: undefined })}>
        <SelectTrigger><SelectValue placeholder="Strand" /></SelectTrigger>
        <SelectContent>{strands.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
      </Select>

      <Select value={filter.difficulty || ''} onValueChange={v => onFilterChange({ ...filter, difficulty: v as Difficulty })}>
        <SelectTrigger><SelectValue placeholder="Difficulty" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="easy">Easy</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="hard">Hard</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filter.question_type || ''} onValueChange={v => onFilterChange({ ...filter, question_type: v as QuestionType })}>
        <SelectTrigger><SelectValue placeholder="Question Type" /></SelectTrigger>
        <SelectContent>{QUESTION_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}
