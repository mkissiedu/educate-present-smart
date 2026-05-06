import React from 'react';
import { AttendanceStatus } from '@/types/attendance';
import { Check, X, Clock, FileText } from 'lucide-react';

interface Props {
  status: AttendanceStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const statusConfig: Record<AttendanceStatus, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
  present: { bg: 'bg-green-500', text: 'text-green-500', icon: <Check className="w-3 h-3" />, label: 'Present' },
  absent: { bg: 'bg-red-500', text: 'text-red-500', icon: <X className="w-3 h-3" />, label: 'Absent' },
  late: { bg: 'bg-yellow-500', text: 'text-yellow-500', icon: <Clock className="w-3 h-3" />, label: 'Late' },
  excused: { bg: 'bg-blue-500', text: 'text-blue-500', icon: <FileText className="w-3 h-3" />, label: 'Excused' },
};

export const AttendanceStatusBadge: React.FC<Props> = ({ status, size = 'md', showLabel = false }) => {
  const config = statusConfig[status];
  const sizeClasses = {
    sm: 'w-5 h-5 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-8 h-8 text-base',
  };

  if (showLabel) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} text-white`}>
        {config.icon}
        {config.label}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center justify-center rounded-full ${config.bg} text-white ${sizeClasses[size]}`}>
      {config.icon}
    </span>
  );
};
