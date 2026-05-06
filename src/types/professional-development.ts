// Professional Development Types

export interface PDCourse {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  created_by: string;
  creator_type: 'super_teacher' | 'admin';
  school_id?: string;
  target_type: 'all' | 'selected_schools' | 'selected_teachers' | 'school_teachers';
  target_school_ids: string[];
  target_teacher_ids: string[];
  category?: string;
  duration_hours?: number;
  is_published: boolean;
  is_mandatory: boolean;
  due_date?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  creator_name?: string;
  modules?: PDCourseModule[];
  enrollment?: PDCourseEnrollment;
  enrolled_count?: number;
  completed_count?: number;
}

export interface PDCourseModule {
  id: string;
  course_id: string;
  title: string;
  content_type: 'video' | 'document' | 'quiz' | 'text' | 'link';
  content_url?: string;
  content_text?: string;
  duration_minutes?: number;
  order_index: number;
  is_required: boolean;
  created_at: string;
}

export interface PDCourseEnrollment {
  id: string;
  course_id: string;
  teacher_id: string;
  school_id?: string;
  status: 'enrolled' | 'in_progress' | 'completed';
  progress_percent: number;
  completed_modules: string[];
  started_at?: string;
  completed_at?: string;
  certificate_url?: string;
  created_at: string;
}

export interface PDWebinar {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  created_by: string;
  creator_type: 'super_teacher' | 'admin';
  school_id?: string;
  target_type: 'all' | 'selected_schools' | 'selected_teachers' | 'school_teachers';
  target_school_ids: string[];
  target_teacher_ids: string[];
  meeting_type: 'webinar' | 'meeting' | 'workshop';
  scheduled_at: string;
  duration_minutes: number;
  meeting_url?: string;
  meeting_room_id?: string;
  meeting_password?: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  max_participants?: number;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  recording_url?: string;
  recording_uploaded_at?: string;
  recording_description?: string;
  recording_thumbnail_url?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  creator_name?: string;
  host_name?: string;
  attendee_count?: number;
  my_rsvp?: PDWebinarAttendee;
  my_recording_view?: PDRecordingView;
  view_count?: number;
}

export interface PDWebinarAttendee {
  id: string;
  webinar_id: string;
  teacher_id: string;
  school_id?: string;
  rsvp_status: 'pending' | 'attending' | 'declined' | 'maybe';
  joined_at?: string;
  left_at?: string;
  attendance_duration_minutes?: number;
  created_at: string;
  // Joined data
  teacher_name?: string;
  teacher_email?: string;
}

export interface PDRecordingView {
  id: string;
  webinar_id: string;
  teacher_id: string;
  school_id?: string;
  first_viewed_at: string;
  last_viewed_at: string;
  view_count: number;
  total_watch_time_seconds: number;
  completed: boolean;
  created_at: string;
  // Joined data
  teacher_name?: string;
  teacher_email?: string;
}



export interface PDCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const PD_CATEGORIES: PDCategory[] = [
  { id: 'pedagogy', name: 'Pedagogy & Teaching Methods', icon: 'BookOpen', color: 'blue' },
  { id: 'technology', name: 'Educational Technology', icon: 'Monitor', color: 'purple' },
  { id: 'curriculum', name: 'Curriculum & Standards', icon: 'FileText', color: 'green' },
  { id: 'assessment', name: 'Assessment & Evaluation', icon: 'ClipboardCheck', color: 'orange' },
  { id: 'classroom', name: 'Classroom Management', icon: 'Users', color: 'red' },
  { id: 'inclusion', name: 'Inclusion & Differentiation', icon: 'Heart', color: 'pink' },
  { id: 'leadership', name: 'Leadership & Mentoring', icon: 'Award', color: 'amber' },
  { id: 'wellness', name: 'Teacher Wellness', icon: 'Smile', color: 'teal' },
  { id: 'subject', name: 'Subject-Specific', icon: 'GraduationCap', color: 'indigo' },
  { id: 'compliance', name: 'Compliance & Policies', icon: 'Shield', color: 'slate' },
];

export interface JitsiMeetConfig {
  roomName: string;
  displayName: string;
  email?: string;
  subject?: string;
  password?: string;
  startWithAudioMuted?: boolean;
  startWithVideoMuted?: boolean;
}
