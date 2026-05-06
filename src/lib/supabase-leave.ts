import { supabase } from './supabase';
import type { 
  LeaveType, 
  LeaveRequest, 
  LeaveBalance, 
  TeacherLeaveBalance,
  LeaveStatus,
  LeaveRequestFormData 
} from '@/types/punch-clock';

// ==================== Leave Types ====================

export async function getLeaveTypes(schoolId: string): Promise<LeaveType[]> {
  // First try to get school-specific leave types
  const { data: schoolTypes, error: schoolError } = await supabase
    .from('leave_types')
    .select('*')
    .eq('school_id', schoolId)
    .eq('is_active', true)
    .order('name');

  if (schoolError) {
    console.error('Error fetching school leave types:', schoolError);
  }

  // If school has custom types, return those
  if (schoolTypes && schoolTypes.length > 0) {
    return schoolTypes;
  }

  // Otherwise, get default types (school_id is null)
  const { data: defaultTypes, error: defaultError } = await supabase
    .from('leave_types')
    .select('*')
    .is('school_id', null)
    .eq('is_active', true)
    .order('name');

  if (defaultError) {
    console.error('Error fetching default leave types:', defaultError);
    return [];
  }

  return defaultTypes || [];
}

export async function createLeaveType(leaveType: Partial<LeaveType>): Promise<LeaveType | null> {
  const { data, error } = await supabase
    .from('leave_types')
    .insert(leaveType)
    .select()
    .single();

  if (error) {
    console.error('Error creating leave type:', error);
    return null;
  }

  return data;
}

export async function updateLeaveType(id: string, updates: Partial<LeaveType>): Promise<LeaveType | null> {
  const { data, error } = await supabase
    .from('leave_types')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating leave type:', error);
    return null;
  }

  return data;
}

// ==================== Leave Requests ====================

export async function getLeaveRequests(
  schoolId: string, 
  filters?: { 
    teacherId?: string; 
    status?: LeaveStatus; 
    startDate?: string; 
    endDate?: string;
  }
): Promise<LeaveRequest[]> {
  let query = supabase
    .from('leave_requests')
    .select('*')
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false });

  if (filters?.teacherId) {
    query = query.eq('teacher_id', filters.teacherId);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.startDate) {
    query = query.gte('start_date', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('end_date', filters.endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching leave requests:', error);
    return [];
  }

  return data || [];
}

export async function getTeacherLeaveRequests(
  schoolId: string,
  teacherId: string,
  year?: number
): Promise<LeaveRequest[]> {
  let query = supabase
    .from('leave_requests')
    .select('*')
    .eq('school_id', schoolId)
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });

  if (year) {
    const startOfYear = `${year}-01-01`;
    const endOfYear = `${year}-12-31`;
    query = query.gte('start_date', startOfYear).lte('start_date', endOfYear);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching teacher leave requests:', error);
    return [];
  }

  return data || [];
}

export async function getPendingLeaveRequests(schoolId: string): Promise<LeaveRequest[]> {
  const { data, error } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('school_id', schoolId)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching pending leave requests:', error);
    return [];
  }

  return data || [];
}

export async function createLeaveRequest(
  schoolId: string,
  teacherId: string,
  teacherName: string,
  formData: LeaveRequestFormData,
  leaveTypeName: string
): Promise<LeaveRequest | null> {
  // Calculate total days (excluding weekends)
  const startDate = new Date(formData.start_date);
  const endDate = new Date(formData.end_date);
  let totalDays = 0;
  
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      totalDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const { data, error } = await supabase
    .from('leave_requests')
    .insert({
      school_id: schoolId,
      teacher_id: teacherId,
      teacher_name: teacherName,
      leave_type_id: formData.leave_type_id,
      leave_type_name: leaveTypeName,
      start_date: formData.start_date,
      end_date: formData.end_date,
      total_days: totalDays,
      reason: formData.reason,
      documentation_url: formData.documentation_url,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating leave request:', error);
    return null;
  }

  return data;
}

export async function updateLeaveRequestStatus(
  requestId: string,
  status: LeaveStatus,
  reviewerId: string,
  reviewerName: string,
  reviewNotes?: string
): Promise<LeaveRequest | null> {
  const { data, error } = await supabase
    .from('leave_requests')
    .update({
      status,
      reviewed_by: reviewerId,
      reviewed_by_name: reviewerName,
      reviewed_at: new Date().toISOString(),
      review_notes: reviewNotes,
      updated_at: new Date().toISOString()
    })
    .eq('id', requestId)
    .select()
    .single();

  if (error) {
    console.error('Error updating leave request status:', error);
    return null;
  }

  // If approved, update leave balance
  if (status === 'approved' && data) {
    await updateLeaveBalanceOnApproval(data);
  }

  return data;
}

export async function cancelLeaveRequest(requestId: string): Promise<boolean> {
  const { error } = await supabase
    .from('leave_requests')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('id', requestId);

  if (error) {
    console.error('Error cancelling leave request:', error);
    return false;
  }

  return true;
}

// ==================== Leave Balances ====================

export async function getTeacherLeaveBalances(
  schoolId: string,
  teacherId: string,
  year: number
): Promise<TeacherLeaveBalance[]> {
  // Get all leave types for the school
  const leaveTypes = await getLeaveTypes(schoolId);
  
  // Get existing balances
  const { data: balances, error } = await supabase
    .from('leave_balances')
    .select('*')
    .eq('school_id', schoolId)
    .eq('teacher_id', teacherId)
    .eq('year', year);

  if (error) {
    console.error('Error fetching leave balances:', error);
  }

  // Get pending leave requests to calculate pending days
  const { data: pendingRequests } = await supabase
    .from('leave_requests')
    .select('leave_type_id, total_days')
    .eq('school_id', schoolId)
    .eq('teacher_id', teacherId)
    .eq('status', 'pending')
    .gte('start_date', `${year}-01-01`)
    .lte('start_date', `${year}-12-31`);

  // Build balance map
  const balanceMap = new Map<string, { used: number; pending: number }>();
  
  balances?.forEach(b => {
    balanceMap.set(b.leave_type_id, { used: b.used_days, pending: 0 });
  });

  pendingRequests?.forEach(r => {
    if (r.leave_type_id) {
      const existing = balanceMap.get(r.leave_type_id) || { used: 0, pending: 0 };
      existing.pending += r.total_days;
      balanceMap.set(r.leave_type_id, existing);
    }
  });

  // Build result
  return leaveTypes.map(lt => {
    const balance = balanceMap.get(lt.id) || { used: 0, pending: 0 };
    return {
      leaveType: lt,
      totalDays: lt.days_allowed,
      usedDays: balance.used,
      remainingDays: lt.days_allowed - balance.used,
      pendingDays: balance.pending
    };
  });
}

export async function initializeLeaveBalance(
  schoolId: string,
  teacherId: string,
  leaveTypeId: string,
  year: number,
  totalDays: number
): Promise<LeaveBalance | null> {
  const { data, error } = await supabase
    .from('leave_balances')
    .upsert({
      school_id: schoolId,
      teacher_id: teacherId,
      leave_type_id: leaveTypeId,
      year,
      total_days: totalDays,
      used_days: 0
    }, {
      onConflict: 'school_id,teacher_id,leave_type_id,year'
    })
    .select()
    .single();

  if (error) {
    console.error('Error initializing leave balance:', error);
    return null;
  }

  return data;
}

async function updateLeaveBalanceOnApproval(request: LeaveRequest): Promise<void> {
  if (!request.leave_type_id) return;

  const year = new Date(request.start_date).getFullYear();

  // Try to update existing balance
  const { data: existing } = await supabase
    .from('leave_balances')
    .select('*')
    .eq('school_id', request.school_id)
    .eq('teacher_id', request.teacher_id)
    .eq('leave_type_id', request.leave_type_id)
    .eq('year', year)
    .single();

  if (existing) {
    await supabase
      .from('leave_balances')
      .update({
        used_days: existing.used_days + request.total_days,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id);
  } else {
    // Create new balance record
    const leaveTypes = await getLeaveTypes(request.school_id);
    const leaveType = leaveTypes.find(lt => lt.id === request.leave_type_id);
    
    await supabase
      .from('leave_balances')
      .insert({
        school_id: request.school_id,
        teacher_id: request.teacher_id,
        leave_type_id: request.leave_type_id,
        year,
        total_days: leaveType?.days_allowed || 0,
        used_days: request.total_days
      });
  }
}

// ==================== Leave Calendar Integration ====================

export async function getApprovedLeavesForDate(
  schoolId: string,
  date: string
): Promise<LeaveRequest[]> {
  const { data, error } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('school_id', schoolId)
    .eq('status', 'approved')
    .lte('start_date', date)
    .gte('end_date', date);

  if (error) {
    console.error('Error fetching approved leaves for date:', error);
    return [];
  }

  return data || [];
}

export async function isTeacherOnLeave(
  schoolId: string,
  teacherId: string,
  date: string
): Promise<{ onLeave: boolean; leaveType?: string; leaveColor?: string }> {
  const { data, error } = await supabase
    .from('leave_requests')
    .select('*, leave_types(*)')
    .eq('school_id', schoolId)
    .eq('teacher_id', teacherId)
    .eq('status', 'approved')
    .lte('start_date', date)
    .gte('end_date', date)
    .single();

  if (error || !data) {
    return { onLeave: false };
  }

  return {
    onLeave: true,
    leaveType: data.leave_type_name,
    leaveColor: (data.leave_types as any)?.color || '#6B7280'
  };
}

export async function getTeamLeaveCalendar(
  schoolId: string,
  month: number,
  year: number
): Promise<{ teacherId: string; teacherName: string; leaves: LeaveRequest[] }[]> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('school_id', schoolId)
    .in('status', ['approved', 'pending'])
    .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);

  if (error) {
    console.error('Error fetching team leave calendar:', error);
    return [];
  }

  // Group by teacher
  const teacherMap = new Map<string, { teacherId: string; teacherName: string; leaves: LeaveRequest[] }>();
  
  data?.forEach(leave => {
    if (!teacherMap.has(leave.teacher_id)) {
      teacherMap.set(leave.teacher_id, {
        teacherId: leave.teacher_id,
        teacherName: leave.teacher_name,
        leaves: []
      });
    }
    teacherMap.get(leave.teacher_id)!.leaves.push(leave);
  });

  return Array.from(teacherMap.values());
}

// ==================== Statistics ====================

export async function getLeaveStatistics(
  schoolId: string,
  year: number
): Promise<{
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalDaysApproved: number;
  byLeaveType: { type: string; count: number; days: number }[];
}> {
  const { data, error } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('school_id', schoolId)
    .gte('start_date', `${year}-01-01`)
    .lte('start_date', `${year}-12-31`);

  if (error) {
    console.error('Error fetching leave statistics:', error);
    return {
      totalRequests: 0,
      pendingRequests: 0,
      approvedRequests: 0,
      rejectedRequests: 0,
      totalDaysApproved: 0,
      byLeaveType: []
    };
  }

  const requests = data || [];
  const byTypeMap = new Map<string, { count: number; days: number }>();

  requests.forEach(r => {
    if (!byTypeMap.has(r.leave_type_name)) {
      byTypeMap.set(r.leave_type_name, { count: 0, days: 0 });
    }
    const entry = byTypeMap.get(r.leave_type_name)!;
    entry.count++;
    if (r.status === 'approved') {
      entry.days += r.total_days;
    }
  });

  return {
    totalRequests: requests.length,
    pendingRequests: requests.filter(r => r.status === 'pending').length,
    approvedRequests: requests.filter(r => r.status === 'approved').length,
    rejectedRequests: requests.filter(r => r.status === 'rejected').length,
    totalDaysApproved: requests.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.total_days, 0),
    byLeaveType: Array.from(byTypeMap.entries()).map(([type, data]) => ({
      type,
      count: data.count,
      days: data.days
    }))
  };
}
