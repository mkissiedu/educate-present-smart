import { supabase } from './supabase';
import { ContentNotification, NotificationType } from '@/types/review';

export async function fetchUserNotifications(userId: string, unreadOnly = false): Promise<ContentNotification[]> {
  let query = supabase.from('content_notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (unreadOnly) query = query.eq('read', false);
  const { data, error } = await query;
  if (error) { console.error('Error fetching notifications:', error); return []; }
  return data || [];
}

export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase.from('content_notifications').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('read', false);
  if (error) { console.error('Error counting notifications:', error); return 0; }
  return count || 0;
}

export async function createNotification(
  userId: string, lessonId: string, lessonTitle: string, type: NotificationType,
  message: string, fromUserId?: string, fromUserName?: string
): Promise<boolean> {
  const { error } = await supabase.from('content_notifications').insert({
    user_id: userId, lesson_id: lessonId, lesson_title: lessonTitle,
    notification_type: type, message, from_user_id: fromUserId, from_user_name: fromUserName
  });
  if (error) { console.error('Error creating notification:', error); return false; }
  return true;
}

export async function markAsRead(notificationId: string): Promise<boolean> {
  const { error } = await supabase.from('content_notifications').update({ read: true, read_at: new Date().toISOString() }).eq('id', notificationId);
  if (error) { console.error('Error marking as read:', error); return false; }
  return true;
}

export async function markAllAsRead(userId: string): Promise<boolean> {
  const { error } = await supabase.from('content_notifications').update({ read: true, read_at: new Date().toISOString() }).eq('user_id', userId).eq('read', false);
  if (error) { console.error('Error marking all as read:', error); return false; }
  return true;
}

export async function deleteNotification(notificationId: string): Promise<boolean> {
  const { error } = await supabase.from('content_notifications').delete().eq('id', notificationId);
  if (error) { console.error('Error deleting notification:', error); return false; }
  return true;
}

export async function fetchNotificationLogs(classLevel: string): Promise<any[]> {
  const { data, error } = await supabase.from('content_notifications').select('*').order('created_at', { ascending: false }).limit(50);
  if (error) { console.error('Error fetching notification logs:', error); return []; }
  return data || [];
}

export async function notifyStatusChange(
  lessonId: string, lessonTitle: string, type: NotificationType,
  recipientIds: string[], fromUserId: string, fromUserName: string
): Promise<void> {
  const messages: Record<NotificationType, string> = {
    submitted: `"${lessonTitle}" has been submitted for review`,
    in_review: `"${lessonTitle}" is now being reviewed`,
    changes_requested: `Changes requested for "${lessonTitle}"`,
    approved: `"${lessonTitle}" has been approved`,
    published: `"${lessonTitle}" has been published to schools`,
    rejected: `"${lessonTitle}" has been rejected`,
    comment_added: `New comment on "${lessonTitle}"`,
    assigned_review: `You've been assigned to review "${lessonTitle}"`
  };
  
  for (const userId of recipientIds) {
    await createNotification(userId, lessonId, lessonTitle, type, messages[type], fromUserId, fromUserName);
  }
}

export async function fetchNotificationSettings(schoolId: string): Promise<any | null> {
  const { data, error } = await supabase.from('notification_settings').select('*').eq('school_id', schoolId).single();
  if (error && error.code !== 'PGRST116') console.error('Error fetching settings:', error);
  return data;
}

export async function saveNotificationSettings(schoolId: string, settings: any): Promise<boolean> {
  const { error } = await supabase.from('notification_settings').upsert({ school_id: schoolId, ...settings, updated_at: new Date().toISOString() });
  if (error) { console.error('Error saving settings:', error); return false; }
  return true;
}
