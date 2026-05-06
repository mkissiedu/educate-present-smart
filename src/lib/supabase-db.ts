import { supabase } from './supabase';
import { User, ClassLevel, UserRole } from '@/types/user';
import { Lesson } from '@/types/lesson';

// Demo users for fallback when database is unavailable
const DEMO_USERS: Record<string, User> = {
  'teacher@ananse.edu': { id: 'demo-teacher', name: 'Demo Teacher', email: 'teacher@ananse.edu', phone: '+233244222222', role: 'teacher', assignedClasses: ['KG 1', 'KG 2'] },
  'admin@ananse.edu': { id: 'demo-admin', name: 'School Admin', email: 'admin@ananse.edu', phone: '+233244000000', role: 'school_admin', assignedClasses: [] },
  'super@ananse.edu': { id: 'demo-super', name: 'Super Teacher', email: 'super@ananse.edu', phone: '+233244111111', role: 'super_teacher', assignedClasses: [] },
  'superadmin@catalyst.edu': { id: 'demo-superadmin', name: 'Super Admin', email: 'superadmin@catalyst.edu', phone: '+233240000000', role: 'super_admin', assignedClasses: [] },
};

const DEMO_PASSWORDS: Record<string, string> = {
  'teacher@ananse.edu': 'teacher123',
  'admin@ananse.edu': 'admin123',
  'super@ananse.edu': 'super123',
  'superadmin@catalyst.edu': 'superadmin123',
};

// User functions - supports login by email or phone
export const loginUser = async (identifier: string, password: string, role: UserRole): Promise<User | null> => {
  const isEmail = identifier.includes('@');
  const isPhone = /^\+?\d{10,15}$/.test(identifier.replace(/\s/g, ''));
  
  console.log('[Login] Attempting DB login:', { identifier, role, isEmail, isPhone });
  
  // Try database first
  try {
    let query = supabase.from('users').select('*').eq('password_hash', password).eq('role', role);
    
    if (isEmail) {
      query = query.eq('email', identifier.trim().toLowerCase());
    } else if (isPhone) {
      query = query.eq('phone', identifier.replace(/\s/g, ''));
    } else {
      query = query.eq('email', identifier.trim()); // Default to email
    }
    
    const { data, error } = await query.single();
    
    if (error) {
      console.log('[Login] DB query error:', error.message, error.code);
      
      // If no rows found, also try case-insensitive email match
      if (error.code === 'PGRST116' && isEmail) {
        console.log('[Login] No exact match, trying case-insensitive...');
        const { data: data2, error: error2 } = await supabase
          .from('users')
          .select('*')
          .eq('password_hash', password)
          .eq('role', role)
          .ilike('email', identifier.trim());
        
        if (!error2 && data2 && data2.length > 0) {
          const row = data2[0];
          console.log('[Login] Case-insensitive match found:', { id: row.id, name: row.name, role: row.role });
          return mapDbRowToUser(row);
        }
      }
    } else if (data) {
      console.log('[Login] DB match found:', { id: data.id, name: data.name, role: data.role });
      return mapDbRowToUser(data);
    }
  } catch (err: any) {
    console.error('[Login] DB query exception:', err.message);
  }
  
  // Fallback to demo users for offline/demo mode
  const demoUser = DEMO_USERS[identifier];
  const demoPassword = DEMO_PASSWORDS[identifier];
  if (demoUser && demoPassword === password && demoUser.role === role) {
    console.log('[Login] Using demo user fallback for:', identifier);
    return demoUser;
  }
  
  console.log('[Login] No match found for:', identifier, 'with role:', role);
  return null;
};

/**
 * Maps a raw database row to the frontend User type.
 * Handles both snake_case DB columns and potential missing fields.
 */
function mapDbRowToUser(data: any): User {
  return {
    id: data.id,
    name: data.name || data.email?.split('@')[0] || 'User',
    email: data.email,
    phone: data.phone || undefined,
    role: data.role as UserRole,
    assignedClasses: parseAssignedClasses(data.assigned_classes),
    avatar: data.avatar || undefined,
    school_id: data.school_id || undefined,
  };
}

/**
 * Safely parses assigned_classes which could be a JSON array, string, or null.
 */
function parseAssignedClasses(raw: any): ClassLevel[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as ClassLevel[];
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) as ClassLevel[]; } catch { return []; }
  }
  return [];
}

export const fetchAllTeachers = async (): Promise<User[]> => {
  const { data, error } = await supabase.from('users').select('*').eq('role', 'teacher');
  if (error || !data) {
    console.log('[Teachers] Fetch error:', error?.message);
    return [];
  }
  return data.map(u => mapDbRowToUser(u));
};

// Lesson functions
export const fetchLessons = async (): Promise<Lesson[]> => {
  const { data, error } = await supabase.from('lessons').select('*').order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map(mapDbToLesson);
};

export const createLesson = async (lesson: Omit<Lesson, 'id'>): Promise<Lesson | null> => {
  const { data, error } = await supabase.from('lessons').insert({
    title: lesson.title, subject: lesson.subject, class_level: lesson.class,
    week: lesson.week, lesson_number: lesson.lessonNumber, duration: lesson.duration,
    thumbnail_url: lesson.thumbnailUrl, slides: lesson.slides, is_favorite: lesson.isFavorite,
    scheduled_date: lesson.scheduledDate, scheduled_time: lesson.scheduledTime, curriculum_info: lesson.curriculumInfo
  }).select().single();
  if (error || !data) return null;
  return mapDbToLesson(data);
};

export const updateLesson = async (id: string, lesson: Partial<Lesson>): Promise<boolean> => {
  const updates: any = { updated_at: new Date().toISOString() };
  if (lesson.title) updates.title = lesson.title;
  if (lesson.subject) updates.subject = lesson.subject;
  if (lesson.class) updates.class_level = lesson.class;
  if (lesson.week !== undefined) updates.week = lesson.week;
  if (lesson.lessonNumber !== undefined) updates.lesson_number = lesson.lessonNumber;
  if (lesson.duration) updates.duration = lesson.duration;
  if (lesson.thumbnailUrl) updates.thumbnail_url = lesson.thumbnailUrl;
  if (lesson.slides) updates.slides = lesson.slides;
  if (lesson.isFavorite !== undefined) updates.is_favorite = lesson.isFavorite;
  if (lesson.scheduledDate !== undefined) updates.scheduled_date = lesson.scheduledDate;
  if (lesson.scheduledTime !== undefined) updates.scheduled_time = lesson.scheduledTime;
  if (lesson.curriculumInfo !== undefined) updates.curriculum_info = lesson.curriculumInfo;
  const { error } = await supabase.from('lessons').update(updates).eq('id', id);
  return !error;
};

export const deleteLesson = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('lessons').delete().eq('id', id);
  return !error;
};

export const deleteAllLessons = async (): Promise<{ success: boolean; count: number }> => {
  const { count, error: countError } = await supabase.from('lessons').select('*', { count: 'exact', head: true });
  if (countError) return { success: false, count: 0 };
  const { error } = await supabase.from('lessons').delete().neq('id', '');
  return { success: !error, count: count || 0 };
};

const mapDbToLesson = (data: any): Lesson => ({
  id: data.id, title: data.title, subject: data.subject, class: data.class_level,
  week: data.week || 1, lessonNumber: data.lesson_number || 1, duration: data.duration,
  thumbnailUrl: data.thumbnail_url, slides: data.slides || [], lastPresented: data.last_presented,
  isFavorite: data.is_favorite, scheduledDate: data.scheduled_date, scheduledTime: data.scheduled_time,
  curriculumInfo: data.curriculum_info
});
