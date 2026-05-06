export interface School {
  id: string;
  name: string;
  code: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  email?: string;
  motto?: string;
  academic_year?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  // Punch clock settings
  gate_latitude?: number;
  gate_longitude?: number;
  attendance_radius_meters?: number;
  late_threshold_time?: string;
  early_departure_time?: string;
  work_start_time?: string;
  work_end_time?: string;
  late_notification_enabled?: boolean;
  admin_notification_phone?: string;
  admin_notification_email?: string;
  notify_on_absence?: boolean;
  notify_on_early_departure?: boolean;
}


export interface PublishedContent {
  id: string;
  content_type: 'lesson' | 'question' | 'template';
  content_id: string;
  title: string;
  subject?: string;
  class_level?: string;
  published_by?: string;
  publish_mode: 'all' | 'selected';
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  selected_schools?: string[];
}

export interface ContentSchoolAccess {
  id: string;
  content_id: string;
  school_id: string;
  granted_at?: string;
}

export interface PublishContentPayload {
  content_type: 'lesson' | 'question' | 'template';
  content_id: string;
  title: string;
  subject?: string;
  class_level?: string;
  publish_mode: 'all' | 'selected';
  selected_schools?: string[];
}
