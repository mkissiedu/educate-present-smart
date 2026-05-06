import { supabase } from './supabase';
import type { PaymentPlan, PlanInstallment, CreatePlanInput, PlanComplianceReport } from '@/types/payment-plan';

export async function createPaymentPlan(input: CreatePlanInput): Promise<PaymentPlan> {
  const { data: plan, error } = await supabase.from('payment_plans').insert({
    school_id: input.school_id, student_id: input.student_id, class_id: input.class_id,
    bill_id: input.bill_id, plan_name: input.plan_name, plan_type: input.plan_type,
    total_amount: input.total_amount, number_of_installments: input.installments.length,
    start_date: input.installments[0]?.due_date,
    end_date: input.installments[input.installments.length - 1]?.due_date,
    notes: input.notes, created_by: input.created_by, status: 'active'
  }).select().single();
  if (error) throw error;

  const installmentData = input.installments.map((inst, idx) => ({
    plan_id: plan.id, installment_number: idx + 1, amount: inst.amount,
    due_date: inst.due_date, amount_paid: 0, status: 'pending'
  }));

  const { error: instError } = await supabase.from('payment_plan_installments').insert(installmentData);
  if (instError) throw instError;
  return plan;
}

export async function getPaymentPlans(schoolId: string): Promise<PaymentPlan[]> {
  const { data, error } = await supabase.from('payment_plans').select('*').eq('school_id', schoolId).order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getStudentPaymentPlans(studentId: string): Promise<PaymentPlan[]> {
  const { data, error } = await supabase.from('payment_plans').select('*').eq('student_id', studentId).order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getPlanInstallments(planId: string): Promise<PlanInstallment[]> {
  const { data, error } = await supabase.from('payment_plan_installments').select('*').eq('plan_id', planId).order('installment_number');
  if (error) throw error;
  return data || [];
}

export async function recordInstallmentPayment(installmentId: string, amount: number): Promise<PlanInstallment> {
  const { data: inst } = await supabase.from('payment_plan_installments').select('*').eq('id', installmentId).single();
  if (!inst) throw new Error('Installment not found');

  const newPaid = (inst.amount_paid || 0) + amount;
  const status = newPaid >= inst.amount ? 'paid' : newPaid > 0 ? 'partial' : 'pending';

  const { data, error } = await supabase.from('payment_plan_installments').update({
    amount_paid: newPaid, status, payment_date: new Date().toISOString(), updated_at: new Date().toISOString()
  }).eq('id', installmentId).select().single();
  if (error) throw error;

  await checkPlanCompletion(inst.plan_id);
  return data;
}

async function checkPlanCompletion(planId: string) {
  const { data: installments } = await supabase.from('payment_plan_installments').select('status').eq('plan_id', planId);
  if (installments?.every(i => i.status === 'paid')) {
    await supabase.from('payment_plans').update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', planId);
  }
}

export async function cancelPlan(planId: string): Promise<void> {
  await supabase.from('payment_plans').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', planId);
}

export async function getComplianceReport(schoolId: string): Promise<PlanComplianceReport> {
  const { data: plans } = await supabase.from('payment_plans').select('*').eq('school_id', schoolId);
  const { data: installments } = await supabase.from('payment_plan_installments').select('*, payment_plans!inner(school_id)').eq('payment_plans.school_id', schoolId);

  const today = new Date().toISOString().split('T')[0];
  const overdue = installments?.filter(i => i.due_date < today && i.status !== 'paid').length || 0;
  const upcoming = installments?.filter(i => i.due_date >= today && i.status !== 'paid').length || 0;
  const totalExpected = plans?.reduce((s, p) => s + p.total_amount, 0) || 0;
  const totalCollected = installments?.reduce((s, i) => s + (i.amount_paid || 0), 0) || 0;

  const classCounts = new Map<string, { count: number; amount: number }>();
  plans?.forEach(p => {
    const cls = p.class_id || 'Individual';
    const curr = classCounts.get(cls) || { count: 0, amount: 0 };
    classCounts.set(cls, { count: curr.count + 1, amount: curr.amount + p.total_amount });
  });

  return {
    total_plans: plans?.length || 0,
    active_plans: plans?.filter(p => p.status === 'active').length || 0,
    completed_plans: plans?.filter(p => p.status === 'completed').length || 0,
    defaulted_plans: plans?.filter(p => p.status === 'defaulted').length || 0,
    total_expected: totalExpected,
    total_collected: totalCollected,
    collection_rate: totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0,
    overdue_installments: overdue,
    upcoming_installments: upcoming,
    plans_by_class: Array.from(classCounts.entries()).map(([name, data]) => ({ class_name: name, ...data }))
  };
}

export async function sendInstallmentReminders(schoolId: string, daysBeforeDue: number = 3) {
  return await supabase.functions.invoke('send-installment-reminder', { body: { schoolId, daysBeforeDue } });
}
