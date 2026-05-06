import { supabase } from './supabase';
import { 
  PunchClockRecord, 
  GeoLocation, 
  SchoolGateLocation, 
  SchoolAttendanceSettings,
  LateArrivalNotification,
  LateArrivalRecord,
  DailyLateArrivalReport,
  TeacherMonthlyAttendance,
  DailyAttendanceRecord,
  MonthlyAttendanceReport,
  AttendanceReportFilters
} from '@/types/punch-clock';
import { isTeacherOnLeave } from './supabase-leave';



// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Get current geolocation
export function getCurrentLocation(): Promise<GeoLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Location permission denied. Please enable location access.'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Location information is unavailable.'));
            break;
          case error.TIMEOUT:
            reject(new Error('Location request timed out.'));
            break;
          default:
            reject(new Error('An unknown error occurred while getting location.'));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

// Get school gate location
export async function getSchoolGateLocation(schoolId: string): Promise<SchoolGateLocation | null> {
  const { data, error } = await supabase
    .from('schools')
    .select('gate_latitude, gate_longitude, attendance_radius_meters')
    .eq('id', schoolId)
    .single();

  if (error || !data) return null;

  if (!data.gate_latitude || !data.gate_longitude) {
    return null;
  }

  return {
    latitude: parseFloat(data.gate_latitude),
    longitude: parseFloat(data.gate_longitude),
    radius_meters: data.attendance_radius_meters || 50,
  };
}

// Update school gate location
export async function updateSchoolGateLocation(
  schoolId: string,
  location: GeoLocation,
  radiusMeters: number = 50
): Promise<boolean> {
  const { error } = await supabase
    .from('schools')
    .update({
      gate_latitude: location.latitude,
      gate_longitude: location.longitude,
      attendance_radius_meters: radiusMeters,
      updated_at: new Date().toISOString(),
    })
    .eq('id', schoolId);

  return !error;
}

// Get school attendance settings
export async function getSchoolAttendanceSettings(schoolId: string): Promise<SchoolAttendanceSettings | null> {
  const { data, error } = await supabase
    .from('schools')
    .select('late_threshold_time, early_departure_time, late_notification_enabled, admin_notification_phone, admin_notification_email')
    .eq('id', schoolId)
    .single();

  if (error || !data) return null;

  return {
    late_threshold_time: data.late_threshold_time || '08:00:00',
    early_departure_time: data.early_departure_time || '16:00:00',
    late_notification_enabled: data.late_notification_enabled ?? true,
    admin_notification_phone: data.admin_notification_phone,
    admin_notification_email: data.admin_notification_email,
  };
}


// Update school attendance settings
export async function updateSchoolAttendanceSettings(
  schoolId: string,
  settings: Partial<SchoolAttendanceSettings>
): Promise<boolean> {
  const { error } = await supabase
    .from('schools')
    .update({
      ...settings,
      updated_at: new Date().toISOString(),
    })
    .eq('id', schoolId);

  return !error;
}

// Check if a punch-in time is late
export function isLateArrival(punchInTime: string, lateThreshold: string): { isLate: boolean; minutesLate: number } {
  const punchIn = new Date(punchInTime);
  const [hours, minutes] = lateThreshold.split(':').map(Number);
  
  const thresholdDate = new Date(punchIn);
  thresholdDate.setHours(hours, minutes, 0, 0);
  
  const diffMs = punchIn.getTime() - thresholdDate.getTime();
  const minutesLate = Math.floor(diffMs / (1000 * 60));
  
  return {
    isLate: minutesLate > 0,
    minutesLate: Math.max(0, minutesLate),
  };
}

// Send late arrival notification
export async function sendLateArrivalNotification(
  schoolId: string,
  teacherId: string,
  teacherName: string,
  punchInTime: string,
  lateThresholdTime: string,
  minutesLate: number,
  adminPhone?: string,
  adminEmail?: string,
  schoolName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('send-late-arrival-notification', {
      body: {
        schoolId,
        teacherId,
        teacherName,
        punchInTime,
        lateThresholdTime,
        minutesLate,
        adminPhone,
        adminEmail,
        schoolName,
      },
    });

    if (error) {
      console.error('Error sending late arrival notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error invoking late arrival notification:', err);
    return { success: false, error: err.message };
  }
}

// Get today's punch record for a teacher
export async function getTodayPunchRecord(teacherId: string): Promise<PunchClockRecord | null> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('teacher_punch_clock')
    .select('*')
    .eq('teacher_id', teacherId)
    .eq('date', today)
    .single();

  if (error || !data) return null;
  return data as PunchClockRecord;
}

// Get punch records for a date range
export async function getPunchRecords(
  teacherId: string,
  startDate: string,
  endDate: string
): Promise<PunchClockRecord[]> {
  const { data, error } = await supabase
    .from('teacher_punch_clock')
    .select('*')
    .eq('teacher_id', teacherId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  if (error || !data) return [];
  return data as PunchClockRecord[];
}

// Get all punch records for a school on a specific date
export async function getSchoolPunchRecords(
  schoolId: string,
  date: string
): Promise<PunchClockRecord[]> {
  const { data, error } = await supabase
    .from('teacher_punch_clock')
    .select('*')
    .eq('school_id', schoolId)
    .eq('date', date)
    .order('punch_in_time', { ascending: true });

  if (error || !data) return [];
  return data as PunchClockRecord[];
}

// Upload punch photo
export async function uploadPunchPhoto(
  teacherId: string,
  photoBlob: Blob,
  punchType: 'in' | 'out'
): Promise<string | null> {
  const timestamp = Date.now();
  const fileName = `${teacherId}/${punchType}_${timestamp}.jpg`;

  const { data, error } = await supabase.storage
    .from('punch-clock-photos')
    .upload(fileName, photoBlob, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) {
    console.error('Error uploading punch photo:', error);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from('punch-clock-photos')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

// Punch in with late arrival notification
export async function punchIn(
  teacherId: string,
  schoolId: string,
  location: GeoLocation,
  photoUrl: string,
  schoolGateLocation: SchoolGateLocation,
  teacherName?: string,
  schoolName?: string
): Promise<{ success: boolean; record?: PunchClockRecord; error?: string; isLate?: boolean; minutesLate?: number }> {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  // Calculate distance from school gate
  const distance = calculateDistance(
    location.latitude,
    location.longitude,
    schoolGateLocation.latitude,
    schoolGateLocation.longitude
  );

  const isVerified = distance <= schoolGateLocation.radius_meters;

  const { data, error } = await supabase
    .from('teacher_punch_clock')
    .upsert({
      teacher_id: teacherId,
      school_id: schoolId,
      date: today,
      punch_in_time: now,
      punch_in_latitude: location.latitude,
      punch_in_longitude: location.longitude,
      punch_in_photo_url: photoUrl,
      punch_in_verified: isVerified,
      punch_in_distance_meters: Math.round(distance * 100) / 100,
      updated_at: now,
    }, { onConflict: 'teacher_id,date' })
    .select()
    .single();

  if (error) {
    console.error('Punch in error:', error);
    return { success: false, error: error.message };
  }

  // Check for late arrival and send notification
  const settings = await getSchoolAttendanceSettings(schoolId);
  let isLate = false;
  let minutesLate = 0;

  if (settings) {
    const lateCheck = isLateArrival(now, settings.late_threshold_time);
    isLate = lateCheck.isLate;
    minutesLate = lateCheck.minutesLate;

    if (isLate && settings.late_notification_enabled && settings.admin_notification_phone) {
      // Send notification asynchronously (don't block the punch-in)
      sendLateArrivalNotification(
        schoolId,
        teacherId,
        teacherName || 'Unknown Teacher',
        now,
        settings.late_threshold_time,
        minutesLate,
        settings.admin_notification_phone,
        settings.admin_notification_email,
        schoolName
      ).catch(err => console.error('Failed to send late notification:', err));
    }
  }

  return {
    success: true,
    record: data as PunchClockRecord,
    isLate,
    minutesLate,
  };
}

// Punch out
export async function punchOut(
  teacherId: string,
  location: GeoLocation,
  photoUrl: string,
  schoolGateLocation: SchoolGateLocation
): Promise<{ success: boolean; record?: PunchClockRecord; error?: string }> {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  // Calculate distance from school gate
  const distance = calculateDistance(
    location.latitude,
    location.longitude,
    schoolGateLocation.latitude,
    schoolGateLocation.longitude
  );

  const isVerified = distance <= schoolGateLocation.radius_meters;

  const { data, error } = await supabase
    .from('teacher_punch_clock')
    .update({
      punch_out_time: now,
      punch_out_latitude: location.latitude,
      punch_out_longitude: location.longitude,
      punch_out_photo_url: photoUrl,
      punch_out_verified: isVerified,
      punch_out_distance_meters: Math.round(distance * 100) / 100,
      updated_at: now,
    })
    .eq('teacher_id', teacherId)
    .eq('date', today)
    .select()
    .single();

  if (error) {
    console.error('Punch out error:', error);
    return { success: false, error: error.message };
  }

  return {
    success: true,
    record: data as PunchClockRecord,
  };
}

// Get late arrival notifications for a school
export async function getLateArrivalNotifications(
  schoolId: string,
  startDate: string,
  endDate: string
): Promise<LateArrivalNotification[]> {
  const { data, error } = await supabase
    .from('late_arrival_notifications')
    .select('*')
    .eq('school_id', schoolId)
    .gte('notification_sent_at', startDate)
    .lte('notification_sent_at', endDate)
    .order('notification_sent_at', { ascending: false });

  if (error || !data) return [];
  return data as LateArrivalNotification[];
}

// Get daily late arrival report
export async function getDailyLateArrivalReport(
  schoolId: string,
  date: string,
  lateThreshold: string,
  teachers: { id: string; name: string }[]
): Promise<DailyLateArrivalReport> {
  const records = await getSchoolPunchRecords(schoolId, date);
  
  const lateRecords: LateArrivalRecord[] = [];
  let totalMinutesLate = 0;
  let onTimeCount = 0;

  records.forEach(record => {
    if (record.punch_in_time) {
      const { isLate, minutesLate } = isLateArrival(record.punch_in_time, lateThreshold);
      const teacher = teachers.find(t => t.id === record.teacher_id);
      
      if (isLate) {
        lateRecords.push({
          id: record.id,
          teacher_id: record.teacher_id,
          teacher_name: teacher?.name || 'Unknown',
          punch_in_time: record.punch_in_time,
          minutes_late: minutesLate,
          punch_in_verified: record.punch_in_verified || false,
          punch_in_photo_url: record.punch_in_photo_url,
          date: record.date,
        });
        totalMinutesLate += minutesLate;
      } else {
        onTimeCount++;
      }
    }
  });

  // Sort by minutes late (most late first)
  lateRecords.sort((a, b) => b.minutes_late - a.minutes_late);

  return {
    date,
    totalTeachers: teachers.length,
    lateArrivals: lateRecords.length,
    onTimeArrivals: onTimeCount,
    absentTeachers: teachers.length - records.filter(r => r.punch_in_time).length,
    lateRecords,
    averageMinutesLate: lateRecords.length > 0 ? Math.round(totalMinutesLate / lateRecords.length) : 0,
  };
}

// Get punch statistics for a teacher
export async function getTeacherPunchStats(
  teacherId: string,
  month: number,
  year: number,
  lateThreshold: string = '08:00'
): Promise<{
  totalDays: number;
  presentDays: number;
  verifiedDays: number;
  averageArrivalTime: string;
  averageDepartureTime: string;
  lateArrivals: number;
}> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('teacher_punch_clock')
    .select('*')
    .eq('teacher_id', teacherId)
    .gte('date', startDate)
    .lte('date', endDate);

  if (error || !data || data.length === 0) {
    return {
      totalDays: 0,
      presentDays: 0,
      verifiedDays: 0,
      averageArrivalTime: '--:--',
      averageDepartureTime: '--:--',
      lateArrivals: 0,
    };
  }

  const records = data as PunchClockRecord[];
  const presentDays = records.filter(r => r.punch_in_time).length;
  const verifiedDays = records.filter(r => r.punch_in_verified).length;

  // Calculate average times
  const arrivalTimes = records
    .filter(r => r.punch_in_time)
    .map(r => new Date(r.punch_in_time!).getHours() * 60 + new Date(r.punch_in_time!).getMinutes());

  const departureTimes = records
    .filter(r => r.punch_out_time)
    .map(r => new Date(r.punch_out_time!).getHours() * 60 + new Date(r.punch_out_time!).getMinutes());

  const avgArrival = arrivalTimes.length > 0
    ? Math.round(arrivalTimes.reduce((a, b) => a + b, 0) / arrivalTimes.length)
    : 0;

  const avgDeparture = departureTimes.length > 0
    ? Math.round(departureTimes.reduce((a, b) => a + b, 0) / departureTimes.length)
    : 0;

  // Count late arrivals using configurable threshold
  const [thresholdHours, thresholdMinutes] = lateThreshold.split(':').map(Number);
  const thresholdTotalMinutes = thresholdHours * 60 + thresholdMinutes;
  const lateArrivals = arrivalTimes.filter(t => t > thresholdTotalMinutes).length;

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  return {
    totalDays: new Date(year, month, 0).getDate(),
    presentDays,
    verifiedDays,
    averageArrivalTime: avgArrival > 0 ? formatTime(avgArrival) : '--:--',
    averageDepartureTime: avgDeparture > 0 ? formatTime(avgDeparture) : '--:--',
    lateArrivals,
  };
}

// Get monthly late arrival summary
export async function getMonthlyLateArrivalSummary(
  schoolId: string,
  month: number,
  year: number,
  lateThreshold: string
): Promise<{
  totalLateArrivals: number;
  uniqueTeachersLate: number;
  totalMinutesLate: number;
  averageMinutesLate: number;
  worstDay: { date: string; count: number } | null;
  frequentLateTeachers: { teacherId: string; count: number }[];
}> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('teacher_punch_clock')
    .select('*')
    .eq('school_id', schoolId)
    .gte('date', startDate)
    .lte('date', endDate)
    .not('punch_in_time', 'is', null);

  if (error || !data) {
    return {
      totalLateArrivals: 0,
      uniqueTeachersLate: 0,
      totalMinutesLate: 0,
      averageMinutesLate: 0,
      worstDay: null,
      frequentLateTeachers: [],
    };
  }

  const records = data as PunchClockRecord[];
  const lateByDate: Record<string, number> = {};
  const lateByTeacher: Record<string, number> = {};
  const uniqueTeachers = new Set<string>();
  let totalMinutesLate = 0;
  let totalLateArrivals = 0;

  records.forEach(record => {
    if (record.punch_in_time) {
      const { isLate, minutesLate } = isLateArrival(record.punch_in_time, lateThreshold);
      if (isLate) {
        totalLateArrivals++;
        totalMinutesLate += minutesLate;
        uniqueTeachers.add(record.teacher_id);
        
        lateByDate[record.date] = (lateByDate[record.date] || 0) + 1;
        lateByTeacher[record.teacher_id] = (lateByTeacher[record.teacher_id] || 0) + 1;
      }
    }
  });

  // Find worst day
  let worstDay: { date: string; count: number } | null = null;
  Object.entries(lateByDate).forEach(([date, count]) => {
    if (!worstDay || count > worstDay.count) {
      worstDay = { date, count };
    }
  });

  // Get frequent late teachers
  const frequentLateTeachers = Object.entries(lateByTeacher)
    .map(([teacherId, count]) => ({ teacherId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalLateArrivals,
    uniqueTeachersLate: uniqueTeachers.size,
    totalMinutesLate,
    averageMinutesLate: totalLateArrivals > 0 ? Math.round(totalMinutesLate / totalLateArrivals) : 0,
    worstDay,
    frequentLateTeachers,
  };
}


// Check if a punch-out time is early departure
export function isEarlyDeparture(
  punchOutTime: string, 
  earlyDepartureThreshold: string
): { isEarly: boolean; minutesEarly: number } {
  const punchOut = new Date(punchOutTime);
  const [hours, minutes] = earlyDepartureThreshold.split(':').map(Number);
  
  const thresholdDate = new Date(punchOut);
  thresholdDate.setHours(hours, minutes, 0, 0);
  
  const diffMs = thresholdDate.getTime() - punchOut.getTime();
  const minutesEarly = Math.floor(diffMs / (1000 * 60));
  
  return {
    isEarly: minutesEarly > 0,
    minutesEarly: Math.max(0, minutesEarly),
  };
}

// Calculate work hours between punch in and punch out
export function calculateWorkHours(punchInTime: string, punchOutTime: string): number {
  const punchIn = new Date(punchInTime);
  const punchOut = new Date(punchOutTime);
  const diffMs = punchOut.getTime() - punchIn.getTime();
  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // Hours with 2 decimal places
}

// Format minutes to HH:MM string
export function formatMinutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

// Get working days for a month (excluding weekends by default)
export function getWorkingDays(
  month: number, 
  year: number, 
  includeWeekends: boolean = false,
  excludedDates: string[] = []
): string[] {
  const workingDays: string[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    
    // Skip weekends (0 = Sunday, 6 = Saturday) unless includeWeekends is true
    if (!includeWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
      continue;
    }
    
    // Skip excluded dates (holidays, etc.)
    if (excludedDates.includes(dateStr)) {
      continue;
    }
    
    workingDays.push(dateStr);
  }
  
  return workingDays;
}

// Get all punch records for a school in a month
export async function getSchoolMonthlyPunchRecords(
  schoolId: string,
  month: number,
  year: number
): Promise<PunchClockRecord[]> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('teacher_punch_clock')
    .select('*')
    .eq('school_id', schoolId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error || !data) return [];
  return data as PunchClockRecord[];
}

// Generate comprehensive monthly attendance report
export async function generateMonthlyAttendanceReport(
  schoolId: string,
  schoolName: string,
  month: number,
  year: number,
  teachers: { id: string; name: string; email?: string; assignedClasses?: string[] }[],
  filters: Partial<AttendanceReportFilters> = {}
): Promise<MonthlyAttendanceReport> {
  // Get settings
  const settings = await getSchoolAttendanceSettings(schoolId);
  const lateThreshold = settings?.late_threshold_time?.slice(0, 5) || '08:00';
  const earlyDepartureThreshold = settings?.early_departure_time?.slice(0, 5) || '16:00';
  
  // Get working days
  const workingDays = getWorkingDays(
    month, 
    year, 
    filters.includeWeekends || false,
    filters.excludedDates || []
  );
  
  // Get all punch records for the month
  const allRecords = await getSchoolMonthlyPunchRecords(schoolId, month, year);
  
  // Group records by teacher
  const recordsByTeacher: Record<string, PunchClockRecord[]> = {};
  allRecords.forEach(record => {
    if (!recordsByTeacher[record.teacher_id]) {
      recordsByTeacher[record.teacher_id] = [];
    }
    recordsByTeacher[record.teacher_id].push(record);
  });
  
  // Generate report for each teacher
  const teacherReports: TeacherMonthlyAttendance[] = [];
  let totalLateArrivals = 0;
  let totalEarlyDepartures = 0;
  let totalAbsences = 0;
  
  for (const teacher of teachers) {
    // Filter by teacherId if specified
    if (filters.teacherId && teacher.id !== filters.teacherId) {
      continue;
    }
    
    const teacherRecords = recordsByTeacher[teacher.id] || [];
    const recordsByDate: Record<string, PunchClockRecord> = {};
    teacherRecords.forEach(r => { recordsByDate[r.date] = r; });
    
    // Calculate daily records
    const dailyRecords: DailyAttendanceRecord[] = [];
    let daysPresent = 0;
    let lateArrivals = 0;
    let earlyDepartures = 0;
    let verifiedPunchIns = 0;
    let verifiedPunchOuts = 0;
    let totalWorkHoursSum = 0;
    const arrivalMinutes: number[] = [];
    const departureMinutes: number[] = [];
    
    for (const dateStr of workingDays) {
      const record = recordsByDate[dateStr];
      const date = new Date(dateStr);
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      let dailyRecord: DailyAttendanceRecord = {
        date: dateStr,
        dayOfWeek,
        isLate: false,
        minutesLate: 0,
        isEarlyDeparture: false,
        minutesEarly: 0,
        workHours: 0,
        punchInVerified: false,
        punchOutVerified: false,
        status: 'absent',
      };
      
      if (record?.punch_in_time) {
        daysPresent++;
        dailyRecord.punchInTime = record.punch_in_time;
        dailyRecord.punchInVerified = record.punch_in_verified || false;
        
        if (record.punch_in_verified) verifiedPunchIns++;
        
        // Check late arrival
        const lateCheck = isLateArrival(record.punch_in_time, lateThreshold);
        dailyRecord.isLate = lateCheck.isLate;
        dailyRecord.minutesLate = lateCheck.minutesLate;
        if (lateCheck.isLate) {
          lateArrivals++;
          totalLateArrivals++;
        }
        
        // Calculate arrival time in minutes for average
        const punchInDate = new Date(record.punch_in_time);
        arrivalMinutes.push(punchInDate.getHours() * 60 + punchInDate.getMinutes());
        
        // Check punch out
        if (record.punch_out_time) {
          dailyRecord.punchOutTime = record.punch_out_time;
          dailyRecord.punchOutVerified = record.punch_out_verified || false;
          
          if (record.punch_out_verified) verifiedPunchOuts++;
          
          // Check early departure
          const earlyCheck = isEarlyDeparture(record.punch_out_time, earlyDepartureThreshold);
          dailyRecord.isEarlyDeparture = earlyCheck.isEarly;
          dailyRecord.minutesEarly = earlyCheck.minutesEarly;
          if (earlyCheck.isEarly) {
            earlyDepartures++;
            totalEarlyDepartures++;
          }
          
          // Calculate work hours
          dailyRecord.workHours = calculateWorkHours(record.punch_in_time, record.punch_out_time);
          totalWorkHoursSum += dailyRecord.workHours;
          
          // Calculate departure time in minutes for average
          const punchOutDate = new Date(record.punch_out_time);
          departureMinutes.push(punchOutDate.getHours() * 60 + punchOutDate.getMinutes());
          
          // Set status
          if (dailyRecord.isLate) {
            dailyRecord.status = 'late';
          } else if (dailyRecord.isEarlyDeparture) {
            dailyRecord.status = 'early_departure';
          } else {
            dailyRecord.status = 'present';
          }
        } else {
          dailyRecord.status = 'incomplete';
        }
      } else {
        totalAbsences++;
      }
      
      dailyRecords.push(dailyRecord);
    }
    
    // Calculate averages
    const avgArrivalMinutes = arrivalMinutes.length > 0
      ? Math.round(arrivalMinutes.reduce((a, b) => a + b, 0) / arrivalMinutes.length)
      : 0;
    const avgDepartureMinutes = departureMinutes.length > 0
      ? Math.round(departureMinutes.reduce((a, b) => a + b, 0) / departureMinutes.length)
      : 0;
    const avgWorkHours = daysPresent > 0 ? totalWorkHoursSum / daysPresent : 0;
    
    // Calculate percentages
    const attendancePercentage = workingDays.length > 0 
      ? Math.round((daysPresent / workingDays.length) * 100) 
      : 0;
    const punctualityPercentage = daysPresent > 0 
      ? Math.round(((daysPresent - lateArrivals) / daysPresent) * 100) 
      : 0;
    
    teacherReports.push({
      teacherId: teacher.id,
      teacherName: teacher.name,
      teacherEmail: teacher.email,
      assignedClasses: teacher.assignedClasses,
      totalWorkingDays: workingDays.length,
      daysPresent,
      daysAbsent: workingDays.length - daysPresent,
      lateArrivals,
      earlyDepartures,
      averageArrivalTime: avgArrivalMinutes > 0 ? formatMinutesToTime(avgArrivalMinutes) : '--:--',
      averageDepartureTime: avgDepartureMinutes > 0 ? formatMinutesToTime(avgDepartureMinutes) : '--:--',
      averageWorkHours: avgWorkHours > 0 ? `${avgWorkHours.toFixed(1)}h` : '--',
      totalWorkHours: Math.round(totalWorkHoursSum * 10) / 10,
      attendancePercentage,
      punctualityPercentage,
      verifiedPunchIns,
      verifiedPunchOuts,
      dailyRecords,
    });
  }
  
  // Sort teacher reports by name
  teacherReports.sort((a, b) => a.teacherName.localeCompare(b.teacherName));
  
  // Calculate overall averages
  const avgAttendanceRate = teacherReports.length > 0
    ? Math.round(teacherReports.reduce((sum, r) => sum + r.attendancePercentage, 0) / teacherReports.length)
    : 0;
  const avgPunctualityRate = teacherReports.length > 0
    ? Math.round(teacherReports.reduce((sum, r) => sum + r.punctualityPercentage, 0) / teacherReports.length)
    : 0;
  
  // Top performers
  const topAttendance = [...teacherReports]
    .sort((a, b) => b.attendancePercentage - a.attendancePercentage)
    .slice(0, 5)
    .map(r => ({ teacherId: r.teacherId, teacherName: r.teacherName, percentage: r.attendancePercentage }));
  
  const topPunctuality = [...teacherReports]
    .sort((a, b) => b.punctualityPercentage - a.punctualityPercentage)
    .slice(0, 5)
    .map(r => ({ teacherId: r.teacherId, teacherName: r.teacherName, percentage: r.punctualityPercentage }));
  
  // Needs improvement
  const frequentLateArrivals = [...teacherReports]
    .filter(r => r.lateArrivals > 0)
    .sort((a, b) => b.lateArrivals - a.lateArrivals)
    .slice(0, 5)
    .map(r => ({ teacherId: r.teacherId, teacherName: r.teacherName, count: r.lateArrivals }));
  
  const frequentAbsences = [...teacherReports]
    .filter(r => r.daysAbsent > 0)
    .sort((a, b) => b.daysAbsent - a.daysAbsent)
    .slice(0, 5)
    .map(r => ({ teacherId: r.teacherId, teacherName: r.teacherName, count: r.daysAbsent }));
  
  return {
    schoolId,
    schoolName,
    month,
    year,
    reportGeneratedAt: new Date().toISOString(),
    lateThresholdTime: lateThreshold,
    earlyDepartureTime: earlyDepartureThreshold,
    totalTeachers: teacherReports.length,
    totalWorkingDays: workingDays.length,
    averageAttendanceRate: avgAttendanceRate,
    averagePunctualityRate: avgPunctualityRate,
    totalLateArrivals,
    totalEarlyDepartures,
    totalAbsences,
    teacherReports,
    topAttendance,
    topPunctuality,
    frequentLateArrivals,
  };
}

// Check teacher leave status for attendance display
export async function getTeacherLeaveStatusForDate(
  schoolId: string,
  teacherId: string,
  date: string
): Promise<{ onLeave: boolean; leaveType?: string; leaveColor?: string }> {
  return isTeacherOnLeave(schoolId, teacherId, date);
}

// Enhanced daily attendance record that includes leave status
export async function getDailyAttendanceWithLeaveStatus(
  schoolId: string,
  date: string,
  teachers: { id: string; name: string }[]
): Promise<{
  teacherId: string;
  teacherName: string;
  status: 'present' | 'late' | 'absent' | 'on_leave';
  punchInTime?: string;
  punchOutTime?: string;
  isLate?: boolean;
  minutesLate?: number;
  leaveType?: string;
  leaveColor?: string;
}[]> {
  const records = await getSchoolPunchRecords(schoolId, date);
  const settings = await getSchoolAttendanceSettings(schoolId);
  const lateThreshold = settings?.late_threshold_time || '08:00';
  
  const results = [];
  
  for (const teacher of teachers) {
    const record = records.find(r => r.teacher_id === teacher.id);
    const leaveStatus = await isTeacherOnLeave(schoolId, teacher.id, date);
    
    if (leaveStatus.onLeave) {
      results.push({
        teacherId: teacher.id,
        teacherName: teacher.name,
        status: 'on_leave' as const,
        leaveType: leaveStatus.leaveType,
        leaveColor: leaveStatus.leaveColor,
      });
    } else if (record?.punch_in_time) {
      const lateCheck = isLateArrival(record.punch_in_time, lateThreshold);
      results.push({
        teacherId: teacher.id,
        teacherName: teacher.name,
        status: lateCheck.isLate ? 'late' : 'present',
        punchInTime: record.punch_in_time,
        punchOutTime: record.punch_out_time,
        isLate: lateCheck.isLate,
        minutesLate: lateCheck.minutesLate,
      });
    } else {
      results.push({
        teacherId: teacher.id,
        teacherName: teacher.name,
        status: 'absent' as const,
      });
    }
  }
  
  return results;
}
