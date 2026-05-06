import { supabase } from './supabase';
import type { ReminderTemplate, ReminderSchedule, ReminderLog, ReminderStats } from '@/types/reminder';

export async function getReminderTemplates(schoolId: string): Promise<ReminderTemplate[]> {
  const { data, error } = await supabase
    .from('bill_reminder_templates')
    .select('*')
    .eq('school_id', schoolId)
    .order('days_offset', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createReminderTemplate(template: Omit<ReminderTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<ReminderTemplate> {
  const { data, error } = await supabase
    .from('bill_reminder_templates')
    .insert(template)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateReminderTemplate(id: string, updates: Partial<ReminderTemplate>): Promise<void> {
  const { error } = await supabase
    .from('bill_reminder_templates')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteReminderTemplate(id: string): Promise<void> {
  const { error } = await supabase.from('bill_reminder_templates').delete().eq('id', id);
  if (error) throw error;
}

export async function getReminderSchedule(schoolId: string): Promise<ReminderSchedule | null> {
  const { data, error } = await supabase
    .from('bill_reminder_schedules')
    .select('*')
    .eq('school_id', schoolId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function saveReminderSchedule(schedule: Omit<ReminderSchedule, 'id' | 'created_at' | 'updated_at'>): Promise<ReminderSchedule> {
  const existing = await getReminderSchedule(schedule.school_id);
  if (existing) {
    const { data, error } = await supabase
      .from('bill_reminder_schedules')
      .update({ ...schedule, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase
    .from('bill_reminder_schedules')
    .insert(schedule)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getReminderLogs(schoolId: string, filters?: { billId?: string; studentId?: string; limit?: number }): Promise<ReminderLog[]> {
  let query = supabase.from('bill_reminder_log').select('*').eq('school_id', schoolId);
  if (filters?.billId) query = query.eq('bill_id', filters.billId);
  if (filters?.studentId) query = query.eq('student_id', filters.studentId);
  query = query.order('sent_at', { ascending: false }).limit(filters?.limit || 100);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getReminderStats(schoolId: string): Promise<ReminderStats> {
  const { data, error } = await supabase.from('bill_reminder_log').select('status, reminder_type').eq('school_id', schoolId);
  if (error) throw error;
  const logs = data || [];
  const stats: ReminderStats = { total_sent: logs.length, delivered: 0, failed: 0, pending: 0, by_type: {} };
  logs.forEach(l => {
    if (l.status === 'delivered' || l.status === 'sent') stats.delivered++;
    else if (l.status === 'failed') stats.failed++;
    else stats.pending++;
    stats.by_type[l.reminder_type] = (stats.by_type[l.reminder_type] || 0) + 1;
  });
  return stats;
}

export async function checkReminderSent(billId: string, reminderType: string): Promise<boolean> {
  const { data } = await supabase
    .from('bill_reminder_log')
    .select('id')
    .eq('bill_id', billId)
    .eq('reminder_type', reminderType)
    .eq('status', 'sent')
    .single();
  return !!data;
}
