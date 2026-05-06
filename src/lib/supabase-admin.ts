import { supabase } from './supabase';
import { User, UserRole, ClassLevel } from '@/types/user';
import { TeacherAttendanceRecord, TeacherAttendanceStatus } from '@/types/admin';
import { School } from '@/types/school';
import { callEdgeFunction, normalizeUser } from './edge-functions';

export interface CreateUserResult {
  user: User | null;
  error: string | null;
}

export async function createUser(userData: {
  name: string; email: string; phone?: string; password: string;
  role: UserRole; assignedClasses?: ClassLevel[]; school_id?: string; created_by?: string;
}): Promise<CreateUserResult> {
  try {
    console.log('[Admin] createUser called:', { ...userData, password: '***' });
    
    const { data, error } = await callEdgeFunction('create-user', {
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      role: userData.role,
      assignedClasses: userData.assignedClasses || [],
      school_id: userData.school_id,
      created_by: userData.created_by,
    });
    
    if (error) {
      console.error('[Admin] createUser error:', error);
      return { user: null, error };
    }
    
    if (data?.user) {
      const normalized = normalizeUser(data.user);
      console.log('[Admin] createUser success:', normalized);
      return { user: normalized, error: null };
    }
    
    return { user: null, error: 'Unknown error creating user' };
  } catch (err: any) {
    console.error('[Admin] createUser exception:', err);
    return { user: null, error: err.message || 'Failed to create user' };
  }
}

// Legacy function for backwards compatibility
export async function createTeacher(teacher: {
  name: string; email: string; phone?: string; password: string;
  role: UserRole; assignedClasses: ClassLevel[]; school_id?: string; created_by?: string;
}): Promise<User | null> {
  const result = await createUser(teacher);
  return result.user;
}

export async function fetchAllUsers(schoolId?: string): Promise<User[]> {
  let query = supabase.from('users').select('*').order('name');
  if (schoolId) query = query.eq('school_id', schoolId);
  const { data, error } = await query;
  if (error || !data) return [];
  return data.map(u => {
    const normalized = normalizeUser(u);
    return normalized || { id: u.id, name: u.name, email: u.email, role: u.role, assignedClasses: [] };
  });
}

export async function fetchUsersByRole(role: UserRole): Promise<User[]> {
  const { data, error } = await supabase.from('users').select('*').eq('role', role).order('name');
  if (error || !data) return [];
  return data.map(u => {
    const normalized = normalizeUser(u);
    return normalized || { id: u.id, name: u.name, email: u.email, role: u.role, assignedClasses: [] };
  });
}

export async function updateUser(id: string, updates: Partial<User & { password?: string }>): Promise<boolean> {
  const dbUpdates: any = { updated_at: new Date().toISOString() };
  if (updates.name) dbUpdates.name = updates.name;
  if (updates.email) dbUpdates.email = updates.email;
  if (updates.phone) dbUpdates.phone = updates.phone;
  if (updates.role) dbUpdates.role = updates.role;
  if (updates.assignedClasses) dbUpdates.assigned_classes = updates.assignedClasses;
  if (updates.password) dbUpdates.password_hash = updates.password;
  if (updates.school_id) dbUpdates.school_id = updates.school_id;
  const { error } = await supabase.from('users').update(dbUpdates).eq('id', id);
  return !error;
}

export async function deleteUser(id: string): Promise<boolean> {
  const { error } = await supabase.from('users').delete().eq('id', id);
  return !error;
}

export async function createSchoolWithAdmin(school: Partial<School>, admin: {
  name: string; email: string; phone?: string; password: string;
}, createdBy?: string): Promise<{ school: School | null; admin: User | null; error?: string }> {
  try {
    const { data, error } = await callEdgeFunction('create-school', {
      school, admin, createdBy
    });
    
    if (error) {
      return { school: null, admin: null, error };
    }
    
    return { school: data?.school || null, admin: data?.admin || null };
  } catch (err: any) {
    return { school: null, admin: null, error: err.message };
  }
}

export async function fetchTeacherAttendance(date: string, schoolId?: string): Promise<TeacherAttendanceRecord[]> {
  const { data, error } = await supabase.from('teacher_attendance').select('*').eq('date', date);
  if (error) return [];
  return data as TeacherAttendanceRecord[];
}

export async function saveTeacherAttendance(record: Omit<TeacherAttendanceRecord, 'id' | 'created_at' | 'updated_at'>): Promise<TeacherAttendanceRecord | null> {
  const { data, error } = await supabase.from('teacher_attendance')
    .upsert([{ ...record, updated_at: new Date().toISOString() }], { onConflict: 'teacher_id,date' })
    .select().single();
  if (error) return null;
  return data as TeacherAttendanceRecord;
}

export async function bulkSaveTeacherAttendance(records: Omit<TeacherAttendanceRecord, 'id' | 'created_at' | 'updated_at'>[]): Promise<boolean> {
  if (records.length === 0) return true;
  const { error } = await supabase.from('teacher_attendance')
    .upsert(records.map(r => ({ ...r, updated_at: new Date().toISOString() })), { onConflict: 'teacher_id,date' });
  return !error;
}

export async function getTeacherAttendanceStats(teacherId: string, startDate: string, endDate: string) {
  const { data, error } = await supabase.from('teacher_attendance')
    .select('*').eq('teacher_id', teacherId).gte('date', startDate).lte('date', endDate);
  if (error || !data) return { present: 0, absent: 0, late: 0, on_leave: 0, sick: 0 };
  return data.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; },
    { present: 0, absent: 0, late: 0, on_leave: 0, sick: 0 } as Record<TeacherAttendanceStatus, number>);
}

export async function ensureAdminExists(): Promise<void> {
  // This is handled by the edge function now
  console.log('[Admin] Admin users should be created via the Super Admin dashboard');
}
