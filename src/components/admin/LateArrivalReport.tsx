import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useSchool } from '@/contexts/SchoolContext';
import { useToast } from '@/hooks/use-toast';
import { fetchAllUsers } from '@/lib/supabase-admin';
import {
  getSchoolAttendanceSettings,
  updateSchoolAttendanceSettings,
  getDailyLateArrivalReport,
  getMonthlyLateArrivalSummary,
  getLateArrivalNotifications,
  isLateArrival,
} from '@/lib/supabase-punch-clock';
import { 
  SchoolAttendanceSettings, 
  DailyLateArrivalReport as DailyReport,
  LateArrivalNotification,
  LateArrivalRecord 
} from '@/types/punch-clock';
import { User } from '@/types/user';
import {
  Clock,
  AlertTriangle,
  Bell,
  BellOff,
  Save,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  TrendingUp,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Image,
  RefreshCw,
  Settings,
  FileText,
  Download,
} from 'lucide-react';

export const LateArrivalReport: React.FC = () => {
  const { currentSchool } = useSchool();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [settings, setSettings] = useState<SchoolAttendanceSettings | null>(null);
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [notifications, setNotifications] = useState<LateArrivalNotification[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<any>(null);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'notifications'>('daily');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Form state for settings
  const [lateThreshold, setLateThreshold] = useState('08:00');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [adminPhone, setAdminPhone] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    if (currentSchool?.id) loadData();
  }, [currentSchool?.id, selectedDate, selectedMonth, selectedYear]);

  const loadData = async () => {
    if (!currentSchool?.id) return;
    setLoading(true);

    try {
      const [users, settingsData] = await Promise.all([
        fetchAllUsers(currentSchool.id),
        getSchoolAttendanceSettings(currentSchool.id),
      ]);

      const teacherList = users.filter(u => u.role === 'teacher' || u.role === 'super_teacher');
      setTeachers(teacherList);

      if (settingsData) {
        setSettings(settingsData);
        setLateThreshold(settingsData.late_threshold_time?.slice(0, 5) || '08:00');
        setNotificationsEnabled(settingsData.late_notification_enabled);
        setAdminPhone(settingsData.admin_notification_phone || '');
        setAdminEmail(settingsData.admin_notification_email || '');
      }

      // Load daily report
      const threshold = settingsData?.late_threshold_time?.slice(0, 5) || '08:00';
      const report = await getDailyLateArrivalReport(
        currentSchool.id,
        selectedDate,
        threshold,
        teacherList.map(t => ({ id: t.id, name: t.name }))
      );
      setDailyReport(report);

      // Load monthly summary
      const summary = await getMonthlyLateArrivalSummary(
        currentSchool.id,
        selectedMonth,
        selectedYear,
        threshold
      );
      setMonthlySummary(summary);

      // Load notifications for the month
      const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
      const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];
      const notifs = await getLateArrivalNotifications(currentSchool.id, startDate, endDate + 'T23:59:59');
      setNotifications(notifs);

    } catch (error) {
      console.error('Error loading late arrival data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!currentSchool?.id) return;
    setSaving(true);

    try {
      const success = await updateSchoolAttendanceSettings(currentSchool.id, {
        late_threshold_time: lateThreshold + ':00',
        late_notification_enabled: notificationsEnabled,
        admin_notification_phone: adminPhone || undefined,
        admin_notification_email: adminEmail || undefined,
      });

      if (success) {
        toast({
          title: 'Settings Saved',
          description: 'Late arrival notification settings have been updated.',
        });
        setShowSettings(false);
        loadData();
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const changeMonth = (delta: number) => {
    let newMonth = selectedMonth + delta;
    let newYear = selectedYear;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTeacherName = (teacherId: string) => {
    return teachers.find(t => t.id === teacherId)?.name || 'Unknown';
  };

  const exportReport = () => {
    if (!dailyReport) return;

    const csvContent = [
      ['Late Arrival Report', selectedDate].join(','),
      [''],
      ['Teacher Name', 'Arrival Time', 'Minutes Late', 'Verified'].join(','),
      ...dailyReport.lateRecords.map(r => [
        r.teacher_name,
        formatTime(r.punch_in_time),
        r.minutes_late,
        r.punch_in_verified ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `late-arrivals-${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
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
          <AlertTriangle className="w-6 h-6 text-amber-400" />
          Late Arrival Report
        </h2>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button
            onClick={loadData}
            variant="ghost"
            className="text-white hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="bg-white/10 border-white/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Late Arrival Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 text-sm mb-1 block">Late Threshold Time</label>
                <Input
                  type="time"
                  value={lateThreshold}
                  onChange={(e) => setLateThreshold(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
                <p className="text-xs text-white/50 mt-1">
                  Teachers arriving after this time are considered late
                </p>
              </div>
              <div>
                <label className="text-white/70 text-sm mb-1 block">Enable Notifications</label>
                <div className="flex items-center gap-3 mt-2">
                  <Switch
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                  <span className="text-white">
                    {notificationsEnabled ? 'Notifications On' : 'Notifications Off'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 text-sm mb-1 block flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Admin Phone (SMS/WhatsApp)
                </label>
                <Input
                  type="tel"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  placeholder="+233XXXXXXXXX"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <label className="text-white/70 text-sm mb-1 block flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Admin Email (Optional)
                </label>
                <Input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@school.edu"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSaveSettings}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Settings
              </Button>
              <Button
                onClick={() => setShowSettings(false)}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Settings Summary */}
      <div className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-white/70">
            <Clock className="w-4 h-4 inline mr-1" />
            Late after: <span className="text-white font-medium">{lateThreshold}</span>
          </span>
          <span className="text-white/70">
            {notificationsEnabled ? (
              <Badge className="bg-green-500/30 text-green-300">
                <Bell className="w-3 h-3 mr-1" />
                Alerts On
              </Badge>
            ) : (
              <Badge className="bg-gray-500/30 text-gray-300">
                <BellOff className="w-3 h-3 mr-1" />
                Alerts Off
              </Badge>
            )}
          </span>
          {adminPhone && (
            <span className="text-white/70">
              <Phone className="w-4 h-4 inline mr-1" />
              {adminPhone}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          onClick={() => setActiveTab('daily')}
          variant={activeTab === 'daily' ? 'default' : 'ghost'}
          className={activeTab === 'daily' ? 'bg-amber-600' : 'text-white hover:bg-white/10'}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Daily Report
        </Button>
        <Button
          onClick={() => setActiveTab('monthly')}
          variant={activeTab === 'monthly' ? 'default' : 'ghost'}
          className={activeTab === 'monthly' ? 'bg-amber-600' : 'text-white hover:bg-white/10'}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Monthly Summary
        </Button>
        <Button
          onClick={() => setActiveTab('notifications')}
          variant={activeTab === 'notifications' ? 'default' : 'ghost'}
          className={activeTab === 'notifications' ? 'bg-amber-600' : 'text-white hover:bg-white/10'}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Sent Alerts ({notifications.length})
        </Button>
      </div>

      {/* Daily Report Tab */}
      {activeTab === 'daily' && dailyReport && (
        <div className="space-y-4">
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
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
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
              onClick={exportReport}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-blue-500/30 rounded-lg p-3 text-center">
              <Users className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{dailyReport.totalTeachers}</div>
              <div className="text-xs text-blue-300">Total Teachers</div>
            </div>
            <div className="bg-green-500/30 rounded-lg p-3 text-center">
              <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{dailyReport.onTimeArrivals}</div>
              <div className="text-xs text-green-300">On Time</div>
            </div>
            <div className="bg-amber-500/30 rounded-lg p-3 text-center">
              <AlertTriangle className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{dailyReport.lateArrivals}</div>
              <div className="text-xs text-amber-300">Late</div>
            </div>
            <div className="bg-red-500/30 rounded-lg p-3 text-center">
              <XCircle className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{dailyReport.absentTeachers}</div>
              <div className="text-xs text-red-300">Absent</div>
            </div>
            <div className="bg-purple-500/30 rounded-lg p-3 text-center">
              <Clock className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{dailyReport.averageMinutesLate}</div>
              <div className="text-xs text-purple-300">Avg Min Late</div>
            </div>
          </div>

          {/* Late Arrivals List */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg">
                Late Arrivals ({dailyReport.lateRecords.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dailyReport.lateRecords.length === 0 ? (
                <div className="text-center py-8 text-white/50">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-400" />
                  <p>No late arrivals on this day!</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {dailyReport.lateRecords.map((record) => (
                    <div
                      key={record.id}
                      className="bg-white/5 rounded-lg p-3 flex items-center gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white">{record.teacher_name}</div>
                        <div className="text-xs text-white/60">
                          Arrived at {formatTime(record.punch_in_time)}
                        </div>
                      </div>
                      <div className="text-center">
                        <Badge className="bg-amber-500/30 text-amber-300">
                          {record.minutes_late} min late
                        </Badge>
                      </div>
                      <div>
                        {record.punch_in_verified ? (
                          <Badge className="bg-green-500/30 text-green-300">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500/30 text-red-300">
                            <XCircle className="w-3 h-3 mr-1" />
                            Unverified
                          </Badge>
                        )}
                      </div>
                      {record.punch_in_photo_url && (
                        <button
                          onClick={() => setSelectedPhoto(record.punch_in_photo_url!)}
                          className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white/20 hover:border-white/50 transition-colors"
                        >
                          <img
                            src={record.punch_in_photo_url}
                            alt="Photo"
                            className="w-full h-full object-cover"
                          />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monthly Summary Tab */}
      {activeTab === 'monthly' && monthlySummary && (
        <div className="space-y-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              onClick={() => changeMonth(-1)}
              className="text-white hover:bg-white/10"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="text-white font-medium text-lg">
              {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </span>
            <Button
              variant="ghost"
              onClick={() => changeMonth(1)}
              className="text-white hover:bg-white/10"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Monthly Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-amber-500/30 rounded-lg p-4 text-center">
              <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{monthlySummary.totalLateArrivals}</div>
              <div className="text-sm text-amber-300">Total Late Arrivals</div>
            </div>
            <div className="bg-purple-500/30 rounded-lg p-4 text-center">
              <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{monthlySummary.uniqueTeachersLate}</div>
              <div className="text-sm text-purple-300">Teachers Late</div>
            </div>
            <div className="bg-blue-500/30 rounded-lg p-4 text-center">
              <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{monthlySummary.averageMinutesLate}</div>
              <div className="text-sm text-blue-300">Avg Minutes Late</div>
            </div>
            <div className="bg-red-500/30 rounded-lg p-4 text-center">
              <Calendar className="w-6 h-6 text-red-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">
                {monthlySummary.worstDay?.count || 0}
              </div>
              <div className="text-sm text-red-300">
                Worst Day: {monthlySummary.worstDay ? formatDate(monthlySummary.worstDay.date) : 'N/A'}
              </div>
            </div>
          </div>

          {/* Frequent Late Teachers */}
          {monthlySummary.frequentLateTeachers.length > 0 && (
            <Card className="bg-white/10 border-white/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                  Frequently Late Teachers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {monthlySummary.frequentLateTeachers.map((item: any, index: number) => (
                    <div
                      key={item.teacherId}
                      className="bg-white/5 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-amber-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-amber-700 text-white' :
                          'bg-white/20 text-white'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="text-white font-medium">
                          {getTeacherName(item.teacherId)}
                        </span>
                      </div>
                      <Badge className="bg-amber-500/30 text-amber-300">
                        {item.count} times late
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Sent Notifications ({notifications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-white/50">
                  <BellOff className="w-12 h-12 mx-auto mb-2" />
                  <p>No notifications sent this month</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="bg-white/5 rounded-lg p-3 flex items-center gap-4"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        notif.notification_type === 'sms' ? 'bg-blue-500/30' :
                        notif.notification_type === 'whatsapp' ? 'bg-green-500/30' :
                        'bg-purple-500/30'
                      }`}>
                        {notif.notification_type === 'sms' ? (
                          <MessageSquare className="w-5 h-5 text-blue-400" />
                        ) : notif.notification_type === 'whatsapp' ? (
                          <Phone className="w-5 h-5 text-green-400" />
                        ) : (
                          <Mail className="w-5 h-5 text-purple-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white">{notif.teacher_name}</div>
                        <div className="text-xs text-white/60">
                          {formatDate(notif.notification_sent_at)} at {formatTime(notif.notification_sent_at)}
                        </div>
                        <div className="text-xs text-white/50">
                          {notif.minutes_late} minutes late • {notif.notification_type.toUpperCase()}
                        </div>
                      </div>
                      <Badge className={
                        notif.notification_status === 'sent' 
                          ? 'bg-green-500/30 text-green-300'
                          : 'bg-red-500/30 text-red-300'
                      }>
                        {notif.notification_status === 'sent' ? (
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                        ) : (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {notif.notification_status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

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

export default LateArrivalReport;
