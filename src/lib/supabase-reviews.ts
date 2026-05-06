import { supabase } from './supabase';
import { LessonReview, ReviewComment, LessonVersion, ContentNotification, ReviewStatus, CommentType, NotificationType } from '@/types/review';

export async function fetchLessonReview(lessonId: string): Promise<LessonReview | null> {
  const { data, error } = await supabase.from('lesson_reviews').select('*').eq('lesson_id', lessonId).single();
  if (error && error.code !== 'PGRST116') console.error('Error fetching review:', error);
  return data;
}

export async function fetchAllReviews(status?: ReviewStatus): Promise<LessonReview[]> {
  let query = supabase.from('lesson_reviews').select('*').order('updated_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) { console.error('Error fetching reviews:', error); return []; }
  return data || [];
}

export async function createOrUpdateReview(lessonId: string, updates: Partial<LessonReview>): Promise<LessonReview | null> {
  const existing = await fetchLessonReview(lessonId);
  if (existing) {
    const { data, error } = await supabase.from('lesson_reviews').update({ ...updates, updated_at: new Date().toISOString() }).eq('lesson_id', lessonId).select().single();
    if (error) { console.error('Error updating review:', error); return null; }
    return data;
  } else {
    const { data, error } = await supabase.from('lesson_reviews').insert({ lesson_id: lessonId, ...updates }).select().single();
    if (error) { console.error('Error creating review:', error); return null; }
    return data;
  }
}

export async function submitForReview(lessonId: string, submittedBy: string): Promise<boolean> {
  const result = await createOrUpdateReview(lessonId, { status: 'pending', submitted_by: submittedBy, submitted_at: new Date().toISOString() });
  return result !== null;
}

export async function assignReviewer(lessonId: string, reviewerId: string): Promise<boolean> {
  const result = await createOrUpdateReview(lessonId, { status: 'in_review', reviewer_id: reviewerId, reviewed_at: new Date().toISOString() });
  return result !== null;
}

export async function updateReviewStatus(lessonId: string, status: ReviewStatus, userId: string): Promise<boolean> {
  const updates: Partial<LessonReview> = { status };
  if (status === 'approved') { updates.approved_by = userId; updates.approved_at = new Date().toISOString(); }
  if (status === 'published') { updates.published_by = userId; updates.published_at = new Date().toISOString(); }
  const result = await createOrUpdateReview(lessonId, updates);
  return result !== null;
}
