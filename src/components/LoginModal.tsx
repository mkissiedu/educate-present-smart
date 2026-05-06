import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user';
import { User, Crown, AlertCircle, Loader2, Shield, Sparkles, Mail, Phone, CheckCircle, WifiOff } from 'lucide-react';
import { ANANSE_IMAGE } from './AnanseMascot';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role?: UserRole) => void;
  onSwitchToOTP?: () => void;
  onForgotPassword?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess, onSwitchToOTP, onForgotPassword }) => {
  const { login, isLoading } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('teacher');
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  const isEmail = identifier.includes('@');
  const isPhone = /^\+?\d{10,15}$/.test(identifier.replace(/\s/g, ''));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoginSuccess(false);

    if (!identifier.trim()) {
      setError('Please enter your email or phone number.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    console.log('[LoginModal] Submitting:', { identifier: identifier.trim(), role });

    try {
      const success = await login(identifier.trim(), password, role);
      if (success) {
        setLoginSuccess(true);
        console.log('[LoginModal] Login successful, navigating...');
        // Brief success feedback before closing
        setTimeout(() => {
          onClose();
          setLoginSuccess(false);
          setTimeout(() => onSuccess(role), 100);
        }, 500);
      } else {
        console.log('[LoginModal] Login returned false');
        setError(
          'Invalid credentials. Please check your email, password, and role selection. ' +
          'Make sure you are selecting the correct role (Teacher, Super Teacher, Admin, etc.).'
        );
      }
    } catch (err: any) {
      console.error('[LoginModal] Login exception:', err);
      setError('Connection error. Please check your internet and try again.');
    }
  };

  const fillDemo = (type: UserRole) => {
    setError('');
    setLoginSuccess(false);
    if (type === 'teacher') { setIdentifier('teacher@ananse.edu'); setPassword('teacher123'); setRole('teacher'); }
    else if (type === 'super_teacher') { setIdentifier('super@ananse.edu'); setPassword('super123'); setRole('super_teacher'); }
    else if (type === 'school_admin') { setIdentifier('admin@ananse.edu'); setPassword('admin123'); setRole('school_admin'); }
    else if (type === 'super_admin') { setIdentifier('superadmin@catalyst.edu'); setPassword('superadmin123'); setRole('super_admin'); }
  };

  const roleConfig = [
    { role: 'teacher' as UserRole, icon: User, color: 'text-blue-500', label: 'Teacher' },
    { role: 'super_teacher' as UserRole, icon: Crown, color: 'text-yellow-500', label: 'Super Teacher' },
    { role: 'school_admin' as UserRole, icon: Shield, color: 'text-emerald-500', label: 'School Admin' },
    { role: 'super_admin' as UserRole, icon: Sparkles, color: 'text-purple-500', label: 'Super Admin' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { setError(''); setLoginSuccess(false); } onClose(); }}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-purple-50 to-pink-50 border-4 border-purple-300 rounded-3xl">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <img src={ANANSE_IMAGE} alt="Ananse" className="w-16 h-16 rounded-full border-4 border-amber-400 shadow-lg object-cover" />
          </div>
          <DialogTitle className="text-2xl font-black text-purple-600 text-center">Welcome Back!</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-1 mb-3 flex-wrap">
            <Button type="button" onClick={() => fillDemo('teacher')} variant="outline" className="flex-1 text-xs px-1 py-1 h-8">
              <User className="w-3 h-3 mr-1" /> Teacher
            </Button>
            <Button type="button" onClick={() => fillDemo('super_teacher')} variant="outline" className="flex-1 text-xs px-1 py-1 h-8">
              <Crown className="w-3 h-3 mr-1" /> Super
            </Button>
            <Button type="button" onClick={() => fillDemo('school_admin')} variant="outline" className="flex-1 text-xs px-1 py-1 h-8">
              <Shield className="w-3 h-3 mr-1" /> Admin
            </Button>
            <Button type="button" onClick={() => fillDemo('super_admin')} variant="outline" className="flex-1 text-xs px-1 py-1 h-8">
              <Sparkles className="w-3 h-3 mr-1" /> Super
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {roleConfig.map(({ role: r, icon: Icon, color, label }) => (
              <button key={r} type="button" onClick={() => { setRole(r); setError(''); }}
                className={`p-2 rounded-lg font-bold transition-all text-xs ${role === r ? 'bg-purple-500 text-white' : 'bg-white text-purple-600 border-2 border-purple-300'}`}>
                <Icon className={`w-4 h-4 mx-auto mb-1 ${role === r ? 'text-white' : color}`} />
                <span className="text-[10px] block">{label}</span>
              </button>
            ))}
          </div>
          <div>
            <Label className="text-purple-700 font-bold text-sm flex items-center gap-1">
              {isPhone ? <Phone className="w-3 h-3" /> : <Mail className="w-3 h-3" />} Email or Phone
            </Label>
            <Input value={identifier} onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
              placeholder="email@example.com or +233..." className="rounded-xl border-2 border-purple-300 h-9" required />
          </div>
          <div>
            <Label className="text-purple-700 font-bold text-sm">Password</Label>
            <Input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="rounded-xl border-2 border-purple-300 h-9" required />
          </div>

          {/* Success feedback */}
          {loginSuccess && (
            <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-2 rounded-lg border border-green-200">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>Login successful! Redirecting...</span>
            </div>
          )}

          {/* Error feedback */}
          {error && (
            <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 p-2 rounded-lg border border-red-200">
              {error.includes('Connection') ? <WifiOff className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" disabled={isLoading || loginSuccess} className="w-full bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold text-lg py-5 rounded-xl">
            {isLoading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Logging in...</> : loginSuccess ? <><CheckCircle className="w-5 h-5 mr-2" /> Success!</> : 'Login'}
          </Button>
          <div className="flex gap-2">
            {onSwitchToOTP && (
              <Button type="button" variant="ghost" onClick={onSwitchToOTP} className="flex-1 text-purple-600 text-xs">
                <Shield className="w-3 h-3 mr-1" /> Login with OTP
              </Button>
            )}
            {onForgotPassword && (
              <Button type="button" variant="ghost" onClick={onForgotPassword} className="flex-1 text-blue-600 text-xs">
                Forgot Password?
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
