import { supabase } from './supabase';
import { AcademicCalendarEvent, SchoolCalendarOverride } from '@/types/assessment-types';

export async function fetchGlobalCalendarEvents(): Promise<AcademicCalendarEvent[]> {
  const { data, error } = await supabase
    .from('academic_calendar')
    .select('*')
    .eq('is_global', true)
    .order('start_date');
  if (error) { console.error('Error fetching calendar:', error); return []; }
  return data || [];
}

export async function fetchSchoolCalendarEvents(schoolId: string): Promise<AcademicCalendarEvent[]> {
  const { data, error } = await supabase
    .from('academic_calendar')
    .select('*')
    .or(`is_global.eq.true,school_id.eq.${schoolId}`)
    .order('start_date');
  if (error) { console.error('Error fetching school calendar:', error); return []; }
  return data || [];
}

export async function createCalendarEvent(event: Omit<AcademicCalendarEvent, 'id' | 'created_at' | 'updated_at'>): Promise<AcademicCalendarEvent | null> {
  const { data, error } = await supabase.from('academic_calendar').insert(event).select().single();
  if (error) { console.error('Error creating event:', error); return null; }
  return data;
}

export async function updateCalendarEvent(id: string, updates: Partial<AcademicCalendarEvent>): Promise<boolean> {
  const { error } = await supabase.from('academic_calendar').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
  return !error;
}

export async function deleteCalendarEvent(id: string): Promise<boolean> {
  const { error } = await supabase.from('academic_calendar').delete().eq('id', id);
  return !error;
}

export async function fetchSchoolOverrides(schoolId: string): Promise<SchoolCalendarOverride[]> {
  const { data, error } = await supabase.from('school_calendar_overrides').select('*').eq('school_id', schoolId);
  if (error) return [];
  return data || [];
}

export async function createSchoolOverride(override: Omit<SchoolCalendarOverride, 'id' | 'created_at'>): Promise<SchoolCalendarOverride | null> {
  const { data, error } = await supabase.from('school_calendar_overrides').insert(override).select().single();
  if (error) return null;
  return data;
}

export async function deleteSchoolOverride(id: string): Promise<boolean> {
  const { error } = await supabase.from('school_calendar_overrides').delete().eq('id', id);
  return !error;
}
