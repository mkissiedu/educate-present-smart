import { supabase } from './supabase';
import { Question, QuestionOption, TestPaper, TestPaperQuestion, QuestionFilter } from '@/types/question-bank';

export async function createQuestion(question: Omit<Question, 'id' | 'created_at'>, options?: Omit<QuestionOption, 'id' | 'question_id'>[]): Promise<Question | null> {
  const { data, error } = await supabase.from('questions').insert(question).select().single();
  if (error || !data) return null;
  
  if (options?.length) {
    const optionsWithId = options.map((opt, i) => ({ ...opt, question_id: data.id, option_order: i }));
    await supabase.from('question_options').insert(optionsWithId);
  }
  return data;
}

export async function getQuestions(filter?: QuestionFilter): Promise<Question[]> {
  let query = supabase.from('questions').select('*, question_options(*)');
  if (filter?.curriculum_type) query = query.eq('curriculum_type', filter.curriculum_type);
  if (filter?.subject) query = query.eq('subject', filter.subject);
  if (filter?.grade_level) query = query.eq('grade_level', filter.grade_level);
  if (filter?.strand) query = query.eq('strand', filter.strand);
  if (filter?.indicator_code) query = query.eq('indicator_code', filter.indicator_code);
  if (filter?.difficulty) query = query.eq('difficulty', filter.difficulty);
  if (filter?.question_type) query = query.eq('question_type', filter.question_type);
  
  const { data } = await query.order('created_at', { ascending: false });
  return (data || []).map(q => ({ ...q, options: q.question_options }));
}

export async function deleteQuestion(id: string): Promise<boolean> {
  const { error } = await supabase.from('questions').delete().eq('id', id);
  return !error;
}

export async function createTestPaper(paper: Omit<TestPaper, 'id' | 'created_at'>): Promise<TestPaper | null> {
  const { data, error } = await supabase.from('test_papers').insert(paper).select().single();
  return error ? null : data;
}

export async function addQuestionsToTestPaper(testPaperId: string, questionIds: string[]): Promise<boolean> {
  const items = questionIds.map((qid, i) => ({ test_paper_id: testPaperId, question_id: qid, question_order: i }));
  const { error } = await supabase.from('test_paper_questions').insert(items);
  return !error;
}

export async function getTestPapers(): Promise<TestPaper[]> {
  const { data } = await supabase.from('test_papers').select('*').order('created_at', { ascending: false });
  return data || [];
}

export async function getTestPaperWithQuestions(id: string): Promise<TestPaper | null> {
  const { data: paper } = await supabase.from('test_papers').select('*').eq('id', id).single();
  if (!paper) return null;
  
  const { data: tpq } = await supabase.from('test_paper_questions').select('*, questions(*, question_options(*))').eq('test_paper_id', id).order('question_order');
  paper.questions = (tpq || []).map(t => ({ ...t.questions, options: t.questions?.question_options }));
  return paper;
}
