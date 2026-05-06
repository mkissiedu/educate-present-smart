import { supabase } from './supabase';
import { LessonTemplate, TemplateFilters } from '@/types/template';
import { Lesson } from '@/types/lesson';

export const fetchTemplates = async (filters?: TemplateFilters): Promise<LessonTemplate[]> => {
  let query = supabase.from('lesson_templates').select('*').order('created_at', { ascending: false });
  
  if (filters?.subject) query = query.eq('subject', filters.subject);
  if (filters?.classLevel) query = query.eq('class_level', filters.classLevel);
  if (filters?.category) query = query.eq('category', filters.category);
  if (filters?.week) query = query.eq('week', filters.week);
  if (filters?.lessonNumber) query = query.eq('lesson_number', filters.lessonNumber);
  if (filters?.featuredOnly) query = query.eq('is_featured', true);
  if (filters?.searchQuery) query = query.ilike('title', `%${filters.searchQuery}%`);
  
  const { data, error } = await query;
  if (error || !data) return [];
  return data.map(mapDbToTemplate);
};

export const fetchFeaturedTemplates = async (): Promise<LessonTemplate[]> => {
  const { data, error } = await supabase
    .from('lesson_templates')
    .select('*')
    .eq('is_featured', true)
    .order('use_count', { ascending: false })
    .limit(6);
  if (error || !data) return [];
  return data.map(mapDbToTemplate);
};

export const createTemplate = async (template: Omit<LessonTemplate, 'id' | 'createdAt' | 'updatedAt' | 'useCount'>): Promise<LessonTemplate | null> => {
  const { data, error } = await supabase.from('lesson_templates').insert({
    title: template.title, description: template.description, subject: template.subject,
    class_level: template.classLevel, category: template.category, 
    week: template.week, lesson_number: template.lessonNumber,
    lesson_data: template.lessonData, author_id: template.authorId, author_name: template.authorName,
    is_featured: template.isFeatured, thumbnail_url: template.thumbnailUrl, tags: template.tags
  }).select().single();
  if (error || !data) return null;
  return mapDbToTemplate(data);
};

export const duplicateTemplate = async (templateId: string, userId: string, userName: string): Promise<Lesson | null> => {
  const { data, error } = await supabase.from('lesson_templates').select('*').eq('id', templateId).single();
  if (error || !data) return null;
  
  await supabase.from('lesson_templates').update({ use_count: (data.use_count || 0) + 1 }).eq('id', templateId);
  
  const lesson = data.lesson_data as Lesson;
  return { 
    ...lesson, 
    id: Date.now().toString(), 
    title: `${lesson.title} (Copy)`,
    week: data.week || lesson.week || 1,
    lessonNumber: data.lesson_number || lesson.lessonNumber || 1
  };
};


export const deleteTemplate = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('lesson_templates').delete().eq('id', id);
  return !error;
};

const mapDbToTemplate = (data: any): LessonTemplate => ({
  id: data.id, title: data.title, description: data.description, subject: data.subject,
  classLevel: data.class_level, category: data.category, 
  week: data.week || 1, lessonNumber: data.lesson_number || 1,
  lessonData: data.lesson_data, authorId: data.author_id, authorName: data.author_name,
  isFeatured: data.is_featured, useCount: data.use_count || 0, thumbnailUrl: data.thumbnail_url,
  tags: data.tags || [], createdAt: data.created_at, updatedAt: data.updated_at
});

