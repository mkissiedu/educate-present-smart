export type TeacherAttendanceStatus = 'present' | 'absent' | 'late' | 'on_leave' | 'sick';

export interface TeacherAttendanceRecord {
  id: string;
  teacher_id: string;
  date: string;
  status: TeacherAttendanceStatus;
  check_in_time?: string;
  check_out_time?: string;
  notes?: string;
  recorded_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TeacherWithAttendance {
  id: string;
  name: string;
  email: string;
  phone?: string;
  assignedClasses: string[];
  status?: TeacherAttendanceStatus;
  check_in_time?: string;
}

export interface SchoolSettings {
  id: string;
  school_name: string;
  school_logo?: string;
  school_address?: string;
  school_phone?: string;
  school_email?: string;
  school_motto?: string;
  academic_year?: string;
}

export interface ParentMessage {
  id: string;
  student_id: string;
  student_name: string;
  parent_phone: string;
  message: string;
  sent_at: string;
  sent_by: string;
  message_type: 'report_card' | 'attendance' | 'general' | 'fee_reminder';
}

export interface AdminStats {
  totalTeachers: number;
  totalStudents: number;
  presentTeachersToday: number;
  pendingReportCards: number;
  classesCount: number;
}
