import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, Check, X, ChevronDown, ChevronUp, Save, BookOpen } from 'lucide-react';
import { Question, QuestionType, Difficulty } from '@/types/question-bank';
import { callEdgeFunction } from '@/lib/edge-functions';
import { useAuth } from '@/contexts/AuthContext';
import { fetchKBDocumentsBySubject, KnowledgeBaseDocument } from '@/lib/supabase-knowledge-base';

interface CurriculumData {
  subject: string;
  grade: string;
  strand?: string;
  subStrand?: string;
  indicatorCode?: string;
  indicatorText?: string;
}

interface GeneratedQuestion {
  question_text: string;
  question_type: QuestionType;
  difficulty: Difficulty;
  marks: number;
  explanation: string;
  curriculum_type: string;
  subject: string;
  grade_level: string;
  strand: string;
  sub_strand: string;
  indicator_code: string;
  indicator_text: string;
  is_approved: boolean;
  options: { option_text: string; is_correct: boolean }[];
  selected: boolean;
  expanded: boolean;
}

interface Props {
  curriculumData: CurriculumData;
  onSave: (questions: Omit<Question, 'id' | 'created_at'>[], optionSets: { option_text: string; is_correct: boolean }[][]) => Promise<void>;
  onCancel: () => void;
}

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'true_false', label: 'True / False' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'fill_blank', label: 'Fill in the Blank' },
  { value: 'essay', label: 'Essay' },
];

const DIFFICULTIES: { value: Difficulty; label: string; color: string }[] = [
  { value: 'easy', label: 'Easy', color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { value: 'hard', label: 'Hard', color: 'bg-red-100 text-red-700 border-red-300' },
];

export function AIQuestionGenerator({ curriculumData, onSave, onCancel }: Props) {
  const { user } = useAuth();

  const [questionType, setQuestionType] = useState<QuestionType>('multiple_choice');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [count, setCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState<GeneratedQuestion[]>([]);
  const [kbDocs, setKbDocs] = useState<KnowledgeBaseDocument[]>([]);
  const [selectedKbId, setSelectedKbId] = useState('');
  const [kbLoading, setKbLoading] = useState(false);

  useEffect(() => {
    setKbLoading(true);
    fetchKBDocumentsBySubject(curriculumData.subject, curriculumData.grade)
      .then(docs => setKbDocs(docs))
      .finally(() => setKbLoading(false));
  }, [curriculumData.subject, curriculumData.grade]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    setGenerated([]);

    const selectedDoc = kbDocs.find(d => d.id === selectedKbId);

    const { data, error: fnError } = await callEdgeFunction('generate-questions', {
      subject: curriculumData.subject,
      grade_level: curriculumData.grade,
      strand: curriculumData.strand,
      sub_strand: curriculumData.subStrand,
      indicator_code: curriculumData.indicatorCode,
      indicator_text: curriculumData.indicatorText,
      question_type: questionType,
      difficulty,
      count,
      knowledge_base_context: selectedDoc?.content,
    });

    setGenerating(false);

    if (fnError || !data?.questions) {
      setError(fnError || 'No questions returned. Try again.');
      return;
    }

    setGenerated(
      data.questions.map((q: any) => ({ ...q, selected: true, expanded: false }))
    );
  };

  const toggleSelect = (i: number) =>
    setGenerated(prev => prev.map((q, idx) => idx === i ? { ...q, selected: !q.selected } : q));

  const toggleExpand = (i: number) =>
    setGenerated(prev => prev.map((q, idx) => idx === i ? { ...q, expanded: !q.expanded } : q));

  const handleSave = async () => {
    const chosen = generated.filter(q => q.selected);
    if (chosen.length === 0) return;

    setSaving(true);
    const questionPayloads = chosen.map(q => ({
      question_text: q.question_text,
      question_type: q.question_type,
      difficulty: q.difficulty,
      marks: q.marks,
      explanation: q.explanation,
      curriculum_type: q.curriculum_type,
      subject: q.subject,
      grade_level: q.grade_level,
      strand: q.strand,
      sub_strand: q.sub_strand,
      indicator_code: q.indicator_code,
      indicator_text: q.indicator_text,
      is_approved: false,
      created_by: user?.id,
    }));
    const optionSets = chosen.map(q => q.options);

    await onSave(questionPayloads as any, optionSets);
    setSaving(false);
  };

  const selectedCount = generated.filter(q => q.selected).length;
  const diffColor = DIFFICULTIES.find(d => d.value === difficulty)?.color ?? '';

  return (
    <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-5 space-y-5">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-slate-800 text-lg">Generate with AI</h3>
        <Badge className="bg-blue-100 text-blue-700 border-blue-300 ml-1">Claude</Badge>
      </div>

      {/* Curriculum summary */}
      <div className="bg-blue-50 rounded-lg p-3 text-sm space-y-0.5">
        <div className="font-medium text-blue-900">{curriculumData.subject} — {curriculumData.grade}</div>
        {curriculumData.strand && <div className="text-blue-700">{curriculumData.strand}{curriculumData.subStrand ? ` › ${curriculumData.subStrand}` : ''}</div>}
        {curriculumData.indicatorCode && (
          <div className="text-blue-600 text-xs">{curriculumData.indicatorCode}: {curriculumData.indicatorText}</div>
        )}
      </div>

      {/* Knowledge base context */}
      {(kbLoading || kbDocs.length > 0) && (
        <div>
          <Label className="text-slate-700 text-sm flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> Reference Document (optional)
          </Label>
          <select
            title="Knowledge Base Document"
            value={selectedKbId}
            onChange={e => setSelectedKbId(e.target.value)}
            disabled={kbLoading}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">None — use Claude's general knowledge</option>
            {kbDocs.map(d => (
              <option key={d.id} value={d.id}>{d.title}{d.grade_level ? ` (${d.grade_level})` : ''}</option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-1">Claude will draw questions from this document when selected.</p>
        </div>
      )}

      {/* Controls */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-slate-700 text-sm">Question Type</Label>
          <select
            title="Question Type"
            value={questionType}
            onChange={e => setQuestionType(e.target.value as QuestionType)}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <Label className="text-slate-700 text-sm">Difficulty</Label>
          <select
            title="Difficulty"
            value={difficulty}
            onChange={e => setDifficulty(e.target.value as Difficulty)}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {DIFFICULTIES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
        <div>
          <Label className="text-slate-700 text-sm">Number of Questions</Label>
          <select
            title="Number of Questions"
            value={count}
            onChange={e => setCount(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {generating
            ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Generating…</>
            : <><Sparkles className="w-4 h-4 mr-2" />Generate {count} Question{count > 1 ? 's' : ''}</>}
        </Button>
        <Button variant="outline" onClick={onCancel} className="border-slate-300 text-slate-700">
          Cancel
        </Button>
      </div>

      {/* Generated questions */}
      {generated.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">
              {generated.length} question{generated.length > 1 ? 's' : ''} generated — {selectedCount} selected
            </p>
            <div className="flex gap-2 text-xs">
              <button type="button" onClick={() => setGenerated(p => p.map(q => ({ ...q, selected: true })))} className="text-blue-600 hover:underline">Select all</button>
              <span className="text-slate-400">·</span>
              <button type="button" onClick={() => setGenerated(p => p.map(q => ({ ...q, selected: false })))} className="text-slate-500 hover:underline">Deselect all</button>
            </div>
          </div>

          {generated.map((q, i) => (
            <div
              key={i}
              className={`rounded-lg border transition-colors ${q.selected ? 'border-blue-300 bg-blue-50/50' : 'border-slate-200 bg-slate-50 opacity-60'}`}
            >
              <div className="flex items-start gap-3 p-3">
                <button
                  type="button"
                  onClick={() => toggleSelect(i)}
                  className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    q.selected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'
                  }`}
                >
                  {q.selected && <Check className="w-3 h-3 text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge className={`text-xs border ${diffColor}`}>{q.difficulty}</Badge>
                    <Badge className="text-xs bg-slate-100 text-slate-600 border-slate-300">
                      {QUESTION_TYPES.find(t => t.value === q.question_type)?.label}
                    </Badge>
                    <span className="text-xs text-slate-400">{q.marks} mark{q.marks > 1 ? 's' : ''}</span>
                  </div>
                  <p className="text-slate-800 text-sm leading-snug">{q.question_text}</p>
                </div>
                <button type="button" onClick={() => toggleExpand(i)} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
                  {q.expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {q.expanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-slate-200 pt-3">
                  {q.options.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Options</p>
                      {q.options.map((opt, oi) => (
                        <div key={oi} className={`flex items-center gap-2 text-sm px-2 py-1 rounded ${opt.is_correct ? 'bg-green-50 text-green-800 font-medium' : 'text-slate-700'}`}>
                          {opt.is_correct
                            ? <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                            : <X className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />}
                          {opt.option_text}
                        </div>
                      ))}
                    </div>
                  )}
                  {q.explanation && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Explanation</p>
                      <p className="text-sm text-slate-600 italic">{q.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          <Button
            onClick={handleSave}
            disabled={saving || selectedCount === 0}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving…</>
              : <><Save className="w-4 h-4 mr-2" />Save {selectedCount} Question{selectedCount !== 1 ? 's' : ''} to Bank</>}
          </Button>
        </div>
      )}
    </div>
  );
}
