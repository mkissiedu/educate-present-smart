import { supabase } from './supabase';
import { Skill, StudentProgress, PollResponse } from '../types/student';

export async function fetchSkills(domain?: string, classLevel?: string) {
  let query = supabase.from('skills').select('*').order('unit_number', { ascending: true });
  
  if (domain) query = query.eq('domain', domain);
  if (classLevel) query = query.eq('class_level', classLevel);
  
  const { data, error } = await query;
  if (error) throw error;
  return data as Skill[];
}

export async function createSkill(skill: Omit<Skill, 'id' | 'created_at'>) {
  const { data, error } = await supabase.from('skills').insert([skill]).select().single();
  if (error) throw error;
  return data as Skill;
}

export async function fetchStudentProgress(studentId: string) {
  const { data, error } = await supabase
    .from('student_progress')
    .select('*, skills(*)')
    .eq('student_id', studentId);
  
  if (error) throw error;
  return data;
}

export async function updateProgress(studentId: string, skillId: string, mastered: boolean, notes?: string) {
  const { data, error } = await supabase
    .from('student_progress')
    .upsert({
      student_id: studentId,
      skill_id: skillId,
      mastered,
      assessed_date: new Date().toISOString().split('T')[0],
      notes,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as StudentProgress;
}

export async function bulkUpdateProgress(updates: Array<{ studentId: string; skillId: string; mastered: boolean; notes?: string }>) {
  const records = updates.map(u => ({
    student_id: u.studentId,
    skill_id: u.skillId,
    mastered: u.mastered,
    assessed_date: new Date().toISOString().split('T')[0],
    notes: u.notes,
    updated_at: new Date().toISOString()
  }));

  const { data, error } = await supabase
    .from('student_progress')
    .upsert(records)
    .select();
  
  if (error) throw error;
  return data;
}

export async function fetchClassProgress(teacherId: string, classLevel: string) {
  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select('*')
    .eq('teacher_id', teacherId)
    .eq('class_level', classLevel);
  
  if (studentsError) throw studentsError;

  const studentIds = students.map(s => s.id);
  
  const { data: progress, error: progressError } = await supabase
    .from('student_progress')
    .select('*, skills(*)')
    .in('student_id', studentIds);
  
  if (progressError) throw progressError;

  return { students, progress };
}
