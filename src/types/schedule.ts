export interface ClassPeriod {
  id: string;
  school_id?: string;
  period_number: number;
  name: string;
  start_time: string;
  end_time: string;
  is_break: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SchoolClass {
  id: string;
  school_id?: string;
  name: string;
  grade_level: string;
  section?: string;
  capacity: number;
  room_number?: string;
  class_teacher_id?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ScheduleEntry {
  id: string;
  school_id?: string;
  class_id: string;
  teacher_id?: string;
  subject: string;
  day_of_week: number; // 1-5 (Monday-Friday)
  period_id: string;
  room_number?: string;
  notes?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  // Joined data
  class_name?: string;
  teacher_name?: string;
  period_name?: string;
  period_start?: string;
  period_end?: string;
}

export interface ScheduleConflict {
  type: 'teacher' | 'room' | 'class';
  message: string;
  entry1: ScheduleEntry;
  entry2: ScheduleEntry;
}

export const DAYS_OF_WEEK = [
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
];

export const SUBJECTS = [
  'English Language', 'Mathematics', 'Science', 'Social Studies',
  'Religious & Moral Education', 'Creative Arts', 'Physical Education',
  'Computing', 'French', 'Ghanaian Language', 'History', 'Geography',
  'Our World Our People', 'Career Technology'
];
