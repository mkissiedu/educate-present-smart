import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import { Home, LogOut, Shield, School, Database } from 'lucide-react';
import { CATALYST_LOGO } from '../CatalystMascot';

export const AdminHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currentSchool } = useSchool();

  return (
    <header className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={CATALYST_LOGO} alt="Catalyst" className="h-10 object-contain bg-white rounded-lg px-2 py-1" />
            <div>
              <h1 className="text-xl font-black text-white flex items-center gap-2">
                <Shield className="w-5 h-5" /> School Admin Portal
              </h1>
              <p className="text-emerald-200 text-xs">{currentSchool?.name || 'Catalyst'}</p>

            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentSchool && (
              <div className="hidden md:flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                <School className="w-4 h-4 text-emerald-200" />
                <span className="text-white text-sm font-medium">{currentSchool.code}</span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
              <Shield className="w-4 h-4 text-emerald-200" />
              <span className="text-white text-sm font-bold hidden sm:inline">{user?.name}</span>
            </div>
            <Button onClick={() => navigate('/question-bank')} variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <Database className="w-4 h-4" />
            </Button>
            <Button onClick={() => navigate('/')} variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <Home className="w-4 h-4" />
            </Button>
            <Button onClick={() => { logout(); navigate('/'); }} variant="ghost" size="sm" className="text-white hover:bg-red-500/50">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
