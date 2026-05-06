import { supabase } from './supabase';

export interface ClassSubjectMapping {
  [className: string]: string[];
}

export interface TeacherAssignmentRecord {
  id: string;
  teacher_id: string;
  school_id: string;
  assigned_classes: string[];
  assigned_subjects: string[];
  assignment_mode: 'multi-class' | 'multi-subject' | 'multi-both';
  class_subject_mapping?: ClassSubjectMapping;
  assigned_by?: string;
  assigned_at: string;
  updated_at: string;
  notes?: string;
  is_active: boolean;
}

export async function getTeacherAssignment(teacherId: string, schoolId: string): Promise<TeacherAssignmentRecord | null> {
  const { data, error } = await supabase
    .from('teacher_assignments')
    .select('*')
    .eq('teacher_id', teacherId)
    .eq('school_id', schoolId)
    .eq('is_active', true)
    .single();
  
  if (error || !data) return null;
  return data as TeacherAssignmentRecord;
}

export async function saveTeacherAssignment(
  teacherId: string,
  schoolId: string,
  classes: string[],
  subjects: string[],
  mode: 'multi-class' | 'multi-subject' | 'multi-both',
  assignedBy: string,
  notes?: string,
  classSubjectMapping?: ClassSubjectMapping
): Promise<boolean> {
  const { error } = await supabase
    .from('teacher_assignments')
    .upsert({
      teacher_id: teacherId,
      school_id: schoolId,
      assigned_classes: classes,
      assigned_subjects: subjects,
      assignment_mode: mode,
      class_subject_mapping: classSubjectMapping || null,
      assigned_by: assignedBy,
      updated_at: new Date().toISOString(),
      notes,
      is_active: true
    }, { onConflict: 'teacher_id,school_id' });
  
  return !error;
}

export async function deleteTeacherAssignment(teacherId: string, schoolId: string): Promise<boolean> {
  const { error } = await supabase
    .from('teacher_assignments')
    .update({ is_active: false })
    .eq('teacher_id', teacherId)
    .eq('school_id', schoolId);
  
  return !error;
}
export async function getSchoolTeacherAssignments(schoolId: string): Promise<TeacherAssignmentRecord[]> {
  const { data, error } = await supabase
    .from('teacher_assignments')
    .select('*')
    .eq('school_id', schoolId)
    .eq('is_active', true);
  
  if (error || !data) return [];
  return data as TeacherAssignmentRecord[];
}

// Alias for getSchoolTeacherAssignments for backward compatibility
export const getTeacherAssignments = getSchoolTeacherAssignments;

export interface TeacherAssignmentWithName extends TeacherAssignmentRecord {
  teacher_name?: string;
}

/**
 * Get all teacher assignments for a school with teacher names
 */
export async function getTeacherAssignmentsWithNames(schoolId: string): Promise<TeacherAssignmentWithName[]> {
  const { data, error } = await supabase
    .from('teacher_assignments')
    .select(`
      *,
      profiles:teacher_id (full_name, email)
    `)
    .eq('school_id', schoolId)
    .eq('is_active', true);
  
  if (error || !data) return [];
  
  return data.map((item: any) => ({
    ...item,
    teacher_name: item.profiles?.full_name || item.profiles?.email || 'Unknown Teacher'
  })) as TeacherAssignmentWithName[];
}



/**
 * Get the subjects a teacher can teach for a specific class
 * For multi-both mode with mapping, returns only the mapped subjects
 * For other modes, returns all assigned subjects
 */
export function getTeacherSubjectsForClass(
  assignment: TeacherAssignmentRecord,
  className: string
): string[] {
  if (!assignment.assigned_classes.includes(className)) {
    return [];
  }

  if (assignment.assignment_mode === 'multi-both' && assignment.class_subject_mapping) {
    return assignment.class_subject_mapping[className] || [];
  }

  return assignment.assigned_subjects;
}

/**
 * Get the classes a teacher can teach for a specific subject
 * For multi-both mode with mapping, returns only classes where the subject is mapped
 * For other modes, returns all assigned classes
 */
export function getTeacherClassesForSubject(
  assignment: TeacherAssignmentRecord,
  subject: string
): string[] {
  if (!assignment.assigned_subjects.includes(subject)) {
    return [];
  }

  if (assignment.assignment_mode === 'multi-both' && assignment.class_subject_mapping) {
    return assignment.assigned_classes.filter(
      className => assignment.class_subject_mapping?.[className]?.includes(subject)
    );
  }

  return assignment.assigned_classes;
}

/**
 * Check if a teacher can teach a specific class-subject combination
 */
export function canTeachClassSubject(
  assignment: TeacherAssignmentRecord,
  className: string,
  subject: string
): boolean {
  if (!assignment.assigned_classes.includes(className)) {
    return false;
  }
  if (!assignment.assigned_subjects.includes(subject)) {
    return false;
  }

  if (assignment.assignment_mode === 'multi-both' && assignment.class_subject_mapping) {
    return assignment.class_subject_mapping[className]?.includes(subject) || false;
  }

  return true;
}

/**
 * Get all valid class-subject combinations for a teacher
 */
export function getTeacherClassSubjectCombinations(
  assignment: TeacherAssignmentRecord
): Array<{ className: string; subject: string }> {
  const combinations: Array<{ className: string; subject: string }> = [];

  if (assignment.assignment_mode === 'multi-both' && assignment.class_subject_mapping) {
    Object.entries(assignment.class_subject_mapping).forEach(([className, subjects]) => {
      subjects.forEach(subject => {
        combinations.push({ className, subject });
      });
    });
  } else {
    assignment.assigned_classes.forEach(className => {
      assignment.assigned_subjects.forEach(subject => {
        combinations.push({ className, subject });
      });
    });
  }

  return combinations;
}

/**
 * Get a summary of the teacher's assignment for display
 */
export function getAssignmentSummary(assignment: TeacherAssignmentRecord): string {
  const combinations = getTeacherClassSubjectCombinations(assignment);
  
  if (assignment.assignment_mode === 'multi-class') {
    return `${assignment.assigned_subjects[0]} teacher for ${assignment.assigned_classes.length} class${assignment.assigned_classes.length > 1 ? 'es' : ''}`;
  }
  
  if (assignment.assignment_mode === 'multi-subject') {
    return `${assignment.assigned_classes[0]} class teacher (${assignment.assigned_subjects.length} subject${assignment.assigned_subjects.length > 1 ? 's' : ''})`;
  }
  
  // multi-both
  return `${combinations.length} class-subject combination${combinations.length > 1 ? 's' : ''}`;
}
