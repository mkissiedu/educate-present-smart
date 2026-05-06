export type PlanType = 'monthly' | 'termly' | 'custom';
export type PlanStatus = 'active' | 'completed' | 'cancelled' | 'defaulted';
export type InstallmentStatus = 'pending' | 'partial' | 'paid' | 'overdue';

export interface PaymentPlan {
  id: string;
  school_id: string;
  student_id?: string;
  student_name?: string;
  class_id?: string;
  class_name?: string;
  bill_id?: string;
  plan_name: string;
  plan_type: PlanType;
  total_amount: number;
  number_of_installments: number;
  start_date: string;
  end_date?: string;
  status: PlanStatus;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  installments?: PlanInstallment[];
  total_paid?: number;
  remaining_balance?: number;
}

export interface PlanInstallment {
  id: string;
  plan_id: string;
  installment_number: number;
  amount: number;
  due_date: string;
  amount_paid: number;
  payment_date?: string;
  status: InstallmentStatus;
  reminder_sent: boolean;
  reminder_sent_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PlanComplianceReport {
  total_plans: number;
  active_plans: number;
  completed_plans: number;
  defaulted_plans: number;
  total_expected: number;
  total_collected: number;
  collection_rate: number;
  overdue_installments: number;
  upcoming_installments: number;
  plans_by_class: { class_name: string; count: number; amount: number }[];
}

export interface CreatePlanInput {
  school_id: string;
  student_id?: string;
  class_id?: string;
  bill_id?: string;
  plan_name: string;
  plan_type: PlanType;
  total_amount: number;
  installments: { amount: number; due_date: string }[];
  notes?: string;
  created_by?: string;
}
