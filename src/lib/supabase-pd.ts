// Professional Development Database Functions
import { supabase } from './supabase';
import { PDCourse, PDCourseModule, PDCourseEnrollment, PDWebinar, PDWebinarAttendee, PDRecordingView } from '@/types/professional-development';


// ============ COURSES ============

export async function getCourses(filters?: {
  creatorId?: string;
  creatorType?: 'super_teacher' | 'admin';
  schoolId?: string;
  isPublished?: boolean;
  category?: string;
}): Promise<PDCourse[]> {
  let query = supabase.from('pd_courses').select('*');
  
  if (filters?.creatorId) query = query.eq('created_by', filters.creatorId);
  if (filters?.creatorType) query = query.eq('creator_type', filters.creatorType);
  if (filters?.schoolId) query = query.eq('school_id', filters.schoolId);
  if (filters?.isPublished !== undefined) query = query.eq('is_published', filters.isPublished);
  if (filters?.category) query = query.eq('category', filters.category);
  
  query = query.order('created_at', { ascending: false });
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getAvailableCoursesForTeacher(teacherId: string, schoolId?: string): Promise<PDCourse[]> {
  try {
    const { data, error } = await supabase
      .from('pd_courses')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });
    if (error) { console.warn('getAvailableCoursesForTeacher:', error.message); return []; }
    return data || [];
  } catch (e: any) {
    console.warn('getAvailableCoursesForTeacher exception:', e?.message);
    return [];
  }
}


export async function getCourseById(courseId: string): Promise<PDCourse | null> {
  const { data, error } = await supabase
    .from('pd_courses')
    .select('*')
    .eq('id', courseId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createCourse(course: Omit<PDCourse, 'id' | 'created_at' | 'updated_at'>): Promise<PDCourse> {
  const { data, error } = await supabase
    .from('pd_courses')
    .insert(course)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateCourse(courseId: string, updates: Partial<PDCourse>): Promise<PDCourse> {
  const { data, error } = await supabase
    .from('pd_courses')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', courseId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteCourse(courseId: string): Promise<void> {
  const { error } = await supabase
    .from('pd_courses')
    .delete()
    .eq('id', courseId);
  
  if (error) throw error;
}

// ============ COURSE MODULES ============

export async function getCourseModules(courseId: string): Promise<PDCourseModule[]> {
  const { data, error } = await supabase
    .from('pd_course_modules')
    .select('*')
    .eq('course_id', courseId)
    .order('order_index', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function createCourseModule(module: Omit<PDCourseModule, 'id' | 'created_at'>): Promise<PDCourseModule> {
  const { data, error } = await supabase
    .from('pd_course_modules')
    .insert(module)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateCourseModule(moduleId: string, updates: Partial<PDCourseModule>): Promise<PDCourseModule> {
  const { data, error } = await supabase
    .from('pd_course_modules')
    .update(updates)
    .eq('id', moduleId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteCourseModule(moduleId: string): Promise<void> {
  const { error } = await supabase
    .from('pd_course_modules')
    .delete()
    .eq('id', moduleId);
  
  if (error) throw error;
}

// ============ ENROLLMENTS ============

export async function getEnrollment(courseId: string, teacherId: string): Promise<PDCourseEnrollment | null> {
  const { data, error } = await supabase
    .from('pd_course_enrollments')
    .select('*')
    .eq('course_id', courseId)
    .eq('teacher_id', teacherId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getTeacherEnrollments(teacherId: string): Promise<PDCourseEnrollment[]> {
  try {
    const { data, error } = await supabase
      .from('pd_course_enrollments')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });
    if (error) { console.warn('getTeacherEnrollments:', error.message); return []; }
    return data || [];
  } catch (e: any) {
    console.warn('getTeacherEnrollments exception:', e?.message);
    return [];
  }
}


export async function getCourseEnrollments(courseId: string): Promise<PDCourseEnrollment[]> {
  const { data, error } = await supabase
    .from('pd_course_enrollments')
    .select('*')
    .eq('course_id', courseId);
  
  if (error) throw error;
  return data || [];
}

export async function enrollInCourse(enrollment: Omit<PDCourseEnrollment, 'id' | 'created_at'>): Promise<PDCourseEnrollment> {
  const { data, error } = await supabase
    .from('pd_course_enrollments')
    .insert(enrollment)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateEnrollment(enrollmentId: string, updates: Partial<PDCourseEnrollment>): Promise<PDCourseEnrollment> {
  const { data, error } = await supabase
    .from('pd_course_enrollments')
    .update(updates)
    .eq('id', enrollmentId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ============ WEBINARS ============

export async function getWebinars(filters?: {
  creatorId?: string;
  creatorType?: 'super_teacher' | 'admin';
  schoolId?: string;
  status?: string;
  meetingType?: string;
  upcoming?: boolean;
}): Promise<PDWebinar[]> {
  let query = supabase.from('pd_webinars').select('*');
  
  if (filters?.creatorId) query = query.eq('created_by', filters.creatorId);
  if (filters?.creatorType) query = query.eq('creator_type', filters.creatorType);
  if (filters?.schoolId) query = query.eq('school_id', filters.schoolId);
  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.meetingType) query = query.eq('meeting_type', filters.meetingType);
  if (filters?.upcoming) query = query.gte('scheduled_at', new Date().toISOString());
  
  query = query.order('scheduled_at', { ascending: true });
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getAvailableWebinarsForTeacher(teacherId: string, schoolId?: string): Promise<PDWebinar[]> {
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('pd_webinars')
      .select('*')
      .neq('status', 'cancelled')
      .gte('scheduled_at', now)
      .order('scheduled_at', { ascending: true });
    if (error) { console.warn('getAvailableWebinarsForTeacher:', error.message); return []; }
    return data || [];
  } catch (e: any) {
    console.warn('getAvailableWebinarsForTeacher exception:', e?.message);
    return [];
  }
}


export async function getWebinarById(webinarId: string): Promise<PDWebinar | null> {
  const { data, error } = await supabase
    .from('pd_webinars')
    .select('*')
    .eq('id', webinarId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createWebinar(webinar: Omit<PDWebinar, 'id' | 'created_at' | 'updated_at'>): Promise<PDWebinar> {
  // Generate a unique room ID for Jitsi
  const roomId = `catalyst-${webinar.meeting_type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const { data, error } = await supabase
    .from('pd_webinars')
    .insert({
      ...webinar,
      meeting_room_id: roomId,
      meeting_url: `https://meet.jit.si/${roomId}`
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateWebinar(webinarId: string, updates: Partial<PDWebinar>): Promise<PDWebinar> {
  const { data, error } = await supabase
    .from('pd_webinars')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', webinarId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteWebinar(webinarId: string): Promise<void> {
  const { error } = await supabase
    .from('pd_webinars')
    .delete()
    .eq('id', webinarId);
  
  if (error) throw error;
}

// ============ WEBINAR ATTENDEES ============

export async function getWebinarAttendees(webinarId: string): Promise<PDWebinarAttendee[]> {
  const { data, error } = await supabase
    .from('pd_webinar_attendees')
    .select('*')
    .eq('webinar_id', webinarId);
  
  if (error) throw error;
  return data || [];
}

export async function getAttendeeRSVP(webinarId: string, teacherId: string): Promise<PDWebinarAttendee | null> {
  const { data, error } = await supabase
    .from('pd_webinar_attendees')
    .select('*')
    .eq('webinar_id', webinarId)
    .eq('teacher_id', teacherId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function rsvpToWebinar(attendee: Omit<PDWebinarAttendee, 'id' | 'created_at'>): Promise<PDWebinarAttendee> {
  const { data, error } = await supabase
    .from('pd_webinar_attendees')
    .upsert(attendee, { onConflict: 'webinar_id,teacher_id' })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateAttendeeStatus(attendeeId: string, updates: Partial<PDWebinarAttendee>): Promise<PDWebinarAttendee> {
  const { data, error } = await supabase
    .from('pd_webinar_attendees')
    .update(updates)
    .eq('id', attendeeId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function recordWebinarJoin(webinarId: string, teacherId: string): Promise<void> {
  const { error } = await supabase
    .from('pd_webinar_attendees')
    .update({ joined_at: new Date().toISOString() })
    .eq('webinar_id', webinarId)
    .eq('teacher_id', teacherId);
  
  if (error) throw error;
}

export async function recordWebinarLeave(webinarId: string, teacherId: string): Promise<void> {
  const attendee = await getAttendeeRSVP(webinarId, teacherId);
  if (attendee && attendee.joined_at) {
    const joinedAt = new Date(attendee.joined_at);
    const leftAt = new Date();
    const durationMinutes = Math.round((leftAt.getTime() - joinedAt.getTime()) / 60000);
    
    await supabase
      .from('pd_webinar_attendees')
      .update({ 
        left_at: leftAt.toISOString(),
        attendance_duration_minutes: durationMinutes
      })
      .eq('webinar_id', webinarId)
      .eq('teacher_id', teacherId);
  }
}

// ============ STATISTICS ============

export async function getTeacherPDStats(teacherId: string): Promise<{
  coursesEnrolled: number;
  coursesCompleted: number;
  totalHoursLearned: number;
  webinarsAttended: number;
  upcomingWebinars: number;
}> {
  const [enrollments, attendances, upcomingWebinars] = await Promise.all([
    getTeacherEnrollments(teacherId),
    supabase
      .from('pd_webinar_attendees')
      .select('attendance_duration_minutes')
      .eq('teacher_id', teacherId)
      .not('joined_at', 'is', null),
    getAvailableWebinarsForTeacher(teacherId)
  ]);
  
  const coursesCompleted = enrollments.filter(e => e.status === 'completed').length;
  const webinarMinutes = attendances.data?.reduce((sum, a) => sum + (a.attendance_duration_minutes || 0), 0) || 0;
  
  return {
    coursesEnrolled: enrollments.length,
    coursesCompleted,
    totalHoursLearned: Math.round(webinarMinutes / 60),
    webinarsAttended: attendances.data?.length || 0,
    upcomingWebinars: upcomingWebinars.length
  };
}


// ============ RECORDINGS ============
export async function getPastWebinarsWithRecordings(teacherId: string, schoolId?: string): Promise<PDWebinar[]> {
  try {
    const { data, error } = await supabase
      .from('pd_webinars')
      .select('*')
      .eq('status', 'ended')
      .not('recording_url', 'is', null)
      .order('scheduled_at', { ascending: false });
    if (error) { console.warn('getPastWebinarsWithRecordings:', error.message); return []; }
    return data || [];
  } catch (e: any) {
    console.warn('getPastWebinarsWithRecordings exception:', e?.message);
    return [];
  }
}


export async function getWebinarsWithRecordings(filters?: {
  creatorId?: string;
  creatorType?: 'super_teacher' | 'admin';
  schoolId?: string;
}): Promise<PDWebinar[]> {
  let query = supabase
    .from('pd_webinars')
    .select('*')
    .eq('status', 'ended')
    .not('recording_url', 'is', null);
  
  if (filters?.creatorId) query = query.eq('created_by', filters.creatorId);
  if (filters?.creatorType) query = query.eq('creator_type', filters.creatorType);
  if (filters?.schoolId) query = query.eq('school_id', filters.schoolId);
  
  query = query.order('scheduled_at', { ascending: false });
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function updateWebinarRecording(
  webinarId: string,
  recordingData: {
    recording_url: string;
    recording_description?: string;
    recording_thumbnail_url?: string;
  }
): Promise<PDWebinar> {
  const { data, error } = await supabase
    .from('pd_webinars')
    .update({
      ...recordingData,
      recording_uploaded_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', webinarId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function removeWebinarRecording(webinarId: string): Promise<PDWebinar> {
  const { data, error } = await supabase
    .from('pd_webinars')
    .update({
      recording_url: null,
      recording_description: null,
      recording_thumbnail_url: null,
      recording_uploaded_at: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', webinarId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ============ RECORDING VIEWS ============

export async function getRecordingView(webinarId: string, teacherId: string): Promise<PDRecordingView | null> {
  const { data, error } = await supabase
    .from('pd_recording_views')
    .select('*')
    .eq('webinar_id', webinarId)
    .eq('teacher_id', teacherId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getRecordingViews(webinarId: string): Promise<PDRecordingView[]> {
  const { data, error } = await supabase
    .from('pd_recording_views')
    .select('*')
    .eq('webinar_id', webinarId)
    .order('first_viewed_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function recordRecordingView(
  webinarId: string,
  teacherId: string,
  schoolId?: string,
  watchTimeSeconds?: number
): Promise<PDRecordingView> {
  // Check if view already exists
  const existingView = await getRecordingView(webinarId, teacherId);
  
  if (existingView) {
    // Update existing view
    const { data, error } = await supabase
      .from('pd_recording_views')
      .update({
        last_viewed_at: new Date().toISOString(),
        view_count: existingView.view_count + 1,
        total_watch_time_seconds: existingView.total_watch_time_seconds + (watchTimeSeconds || 0)
      })
      .eq('id', existingView.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } else {
    // Create new view
    const { data, error } = await supabase
      .from('pd_recording_views')
      .insert({
        webinar_id: webinarId,
        teacher_id: teacherId,
        school_id: schoolId,
        total_watch_time_seconds: watchTimeSeconds || 0
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

export async function updateRecordingViewProgress(
  viewId: string,
  watchTimeSeconds: number,
  completed?: boolean
): Promise<PDRecordingView> {
  const updateData: any = {
    last_viewed_at: new Date().toISOString(),
    total_watch_time_seconds: watchTimeSeconds
  };
  
  if (completed !== undefined) {
    updateData.completed = completed;
  }
  
  const { data, error } = await supabase
    .from('pd_recording_views')
    .update(updateData)
    .eq('id', viewId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getRecordingViewStats(webinarId: string): Promise<{
  totalViews: number;
  uniqueViewers: number;
  completedViews: number;
  averageWatchTime: number;
}> {
  const { data, error } = await supabase
    .from('pd_recording_views')
    .select('*')
    .eq('webinar_id', webinarId);
  
  if (error) throw error;
  
  const views = data || [];
  const totalViews = views.reduce((sum, v) => sum + v.view_count, 0);
  const completedViews = views.filter(v => v.completed).length;
  const totalWatchTime = views.reduce((sum, v) => sum + v.total_watch_time_seconds, 0);
  
  return {
    totalViews,
    uniqueViewers: views.length,
    completedViews,
    averageWatchTime: views.length > 0 ? Math.round(totalWatchTime / views.length) : 0
  };
}

export async function getTeacherRecordingViews(teacherId: string): Promise<PDRecordingView[]> {
  try {
    const { data, error } = await supabase
      .from('pd_recording_views')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('last_viewed_at', { ascending: false });
    if (error) { console.warn('getTeacherRecordingViews:', error.message); return []; }
    return data || [];
  } catch (e: any) {
    console.warn('getTeacherRecordingViews exception:', e?.message);
    return [];
  }
}

