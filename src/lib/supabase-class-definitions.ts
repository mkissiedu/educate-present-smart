import { supabase } from './supabase';
import { DEFAULT_CLASSES, DEFAULT_SUBJECTS } from './curriculum-defaults';

export interface SystemClassDefinition {
  id: string;
  name: string;
  grade_level: string;
  category?: string;
  display_order: number;
  is_active: boolean;
  created_by?: string;
  created_at?: string;
}

export interface SystemSubjectDefinition {
  id: string;
  name: string;
  code: string;
  applicable_classes: string[];
  display_order: number;
  is_active: boolean;
  created_by?: string;
}

// Returns system classes from DB or falls back to defaults
export async function fetchSystemClassDefinitions(): Promise<SystemClassDefinition[]> {
  const { data, error } = await supabase
    .from('system_class_definitions')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  
  if (error || !data || data.length === 0) {
    // Return default 13 classes as fallback
    return DEFAULT_CLASSES.map((c, i) => ({
      id: `default-${c.grade_level}`,
      name: c.name,
      grade_level: c.grade_level,
      category: c.category,
      display_order: c.display_order,
      is_active: true
    }));
  }
  return data;
}

export async function saveSystemClassDefinition(def: Partial<SystemClassDefinition>): Promise<SystemClassDefinition | null> {
  if (def.id && !def.id.startsWith('default-')) {
    const { data } = await supabase.from('system_class_definitions').update({ ...def, updated_at: new Date().toISOString() }).eq('id', def.id).select().single();
    return data;
  }
  const { data } = await supabase.from('system_class_definitions').insert(def).select().single();
  return data;
}

export async function deleteSystemClassDefinition(id: string): Promise<boolean> {
  if (id.startsWith('default-')) return false;
  const { error } = await supabase.from('system_class_definitions').update({ is_active: false }).eq('id', id);
  return !error;
}

export async function seedDefaultClasses(userId?: string): Promise<void> {
  const { data } = await supabase.from('system_class_definitions').select('id').eq('is_active', true).limit(1);
  if (data && data.length > 0) return;
  
  for (const cls of DEFAULT_CLASSES) {
    await supabase.from('system_class_definitions').insert({
      name: cls.name, grade_level: cls.grade_level, category: cls.category,
      display_order: cls.display_order, is_active: true, created_by: userId
    });
  }
}

export async function resetToDefaultClasses(userId?: string): Promise<void> {
  // Deactivate all existing
  await supabase.from('system_class_definitions').update({ is_active: false }).neq('id', '');
  // Insert defaults
  for (const cls of DEFAULT_CLASSES) {
    await supabase.from('system_class_definitions').insert({
      name: cls.name, grade_level: cls.grade_level, category: cls.category,
      display_order: cls.display_order, is_active: true, created_by: userId
    });
  }
}

export async function fetchSystemSubjectDefinitions(): Promise<SystemSubjectDefinition[]> {
  const { data, error } = await supabase.from('system_subject_definitions').select('*').eq('is_active', true).order('display_order');
  if (error || !data || data.length === 0) {
    return DEFAULT_SUBJECTS.map((s, i) => ({
      id: `default-${s.code}`,
      name: s.name,
      code: s.code,
      applicable_classes: s.applicable_classes,
      display_order: s.display_order,
      is_active: true
    }));
  }
  return data;
}

export async function saveSystemSubjectDefinition(def: Partial<SystemSubjectDefinition>): Promise<SystemSubjectDefinition | null> {
  if (def.id && !def.id.startsWith('default-')) {
    const { data } = await supabase.from('system_subject_definitions').update(def).eq('id', def.id).select().single();
    return data;
  }
  const { data } = await supabase.from('system_subject_definitions').insert(def).select().single();
  return data;
}

export async function deleteSystemSubjectDefinition(id: string): Promise<boolean> {
  if (id.startsWith('default-')) return false;
  const { error } = await supabase.from('system_subject_definitions').update({ is_active: false }).eq('id', id);
  return !error;
}

export async function seedDefaultSubjects(userId?: string): Promise<void> {
  const { data } = await supabase.from('system_subject_definitions').select('id').eq('is_active', true).limit(1);
  if (data && data.length > 0) return;
  
  for (const subj of DEFAULT_SUBJECTS) {
    await supabase.from('system_subject_definitions').insert({
      name: subj.name, code: subj.code, applicable_classes: subj.applicable_classes,
      display_order: subj.display_order, is_active: true, created_by: userId
    });
  }
}

export async function getStudentCountByClass(classLevel: string, schoolId?: string): Promise<number> {
  let query = supabase.from('students').select('id', { count: 'exact', head: true }).eq('class_level', classLevel);
  if (schoolId) query = query.eq('school_id', schoolId);
  const { count } = await query;
  return count || 0;
}

export async function getStudentCountsByClasses(schoolId?: string): Promise<Record<string, number>> {
  let query = supabase.from('students').select('class_level');
  if (schoolId) query = query.eq('school_id', schoolId);
  const { data } = await query;
  if (!data) return {};
  const counts: Record<string, number> = {};
  data.forEach((s: { class_level: string }) => { counts[s.class_level] = (counts[s.class_level] || 0) + 1; });
  return counts;
}
