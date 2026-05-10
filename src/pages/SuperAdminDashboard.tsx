import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PortalHeader } from '@/components/shared/PortalHeader';
import { PortalTabs } from '@/components/shared/PortalTabs';
import { SchoolManagement } from '@/components/superadmin/SchoolManagement';
import { SuperTeacherManagement } from '@/components/superadmin/SuperTeacherManagement';
import { SystemSettings } from '@/components/superadmin/SystemSettings';
import { SMSTemplateManager } from '@/components/superadmin/SMSTemplateManager';
import { AcademicCalendarManager } from '@/components/superadmin/AcademicCalendarManager';
import { SuperAdminAccountManager } from '@/components/superadmin/SuperAdminAccountManager';
import { TransferRequestManager } from '@/components/superadmin/TransferRequestManager';
import { KnowledgeBaseManager } from '@/components/superadmin/KnowledgeBaseManager';
import { ClassScheduler } from '@/components/schedule/ClassScheduler';
import { fetchSchools } from '@/lib/supabase-schools';
import { fetchUsersByRole } from '@/lib/supabase-admin';
import { fetchTransferRequests } from '@/lib/supabase-transfers';
import { PORTAL_THEMES } from '@/lib/design-system';
import { Building2, Crown, Users, BarChart3, Settings, MessageSquare, Database, Calendar, ShieldCheck, ArrowRightLeft, BookOpen } from 'lucide-react';

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ schools: 0, superTeachers: 0, schoolAdmins: 0 });
  const [pendingTransferCount, setPendingTransferCount] = useState(0);
  const theme = PORTAL_THEMES.super_admin;

  useEffect(() => {
    if (user && !isSuperAdmin) navigate('/');
    else if (!user) navigate('/');
    else if (isSuperAdmin) loadStats();
  }, [user, isSuperAdmin]);

  const loadStats = async () => {
    const [schools, superTeachers, schoolAdmins, allTransfers] = await Promise.all([
      fetchSchools(),
      fetchUsersByRole('super_teacher'),
      fetchUsersByRole('school_admin'),
      fetchTransferRequests(),
    ]);
    setStats({ schools: schools.length, superTeachers: superTeachers.length, schoolAdmins: schoolAdmins.length });
    setPendingTransferCount(allTransfers.filter(t => t.status === 'pending').length);
  };

  if (!user) return <div className={`min-h-screen bg-gradient-to-br ${theme.gradient} flex items-center justify-center`}><div className="text-white text-xl">Loading...</div></div>;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'schools', label: 'Schools & Admins', icon: Building2, badge: stats.schools },
    { id: 'super-teachers', label: 'Super Teachers', icon: Crown, badge: stats.superTeachers },
    { id: 'calendar', label: 'Academic Calendar', icon: Calendar },
    { id: 'questions', label: 'Question Bank', icon: Database },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'transfers', label: 'Transfers', icon: ArrowRightLeft, badge: pendingTransferCount || undefined },
    { id: 'knowledge-base', label: 'Knowledge Base', icon: BookOpen },
    { id: 'admin-accounts', label: 'Admin Accounts', icon: ShieldCheck },
    { id: 'sms-templates', label: 'SMS Templates', icon: MessageSquare },
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.gradient}`}>
      <PortalHeader portalType="super_admin" title="Super Admin Portal" subtitle="Platform Management" />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <PortalTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} portalType="super_admin" />

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 text-white cursor-pointer hover:scale-105 transition-transform" onClick={() => setActiveTab('schools')}>
                <Building2 className="w-10 h-10 mb-3 opacity-80" />
                <div className="text-4xl font-bold">{stats.schools}</div>
                <div className="text-purple-200">Schools</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-6 text-white cursor-pointer hover:scale-105 transition-transform" onClick={() => setActiveTab('super-teachers')}>
                <Crown className="w-10 h-10 mb-3 opacity-80" />
                <div className="text-4xl font-bold">{stats.superTeachers}</div>
                <div className="text-yellow-100">Super Teachers</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
                <Users className="w-10 h-10 mb-3 opacity-80" />
                <div className="text-4xl font-bold">{stats.schoolAdmins}</div>
                <div className="text-emerald-100">School Admins</div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setActiveTab('schools')} className="bg-purple-600/50 hover:bg-purple-600 text-white p-4 rounded-lg text-sm transition-all flex flex-col items-center gap-2"><Building2 className="w-6 h-6" /> Add School</button>
                  <button onClick={() => setActiveTab('super-teachers')} className="bg-yellow-600/50 hover:bg-yellow-600 text-white p-4 rounded-lg text-sm transition-all flex flex-col items-center gap-2"><Crown className="w-6 h-6" /> Add Super Teacher</button>
                  <button onClick={() => setActiveTab('calendar')} className="bg-cyan-600/50 hover:bg-cyan-600 text-white p-4 rounded-lg text-sm transition-all flex flex-col items-center gap-2"><Calendar className="w-6 h-6" /> Academic Calendar</button>
                  <button type="button" onClick={() => setActiveTab('transfers')} className="bg-rose-600/50 hover:bg-rose-600 text-white p-4 rounded-lg text-sm transition-all flex flex-col items-center gap-2 relative"><ArrowRightLeft className="w-6 h-6" /> Transfers{pendingTransferCount > 0 && <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{pendingTransferCount}</span>}</button>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Platform Info</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <p><strong>Platform:</strong> Catalyst</p>
                  <p><strong>Role:</strong> Super Administrator</p>
                  <p><strong>Date:</strong> {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p><strong>Version:</strong> 2.0.0</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schools' && <div className="bg-white/10 backdrop-blur-md rounded-xl"><SchoolManagement /></div>}
        {activeTab === 'super-teachers' && <div className="bg-white/10 backdrop-blur-md rounded-xl"><SuperTeacherManagement /></div>}
        {activeTab === 'calendar' && <div className="bg-white/10 backdrop-blur-md rounded-xl"><AcademicCalendarManager /></div>}
        {activeTab === 'questions' && (
          <div className="text-center py-8">
            <Database className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Question Bank</h2>
            <p className="text-purple-200 mb-4">Manage platform-wide assessment questions</p>
            <button type="button" onClick={() => navigate('/question-bank')} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-medium transition-all">Open Question Bank</button>
          </div>
        )}
        {activeTab === 'settings' && <div className="bg-white/10 backdrop-blur-md rounded-xl"><SystemSettings /></div>}
        {activeTab === 'transfers' && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl">
            <TransferRequestManager />
          </div>
        )}
        {activeTab === 'knowledge-base' && <div className="bg-white/10 backdrop-blur-md rounded-xl"><KnowledgeBaseManager /></div>}
        {activeTab === 'admin-accounts' && <div className="bg-white/10 backdrop-blur-md rounded-xl"><SuperAdminAccountManager /></div>}
        {activeTab === 'sms-templates' && <div className="bg-white/10 backdrop-blur-md rounded-xl"><SMSTemplateManager /></div>}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
