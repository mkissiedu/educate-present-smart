import { supabase } from './supabase';
import type { FeePayment, FeeAccount, StudentBill, StatementEntry, StudentFeeStatement } from '@/types/billing';

export async function recordPayment(payment: Omit<FeePayment, 'id' | 'payment_date'>): Promise<FeePayment> {
  const receipt_number = `RCP-${Date.now().toString(36).toUpperCase()}`;
  const { data, error } = await supabase
    .from('fee_payments')
    .insert({ ...payment, receipt_number })
    .select()
    .single();
  if (error) throw error;
  
  if (payment.payment_status === 'success') {
    await updateBillPayment(payment.bill_id, payment.amount);
    await updateFeeAccount(payment.student_id, payment.amount);
  }
  return data;
}

export async function updateBillPayment(billId: string, amount: number): Promise<void> {
  const { data: bill } = await supabase.from('student_bills').select('*').eq('id', billId).single();
  if (!bill) return;
  
  const newAmountPaid = (bill.amount_paid || 0) + amount;
  const newBalance = bill.total_amount - newAmountPaid;
  const status = newBalance <= 0 ? 'paid' : newBalance < bill.total_amount ? 'partial' : 'pending';
  
  await supabase.from('student_bills').update({
    amount_paid: newAmountPaid,
    balance: Math.max(0, newBalance),
    status,
    updated_at: new Date().toISOString()
  }).eq('id', billId);
}

export async function updateFeeAccount(studentId: string, amount: number): Promise<void> {
  const { data: account } = await supabase.from('fee_accounts').select('*').eq('student_id', studentId).single();
  
  if (account) {
    await supabase.from('fee_accounts').update({
      total_paid: (account.total_paid || 0) + amount,
      current_balance: (account.current_balance || 0) - amount,
      last_payment_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).eq('student_id', studentId);
  }
}

export async function getOrCreateFeeAccount(studentId: string, schoolId: string): Promise<FeeAccount> {
  const { data: existing } = await supabase.from('fee_accounts').select('*').eq('student_id', studentId).single();
  if (existing) return existing;
  
  const { data, error } = await supabase.from('fee_accounts').insert({
    student_id: studentId, school_id: schoolId, total_billed: 0, total_paid: 0, current_balance: 0
  }).select().single();
  if (error) throw error;
  return data;
}

export async function getFeeAccount(studentId: string): Promise<FeeAccount | null> {
  const { data } = await supabase.from('fee_accounts').select('*').eq('student_id', studentId).single();
  return data;
}

export async function getStudentPayments(studentId: string): Promise<FeePayment[]> {
  const { data, error } = await supabase.from('fee_payments').select('*').eq('student_id', studentId).order('payment_date', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getBillPayments(billId: string): Promise<FeePayment[]> {
  const { data, error } = await supabase.from('fee_payments').select('*').eq('bill_id', billId).order('payment_date', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function markBillSentWhatsApp(billId: string): Promise<void> {
  await supabase.from('student_bills').update({
    sent_via_whatsapp: true,
    whatsapp_sent_at: new Date().toISOString()
  }).eq('id', billId);
}

export async function getStudentPreviousBalance(studentId: string, currentTerm: string): Promise<number> {
  const { data } = await supabase.from('student_bills').select('balance').eq('student_id', studentId).neq('term', currentTerm).order('created_at', { ascending: false }).limit(1).single();
  return data?.balance || 0;
}

export async function getStudentBillsForAccount(studentId: string): Promise<StudentBill[]> {
  const { data, error } = await supabase.from('student_bills').select('*').eq('student_id', studentId).order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}
