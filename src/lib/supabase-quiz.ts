// PD Quiz Database Functions
import { supabase } from './supabase';
import { QuizQuestion, QuizSettings, QuizAttempt, QuizAnswer, DEFAULT_QUIZ_SETTINGS } from '@/types/pd-quiz';

// ============ QUIZ QUESTIONS ============

export async function getQuizQuestions(moduleId: string): Promise<QuizQuestion[]> {
  const { data, error } = await supabase
    .from('pd_quiz_questions')
    .select('*')
    .eq('module_id', moduleId)
    .order('order_index', { ascending: true });
  
  if (error) throw error;
  return (data || []).map(q => ({
    ...q,
    options: q.options || []
  }));
}

export async function createQuizQuestion(question: Omit<QuizQuestion, 'id' | 'created_at'>): Promise<QuizQuestion> {
  const { data, error } = await supabase
    .from('pd_quiz_questions')
    .insert({
      ...question,
      options: question.options || []
    })
    .select()
    .single();
  
  if (error) throw error;
  return { ...data, options: data.options || [] };
}

export async function updateQuizQuestion(questionId: string, updates: Partial<QuizQuestion>): Promise<QuizQuestion> {
  const { data, error } = await supabase
    .from('pd_quiz_questions')
    .update(updates)
    .eq('id', questionId)
    .select()
    .single();
  
  if (error) throw error;
  return { ...data, options: data.options || [] };
}

export async function deleteQuizQuestion(questionId: string): Promise<void> {
  const { error } = await supabase
    .from('pd_quiz_questions')
    .delete()
    .eq('id', questionId);
  
  if (error) throw error;
}

export async function reorderQuizQuestions(moduleId: string, questionIds: string[]): Promise<void> {
  const updates = questionIds.map((id, index) => ({
    id,
    order_index: index
  }));
  
  for (const update of updates) {
    await supabase
      .from('pd_quiz_questions')
      .update({ order_index: update.order_index })
      .eq('id', update.id);
  }
}

// ============ QUIZ SETTINGS ============

export async function getQuizSettings(moduleId: string): Promise<QuizSettings | null> {
  const { data, error } = await supabase
    .from('pd_quiz_settings')
    .select('*')
    .eq('module_id', moduleId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function createOrUpdateQuizSettings(
  moduleId: string, 
  settings: Partial<Omit<QuizSettings, 'id' | 'module_id' | 'created_at' | 'updated_at'>>
): Promise<QuizSettings> {
  const existing = await getQuizSettings(moduleId);
  
  if (existing) {
    const { data, error } = await supabase
      .from('pd_quiz_settings')
      .update({
        ...settings,
        updated_at: new Date().toISOString()
      })
      .eq('module_id', moduleId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('pd_quiz_settings')
      .insert({
        module_id: moduleId,
        ...DEFAULT_QUIZ_SETTINGS,
        ...settings
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

// ============ QUIZ ATTEMPTS ============

export async function getQuizAttempts(moduleId: string, teacherId: string): Promise<QuizAttempt[]> {
  const { data, error } = await supabase
    .from('pd_quiz_attempts')
    .select('*')
    .eq('module_id', moduleId)
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return (data || []).map(a => ({
    ...a,
    answers: a.answers || []
  }));
}

export async function getLatestQuizAttempt(moduleId: string, teacherId: string): Promise<QuizAttempt | null> {
  const { data, error } = await supabase
    .from('pd_quiz_attempts')
    .select('*')
    .eq('module_id', moduleId)
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data ? { ...data, answers: data.answers || [] } : null;
}

export async function getPassedAttempt(moduleId: string, teacherId: string): Promise<QuizAttempt | null> {
  const { data, error } = await supabase
    .from('pd_quiz_attempts')
    .select('*')
    .eq('module_id', moduleId)
    .eq('teacher_id', teacherId)
    .eq('passed', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data ? { ...data, answers: data.answers || [] } : null;
}

export async function startQuizAttempt(
  moduleId: string, 
  teacherId: string, 
  enrollmentId?: string,
  totalQuestions?: number
): Promise<QuizAttempt> {
  const { data, error } = await supabase
    .from('pd_quiz_attempts')
    .insert({
      module_id: moduleId,
      teacher_id: teacherId,
      enrollment_id: enrollmentId,
      status: 'in_progress',
      total_questions: totalQuestions || 0,
      answers: []
    })
    .select()
    .single();
  
  if (error) throw error;
  return { ...data, answers: data.answers || [] };
}

export async function submitQuizAttempt(
  attemptId: string,
  answers: QuizAnswer[],
  totalQuestions: number,
  correctAnswers: number,
  scorePercent: number,
  passed: boolean,
  timeSpentSeconds?: number
): Promise<QuizAttempt> {
  const { data, error } = await supabase
    .from('pd_quiz_attempts')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      answers,
      total_questions: totalQuestions,
      correct_answers: correctAnswers,
      score_percent: scorePercent,
      passed,
      time_spent_seconds: timeSpentSeconds
    })
    .eq('id', attemptId)
    .select()
    .single();
  
  if (error) throw error;
  return { ...data, answers: data.answers || [] };
}

export async function timeoutQuizAttempt(attemptId: string): Promise<void> {
  const { error } = await supabase
    .from('pd_quiz_attempts')
    .update({
      status: 'timed_out',
      completed_at: new Date().toISOString()
    })
    .eq('id', attemptId);
  
  if (error) throw error;
}

// ============ QUIZ STATISTICS ============

export async function getQuizStatistics(moduleId: string): Promise<{
  totalAttempts: number;
  passedAttempts: number;
  averageScore: number;
  averageTimeSeconds: number;
}> {
  const { data, error } = await supabase
    .from('pd_quiz_attempts')
    .select('score_percent, passed, time_spent_seconds')
    .eq('module_id', moduleId)
    .eq('status', 'completed');
  
  if (error) throw error;
  
  const attempts = data || [];
  const totalAttempts = attempts.length;
  const passedAttempts = attempts.filter(a => a.passed).length;
  const averageScore = totalAttempts > 0 
    ? attempts.reduce((sum, a) => sum + (a.score_percent || 0), 0) / totalAttempts 
    : 0;
  const validTimes = attempts.filter(a => a.time_spent_seconds);
  const averageTimeSeconds = validTimes.length > 0
    ? validTimes.reduce((sum, a) => sum + (a.time_spent_seconds || 0), 0) / validTimes.length
    : 0;
  
  return {
    totalAttempts,
    passedAttempts,
    averageScore: Math.round(averageScore * 100) / 100,
    averageTimeSeconds: Math.round(averageTimeSeconds)
  };
}

export async function getTeacherQuizStats(teacherId: string): Promise<{
  totalQuizzesTaken: number;
  totalQuizzesPassed: number;
  averageScore: number;
}> {
  const { data, error } = await supabase
    .from('pd_quiz_attempts')
    .select('score_percent, passed')
    .eq('teacher_id', teacherId)
    .eq('status', 'completed');
  
  if (error) throw error;
  
  const attempts = data || [];
  const totalQuizzesTaken = attempts.length;
  const totalQuizzesPassed = attempts.filter(a => a.passed).length;
  const averageScore = totalQuizzesTaken > 0
    ? attempts.reduce((sum, a) => sum + (a.score_percent || 0), 0) / totalQuizzesTaken
    : 0;
  
  return {
    totalQuizzesTaken,
    totalQuizzesPassed,
    averageScore: Math.round(averageScore * 100) / 100
  };
}

// ============ HELPER FUNCTIONS ============

export function gradeQuiz(
  questions: QuizQuestion[],
  answers: Record<string, string | string[]>
): { gradedAnswers: QuizAnswer[]; correctCount: number; totalPoints: number; earnedPoints: number } {
  let correctCount = 0;
  let totalPoints = 0;
  let earnedPoints = 0;
  
  const gradedAnswers: QuizAnswer[] = questions.map(question => {
    const userAnswer = answers[question.id];
    let isCorrect = false;
    let pointsEarned = 0;
    
    totalPoints += question.points;
    
    switch (question.question_type) {
      case 'multiple_choice':
        // Find the correct option
        const correctOption = question.options.find(o => o.is_correct);
        isCorrect = correctOption?.id === userAnswer;
        break;
        
      case 'true_false':
        isCorrect = question.correct_answer?.toLowerCase() === String(userAnswer).toLowerCase();
        break;
        
      case 'short_answer':
        // Case-insensitive comparison, trim whitespace
        const correctAnswerNormalized = question.correct_answer?.toLowerCase().trim();
        const userAnswerNormalized = String(userAnswer || '').toLowerCase().trim();
        isCorrect = correctAnswerNormalized === userAnswerNormalized;
        break;
    }
    
    if (isCorrect) {
      correctCount++;
      pointsEarned = question.points;
      earnedPoints += pointsEarned;
    }
    
    return {
      question_id: question.id,
      answer: userAnswer || '',
      is_correct: isCorrect,
      points_earned: pointsEarned
    };
  });
  
  return { gradedAnswers, correctCount, totalPoints, earnedPoints };
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
