import { supabase } from './supabase';
import type { BillLineItem, StudentBill, DiscountType, StudentDiscount, FeePayment, FeeAccount } from '@/types/billing';

export async function getDiscountTypes(schoolId: string): Promise<DiscountType[]> {
  const { data, error } = await supabase
    .from('discount_types')
    .select('*')
    .eq('school_id', schoolId);
  if (error) throw error;
  return data || [];
}

export async function createDiscountType(discount: Omit<DiscountType, 'id'>): Promise<DiscountType> {
  const { data, error } = await supabase
    .from('discount_types')
    .insert(discount)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getStudentDiscounts(studentId: string): Promise<StudentDiscount[]> {
  const { data, error } = await supabase
    .from('student_discounts')
    .select('*, discount_types(name)')
    .eq('student_id', studentId);
  if (error) throw error;
  return (data || []).map(d => ({ ...d, discount_name: d.discount_types?.name }));
}

export async function applyStudentDiscount(discount: Omit<StudentDiscount, 'id' | 'discount_name'>): Promise<void> {
  const { error } = await supabase.from('student_discounts').insert(discount);
  if (error) throw error;
}

export async function removeStudentDiscount(discountId: string): Promise<void> {
  const { error } = await supabase.from('student_discounts').delete().eq('id', discountId);
  if (error) throw error;
}

export async function generateBillCode(): Promise<string> {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BL-${timestamp}-${random}`;
}

export async function createStudentBill(bill: Omit<StudentBill, 'id' | 'bill_code' | 'created_at'>): Promise<StudentBill> {
  const bill_code = await generateBillCode();
  const { data, error } = await supabase
    .from('student_bills')
    .insert({ ...bill, bill_code })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getStudentBills(schoolId: string, filters?: { term?: string; classId?: string }): Promise<StudentBill[]> {
  let query = supabase.from('student_bills').select('*').eq('school_id', schoolId);
  if (filters?.term) query = query.eq('term', filters.term);
  if (filters?.classId) query = query.eq('class_id', filters.classId);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getBillByCode(billCode: string): Promise<StudentBill | null> {
  const { data, error } = await supabase.from('student_bills').select('*').eq('bill_code', billCode).single();
  if (error) return null;
  return data;
}
