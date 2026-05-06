import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, Presentation, ClipboardCheck, Settings, LogIn, LogOut, Crown, User, Shield, Globe, Sparkles, Zap } from 'lucide-react';


import { useAuth } from '@/contexts/AuthContext';
import { LoginModal } from '@/components/LoginModal';
import { OTPLoginModal } from '@/components/OTPLoginModal';
import { ForgotPasswordModal } from '@/components/ForgotPasswordModal';
import { CATALYST_LOGO, HERO_IMAGE, SUBJECT_THUMBNAILS } from '@/components/CatalystMascot';
import { UserRole } from '@/types/user';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, loginWithOTP, isAdmin, isSuperTeacher, isPlatformAdmin, isSuperAdmin } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showOTPLogin, setShowOTPLogin] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleLoginSuccess = (role?: UserRole) => {
    if (role === 'super_admin') navigate('/super-admin');
    else if (role === 'school_admin') navigate('/admin');
    else if (role === 'super_teacher' || role === 'platform_admin') navigate('/super-teacher');
    else navigate('/dashboard');
  };

  const handleOTPSuccess = (otpUser: any, session?: any) => {
    loginWithOTP(otpUser, session);
    if (otpUser.role === 'super_admin') navigate('/super-admin');
    else if (otpUser.role === 'school_admin') navigate('/admin');
    else if (otpUser.role === 'super_teacher' || otpUser.role === 'platform_admin') navigate('/super-teacher');
    else navigate('/dashboard');
  };


  const handleDashboardClick = () => {
    if (isSuperAdmin) navigate('/super-admin');
    else if (isAdmin) navigate('/admin');
    else if (isSuperTeacher || isPlatformAdmin) navigate('/super-teacher');
    else navigate('/dashboard');
  };

  const getDashboardLabel = () => {
    if (isSuperAdmin) return 'Go to Super Admin Portal';
    if (isAdmin) return 'Go to Admin Portal';
    if (isSuperTeacher || isPlatformAdmin) return 'Go to Super Teacher Portal';
    return 'Go to Dashboard';
  };

  const features = [
    { icon: BookOpen, title: 'Learn', desc: 'Access comprehensive curriculum-aligned content for all subjects and grade levels.', color: 'bg-blue-500' },
    { icon: Calendar, title: 'Plan', desc: 'Create detailed lesson plans with our 5-Minute Lesson Planning Wizard.', color: 'bg-green-500' },
    { icon: Presentation, title: 'Teach', desc: 'Deliver engaging lessons with dual-view presentation mode and interactive tools.', color: 'bg-purple-500' },
    { icon: ClipboardCheck, title: 'Assess', desc: 'Track student progress with real-time assessments and detailed analytics.', color: 'bg-orange-500' },
    { icon: Settings, title: 'Manage', desc: 'Take attendance, track fees, and communicate with parents all in one place.', color: 'bg-teal-500' },
  ];



  const subjectCategories = [
    { category: 'Pre-Primary', subjects: [
      { name: 'Language & Literacy', color: 'from-blue-500 to-blue-700' },
      { name: 'Numeracy', color: 'from-green-500 to-green-700' },
      { name: "Ananse's Phonics", color: 'from-purple-500 to-purple-700' },
      { name: 'Creativity', color: 'from-pink-500 to-pink-700' },
    ]},
    { category: 'Primary', subjects: [
      { name: 'English', color: 'from-blue-500 to-blue-700' },
      { name: 'Mathematics', color: 'from-green-500 to-green-700' },
      { name: 'Science', color: 'from-purple-500 to-purple-700' },
      { name: 'French', color: 'from-red-500 to-red-700' },
      { name: 'Creative Arts', color: 'from-pink-500 to-pink-700' },
      { name: 'RME', color: 'from-amber-500 to-amber-700' },
      { name: 'Physical Education', color: 'from-orange-500 to-orange-700' },
      { name: 'Ghanaian Language', color: 'from-yellow-500 to-yellow-700' },
    ]},
    { category: 'JHS', subjects: [
      { name: 'English', color: 'from-blue-600 to-blue-800' },
      { name: 'JHS Mathematics', color: 'from-green-600 to-green-800' },
      { name: 'Science', color: 'from-purple-600 to-purple-800' },
      { name: 'Social Studies', color: 'from-orange-500 to-orange-700' },
      { name: 'French', color: 'from-red-600 to-red-800' },
      { name: 'Computing', color: 'from-cyan-500 to-cyan-700' },
      { name: 'Career Technology', color: 'from-teal-500 to-teal-700' },
      { name: 'RME', color: 'from-amber-600 to-amber-800' },
    ]},
  ];


  const getRoleIcon = () => {
    if (isSuperAdmin) return <Sparkles className="w-5 h-5 text-purple-400" />;
    if (isPlatformAdmin) return <Globe className="w-5 h-5 text-purple-400" />;
    if (isSuperTeacher) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (isAdmin) return <Shield className="w-5 h-5 text-emerald-400" />;
    return <User className="w-5 h-5 text-blue-400" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
        {isAuthenticated ? (
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-4 py-2">
            <div className="flex items-center gap-2">{getRoleIcon()}<span className="font-bold text-white">{user?.name}</span></div>
            <Button onClick={logout} variant="ghost" size="sm" className="text-red-400 hover:text-red-300"><LogOut className="w-4 h-4 mr-1" /> Logout</Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button onClick={() => setShowOTPLogin(true)} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 rounded-full font-bold shadow-lg">
              <Shield className="w-4 h-4 mr-2" /> OTP Login
            </Button>
            <Button onClick={() => setShowLogin(true)} className="bg-white text-blue-600 hover:bg-blue-50 rounded-full font-bold shadow-lg">
              <LogIn className="w-4 h-4 mr-2" /> Password Login
            </Button>
          </div>
        )}
      </div>
      {/* Auth test panel link - bottom left */}
      <div className="fixed bottom-4 left-4 z-20">
        <Button onClick={() => navigate('/auth-test')} variant="outline" size="sm"
          className="bg-slate-800/80 border-amber-500/50 text-amber-400 hover:bg-slate-700 hover:text-amber-300 backdrop-blur-md text-xs">
          <Zap className="w-3 h-3 mr-1" /> Auth Test Suite
        </Button>
      </div>


      <div className="relative overflow-hidden">
        <img src={HERO_IMAGE} alt="Learning" className="w-full h-[500px] object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
          <div className="max-w-5xl">
            <div className="flex items-center justify-center gap-4 mb-6">
              <img src={CATALYST_LOGO} alt="Catalyst" className="h-24 md:h-32 object-contain" />
            </div>
            <p className="text-xl text-blue-200 mb-8 font-medium">Transform Your Teaching. Streamline Your School.</p>
            <Button onClick={() => isAuthenticated ? handleDashboardClick() : setShowOTPLogin(true)} size="lg"
              className="text-xl px-10 py-7 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full shadow-xl font-bold">
              {isAuthenticated ? getDashboardLabel() : 'Get Started'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-black text-white text-center mb-2">All Subjects and All Classes</h2>
        <p className="text-blue-200 text-center mb-8">Comprehensive curriculum coverage from Pre-Primary to JHS</p>
        
        {subjectCategories.map((cat, idx) => (
          <div key={idx} className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">{cat.category}</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {cat.subjects.map((s, i) => (
                <div key={i} className={`bg-gradient-to-br ${s.color} rounded-2xl p-4 shadow-xl hover:scale-105 transition-all cursor-pointer`}>
                  <img src={SUBJECT_THUMBNAILS[s.name]} alt={s.name} className="w-full h-24 object-cover rounded-xl mb-3" />
                  <span className="text-white font-bold text-sm block text-center">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <h2 className="text-3xl font-black text-white text-center mb-8 mt-16">Powerful Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">

          {features.map((f, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/20 transition-all">
              <div className={`${f.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4`}><f.icon className="w-8 h-8 text-white" /></div>
              <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
              <p className="text-blue-200 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="max-w-5xl mx-auto text-center px-6">
          <h2 className="text-4xl font-black text-white mb-4">Ready to Transform Your School?</h2>
          <p className="text-xl text-blue-200 mb-8">Join hundreds of schools using Catalyst</p>
          <Button onClick={() => isAuthenticated ? handleDashboardClick() : setShowOTPLogin(true)} size="lg"
            className="text-xl px-12 py-6 bg-white text-blue-600 hover:bg-blue-50 rounded-full shadow-xl font-bold">Get Started</Button>
        </div>
      </div>


      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onSuccess={handleLoginSuccess} 
        onSwitchToOTP={() => { setShowLogin(false); setShowOTPLogin(true); }}
        onForgotPassword={() => { setShowLogin(false); setShowForgotPassword(true); }} />
      <OTPLoginModal isOpen={showOTPLogin} onClose={() => setShowOTPLogin(false)} onSuccess={handleOTPSuccess}
        onForgotPassword={() => { setShowOTPLogin(false); setShowForgotPassword(true); }} />
      <ForgotPasswordModal isOpen={showForgotPassword} onClose={() => setShowForgotPassword(false)} 
        onSuccess={() => setShowLogin(true)} />
    </div>
  );
};

export default Landing;
