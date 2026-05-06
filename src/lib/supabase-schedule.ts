import { supabase } from './supabase';
import { ClassPeriod, SchoolClass, ScheduleEntry, ScheduleConflict } from '@/types/schedule';

export async function fetchClassPeriods(schoolId?: string): Promise<ClassPeriod[]> {
  let query = supabase.from('class_periods').select('*').order('period_number');
  if (schoolId) query = query.eq('school_id', schoolId);
  const { data } = await query;
  return data || [];
}

export async function saveClassPeriod(period: Partial<ClassPeriod>): Promise<ClassPeriod | null> {
  if (period.id) {
    const { data } = await supabase.from('class_periods').update(period).eq('id', period.id).select().single();
    return data;
  }
  const { data } = await supabase.from('class_periods').insert(period).select().single();
  return data;
}

export async function deleteClassPeriod(id: string): Promise<boolean> {
  const { error } = await supabase.from('class_periods').delete().eq('id', id);
  return !error;
}

export async function fetchSchoolClasses(schoolId?: string): Promise<SchoolClass[]> {
  let query = supabase.from('school_classes').select('*').eq('is_active', true).order('grade_level');
  if (schoolId) query = query.eq('school_id', schoolId);
  const { data } = await query;
  return data || [];
}

export async function saveSchoolClass(cls: Partial<SchoolClass>): Promise<SchoolClass | null> {
  if (cls.id) {
    const { data } = await supabase.from('school_classes').update(cls).eq('id', cls.id).select().single();
    return data;
  }
  const { data } = await supabase.from('school_classes').insert(cls).select().single();
  return data;
}

export async function deleteSchoolClass(id: string): Promise<boolean> {
  const { error } = await supabase.from('school_classes').update({ is_active: false }).eq('id', id);
  return !error;
}

export async function fetchScheduleEntries(schoolId?: string, classId?: string): Promise<ScheduleEntry[]> {
  let query = supabase.from('schedule_entries').select('*').eq('is_active', true);
  if (schoolId) query = query.eq('school_id', schoolId);
  if (classId) query = query.eq('class_id', classId);
  const { data } = await query;
  return data || [];
}

export async function saveScheduleEntry(entry: Partial<ScheduleEntry>): Promise<ScheduleEntry | null> {
  if (entry.id) {
    const { data } = await supabase.from('schedule_entries').update(entry).eq('id', entry.id).select().single();
    return data;
  }
  const { data } = await supabase.from('schedule_entries').insert(entry).select().single();
  return data;
}

export async function deleteScheduleEntry(id: string): Promise<boolean> {
  const { error } = await supabase.from('schedule_entries').delete().eq('id', id);
  return !error;
}

export function checkScheduleConflicts(entries: ScheduleEntry[], newEntry: ScheduleEntry): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];
  for (const entry of entries) {
    if (entry.id === newEntry.id) continue;
    if (entry.day_of_week !== newEntry.day_of_week || entry.period_id !== newEntry.period_id) continue;
    if (newEntry.teacher_id && entry.teacher_id === newEntry.teacher_id) {
      conflicts.push({ type: 'teacher', message: 'Teacher already assigned', entry1: entry, entry2: newEntry });
    }
    if (newEntry.room_number && entry.room_number === newEntry.room_number) {
      conflicts.push({ type: 'room', message: 'Room already in use', entry1: entry, entry2: newEntry });
    }
  }
  return conflicts;
}
