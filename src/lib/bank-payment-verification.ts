import { supabase } from './supabase';
import type { BankPaymentSubmission, AdminNotification } from '@/types/bank-payment';

export async function getBankPaymentSubmissions(schoolId: string): Promise<BankPaymentSubmission[]> {
  const { data, error } = await supabase
    .from('bank_payment_submissions')
    .select('*')
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getPendingSubmissions(schoolId: string): Promise<BankPaymentSubmission[]> {
  const { data, error } = await supabase
    .from('bank_payment_submissions')
    .select('*')
    .eq('school_id', schoolId)
    .in('status', ['pending', 'under_review'])
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function updateSubmissionStatus(
  id: string, 
  status: string, 
  adminId: string, 
  notes?: string, 
  rejectionReason?: string
): Promise<BankPaymentSubmission> {
  const { data, error } = await supabase
    .from('bank_payment_submissions')
    .update({
      status,
      admin_notes: notes,
      rejection_reason: rejectionReason,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getAdminNotifications(schoolId: string, unreadOnly = false): Promise<AdminNotification[]> {
  let query = supabase.from('admin_notifications').select('*').eq('school_id', schoolId);
  if (unreadOnly) query = query.eq('is_read', false);
  const { data, error } = await query.order('created_at', { ascending: false }).limit(50);
  if (error) throw error;
  return data || [];
}

export async function markNotificationRead(id: string): Promise<void> {
  await supabase.from('admin_notifications').update({ is_read: true }).eq('id', id);
}

export async function uploadReceiptImage(file: File, schoolId: string): Promise<string> {
  const fileName = `${schoolId}/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from('payment-receipts').upload(fileName, file);
  if (error) throw error;
  const { data } = supabase.storage.from('payment-receipts').getPublicUrl(fileName);
  return data.publicUrl;
}
