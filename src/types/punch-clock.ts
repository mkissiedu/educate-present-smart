export interface PunchClockRecord {
  id: string;
  teacher_id: string;
  school_id?: string;
  date: string;
  punch_in_time?: string;
  punch_out_time?: string;
  punch_in_latitude?: number;
  punch_in_longitude?: number;
  punch_out_latitude?: number;
  punch_out_longitude?: number;
  punch_in_photo_url?: string;
  punch_out_photo_url?: string;
  punch_in_verified?: boolean;
  punch_out_verified?: boolean;
  punch_in_distance_meters?: number;
  punch_out_distance_meters?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface SchoolGateLocation {
  latitude: number;
  longitude: number;
  radius_meters: number;
}

export interface PunchClockStatus {
  hasPunchedIn: boolean;
  hasPunchedOut: boolean;
  punchInTime?: string;
  punchOutTime?: string;
  punchInVerified?: boolean;
  punchOutVerified?: boolean;
}

export type PunchType = 'in' | 'out';

export interface SchoolAttendanceSettings {
  late_threshold_time: string; // Format: "HH:MM:SS" or "HH:MM"
  early_departure_time?: string; // Format: "HH:MM:SS" or "HH:MM"
  late_notification_enabled: boolean;
  admin_notification_phone?: string;
  admin_notification_email?: string;
}

export interface LateArrivalNotification {
  id: string;
  school_id: string;
  teacher_id: string;
  teacher_name: string;
  punch_in_time: string;
  late_threshold_time: string;
  minutes_late: number;
  notification_type: 'sms' | 'whatsapp' | 'email';
  notification_sent_at: string;
  notification_status: 'sent' | 'failed' | 'pending';
  recipient_phone?: string;
  recipient_email?: string;
  created_at: string;
}

export interface LateArrivalRecord {
  id: string;
  teacher_id: string;
  teacher_name: string;
  punch_in_time: string;
  minutes_late: number;
  punch_in_verified: boolean;
  punch_in_photo_url?: string;
  date: string;
}

export interface DailyLateArrivalReport {
  date: string;
  totalTeachers: number;
  lateArrivals: number;
  onTimeArrivals: number;
  absentTeachers: number;
  lateRecords: LateArrivalRecord[];
  averageMinutesLate: number;
}

// Monthly Attendance Report Types
export interface TeacherMonthlyAttendance {
  teacherId: string;
  teacherName: string;
  teacherEmail?: string;
  assignedClasses?: string[];
  
  // Attendance counts
  totalWorkingDays: number;
  daysPresent: number;
  daysAbsent: number;
  lateArrivals: number;
  earlyDepartures: number;
  
  // Time statistics
  averageArrivalTime: string;
  averageDepartureTime: string;
  averageWorkHours: string;
  totalWorkHours: number;
  
  // Percentages
  attendancePercentage: number;
  punctualityPercentage: number;
  
  // Verification stats
  verifiedPunchIns: number;
  verifiedPunchOuts: number;
  
  // Detailed records
  dailyRecords: DailyAttendanceRecord[];
}

export interface DailyAttendanceRecord {
  date: string;
  dayOfWeek: string;
  punchInTime?: string;
  punchOutTime?: string;
  isLate: boolean;
  minutesLate: number;
  isEarlyDeparture: boolean;
  minutesEarly: number;
  workHours: number;
  punchInVerified: boolean;
  punchOutVerified: boolean;
  status: 'present' | 'absent' | 'late' | 'early_departure' | 'incomplete';
}

export interface MonthlyAttendanceReport {
  schoolId: string;
  schoolName: string;
  month: number;
  year: number;
  reportGeneratedAt: string;
  
  // School settings
  lateThresholdTime: string;
  earlyDepartureTime: string;
  
  // Summary statistics
  totalTeachers: number;
  totalWorkingDays: number;
  averageAttendanceRate: number;
  averagePunctualityRate: number;
  totalLateArrivals: number;
  totalEarlyDepartures: number;
  totalAbsences: number;
  
  // Teacher reports
  teacherReports: TeacherMonthlyAttendance[];
  
  // Top performers
  topAttendance: { teacherId: string; teacherName: string; percentage: number }[];
  topPunctuality: { teacherId: string; teacherName: string; percentage: number }[];
  
  // Needs improvement
  frequentLateArrivals: { teacherId: string; teacherName: string; count: number }[];
  frequentAbsences: { teacherId: string; teacherName: string; count: number }[];
}

export interface AttendanceReportFilters {
  month: number;
  year: number;
  teacherId?: string;
  includeWeekends?: boolean;
  customWorkingDays?: string[]; // Array of dates that are working days
  excludedDates?: string[]; // Holidays, etc.
}


// Leave Management Types
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveType {
  id: string;
  school_id?: string;
  name: string;
  description?: string;
  days_allowed: number;
  requires_documentation: boolean;
  is_paid: boolean;
  color: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LeaveRequest {
  id: string;
  school_id: string;
  teacher_id: string;
  teacher_name: string;
  leave_type_id?: string;
  leave_type_name: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason?: string;
  documentation_url?: string;
  status: LeaveStatus;
  reviewed_by?: string;
  reviewed_by_name?: string;
  reviewed_at?: string;
  review_notes?: string;
  created_at?: string;
  updated_at?: string;
  // Joined data
  leave_type?: LeaveType;
}

export interface LeaveBalance {
  id: string;
  school_id: string;
  teacher_id: string;
  leave_type_id: string;
  year: number;
  total_days: number;
  used_days: number;
  remaining_days: number;
  created_at?: string;
  updated_at?: string;
  // Joined data
  leave_type?: LeaveType;
}

export interface TeacherLeaveBalance {
  leaveType: LeaveType;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  pendingDays: number;
}

export interface LeaveRequestFormData {
  leave_type_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  documentation_url?: string;
}

export interface LeaveCalendarDay {
  date: string;
  isOnLeave: boolean;
  leaveType?: string;
  leaveColor?: string;
  leaveStatus?: LeaveStatus;
}

export interface TeamLeaveCalendar {
  month: number;
  year: number;
  teachers: {
    teacherId: string;
    teacherName: string;
    leaveDays: LeaveCalendarDay[];
  }[];
}
