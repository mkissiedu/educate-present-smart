export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  id: string;
  student_id: string;
  class_level: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
  teacher_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StudentAttendance {
  student_id: string;
  student_name: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface AttendanceStats {
  total_days: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendance_rate: number;
}

export interface StudentAttendancePattern {
  student_id: string;
  student_name: string;
  stats: AttendanceStats;
  frequent_absence_days?: string[];
  streak_current: number;
  streak_longest: number;
}

export interface DailyAttendanceSummary {
  date: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
}
