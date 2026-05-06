import { supabase } from './supabase';
import { ReviewComment, CommentType } from '@/types/review';

export async function fetchReviewComments(lessonId: string): Promise<ReviewComment[]> {
  const { data, error } = await supabase.from('review_comments').select('*').eq('lesson_id', lessonId).order('created_at', { ascending: true });
  if (error) { console.error('Error fetching comments:', error); return []; }
  return data || [];
}

export async function addReviewComment(
  lessonId: string, reviewId: string, authorId: string, authorName: string, authorRole: string,
  comment: string, commentType: CommentType = 'general', slideIndex?: number
): Promise<ReviewComment | null> {
  const { data, error } = await supabase.from('review_comments').insert({
    lesson_id: lessonId, review_id: reviewId, author_id: authorId, author_name: authorName,
    author_role: authorRole, comment, comment_type: commentType, slide_index: slideIndex
  }).select().single();
  if (error) { console.error('Error adding comment:', error); return null; }
  return data;
}

export async function resolveComment(commentId: string, resolvedBy: string): Promise<boolean> {
  const { error } = await supabase.from('review_comments').update({ resolved: true, resolved_by: resolvedBy, resolved_at: new Date().toISOString() }).eq('id', commentId);
  if (error) { console.error('Error resolving comment:', error); return false; }
  return true;
}

export async function deleteComment(commentId: string): Promise<boolean> {
  const { error } = await supabase.from('review_comments').delete().eq('id', commentId);
  if (error) { console.error('Error deleting comment:', error); return false; }
  return true;
}

export async function getUnresolvedCommentCount(lessonId: string): Promise<number> {
  const { count, error } = await supabase.from('review_comments').select('*', { count: 'exact', head: true }).eq('lesson_id', lessonId).eq('resolved', false);
  if (error) { console.error('Error counting comments:', error); return 0; }
  return count || 0;
}
