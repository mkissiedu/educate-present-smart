import { supabase } from './supabase';
import { Student, Skill, StudentProgress, PollResponse } from '../types/student';

export async function createStudent(student: Omit<Student, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('students')
    .insert([student])
    .select()
    .single();
  
  if (error) throw error;
  return data as Student;
}

function normalizeStudents(rows: any[]): Student[] {
  return (rows || []).map(s => ({
    ...s,
    name: s.name || `${s.first_name || ''} ${s.last_name || ''}`.trim(),
    class_name: s.class_name || s.class_level,
    parent_phone: s.parent_phone || s.guardian1_whatsapp || s.guardian2_whatsapp || '',
    guardian_phone: s.guardian_phone || s.guardian1_whatsapp || s.guardian2_whatsapp || ''
  })) as Student[];
}

/**
 * Fetch students. Accepts either a school_id or teacher_id, plus optional class filter.
 * Tries school_id first; if that column doesn't exist on this DatabasePad schema,
 * falls back to teacher_id. Always returns [] on error rather than throwing.
 */
export async function fetchStudents(schoolIdOrTeacherId?: string, classLevel?: string) {
  if (!schoolIdOrTeacherId) {
    // No filter — return all students
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('last_name', { ascending: true });
      if (error) {
        console.warn('Fetch students (no filter) error:', error.message);
        return [];
      }
      return normalizeStudents(data || []);
    } catch (e: any) {
      console.warn('Fetch students exception:', e?.message);
      return [];
    }
  }

  // Try school_id first
  try {
    let q = supabase
      .from('students')
      .select('*')
      .eq('school_id', schoolIdOrTeacherId)
      .order('last_name', { ascending: true });
    if (classLevel) q = q.eq('class_level', classLevel);
    const { data, error } = await q;
    if (!error && data && data.length >= 0) {
      // Got a successful response. If empty, also try teacher_id as fallback.
      if (data.length > 0) return normalizeStudents(data);
    } else if (error) {
      console.warn('Fetch students (school_id) error:', error.message);
    }
  } catch (e: any) {
    console.warn('Fetch students (school_id) exception:', e?.message);
  }

  // Fallback: try teacher_id
  try {
    let q = supabase
      .from('students')
      .select('*')
      .eq('teacher_id', schoolIdOrTeacherId)
      .order('last_name', { ascending: true });
    if (classLevel) q = q.eq('class_level', classLevel);
    const { data, error } = await q;
    if (error) {
      console.warn('Fetch students (teacher_id) error:', error.message);
      return [];
    }
    return normalizeStudents(data || []);
  } catch (e: any) {
    console.warn('Fetch students (teacher_id) exception:', e?.message);
    return [];
  }
}

export async function fetchStudentsByClass(classLevel: string, schoolId?: string) {
  try {
    let query = supabase.from('students').select('*')
      .eq('class_level', classLevel)
      .order('last_name', { ascending: true });
    
    if (schoolId) {
      query = query.eq('school_id', schoolId);
    }
    
    const { data, error } = await query;
    if (error) {
      console.warn('fetchStudentsByClass error:', error.message);
      return [];
    }
    return normalizeStudents(data || []);
  } catch (e: any) {
    console.warn('fetchStudentsByClass exception:', e?.message);
    return [];
  }
}

export async function updateStudent(id: string, updates: Partial<Student>) {
  const { data, error } = await supabase
    .from('students')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Student;
}

export async function deleteStudent(id: string) {
  const { error } = await supabase.from('students').delete().eq('id', id);
  if (error) throw error;
}
