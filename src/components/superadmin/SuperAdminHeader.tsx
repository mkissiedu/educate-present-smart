import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sparkles, LogOut, Home, Database } from 'lucide-react';
import { CATALYST_LOGO } from '@/components/CatalystMascot';

export const SuperAdminHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={CATALYST_LOGO} alt="Catalyst" className="h-10 object-contain bg-white rounded-lg px-2 py-1" />
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> Super Admin Portal
            </h1>
            <p className="text-purple-200 text-xs">Platform Management</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span className="text-white text-sm font-bold">{user?.name}</span>
          </div>
          <Button onClick={() => navigate('/question-bank')} variant="ghost" size="sm" className="text-white hover:bg-white/20">
            <Database className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white hover:bg-white/20">
            <Home className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:bg-red-500/50">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
