export interface BankPaymentSubmission {
  id: string;
  school_id: string;
  student_id?: string;
  bill_id?: string;
  bill_code?: string;
  student_name?: string;
  parent_phone?: string;
  amount_claimed: number;
  bank_name?: string;
  transaction_reference?: string;
  deposit_date?: string;
  receipt_image_url?: string;
  submission_source: 'portal' | 'whatsapp';
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminNotification {
  id: string;
  school_id: string;
  notification_type: string;
  title: string;
  message?: string;
  reference_id?: string;
  reference_type?: string;
  is_read: boolean;
  created_at: string;
}

export interface BankPaymentVerificationAction {
  submissionId: string;
  action: 'approve' | 'reject';
  adminNotes?: string;
  rejectionReason?: string;
  verifiedAmount?: number;
}
