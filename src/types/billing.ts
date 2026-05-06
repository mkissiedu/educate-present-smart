export interface BillLineItem {
  id: string;
  name: string;
  amount: number;
  isOptional?: boolean;
}

export interface DiscountType {
  id: string;
  school_id: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  default_value: number;
}

export interface StudentDiscount {
  id: string;
  student_id: string;
  discount_type_id: string;
  discount_name?: string;
  discount_value: number;
  is_percentage: boolean;
  reason?: string;
}

export interface StudentBill {
  id: string;
  bill_code: string;
  school_id: string;
  student_id: string;
  student_name?: string;
  class_id?: string;
  class_name?: string;
  term: string;
  academic_year: string;
  line_items: BillLineItem[];
  subtotal: number;
  discounts: StudentDiscount[];
  total_discount: number;
  previous_balance: number;
  total_amount: number;
  amount_paid: number;
  balance: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  due_date?: string;
  sent_via_whatsapp: boolean;
  whatsapp_sent_at?: string;
  created_at: string;
}

export interface FeePayment {
  id: string;
  bill_id: string;
  student_id: string;
  amount: number;
  payment_method: 'momo' | 'card' | 'bank' | 'cash';
  transaction_id?: string;
  hubtel_reference?: string;
  payment_status: 'pending' | 'success' | 'failed';
  receipt_number?: string;
  receipt_sent: boolean;
  payment_date: string;
  notes?: string;
}

export interface FeeAccount {
  id: string;
  student_id: string;
  school_id: string;
  total_billed: number;
  total_paid: number;
  current_balance: number;
  last_payment_date?: string;
  last_bill_date?: string;
}

export interface StatementEntry {
  id: string;
  date: string;
  description: string;
  type: 'bill' | 'payment' | 'adjustment' | 'opening_balance';
  reference: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface StudentFeeStatement {
  student_id: string;
  student_name: string;
  class_name: string;
  school_name: string;
  account_number?: string;
  opening_balance: number;
  closing_balance: number;
  total_debits: number;
  total_credits: number;
  entries: StatementEntry[];
  generated_at: string;
  period_start?: string;
  period_end?: string;
}

export const DEFAULT_LINE_ITEMS: Omit<BillLineItem, 'id'>[] = [
  { name: 'Tuition Fee', amount: 0 },
  { name: 'Feeding Fee', amount: 0 },
  { name: 'Bus Fee', amount: 0, isOptional: true },
  { name: 'PTA Dues', amount: 0 },
  { name: 'Textbooks', amount: 0, isOptional: true },
  { name: 'Stationery', amount: 0, isOptional: true },
  { name: 'Uniforms', amount: 0, isOptional: true },
  { name: 'Friday Wear', amount: 0, isOptional: true },
  { name: 'Exams Fee', amount: 0 },
  { name: 'Excursion Fee', amount: 0, isOptional: true },
];

export const DEFAULT_DISCOUNT_TYPES = [
  { name: 'Siblings Discount', discount_type: 'percentage' as const, default_value: 10 },
  { name: 'Staff Ward Discount', discount_type: 'percentage' as const, default_value: 25 },
  { name: 'Scholarship', discount_type: 'percentage' as const, default_value: 50 },
  { name: 'Early Payment Discount', discount_type: 'percentage' as const, default_value: 5 },
];
