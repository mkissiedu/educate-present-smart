import React, { useState, useRef, useEffect } from 'react';
import { User, Crown, LogOut, ChevronDown, GraduationCap, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  onOpenMyClasses?: () => void;
  onLogout: () => void;
  adminAssigned?: boolean;
}

export const TeacherProfileDropdown: React.FC<Props> = ({ onOpenMyClasses, onLogout, adminAssigned }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isSuperTeacher = user?.role === 'super_teacher';

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-3 py-1.5 hover:bg-white/20 transition-all"
      >
        {isSuperTeacher ? (
          <Crown className="w-4 h-4 text-yellow-400" />
        ) : (
          <User className="w-4 h-4 text-blue-400" />
        )}
        <span className="font-bold text-white text-sm hidden sm:inline">{user?.name}</span>
        <ChevronDown className={`w-4 h-4 text-white/70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-slate-800 border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="p-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              {isSuperTeacher ? (
                <Crown className="w-5 h-5 text-yellow-400" />
              ) : (
                <User className="w-5 h-5 text-blue-400" />
              )}
              <div>
                <div className="font-bold text-white text-sm">{user?.name}</div>
                <div className="text-xs text-white/60">{isSuperTeacher ? 'Super Teacher' : 'Teacher'}</div>
              </div>
            </div>
          </div>
          
          <div className="p-2">
            {adminAssigned ? (
              <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 text-left">
                <Lock className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="font-semibold text-white text-sm">My Classes</div>
                  <div className="text-xs text-amber-400">Assigned by admin</div>
                </div>
              </div>
            ) : onOpenMyClasses ? (
              <button
                onClick={() => { onOpenMyClasses(); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition-all text-left"
              >
                <GraduationCap className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="font-semibold text-white text-sm">My Classes</div>
                  <div className="text-xs text-white/60">Manage class assignments</div>
                </div>
              </button>
            ) : null}
            
            <button
              onClick={() => { onLogout(); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/20 transition-all text-left mt-1"
            >
              <LogOut className="w-5 h-5 text-red-400" />
              <div>
                <div className="font-semibold text-red-400 text-sm">Sign Out</div>
                <div className="text-xs text-white/60">Log out of your account</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
