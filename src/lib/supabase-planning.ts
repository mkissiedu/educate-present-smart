import { supabase } from './supabase';
import { PlanningSession, PlanningChecklist, DEFAULT_CHECKLIST, MIN_PLANNING_TIME_SECONDS } from '@/types/planning';

export const startPlanningSession = async (lessonId: string, teacherId: string): Promise<PlanningSession | null> => {
  // Check for existing active session
  const existing = await getPlanningSession(lessonId, teacherId);
  if (existing) return existing;

  const { data, error } = await supabase.from('lesson_planning_sessions').insert({
    lesson_id: lessonId,
    teacher_id: teacherId,
    status: 'planning',
    planning_start_time: new Date().toISOString(),
    checklist: DEFAULT_CHECKLIST
  }).select().single();

  if (error || !data) return null;
  return mapDbToSession(data);
};

export const getPlanningSession = async (lessonId: string, teacherId: string): Promise<PlanningSession | null> => {
  const { data, error } = await supabase.from('lesson_planning_sessions')
    .select('*')
    .eq('lesson_id', lessonId)
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return mapDbToSession(data);
};

export const updatePlanningProgress = async (
  sessionId: string, 
  durationSeconds: number, 
  checklist: PlanningChecklist,
  notes?: string
): Promise<boolean> => {
  const { error } = await supabase.from('lesson_planning_sessions').update({
    planning_duration_seconds: durationSeconds,
    checklist,
    notes,
    updated_at: new Date().toISOString()
  }).eq('id', sessionId);
  return !error;
};

export const completePlanningSession = async (sessionId: string, durationSeconds: number): Promise<boolean> => {
  if (durationSeconds < MIN_PLANNING_TIME_SECONDS) return false;
  
  const { error } = await supabase.from('lesson_planning_sessions').update({
    status: 'completed',
    planning_duration_seconds: durationSeconds,
    completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }).eq('id', sessionId);
  return !error;
};

export const getTeacherPlanningStatus = async (teacherId: string): Promise<Map<string, PlanningSession>> => {
  const { data, error } = await supabase.from('lesson_planning_sessions')
    .select('*').eq('teacher_id', teacherId);

  const statusMap = new Map<string, PlanningSession>();
  if (!error && data) {
    data.forEach(d => statusMap.set(d.lesson_id, mapDbToSession(d)));
  }
  return statusMap;
};

const mapDbToSession = (data: any): PlanningSession => ({
  id: data.id,
  lessonId: data.lesson_id,
  teacherId: data.teacher_id,
  status: data.status,
  planningStartTime: data.planning_start_time,
  planningDurationSeconds: data.planning_duration_seconds || 0,
  completedAt: data.completed_at,
  notes: data.notes,
  checklist: data.checklist || DEFAULT_CHECKLIST,
  createdAt: data.created_at,
  updatedAt: data.updated_at
});
