import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Database, AlertCircle } from 'lucide-react';
import { Question, QuestionFilter } from '@/types/question-bank';
import { getQuestions, createQuestion, deleteQuestion } from '@/lib/supabase-questions';
import { QuestionBankFilters } from './QuestionBankFilters';
import { QuestionCard } from './QuestionCard';
import { QuestionForm } from './QuestionForm';
import { CurriculumIndicatorSelector } from './CurriculumIndicatorSelector';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  onCreateTestPaper?: (questions: Question[]) => void;
  assignedSubjects?: string[];
  assignedClasses?: string[];
}

export function QuestionBankMain({ onCreateTestPaper, assignedSubjects, assignedClasses }: Props) {
  const { user, isSuperAdmin } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filter, setFilter] = useState<QuestionFilter>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [curriculumData, setCurriculumData] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const isSuperTeacher = user?.role === 'super_teacher';
  const hasAssignments = !assignedSubjects || assignedSubjects.length > 0;
  const canManage = isSuperTeacher || isSuperAdmin;

  useEffect(() => { loadQuestions(); }, [filter]);

  const loadQuestions = async () => {
    setLoading(true);
    const data = await getQuestions(filter);
    // Filter by assignments if super teacher with assignments
    const filtered = assignedSubjects && assignedSubjects.length > 0
      ? data.filter(q => assignedSubjects.includes(q.subject) && (!assignedClasses || assignedClasses.length === 0 || assignedClasses.includes(q.class_level)))
      : data;
    setQuestions(filtered);
    setLoading(false);
  };

  const handleAddQuestion = async (q: any, opts: any[]) => {
    await createQuestion(q, opts.map(o => ({ option_text: o.text, is_correct: o.isCorrect, option_order: 0 })));
    setShowAddForm(false);
    setCurriculumData(null);
    loadQuestions();
  };

  const handleDelete = async (id: string) => {
    await deleteQuestion(id);
    loadQuestions();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectedQuestions = questions.filter(q => selectedIds.includes(q.id));

  if (isSuperTeacher && assignedSubjects && assignedSubjects.length === 0) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-800 mb-2">No Subjects Assigned</h3>
        <p className="text-slate-600">Contact the Super Admin to get subjects assigned to you.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Question Bank</h1>
            <p className="text-sm text-slate-500">{questions.length} questions available</p>
          </div>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && <Button onClick={() => onCreateTestPaper?.(selectedQuestions)}><FileText className="w-4 h-4 mr-2" />Create Test ({selectedIds.length})</Button>}
          {canManage && hasAssignments && <Button onClick={() => setShowAddForm(true)}><Plus className="w-4 h-4 mr-2" />Add Question</Button>}
        </div>
      </div>

      {showAddForm && !curriculumData && <CurriculumIndicatorSelector onSelect={setCurriculumData} assignedSubjects={assignedSubjects} assignedClasses={assignedClasses} />}
      {showAddForm && curriculumData && <QuestionForm curriculumData={curriculumData} onSubmit={handleAddQuestion} onCancel={() => { setShowAddForm(false); setCurriculumData(null); }} />}

      <QuestionBankFilters filter={filter} onFilterChange={setFilter} assignedSubjects={assignedSubjects} assignedClasses={assignedClasses} />

      <div className="space-y-3">
        {loading ? <p className="text-center py-8 text-slate-500">Loading questions...</p> : questions.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg"><Database className="w-12 h-12 mx-auto text-slate-300 mb-3" /><p className="text-slate-500">No questions found</p></div>
        ) : questions.map(q => (
          <QuestionCard key={q.id} question={q} selectable selected={selectedIds.includes(q.id)} onSelect={toggleSelect} onDelete={canManage ? handleDelete : undefined} />
        ))}
      </div>
    </div>
  );
}
