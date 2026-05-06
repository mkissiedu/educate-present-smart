export type NotificationType = 'absence' | 'late' | 'consecutive_absence' | 'custom' | 'weekly_summary';
export type NotificationChannel = 'whatsapp' | 'sms';
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'delivered';

export interface NotificationSettings {
  id: string;
  teacher_id: string;
  class_level: string;
  notify_on_absence: boolean;
  notify_on_late: boolean;
  consecutive_absence_threshold: number;
  weekly_summary_enabled: boolean;
  preferred_channel: NotificationChannel;
  message_templates: MessageTemplates;
  created_at?: string;
  updated_at?: string;
}

export interface MessageTemplates {
  absence: string;
  late: string;
  consecutive_absence: string;
  weekly_summary: string;
}

export interface NotificationLog {
  id: string;
  student_id: string;
  guardian_phone: string;
  guardian_name: string;
  notification_type: NotificationType;
  channel: NotificationChannel;
  message: string;
  status: NotificationStatus;
  error_message?: string;
  sent_at: string;
  teacher_id: string;
  class_level: string;
}

export interface ParentContact {
  name: string;
  phone: string;
  relationship: 'guardian1' | 'guardian2';
}

export const DEFAULT_TEMPLATES: MessageTemplates = {
  absence: "Dear {guardian_name}, this is to inform you that {student_name} was marked absent from {class_level} on {date}. Please contact the school if you have any questions.",
  late: "Dear {guardian_name}, {student_name} arrived late to {class_level} on {date}. Please ensure timely arrival.",
  consecutive_absence: "Dear {guardian_name}, {student_name} has been absent for {days} consecutive days. Please contact the school urgently.",
  weekly_summary: "Dear {guardian_name}, here is {student_name}'s attendance summary for the week: Present: {present}, Absent: {absent}, Late: {late}."
};
