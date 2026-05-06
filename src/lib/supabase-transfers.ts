import { supabase } from './supabase';

export type TransferStatus = 'pending' | 'approved' | 'rejected';

export interface StudentTransfer {
  id: string;
  student_id: string;
  from_school_id: string;
  to_school_id: string;
  requested_by: string;
  student_name: string;
  student_class: string;
  reason?: string;
  status: TransferStatus;
  reviewed_by?: string;
  review_notes?: string;
  created_at: string;
  updated_at: string;
}

export async function createTransferRequest(payload: {
  student_id: string;
  from_school_id: string;
  to_school_id: string;
  requested_by: string;
  student_name: string;
  student_class: string;
  reason?: string;
}): Promise<boolean> {
  const now = new Date().toISOString();
  const { error } = await supabase.from('student_transfers').insert({
    ...payload,
    status: 'pending',
    created_at: now,
    updated_at: now,
  });
  if (error) {
    console.error('[Transfers] createTransferRequest error:', error);
    return false;
  }
  return true;
}

export async function fetchTransferRequests(schoolId?: string): Promise<StudentTransfer[]> {
  let query = supabase
    .from('student_transfers')
    .select('*')
    .order('created_at', { ascending: false });

  if (schoolId) {
    // Try to scope to either side of the transfer (origin or destination school).
    // PostgREST `.or()` accepts a comma-separated filter string.
    query = query.or(`from_school_id.eq.${schoolId},to_school_id.eq.${schoolId}`);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[Transfers] fetchTransferRequests error:', error);
    return [];
  }
  return (data || []) as StudentTransfer[];
}

export async function fetchPendingTransfersForSchool(schoolId: string): Promise<StudentTransfer[]> {
  const { data, error } = await supabase
    .from('student_transfers')
    .select('*')
    .eq('to_school_id', schoolId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Transfers] fetchPendingTransfersForSchool error:', error);
    return [];
  }
  return (data || []) as StudentTransfer[];
}

export async function fetchTransfersByStudent(studentId: string): Promise<StudentTransfer[]> {
  const { data, error } = await supabase
    .from('student_transfers')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Transfers] fetchTransfersByStudent error:', error);
    return [];
  }
  return (data || []) as StudentTransfer[];
}

export async function approveTransfer(
  id: string,
  reviewerId: string,
  notes?: string
): Promise<boolean> {
  const { error } = await supabase
    .from('student_transfers')
    .update({
      status: 'approved',
      reviewed_by: reviewerId,
      review_notes: notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('[Transfers] approveTransfer error:', error);
    return false;
  }
  return true;
}

export async function rejectTransfer(
  id: string,
  reviewerId: string,
  notes?: string
): Promise<boolean> {
  const { error } = await supabase
    .from('student_transfers')
    .update({
      status: 'rejected',
      reviewed_by: reviewerId,
      review_notes: notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('[Transfers] rejectTransfer error:', error);
    return false;
  }
  return true;
}

/**
 * After a transfer is approved, move the student record to the new school.
 * Updates the students table school_id and clears any teacher_id assignment.
 */
export async function applyApprovedTransfer(transfer: StudentTransfer): Promise<boolean> {
  const { error } = await supabase
    .from('students')
    .update({
      school_id: transfer.to_school_id,
      teacher_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', transfer.student_id);

  if (error) {
    console.error('[Transfers] applyApprovedTransfer error:', error);
    return false;
  }
  return true;
}
