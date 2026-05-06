import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewStatusBadge, ReviewProgress } from '@/components/ReviewStatusBadge';
import { ReviewCommentsPanel } from '@/components/ReviewCommentsPanel';
import { LessonReview, ReviewComment, ReviewStatus, CommentType } from '@/types/review';
import { fetchLessonReview, submitForReview, updateReviewStatus, assignReviewer } from '@/lib/supabase-reviews';
import { fetchReviewComments, addReviewComment, resolveComment } from '@/lib/supabase-review-comments';
import { notifyStatusChange } from '@/lib/supabase-notifications';
import { useAuth } from '@/contexts/AuthContext';
import { Lesson } from '@/types/lesson';
import { Send, CheckCircle, XCircle, RotateCcw, Globe, History, MessageSquare } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ContentReviewWorkflowProps {
  lesson: Lesson;
  onStatusChange?: (status: ReviewStatus) => void;
}

export function ContentReviewWorkflow({ lesson, onStatusChange }: ContentReviewWorkflowProps) {
  const { user } = useAuth();
  const [review, setReview] = useState<LessonReview | null>(null);
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('status');

  const isReviewer = user?.role === 'platform_admin' || (user?.role === 'super_teacher' && user?.permissions?.canApproveContent);
  const isAuthor = review?.submitted_by === user?.id;
  const canSubmit = !review || review.status === 'draft' || review.status === 'changes_requested';
  const canReview = isReviewer && review?.status === 'pending';
  const canApprove = isReviewer && (review?.status === 'in_review' || review?.status === 'pending');
  const canPublish = isReviewer && review?.status === 'approved';

  useEffect(() => { loadReviewData(); }, [lesson.id]);

  const loadReviewData = async () => {
    setLoading(true);
    const [reviewData, commentsData] = await Promise.all([
      fetchLessonReview(lesson.id),
      fetchReviewComments(lesson.id)
    ]);
    setReview(reviewData);
    setComments(commentsData);
    setLoading(false);
  };

  const handleSubmitForReview = async () => {
    if (!user) return;
    const success = await submitForReview(lesson.id, user.id);
    if (success) {
      toast({ title: 'Submitted for Review', description: 'Your lesson has been submitted for review.' });
      await notifyStatusChange(lesson.id, lesson.title, 'submitted', [], user.id, user.name);
      loadReviewData();
      onStatusChange?.('pending');
    }
  };

  const handleStatusUpdate = async (newStatus: ReviewStatus) => {
    if (!user) return;
    const success = await updateReviewStatus(lesson.id, newStatus, user.id);
    if (success) {
      const statusMessages: Record<string, string> = {
        in_review: 'Lesson is now in review', changes_requested: 'Changes requested',
        approved: 'Lesson approved', published: 'Lesson published to schools', rejected: 'Lesson rejected'
      };
      toast({ title: statusMessages[newStatus] || 'Status updated' });
      if (review?.submitted_by) {
        await notifyStatusChange(lesson.id, lesson.title, newStatus as any, [review.submitted_by], user.id, user.name);
      }
      loadReviewData();
      onStatusChange?.(newStatus);
    }
  };

  const handleAddComment = async (comment: string, type: CommentType, slideIndex?: number) => {
    if (!user || !review) return;
    const result = await addReviewComment(lesson.id, review.id, user.id, user.name, user.role, comment, type, slideIndex);
    if (result) {
      toast({ title: 'Comment added' });
      if (review.submitted_by && review.submitted_by !== user.id) {
        await notifyStatusChange(lesson.id, lesson.title, 'comment_added', [review.submitted_by], user.id, user.name);
      }
      loadReviewData();
    }
  };

  const handleResolveComment = async (commentId: string) => {
    if (!user) return;
    const success = await resolveComment(commentId, user.id);
    if (success) { toast({ title: 'Comment resolved' }); loadReviewData(); }
  };

  if (loading) return <div className="p-4 text-center text-gray-500">Loading review data...</div>;

  const status = review?.status || 'draft';

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Content Review</CardTitle>
          <ReviewStatusBadge status={status} size="lg" />
        </div>
        <ReviewProgress status={status} />
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="status">Status & Actions</TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> Comments ({comments.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="status" className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {canSubmit && <Button onClick={handleSubmitForReview} className="col-span-2"><Send className="w-4 h-4 mr-2" /> Submit for Review</Button>}
              {canReview && <Button onClick={() => handleStatusUpdate('in_review')} variant="outline"><History className="w-4 h-4 mr-2" /> Start Review</Button>}
              {canApprove && (
                <>
                  <Button onClick={() => handleStatusUpdate('approved')} className="bg-green-600 hover:bg-green-700"><CheckCircle className="w-4 h-4 mr-2" /> Approve</Button>
                  <Button onClick={() => handleStatusUpdate('changes_requested')} variant="outline" className="border-orange-500 text-orange-600"><RotateCcw className="w-4 h-4 mr-2" /> Request Changes</Button>
                  <Button onClick={() => handleStatusUpdate('rejected')} variant="destructive"><XCircle className="w-4 h-4 mr-2" /> Reject</Button>
                </>
              )}
              {canPublish && <Button onClick={() => handleStatusUpdate('published')} className="col-span-2 bg-purple-600 hover:bg-purple-700"><Globe className="w-4 h-4 mr-2" /> Publish to Schools</Button>}
            </div>
            {review && (
              <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
                {review.submitted_at && <p>Submitted: {new Date(review.submitted_at).toLocaleDateString()}</p>}
                {review.approved_at && <p>Approved: {new Date(review.approved_at).toLocaleDateString()}</p>}
                {review.published_at && <p>Published: {new Date(review.published_at).toLocaleDateString()}</p>}
              </div>
            )}
          </TabsContent>
          <TabsContent value="comments">
            <ReviewCommentsPanel comments={comments} onAddComment={handleAddComment} onResolveComment={handleResolveComment} canResolve={isAuthor} canComment={true} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
