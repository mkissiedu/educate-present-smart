export interface ReminderTemplate {
  id: string;
  school_id: string;
  template_name: string;
  template_type: 'before_due' | 'on_due' | 'overdue';
  days_offset: number;
  channel: 'whatsapp' | 'sms' | 'both';
  message_template: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReminderSchedule {
  id: string;
  school_id: string;
  schedule_name: string;
  is_active: boolean;
  reminder_days: number[];
  overdue_repeat_days: number;
  max_overdue_reminders: number;
  created_at: string;
  updated_at: string;
}

export interface ReminderLog {
  id: string;
  school_id: string;
  bill_id: string;
  student_id: string;
  template_id?: string;
  reminder_type: string;
  channel: string;
  recipient_phone?: string;
  message_sent?: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  error_message?: string;
  sent_at: string;
  delivered_at?: string;
  student_name?: string;
  bill_code?: string;
}

export interface ReminderStats {
  total_sent: number;
  delivered: number;
  failed: number;
  pending: number;
  by_type: Record<string, number>;
}

export const DEFAULT_TEMPLATES: Omit<ReminderTemplate, 'id' | 'school_id' | 'created_at' | 'updated_at'>[] = [
  {
    template_name: '7 Days Before Due',
    template_type: 'before_due',
    days_offset: -7,
    channel: 'whatsapp',
    message_template: 'Dear Parent,\n\nThis is a friendly reminder that the school fees for {{student_name}} ({{class_name}}) is due in 7 days.\n\nAmount Due: GH₵{{balance}}\nDue Date: {{due_date}}\nBill Code: {{bill_code}}\n\nPlease make payment before the due date.\n\nThank you.',
    is_active: true
  },
  {
    template_name: '3 Days Before Due',
    template_type: 'before_due',
    days_offset: -3,
    channel: 'whatsapp',
    message_template: 'Dear Parent,\n\nReminder: School fees for {{student_name}} is due in 3 days.\n\nBalance: GH₵{{balance}}\nDue Date: {{due_date}}\n\nKindly make payment to avoid late fees.\n\nThank you.',
    is_active: true
  },
  {
    template_name: '1 Day Before Due',
    template_type: 'before_due',
    days_offset: -1,
    channel: 'both',
    message_template: 'URGENT: School fees for {{student_name}} is due TOMORROW.\n\nBalance: GH₵{{balance}}\nBill: {{bill_code}}\n\nPlease pay today.',
    is_active: true
  },
  {
    template_name: 'Overdue Notice',
    template_type: 'overdue',
    days_offset: 1,
    channel: 'both',
    message_template: 'Dear Parent,\n\nThe school fees for {{student_name}} is now OVERDUE.\n\nOutstanding: GH₵{{balance}}\nDays Overdue: {{days_overdue}}\n\nPlease make payment immediately to avoid service interruption.\n\nContact us if you need a payment plan.',
    is_active: true
  }
];
