import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Crown, LogOut, Home, BookOpen, Database, Briefcase } from 'lucide-react';
import { CATALYST_LOGO } from '@/components/CatalystMascot';

interface Props {
  assignedSubjects?: string[];
}

export const SuperTeacherHeader: React.FC<Props> = ({ assignedSubjects = [] }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={CATALYST_LOGO} alt="Catalyst" className="h-10 object-contain bg-white rounded-lg px-2 py-1" />
            <div>
              <h1 className="text-xl font-black text-white flex items-center gap-2">
                <Crown className="w-5 h-5" /> Super Teacher Portal
              </h1>
              <p className="text-amber-100 text-xs">Content Development & Training</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {assignedSubjects.length > 0 && (
              <div className="hidden md:flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                <Briefcase className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">{assignedSubjects.length} Subject{assignedSubjects.length !== 1 ? 's' : ''}</span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
              <Crown className="w-4 h-4 text-yellow-200" />
              <span className="text-white text-sm font-bold hidden sm:inline">{user?.name}</span>
            </div>
            <Button onClick={() => navigate('/dashboard')} variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <BookOpen className="w-4 h-4" />
            </Button>
            <Button onClick={() => navigate('/question-bank')} variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <Database className="w-4 h-4" />
            </Button>
            <Button onClick={() => navigate('/')} variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <Home className="w-4 h-4" />
            </Button>
            <Button onClick={handleLogout} variant="ghost" size="sm" className="text-white hover:bg-red-500/50">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
