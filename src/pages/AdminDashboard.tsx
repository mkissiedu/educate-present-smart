import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import { PortalHeader } from '@/components/shared/PortalHeader';
import { PortalTabs } from '@/components/shared/PortalTabs';
import { TeacherManagement } from '@/components/admin/TeacherManagement';
import { StudentManagement } from '@/components/admin/StudentManagement';
import { TeacherAttendance } from '@/components/admin/TeacherAttendance';
import { PunchClockAdmin } from '@/components/admin/PunchClockAdmin';
import { LateArrivalReport } from '@/components/admin/LateArrivalReport';
import { MonthlyAttendanceReport } from '@/components/admin/MonthlyAttendanceReport';
import LeaveManagement from '@/components/admin/LeaveManagement';
import { ReportCardReview } from '@/components/admin/ReportCardReview';
import { BulkParentMessage } from '@/components/admin/BulkParentMessage';
import { ClassPromotion } from '@/components/admin/ClassPromotion';
import { SchoolBrandingSettings } from '@/components/admin/SchoolBrandingSettings';
import { BillGenerator } from '@/components/admin/BillGenerator';
import { AssessmentHub } from '@/components/AssessmentHub';
import { ClassScheduler } from '@/components/schedule/ClassScheduler';
import { PDWebinarManager } from '@/components/pd/PDWebinarManager';
import { TeacherLearnPortal } from '@/components/pd/TeacherLearnPortal';
import { StudentTransferRequest } from '@/components/admin/StudentTransferRequest';
import { fetchAllUsers } from '@/lib/supabase-admin';
import { fetchStudents } from '@/lib/supabase-students';
import { getPendingSubmissions } from '@/lib/bank-payment-verification';
import { getPendingLeaveRequests } from '@/lib/supabase-leave';
import { fetchPendingTransfersForSchool } from '@/lib/supabase-transfers';
import { Student } from '@/types/student';
import { PORTAL_THEMES } from '@/lib/design-system';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserCheck, FileText, MessageCircle, GraduationCap, Shield, BarChart3, ClipboardCheck, Calendar, Building2, ArrowUpCircle, Palette, Receipt, Bell, Fingerprint, AlertTriangle, FileSpreadsheet, CalendarOff, Video, BookOpen, Film, ArrowRightLeft } from 'lucide-react';



const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isAuthenticated } = useAuth();
  const { currentSchool, selectSchoolById } = useSchool();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ teachers: 0, students: 0, classes: 13 });
  const [students, setStudents] = useState<Student[]>([]);
  const [showMessage, setShowMessage] = useState(false);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [pendingLeaveRequests, setPendingLeaveRequests] = useState(0);
  const [pendingTransfers, setPendingTransfers] = useState(0);
  const [learnSubTab, setLearnSubTab] = useState('meetings');

  const theme = PORTAL_THEMES.admin;
  const schoolId = user?.school_id;

  useEffect(() => {
    if (user && !isAdmin) navigate('/');
    else if (!user && !isAuthenticated) navigate('/');
    else if (isAdmin && schoolId) {
      if (!currentSchool || currentSchool.id !== schoolId) selectSchoolById(schoolId);
      loadStats();
    }
  }, [user?.id, isAuthenticated, isAdmin, schoolId]);

  useEffect(() => { if (isAdmin && currentSchool) loadStats(); }, [currentSchool?.id]);

  const loadStats = async () => {
    const sid = currentSchool?.id || schoolId;
    if (!sid) return;
    const [users, studentList, pending, leaveRequests, transfers] = await Promise.all([
      fetchAllUsers(sid),
      fetchStudents(sid),
      getPendingSubmissions(sid).catch(() => []),
      getPendingLeaveRequests(sid).catch(() => []),
      fetchPendingTransfersForSchool(sid).catch(() => []),
    ]);
    setStats({ teachers: users.filter(u => u.role === 'teacher').length, students: studentList.length, classes: 13 });
    setStudents(studentList);
    setPendingPayments(pending.length);
    setPendingLeaveRequests(leaveRequests.length);
    setPendingTransfers(transfers.length);
  };


  if (!user) return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.gradient} flex items-center justify-center`}>
      <div className="text-white text-xl">Loading...</div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'teachers', label: 'Teachers', icon: GraduationCap, badge: stats.teachers },
    { id: 'students', label: 'Students', icon: Users, badge: stats.students },
    { id: 'billing', label: 'Billing', icon: Receipt, badge: pendingPayments > 0 ? pendingPayments : undefined },
    { id: 'promotion', label: 'Promotion', icon: ArrowUpCircle },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'learn', label: 'Learn', icon: Video },
    { id: 'punchclock', label: 'Punch Clock', icon: Fingerprint },
    { id: 'latearrivals', label: 'Late Arrivals', icon: AlertTriangle },
    { id: 'monthlyreport', label: 'Monthly Report', icon: FileSpreadsheet },
    { id: 'leave', label: 'Leave', icon: CalendarOff, badge: pendingLeaveRequests > 0 ? pendingLeaveRequests : undefined },
    { id: 'transfers', label: 'Transfers', icon: ArrowRightLeft, badge: pendingTransfers > 0 ? pendingTransfers : undefined },
    { id: 'attendance', label: 'Attendance', icon: UserCheck },
    { id: 'assess', label: 'Assessments', icon: ClipboardCheck },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
  ];


  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.gradient}`}>
      <PortalHeader portalType="admin" title="School Admin Portal" subtitle={currentSchool?.name} schoolName={currentSchool?.code} />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <PortalTabs tabs={tabs} activeTab={activeTab} onTabChange={(id) => { setActiveTab(id); if (id === 'messages') setShowMessage(true); }} portalType="admin" />
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {pendingPayments > 0 && (
              <div className="bg-orange-500/20 border border-orange-500/50 rounded-xl p-4 flex items-center gap-3">
                <Bell className="h-6 w-6 text-orange-400" />
                <div className="flex-1"><span className="text-white font-medium">{pendingPayments} bank payment(s) pending verification</span></div>
                <button onClick={() => setActiveTab('billing')} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm">Review Now</button>
              </div>
            )}
            {pendingLeaveRequests > 0 && (
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 flex items-center gap-3">
                <CalendarOff className="h-6 w-6 text-yellow-400" />
                <div className="flex-1"><span className="text-white font-medium">{pendingLeaveRequests} leave request(s) pending approval</span></div>
                <button onClick={() => setActiveTab('leave')} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm">Review Now</button>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-4 text-white cursor-pointer hover:scale-105 transition-transform" onClick={() => setActiveTab('teachers')}><GraduationCap className="w-8 h-8 mb-2 opacity-80" /><div className="text-3xl font-bold">{stats.teachers}</div><div className="text-blue-200 text-sm">Teachers</div></div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-4 text-white cursor-pointer hover:scale-105 transition-transform" onClick={() => setActiveTab('students')}><Users className="w-8 h-8 mb-2 opacity-80" /><div className="text-3xl font-bold">{stats.students}</div><div className="text-purple-200 text-sm">Students</div></div>
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl p-4 text-white"><Shield className="w-8 h-8 mb-2 opacity-80" /><div className="text-3xl font-bold">{stats.classes}</div><div className="text-emerald-200 text-sm">Classes</div></div>
              <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl p-4 text-white cursor-pointer hover:scale-105 transition-transform relative" onClick={() => setActiveTab('billing')}><Receipt className="w-8 h-8 mb-2 opacity-80" /><div className="text-3xl font-bold">Fees</div><div className="text-teal-200 text-sm">Billing</div>{pendingPayments > 0 && <Badge className="absolute top-2 right-2 bg-red-500">{pendingPayments}</Badge>}</div>
              <div className="bg-gradient-to-br from-rose-500 to-rose-700 rounded-xl p-4 text-white cursor-pointer hover:scale-105 transition-transform" onClick={() => setActiveTab('punchclock')}><Fingerprint className="w-8 h-8 mb-2 opacity-80" /><div className="text-3xl font-bold">Clock</div><div className="text-rose-200 text-sm">Punch In/Out</div></div>
              <div className="bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl p-4 text-white cursor-pointer hover:scale-105 transition-transform relative" onClick={() => setActiveTab('leave')}><CalendarOff className="w-8 h-8 mb-2 opacity-80" /><div className="text-3xl font-bold">Leave</div><div className="text-amber-200 text-sm">Requests</div>{pendingLeaveRequests > 0 && <Badge className="absolute top-2 right-2 bg-red-500">{pendingLeaveRequests}</Badge>}</div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4"><h3 className="text-lg font-bold text-white mb-3">Quick Actions</h3><div className="grid grid-cols-2 gap-2"><button onClick={() => setActiveTab('teachers')} className="bg-blue-600/50 hover:bg-blue-600 text-white p-3 rounded-lg text-sm transition-all">Add Teacher</button><button onClick={() => setActiveTab('students')} className="bg-purple-600/50 hover:bg-purple-600 text-white p-3 rounded-lg text-sm transition-all">Add Student</button><button onClick={() => setActiveTab('billing')} className="bg-teal-600/50 hover:bg-teal-600 text-white p-3 rounded-lg text-sm transition-all">Generate Bills</button><button onClick={() => setActiveTab('leave')} className="bg-amber-600/50 hover:bg-amber-600 text-white p-3 rounded-lg text-sm transition-all">Leave Requests</button><button onClick={() => setActiveTab('monthlyreport')} className="bg-cyan-600/50 hover:bg-cyan-600 text-white p-3 rounded-lg text-sm transition-all">Monthly Report</button><button onClick={() => setShowMessage(true)} className="bg-green-600/50 hover:bg-green-600 text-white p-3 rounded-lg text-sm transition-all">Message Parents</button></div></div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4"><h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><Building2 className="w-5 h-5" /> School Info</h3><div className="space-y-2 text-sm text-gray-300"><p><strong>School:</strong> {currentSchool?.name || 'Not Selected'}</p><p><strong>Admin:</strong> {user?.name}</p><p><strong>Date:</strong> {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p><p><strong>Academic Year:</strong> {currentSchool?.academic_year || '2024/2025'}</p></div></div>
            </div>
          </div>
        )}
        {activeTab === 'teachers' && <div className="bg-white/10 backdrop-blur-md rounded-xl"><TeacherManagement /></div>}
        {activeTab === 'students' && <div className="bg-white/10 backdrop-blur-md rounded-xl"><StudentManagement /></div>}
        {activeTab === 'billing' && <div className="bg-white/10 backdrop-blur-md rounded-xl"><BillGenerator /></div>}
        {activeTab === 'promotion' && <div className="bg-white/10 backdrop-blur-md rounded-xl"><ClassPromotion /></div>}
        {activeTab === 'schedule' && <div className="bg-white/10 backdrop-blur-md rounded-xl"><ClassScheduler /></div>}
        
        {activeTab === 'learn' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Video className="w-6 h-6 text-purple-400" /> Professional Development
              </h2>
            </div>
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              <Tabs value={learnSubTab} onValueChange={setLearnSubTab} className="w-full">
                <div className="border-b bg-gray-50 px-4">
                  <TabsList className="bg-transparent h-12">
                    <TabsTrigger value="meetings" className="data-[state=active]:bg-white">
                      <Video className="w-4 h-4 mr-2" />
                      Staff Meetings
                    </TabsTrigger>
                    <TabsTrigger value="recordings" className="data-[state=active]:bg-white">
                      <Film className="w-4 h-4 mr-2" />
                      Recordings
                    </TabsTrigger>
                    <TabsTrigger value="courses" className="data-[state=active]:bg-white">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Available Courses
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="meetings" className="p-4 mt-0">
                  <PDWebinarManager creatorType="admin" schoolId={currentSchool?.id} />
                </TabsContent>
                <TabsContent value="recordings" className="p-4 mt-0">
                  <TeacherLearnPortal />
                </TabsContent>
                <TabsContent value="courses" className="p-4 mt-0">
                  <TeacherLearnPortal />
                </TabsContent>
              </Tabs>

            </div>
          </div>
        )}

        

        
        {activeTab === 'punchclock' && <div className="bg-white/10 backdrop-blur-md rounded-xl"><PunchClockAdmin /></div>}
        {activeTab === 'latearrivals' && <div className="bg-white/10 backdrop-blur-md rounded-xl"><LateArrivalReport /></div>}
        {activeTab === 'monthlyreport' && <div className="bg-white/10 backdrop-blur-md rounded-xl"><MonthlyAttendanceReport /></div>}
        {activeTab === 'leave' && <div className="bg-white/10 backdrop-blur-md rounded-xl p-6"><LeaveManagement /></div>}
        {activeTab === 'transfers' && <div className="bg-white/10 backdrop-blur-md rounded-xl"><StudentTransferRequest /></div>}

        {activeTab === 'attendance' && <div className="bg-white/10 backdrop-blur-md rounded-xl"><TeacherAttendance /></div>}
        {activeTab === 'assess' && <div className="bg-white/10 backdrop-blur-md rounded-xl"><AssessmentHub onNavigateToCurriculum={() => navigate('/curriculum')} /></div>}
        {activeTab === 'reports' && <div className="bg-white/10 backdrop-blur-md rounded-xl"><ReportCardReview /></div>}
        {activeTab === 'branding' && <div className="bg-white/10 backdrop-blur-md rounded-xl"><SchoolBrandingSettings /></div>}
        {activeTab === 'messages' && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-10 text-center">
            <MessageCircle className="w-16 h-16 text-green-400 mx-auto mb-4 opacity-80" />
            <h2 className="text-xl font-bold text-white mb-2">Message Parents</h2>
            <p className="text-white/60 mb-6">Send a bulk WhatsApp or SMS message to parents of students in your school.</p>
            <button
              type="button"
              onClick={() => setShowMessage(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Compose Message
            </button>
          </div>
        )}
      </div>
      <BulkParentMessage isOpen={showMessage} onClose={() => setShowMessage(false)} students={students} />
    </div>
  );
};

export default AdminDashboard;
