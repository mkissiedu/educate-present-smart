import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ReviewComment, CommentType } from '@/types/review';
import { MessageSquare, CheckCircle, AlertTriangle, Lightbulb, ThumbsUp, XCircle, Check } from 'lucide-react';
import { format } from 'date-fns';

interface ReviewCommentsPanelProps {
  comments: ReviewComment[];
  onAddComment: (comment: string, type: CommentType, slideIndex?: number) => void;
  onResolveComment: (commentId: string) => void;
  currentSlideIndex?: number;
  canResolve?: boolean;
  canComment?: boolean;
}

const typeConfig: Record<CommentType, { icon: React.ReactNode; color: string; label: string }> = {
  general: { icon: <MessageSquare className="w-3 h-3" />, color: 'bg-gray-100 text-gray-700', label: 'General' },
  suggestion: { icon: <Lightbulb className="w-3 h-3" />, color: 'bg-blue-100 text-blue-700', label: 'Suggestion' },
  required_change: { icon: <AlertTriangle className="w-3 h-3" />, color: 'bg-orange-100 text-orange-700', label: 'Required' },
  approval: { icon: <ThumbsUp className="w-3 h-3" />, color: 'bg-green-100 text-green-700', label: 'Approval' },
  rejection: { icon: <XCircle className="w-3 h-3" />, color: 'bg-red-100 text-red-700', label: 'Rejection' }
};

export function ReviewCommentsPanel({ comments, onAddComment, onResolveComment, currentSlideIndex, canResolve = false, canComment = true }: ReviewCommentsPanelProps) {
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<CommentType>('general');
  const [attachToSlide, setAttachToSlide] = useState(false);

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment, commentType, attachToSlide ? currentSlideIndex : undefined);
    setNewComment('');
    setCommentType('general');
    setAttachToSlide(false);
  };

  const unresolvedCount = comments.filter(c => !c.resolved).length;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Review Comments
          </span>
          {unresolvedCount > 0 && <Badge variant="destructive" className="text-xs">{unresolvedCount} unresolved</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3 overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-2">
          {comments.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No comments yet</p>
          ) : comments.map(comment => (
            <div key={comment.id} className={`p-2 rounded-lg border ${comment.resolved ? 'bg-gray-50 opacity-60' : 'bg-white'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`${typeConfig[comment.comment_type].color} text-xs`}>
                      {typeConfig[comment.comment_type].icon}
                      <span className="ml-1">{typeConfig[comment.comment_type].label}</span>
                    </Badge>
                    {comment.slide_index !== undefined && <Badge variant="outline" className="text-xs">Slide {comment.slide_index + 1}</Badge>}
                  </div>
                  <p className="text-sm">{comment.comment}</p>
                  <p className="text-xs text-gray-500 mt-1">{comment.author_name} • {format(new Date(comment.created_at), 'MMM d, h:mm a')}</p>
                </div>
                {!comment.resolved && canResolve && (
                  <Button size="sm" variant="ghost" onClick={() => onResolveComment(comment.id)} className="h-6 w-6 p-0">
                    <Check className="w-3 h-3" />
                  </Button>
                )}
                {comment.resolved && <CheckCircle className="w-4 h-4 text-green-500" />}
              </div>
            </div>
          ))}
        </div>
        {canComment && (
          <div className="border-t pt-3 space-y-2">
            <div className="flex gap-2">
              <Select value={commentType} onValueChange={(v) => setCommentType(v as CommentType)}>
                <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(typeConfig).map(([key, cfg]) => (
                    <SelectItem key={key} value={key} className="text-xs">{cfg.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentSlideIndex !== undefined && (
                <Button size="sm" variant={attachToSlide ? 'default' : 'outline'} onClick={() => setAttachToSlide(!attachToSlide)} className="text-xs h-8">
                  Slide {currentSlideIndex + 1}
                </Button>
              )}
            </div>
            <Textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." className="text-sm min-h-[60px]" />
            <Button size="sm" onClick={handleSubmit} disabled={!newComment.trim()} className="w-full">Add Comment</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
