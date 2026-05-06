import { supabase } from './supabase';
import { LessonVersion } from '@/types/review';

export async function fetchLessonVersions(lessonId: string): Promise<LessonVersion[]> {
  const { data, error } = await supabase.from('lesson_versions').select('*').eq('lesson_id', lessonId).order('version_number', { ascending: false });
  if (error) { console.error('Error fetching versions:', error); return []; }
  return data || [];
}

export async function fetchLatestVersion(lessonId: string): Promise<LessonVersion | null> {
  const { data, error } = await supabase.from('lesson_versions').select('*').eq('lesson_id', lessonId).order('version_number', { ascending: false }).limit(1).single();
  if (error && error.code !== 'PGRST116') console.error('Error fetching latest version:', error);
  return data;
}

export async function createVersion(
  lessonId: string, content: any, changeSummary: string, createdBy: string, createdByName: string
): Promise<LessonVersion | null> {
  const latest = await fetchLatestVersion(lessonId);
  const nextVersion = (latest?.version_number || 0) + 1;
  
  const { data, error } = await supabase.from('lesson_versions').insert({
    lesson_id: lessonId, version_number: nextVersion, content,
    change_summary: changeSummary, created_by: createdBy, created_by_name: createdByName
  }).select().single();
  
  if (error) { console.error('Error creating version:', error); return null; }
  return data;
}

export async function getVersionContent(versionId: string): Promise<any | null> {
  const { data, error } = await supabase.from('lesson_versions').select('content').eq('id', versionId).single();
  if (error) { console.error('Error fetching version content:', error); return null; }
  return data?.content;
}

export async function compareVersions(lessonId: string, v1: number, v2: number): Promise<{ v1: LessonVersion | null; v2: LessonVersion | null }> {
  const { data: d1 } = await supabase.from('lesson_versions').select('*').eq('lesson_id', lessonId).eq('version_number', v1).single();
  const { data: d2 } = await supabase.from('lesson_versions').select('*').eq('lesson_id', lessonId).eq('version_number', v2).single();
  return { v1: d1, v2: d2 };
}
