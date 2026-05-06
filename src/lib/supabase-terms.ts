import { supabase } from './supabase';
import { Term, TermNumber, TermSettings, getDefaultTermDates } from '@/types/term';

export interface TermSettingsRow {
  id: string;
  academic_year: string;
  term_number: number;
  term_name: string;
  start_date: string;
  end_date: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LessonScheduleRow {
  id: string;
  lesson_id: string;
  scheduled_date: string;
  scheduled_time?: string;
  duration_minutes: number;
  user_id?: string;
  created_at?: string;
}

// Fetch term settings for an academic year
export const fetchTermSettings = async (academicYear: string): Promise<TermSettings | null> => {
  const { data, error } = await supabase
    .from('term_settings')
    .select('*')
    .eq('academic_year', academicYear)
    .order('term_number', { ascending: true });

  if (error || !data || data.length === 0) {
    return { academicYear, terms: getDefaultTermDates(academicYear) };
  }

  const terms: Term[] = data.map((row: TermSettingsRow) => ({
    id: row.id,
    termNumber: row.term_number as TermNumber,
    name: row.term_name,
    startDate: row.start_date,
    endDate: row.end_date,
    academicYear: row.academic_year,
    weeksCount: 12
  }));

  return { academicYear, terms };
};

// Save or update term settings
export const saveTermSettings = async (settings: TermSettings): Promise<boolean> => {
  for (const term of settings.terms) {
    const { error } = await supabase.from('term_settings').upsert({
      id: term.id,
      academic_year: settings.academicYear,
      term_number: term.termNumber,
      term_name: term.name,
      start_date: term.startDate,
      end_date: term.endDate,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
    if (error) return false;
  }
  return true;
};

// Fetch lesson schedule
export const fetchLessonSchedule = async (lessonId: string): Promise<LessonScheduleRow | null> => {
  const { data, error } = await supabase
    .from('lesson_schedules')
    .select('*')
    .eq('lesson_id', lessonId)
    .single();
  if (error || !data) return null;
  return data;
};

// Save lesson schedule
export const saveLessonSchedule = async (schedule: Omit<LessonScheduleRow, 'id' | 'created_at'>): Promise<boolean> => {
  const { error } = await supabase.from('lesson_schedules').upsert({
    ...schedule,
    updated_at: new Date().toISOString()
  }, { onConflict: 'lesson_id' });
  return !error;
};

// Fetch all schedules for a date range
export const fetchSchedulesForRange = async (startDate: string, endDate: string): Promise<LessonScheduleRow[]> => {
  const { data, error } = await supabase
    .from('lesson_schedules')
    .select('*')
    .gte('scheduled_date', startDate)
    .lte('scheduled_date', endDate);
  if (error || !data) return [];
  return data;
};

// Delete lesson schedule
export const deleteLessonSchedule = async (lessonId: string): Promise<boolean> => {
  const { error } = await supabase.from('lesson_schedules').delete().eq('lesson_id', lessonId);
  return !error;
};
