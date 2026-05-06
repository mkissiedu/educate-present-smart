import { supabase } from './supabase';
import { AttendanceRecord, AttendanceStatus } from '../types/attendance';

export async function fetchAttendanceByDate(classLevel: string, date: string) {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('class_level', classLevel)
    .eq('date', date);
  if (error) throw error;
  return data as AttendanceRecord[];
}

export async function fetchAttendanceByDateRange(classLevel: string, startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('class_level', classLevel)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });
  if (error) throw error;
  return data as AttendanceRecord[];
}

export async function fetchStudentAttendance(studentId: string, startDate?: string, endDate?: string) {
  let query = supabase.from('attendance').select('*').eq('student_id', studentId);
  if (startDate) query = query.gte('date', startDate);
  if (endDate) query = query.lte('date', endDate);
  const { data, error } = await query.order('date', { ascending: false });
  if (error) throw error;
  return data as AttendanceRecord[];
}

export async function saveAttendance(record: Omit<AttendanceRecord, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('attendance')
    .upsert([{ ...record, updated_at: new Date().toISOString() }], { onConflict: 'student_id,date' })
    .select()
    .single();
  if (error) throw error;
  return data as AttendanceRecord;
}

export async function bulkSaveAttendance(records: Omit<AttendanceRecord, 'id' | 'created_at' | 'updated_at'>[]) {
  const { data, error } = await supabase
    .from('attendance')
    .upsert(records.map(r => ({ ...r, updated_at: new Date().toISOString() })), { onConflict: 'student_id,date' })
    .select();
  if (error) throw error;
  return data as AttendanceRecord[];
}

export async function deleteAttendance(id: string) {
  const { error } = await supabase.from('attendance').delete().eq('id', id);
  if (error) throw error;
}
