export type ReviewStatus = 'draft' | 'pending' | 'in_review' | 'changes_requested' | 'approved' | 'published' | 'rejected';

export type CommentType = 'general' | 'suggestion' | 'required_change' | 'approval' | 'rejection';

export type NotificationType = 'submitted' | 'in_review' | 'changes_requested' | 'approved' | 'published' | 'rejected' | 'comment_added' | 'assigned_review';

export interface LessonReview {
  id: string;
  lesson_id: string;
  status: ReviewStatus;
  submitted_by?: string;
  submitted_at?: string;
  reviewer_id?: string;
  reviewed_at?: string;
  approved_by?: string;
  approved_at?: string;
  published_by?: string;
  published_at?: string;
  current_version: number;
  created_at: string;
  updated_at: string;
}

export interface ReviewComment {
  id: string;
  lesson_id: string;
  review_id: string;
  author_id: string;
  author_name: string;
  author_role: string;
  comment: string;
  comment_type: CommentType;
  slide_index?: number;
  resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LessonVersion {
  id: string;
  lesson_id: string;
  version_number: number;
  content: any;
  change_summary?: string;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
}

export interface ContentNotification {
  id: string;
  user_id: string;
  lesson_id: string;
  lesson_title?: string;
  notification_type: NotificationType;
  message: string;
  from_user_id?: string;
  from_user_name?: string;
  read: boolean;
  read_at?: string;
  created_at: string;
}

export const REVIEW_STATUS_CONFIG: Record<ReviewStatus, { label: string; color: string; bgColor: string }> = {
  draft: { label: 'Draft', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  pending: { label: 'Pending Review', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  in_review: { label: 'In Review', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  changes_requested: { label: 'Changes Requested', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  approved: { label: 'Approved', color: 'text-green-700', bgColor: 'bg-green-100' },
  published: { label: 'Published', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  rejected: { label: 'Rejected', color: 'text-red-700', bgColor: 'bg-red-100' }
};
