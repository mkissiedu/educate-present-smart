import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSchool } from '@/contexts/SchoolContext';
import { useToast } from '@/hooks/use-toast';
import { fetchAllUsers } from '@/lib/supabase-admin';
import {
  getSchoolGateLocation,
  getSchoolPunchRecords,
  getSchoolAttendanceSettings,
  isLateArrival,
  isEarlyDeparture,
} from '@/lib/supabase-punch-clock';
import { getApprovedLeavesForDate } from '@/lib/supabase-leave';
import { PunchClockRecord, SchoolGateLocation, SchoolAttendanceSettings, LeaveRequest } from '@/types/punch-clock';
import { User } from '@/types/user';
import PunchClockSetup from './PunchClockSetup';
import {
  MapPin,
  Settings,
  CheckCircle2,
  XCircle,
  Clock,
  LogIn,
  LogOut,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Image,
  AlertTriangle,
  Users,
  CalendarOff,
  Fingerprint,
  LayoutDashboard,
  Cog,
} from 'lucide-react';

export const PunchClockAdmin: React.FC = () => {
  const { currentSchool } = useSchool();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [records, setRecords] = useState<PunchClockRecord[]>([]);
  const [approvedLeaves, setApprovedLeaves] = useState<LeaveRequest[]>([]);
  const [gateLocation, setGateLocation] = useState<SchoolGateLocation | null>(null);
  const [attendanceSettings, setAttendanceSettings] = useState<SchoolAttendanceSettings | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (currentSchool?.id) loadData();
  }, [currentSchool?.id, date]);

  const loadData = async () => {
    if (!currentSchool?.id) return;
    setLoading(true);

    try {
      const [users, gateData, punchRecords, settings, leaves] = await Promise.all([
        fetchAllUsers(currentSchool.id),
        getSchoolGateLocation(currentSchool.id),
        getSchoolPunchRecords(currentSchool.id, date),
        getSchoolAttendanceSettings(currentSchool.id),
        getApprovedLeavesForDate(currentSchool.id, date),
      ]);

      setTeachers(users.filter(u => u.role === 'teacher' || u.role === 'super_teacher'));
      setGateLocation(gateData);
      setRecords(punchRecords);
      setAttendanceSettings(settings);
      setApprovedLeaves(leaves);
    } catch (error) {
      console.error('Error loading punch clock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const changeDate = (days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().split('T')[0]);
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getTeacherRecord = (teacherId: string) => {
    return records.find(r => r.teacher_id === teacherId);
  };

  // Check if teacher is on approved leave
  const getTeacherLeave = (teacherId: string) => {
    return approvedLeaves.find(l => l.teacher_id === teacherId);
  };

  // Check if a record is late
  const checkIfLate = (record: PunchClockRecord | undefined): { isLate: boolean; minutesLate: number } => {
    if (!record?.punch_in_time || !attendanceSettings) {
      return { isLate: false, minutesLate: 0 };
    }
    return isLateArrival(record.punch_in_time, attendanceSettings.late_threshold_time);
  };

  // Check if a record is early departure
  const checkIfEarlyDeparture = (record: PunchClockRecord | undefined): { isEarly: boolean; minutesEarly: number } => {
    if (!record?.punch_out_time || !attendanceSettings?.early_departure_time) {
      return { isEarly: false, minutesEarly: 0 };
    }
    return isEarlyDeparture(record.punch_out_time, attendanceSettings.early_departure_time);
  };

  // Calculate statistics
  const onLeaveCount = approvedLeaves.length;
  const lateCount = records.filter(r => {
    if (!r.punch_in_time || !attendanceSettings) return false;
    return isLateArrival(r.punch_in_time, attendanceSettings.late_threshold_time).isLate;
  }).length;

  const earlyDepartureCount = records.filter(r => {
    if (!r.punch_out_time || !attendanceSettings?.early_departure_time) return false;
    return isEarlyDeparture(r.punch_out_time, attendanceSettings.early_departure_time).isEarly;
  }).length;

  const teachersNotOnLeave = teachers.filter(t => !approvedLeaves.find(l => l.teacher_id === t.id));

  const stats = {
    total: teachers.length,
    punchedIn: records.filter(r => r.punch_in_time).length,
    punchedOut: records.filter(r => r.punch_out_time).length,
    verifiedIn: records.filter(r => r.punch_in_verified).length,
    notPunchedIn: teachersNotOnLeave.length - records.filter(r => r.punch_in_time).length,
    lateArrivals: lateCount,
    earlyDepartures: earlyDepartureCount,
    onLeave: onLeaveCount,
  };

  // Get status badge for teacher
  const getTeacherStatus = (teacherId: string) => {
    const leave = getTeacherLeave(teacherId);
    if (leave) {
      return {
        status: 'on_leave',
        label: leave.leave_type_name,
        color: 'bg-purple-500/30 text-purple-300',
      };
    }

    const record = getTeacherRecord(teacherId);
    if (!record?.punch_in_time) {
      return {
        status: 'absent',
        label: 'Absent',
        color: 'bg-red-500/30 text-red-300',
      };
    }

    const lateStatus = checkIfLate(record);
    const earlyStatus = checkIfEarlyDeparture(record);

    if (lateStatus.isLate && !record.punch_out_time) {
      return {
        status: 'late',
        label: `Late (${lateStatus.minutesLate}min)`,
        color: 'bg-amber-500/30 text-amber-300',
      };
    }

    if (earlyStatus.isEarly) {
      return {
        status: 'early_departure',
        label: `Early (${earlyStatus.minutesEarly}min)`,
        color: 'bg-orange-500/30 text-orange-300',
      };
    }

    if (!record.punch_out_time) {
      return {
        status: 'at_school',
        label: 'At School',
        color: 'bg-blue-500/30 text-blue-300',
      };
    }

    return {
      status: 'complete',
      label: 'Complete',
      color: 'bg-green-500/30 text-green-300',
    };
  };

  if (loading && activeTab === 'dashboard') {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Fingerprint className="w-6 h-6" />
          Teacher Punch Clock
        </h2>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/10 border-white/20">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-white/20 text-white">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="setup" className="data-[state=active]:bg-white/20 text-white">
            <Cog className="w-4 h-4 mr-2" />
            Setup & Settings
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4 mt-4">
          {/* Setup Warning */}
          {!gateLocation && (
            <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-amber-300 font-medium">Punch Clock Not Configured</p>
                <p className="text-amber-300/80 text-sm">
                  School gate location is not set. Teachers won't be able to punch in/out.
                </p>
              </div>
              <Button
                onClick={() => setActiveTab('setup')}
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                Configure Now
              </Button>
            </div>
          )}

          {/* Date Navigation */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              onClick={() => changeDate(-1)}
              className="text-white hover:bg-white/10"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-auto bg-white/10 border-white/20 text-white"
            />
            <Button
              variant="ghost"
              onClick={() => changeDate(1)}
              className="text-white hover:bg-white/10"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              onClick={loadData}
              className="text-white hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <div className="bg-blue-500/30 rounded-lg p-3 text-center">
              <Users className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-xs text-blue-300">Total</div>
            </div>
            <div className="bg-green-500/30 rounded-lg p-3 text-center">
              <LogIn className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{stats.punchedIn}</div>
              <div className="text-xs text-green-300">Punched In</div>
            </div>
            <div className="bg-amber-500/30 rounded-lg p-3 text-center">
              <AlertTriangle className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{stats.lateArrivals}</div>
              <div className="text-xs text-amber-300">Late</div>
            </div>
            <div className="bg-orange-500/30 rounded-lg p-3 text-center">
              <LogOut className="w-5 h-5 text-orange-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{stats.punchedOut}</div>
              <div className="text-xs text-orange-300">Punched Out</div>
            </div>
            <div className="bg-rose-500/30 rounded-lg p-3 text-center">
              <Clock className="w-5 h-5 text-rose-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{stats.earlyDepartures}</div>
              <div className="text-xs text-rose-300">Early Dept.</div>
            </div>
            <div className="bg-emerald-500/30 rounded-lg p-3 text-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{stats.verifiedIn}</div>
              <div className="text-xs text-emerald-300">Verified</div>
            </div>
            <div className="bg-purple-500/30 rounded-lg p-3 text-center">
              <CalendarOff className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{stats.onLeave}</div>
              <div className="text-xs text-purple-300">On Leave</div>
            </div>
            <div className="bg-red-500/30 rounded-lg p-3 text-center">
              <XCircle className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{stats.notPunchedIn}</div>
              <div className="text-xs text-red-300">Absent</div>
            </div>
          </div>

          {/* Late Threshold Info */}
          {attendanceSettings && (
            <div className="bg-white/5 rounded-lg p-2 text-center text-sm text-white/70 flex items-center justify-center gap-4 flex-wrap">
              <span>
                <Clock className="w-4 h-4 inline mr-1" />
                Late after: <span className="text-amber-400 font-medium">{attendanceSettings.late_threshold_time.slice(0, 5)}</span>
              </span>
              {attendanceSettings.early_departure_time && (
                <span>
                  <LogOut className="w-4 h-4 inline mr-1" />
                  Early before: <span className="text-orange-400 font-medium">{attendanceSettings.early_departure_time.slice(0, 5)}</span>
                </span>
              )}
              {attendanceSettings.late_notification_enabled && (
                <span className="text-green-400">
                  <CheckCircle2 className="w-4 h-4 inline mr-1" />
                  Notifications enabled
                </span>
              )}
            </div>
          )}

          {/* Teachers on Leave Section */}
          {approvedLeaves.length > 0 && (
            <Card className="bg-purple-500/20 border-purple-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-purple-300 text-sm flex items-center gap-2">
                  <CalendarOff className="w-4 h-4" />
                  Teachers on Leave Today ({approvedLeaves.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {approvedLeaves.map((leave) => (
                    <Badge key={leave.id} className="bg-purple-500/30 text-purple-200">
                      {leave.teacher_name} - {leave.leave_type_name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Teacher List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {teachers.map((teacher) => {
              const record = getTeacherRecord(teacher.id);
              const leave = getTeacherLeave(teacher.id);
              const hasPunchedIn = !!record?.punch_in_time;
              const hasPunchedOut = !!record?.punch_out_time;
              const lateStatus = checkIfLate(record);
              const earlyStatus = checkIfEarlyDeparture(record);
              const status = getTeacherStatus(teacher.id);

              return (
                <div
                  key={teacher.id}
                  className={`bg-white/10 rounded-lg p-3 flex items-center gap-4 ${
                    leave ? 'border-l-4 border-purple-500' :
                    lateStatus.isLate ? 'border-l-4 border-amber-500' :
                    earlyStatus.isEarly ? 'border-l-4 border-orange-500' : ''
                  }`}
                >
                  {/* Teacher Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white truncate flex items-center gap-2">
                      {teacher.name}
                      {leave && (
                        <Badge className="bg-purple-500/30 text-purple-300 text-[10px]">
                          <CalendarOff className="w-3 h-3 mr-1" />
                          {leave.leave_type_name}
                        </Badge>
                      )}
                      {!leave && lateStatus.isLate && (
                        <Badge className="bg-amber-500/30 text-amber-300 text-[10px]">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {lateStatus.minutesLate}min late
                        </Badge>
                      )}
                      {earlyStatus.isEarly && (
                        <Badge className="bg-orange-500/30 text-orange-300 text-[10px]">
                          <Clock className="w-3 h-3 mr-1" />
                          {earlyStatus.minutesEarly}min early
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {teacher.assignedClasses?.join(', ') || 'No classes assigned'}
                    </div>
                  </div>

                  {/* Punch In */}
                  <div className="text-center min-w-[100px]">
                    <div className="text-xs text-white/60 mb-1">Punch In</div>
                    <div className={`font-bold ${
                      leave ? 'text-gray-500' :
                      hasPunchedIn ? (lateStatus.isLate ? 'text-amber-400' : 'text-green-400') : 'text-gray-500'
                    }`}>
                      {leave ? 'On Leave' : formatTime(record?.punch_in_time)}
                    </div>
                    {hasPunchedIn && !leave && (
                      <div className="flex items-center justify-center gap-1 mt-1">
                        {record?.punch_in_verified ? (
                          <Badge className="bg-green-500/30 text-green-300 text-[10px]">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/30 text-amber-300 text-[10px]">
                            {record?.punch_in_distance_meters}m
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Punch Out */}
                  <div className="text-center min-w-[100px]">
                    <div className="text-xs text-white/60 mb-1">Punch Out</div>
                    <div className={`font-bold ${
                      leave ? 'text-gray-500' :
                      hasPunchedOut ? (earlyStatus.isEarly ? 'text-orange-400' : 'text-green-400') : 'text-gray-500'
                    }`}>
                      {leave ? '--' : formatTime(record?.punch_out_time)}
                    </div>
                    {hasPunchedOut && !leave && (
                      <div className="flex items-center justify-center gap-1 mt-1">
                        {record?.punch_out_verified ? (
                          <Badge className="bg-green-500/30 text-green-300 text-[10px]">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/30 text-amber-300 text-[10px]">
                            {record?.punch_out_distance_meters}m
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Photos */}
                  <div className="flex gap-2">
                    {record?.punch_in_photo_url && (
                      <button
                        onClick={() => setSelectedPhoto(record.punch_in_photo_url!)}
                        className="w-10 h-10 rounded-lg overflow-hidden border-2 border-green-500/50 hover:border-green-500 transition-colors"
                      >
                        <img
                          src={record.punch_in_photo_url}
                          alt="In"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    )}
                    {record?.punch_out_photo_url && (
                      <button
                        onClick={() => setSelectedPhoto(record.punch_out_photo_url!)}
                        className="w-10 h-10 rounded-lg overflow-hidden border-2 border-orange-500/50 hover:border-orange-500 transition-colors"
                      >
                        <img
                          src={record.punch_out_photo_url}
                          alt="Out"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    )}
                    {!record?.punch_in_photo_url && !record?.punch_out_photo_url && !leave && (
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                        <Image className="w-4 h-4 text-white/30" />
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="min-w-[90px]">
                    <Badge className={status.color}>{status.label}</Badge>
                  </div>
                </div>
              );
            })}

            {teachers.length === 0 && (
              <div className="text-center py-8 text-white/50">
                No teachers found
              </div>
            )}
          </div>
        </TabsContent>

        {/* Setup Tab */}
        <TabsContent value="setup" className="mt-4">
          <PunchClockSetup />
        </TabsContent>
      </Tabs>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <img
            src={selectedPhoto}
            alt="Punch photo"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

export default PunchClockAdmin;
