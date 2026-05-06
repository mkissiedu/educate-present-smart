import { supabase } from './supabase';
import { Subject, ClassLevel } from '@/types/user';

export interface SuperTeacherAssignment {
  id: string;
  super_teacher_id: string;
  subject: string;
  class_level: string;
  assigned_by?: string;
  assigned_at: string;
  is_active: boolean;
  notes?: string;
}

export async function fetchSuperTeacherAssignments(superTeacherId: string): Promise<SuperTeacherAssignment[]> {
  const { data, error } = await supabase
    .from('super_teacher_assignments')
    .select('*')
    .eq('super_teacher_id', superTeacherId)
    .eq('is_active', true)
    .order('subject');
  
  if (error) { console.error('Error fetching assignments:', error); return []; }
  return data || [];
}

export async function fetchAllSuperTeacherAssignments(): Promise<SuperTeacherAssignment[]> {
  const { data, error } = await supabase
    .from('super_teacher_assignments')
    .select('*')
    .eq('is_active', true)
    .order('super_teacher_id');
  
  if (error) { console.error('Error fetching all assignments:', error); return []; }
  return data || [];
}

export async function assignSubjectToSuperTeacher(
  superTeacherId: string, subject: string, classLevel: string, assignedBy: string, notes?: string
): Promise<boolean> {
  const { error } = await supabase.from('super_teacher_assignments').upsert({
    super_teacher_id: superTeacherId, subject, class_level: classLevel,
    assigned_by: assignedBy, is_active: true, notes, assigned_at: new Date().toISOString()
  }, { onConflict: 'super_teacher_id,subject,class_level' });
  
  if (error) { console.error('Error assigning subject:', error); return false; }
  return true;
}

export async function removeAssignment(assignmentId: string): Promise<boolean> {
  const { error } = await supabase.from('super_teacher_assignments')
    .update({ is_active: false }).eq('id', assignmentId);
  if (error) { console.error('Error removing assignment:', error); return false; }
  return true;
}

export async function bulkAssignSubjects(
  superTeacherId: string, assignments: { subject: string; classLevel: string }[], assignedBy: string
): Promise<boolean> {
  const records = assignments.map(a => ({
    super_teacher_id: superTeacherId, subject: a.subject, class_level: a.classLevel,
    assigned_by: assignedBy, is_active: true, assigned_at: new Date().toISOString()
  }));
  
  const { error } = await supabase.from('super_teacher_assignments')
    .upsert(records, { onConflict: 'super_teacher_id,subject,class_level' });
  
  if (error) { console.error('Error bulk assigning:', error); return false; }
  return true;
}

export function getAssignedSubjects(assignments: SuperTeacherAssignment[]): string[] {
  return [...new Set(assignments.map(a => a.subject))];
}

export function getAssignedClasses(assignments: SuperTeacherAssignment[]): string[] {
  return [...new Set(assignments.map(a => a.class_level))];
}
