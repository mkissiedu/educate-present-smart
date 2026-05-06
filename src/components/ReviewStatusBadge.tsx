import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ReviewStatus, REVIEW_STATUS_CONFIG } from '@/types/review';
import { FileText, Clock, Eye, AlertCircle, CheckCircle, Globe, XCircle } from 'lucide-react';

interface ReviewStatusBadgeProps {
  status: ReviewStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const statusIcons: Record<ReviewStatus, React.ReactNode> = {
  draft: <FileText className="w-3 h-3" />,
  pending: <Clock className="w-3 h-3" />,
  in_review: <Eye className="w-3 h-3" />,
  changes_requested: <AlertCircle className="w-3 h-3" />,
  approved: <CheckCircle className="w-3 h-3" />,
  published: <Globe className="w-3 h-3" />,
  rejected: <XCircle className="w-3 h-3" />
};

export function ReviewStatusBadge({ status, showIcon = true, size = 'md' }: ReviewStatusBadgeProps) {
  const config = REVIEW_STATUS_CONFIG[status];
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  return (
    <Badge className={`${config.bgColor} ${config.color} ${sizeClasses[size]} font-medium border-0 inline-flex items-center gap-1`}>
      {showIcon && statusIcons[status]}
      {config.label}
    </Badge>
  );
}

interface ReviewProgressProps {
  status: ReviewStatus;
}

export function ReviewProgress({ status }: ReviewProgressProps) {
  const steps: ReviewStatus[] = ['draft', 'pending', 'in_review', 'approved', 'published'];
  const currentIndex = steps.indexOf(status);
  const isRejected = status === 'rejected';
  const isChangesRequested = status === 'changes_requested';

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = step === status || (isChangesRequested && step === 'in_review');
        const isPast = index <= currentIndex;

        return (
          <React.Fragment key={step}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors
              ${isComplete ? 'bg-green-500 text-white' : isCurrent ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}
              ${isRejected && step === 'in_review' ? 'bg-red-500 text-white' : ''}
              ${isChangesRequested && step === 'in_review' ? 'bg-orange-500 text-white' : ''}`}>
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 ${isPast && index < currentIndex ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
