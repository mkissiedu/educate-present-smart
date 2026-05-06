import { supabase } from './supabase';
import { PublishedTestPaper, AssessmentPaperType, ContentAnalytics } from '@/types/assessment-types';

export async function publishTestPaper(
  testPaperId: string, paperType: AssessmentPaperType, subject: string, classLevel: string,
  term: string, academicYear: string, publishMode: 'all' | 'selected', publishedBy: string, schoolIds?: string[]
): Promise<PublishedTestPaper | null> {
  const { data, error } = await supabase.from('published_test_papers').insert({
    test_paper_id: testPaperId, paper_type: paperType, subject, class_level: classLevel,
    term, academic_year: academicYear, publish_mode: publishMode, published_by: publishedBy,
    is_active: true, school_ids: schoolIds || []
  }).select().single();
  if (error) { console.error('Error publishing test paper:', error); return null; }
  return data;
}

export async function fetchPublishedTestPapers(filters?: { subject?: string; classLevel?: string; paperType?: AssessmentPaperType }): Promise<PublishedTestPaper[]> {
  let query = supabase.from('published_test_papers').select('*').eq('is_active', true);
  if (filters?.subject) query = query.eq('subject', filters.subject);
  if (filters?.classLevel) query = query.eq('class_level', filters.classLevel);
  if (filters?.paperType) query = query.eq('paper_type', filters.paperType);
  const { data, error } = await query.order('published_at', { ascending: false });
  if (error) return [];
  return data || [];
}

export async function unpublishTestPaper(id: string): Promise<boolean> {
  const { error } = await supabase.from('published_test_papers').update({ is_active: false }).eq('id', id);
  return !error;
}

export async function trackContentAnalytics(
  superTeacherId: string, contentType: 'lesson' | 'question' | 'test_paper',
  action: 'created' | 'edited' | 'submitted' | 'approved' | 'published',
  contentId?: string, subject?: string, classLevel?: string, metadata?: Record<string, any>
): Promise<boolean> {
  const { error } = await supabase.from('content_analytics').insert({
    super_teacher_id: superTeacherId, content_type: contentType, action,
    content_id: contentId, subject, class_level: classLevel, metadata: metadata || {}
  });
  return !error;
}

export async function fetchContentAnalytics(superTeacherId?: string): Promise<ContentAnalytics[]> {
  let query = supabase.from('content_analytics').select('*');
  if (superTeacherId) query = query.eq('super_teacher_id', superTeacherId);
  const { data, error } = await query.order('created_at', { ascending: false }).limit(100);
  if (error) return [];
  return data || [];
}

export async function getAnalyticsSummary(superTeacherId?: string): Promise<{
  lessonsCreated: number; lessonsPublished: number; questionsCreated: number; testPapersCreated: number;
}> {
  let query = supabase.from('content_analytics').select('content_type, action');
  if (superTeacherId) query = query.eq('super_teacher_id', superTeacherId);
  const { data } = await query;
  const items = data || [];
  return {
    lessonsCreated: items.filter(i => i.content_type === 'lesson' && i.action === 'created').length,
    lessonsPublished: items.filter(i => i.content_type === 'lesson' && i.action === 'published').length,
    questionsCreated: items.filter(i => i.content_type === 'question' && i.action === 'created').length,
    testPapersCreated: items.filter(i => i.content_type === 'test_paper' && i.action === 'created').length,
  };
}
