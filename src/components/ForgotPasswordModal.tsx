import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { OTPInput } from './OTPInput';
import { sendOTP, verifyOTP, resetPassword } from '@/lib/otp-auth';
import { Mail, Phone, ArrowLeft, Loader2, CheckCircle, AlertCircle, Clock, Lock, KeyRound, MessageSquare, WifiOff } from 'lucide-react';
import { ANANSE_IMAGE } from './AnanseMascot';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'identifier' | 'verify' | 'newPassword' | 'success';

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<Step>('identifier');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [demoCode, setDemoCode] = useState('');
  const [preferWhatsApp, setPreferWhatsApp] = useState(false);
  const [sentMethod, setSentMethod] = useState<string>('');

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (!isOpen) {
      setStep('identifier'); setIdentifier(''); setOtp(''); setNewPassword(''); setConfirmPassword('');
      setResetToken(''); setError(''); setDemoCode(''); setSentMethod('');
    }
  }, [isOpen]);

  const isEmail = identifier.includes('@');
  const isPhone = /^\+?\d{10,15}$/.test(identifier.replace(/\s/g, ''));

  const handleSendOTP = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isEmail && !isPhone) { setError('Please enter a valid email or phone number'); return; }
    setLoading(true); setError('');
    console.log('[ForgotPassword] Sending reset OTP to:', identifier);
    
    try {
      const result = await sendOTP(identifier.trim(), 'reset', preferWhatsApp);
      console.log('[ForgotPassword] sendOTP result:', result);
      
      if (result.success) {
        setStep('verify'); setCountdown(result.expiresIn || 600);
        if (result.demoCode) setDemoCode(result.demoCode);
        if (result.method) setSentMethod(result.method);
      } else {
        let errorMsg = result.error || 'Failed to send OTP';
        if (result.code === 'USER_NOT_FOUND') {
          errorMsg = 'No account found with this email or phone number.';
        } else if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
          errorMsg = 'Connection error. Please check your internet and try again.';
        }
        setError(errorMsg);
      }
    } catch (err: any) {
      console.error('[ForgotPassword] sendOTP exception:', err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) { setError('Please enter the complete 6-digit code'); return; }
    setLoading(true); setError('');
    console.log('[ForgotPassword] Verifying reset OTP');
    
    try {
      const result = await verifyOTP(identifier.trim(), otp, 'reset');
      console.log('[ForgotPassword] verifyOTP result:', { success: result.success, hasResetToken: !!result.resetToken });
      
      if (result.success && result.resetToken) {
        setResetToken(result.resetToken);
        setStep('newPassword');
      } else if (result.success && !result.resetToken) {
        // Some edge function versions may not return resetToken for reset type
        // Use the userId as fallback
        setResetToken(result.userId || 'verified');
        setStep('newPassword');
      } else {
        let errorMsg = result.error || 'Invalid code';
        if (result.attemptsLeft !== undefined) {
          errorMsg = `${result.error || 'Invalid code'} (${result.attemptsLeft} attempt${result.attemptsLeft !== 1 ? 's' : ''} remaining)`;
        }
        setError(errorMsg);
      }
    } catch (err: any) {
      console.error('[ForgotPassword] verifyOTP exception:', err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    console.log('[ForgotPassword] Resetting password');
    
    try {
      const result = await resetPassword(resetToken, newPassword);
      console.log('[ForgotPassword] resetPassword result:', result);
      
      if (result.success) { setStep('success'); } 
      else { setError(result.error || 'Failed to reset password'); }
    } catch (err: any) {
      console.error('[ForgotPassword] resetPassword exception:', err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) setError(''); onClose(); }}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-blue-50 to-indigo-50 border-4 border-blue-300 rounded-3xl">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <img src={ANANSE_IMAGE} alt="Ananse" className="w-16 h-16 rounded-full border-4 border-blue-400 shadow-lg object-cover" />
          </div>
          <DialogTitle className="text-2xl font-black text-blue-600 text-center">
            {step === 'identifier' && 'Reset Password'}
            {step === 'verify' && 'Verify Your Identity'}
            {step === 'newPassword' && 'Create New Password'}
            {step === 'success' && 'Password Reset!'}
          </DialogTitle>
        </DialogHeader>

        {step === 'identifier' && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="text-center text-gray-600 text-sm mb-4">Enter your email or phone to receive a verification code via SMS, WhatsApp, or email</div>
            <div>
              <Label className="text-blue-700 font-bold flex items-center gap-2">
                {isPhone ? <Phone className="w-4 h-4" /> : <Mail className="w-4 h-4" />} Email or Phone
              </Label>
              <Input value={identifier} onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                placeholder="email@example.com or +233..." className="rounded-xl border-2 border-blue-300 mt-1" required />
            </div>
            {isPhone && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border-2 border-green-200">
                <div className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-green-600" /><span className="text-sm font-medium text-green-700">Prefer WhatsApp</span></div>
                <Switch checked={preferWhatsApp} onCheckedChange={setPreferWhatsApp} />
              </div>
            )}
            {error && (
              <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                {error.includes('Connection') ? <WifiOff className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                <span>{error}</span>
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold py-5 rounded-xl">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Sending...</> : <><KeyRound className="w-5 h-5 mr-2" /> Send Reset Code</>}
            </Button>
          </form>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <button onClick={() => { setStep('identifier'); setOtp(''); setError(''); }} className="flex items-center gap-1 text-blue-600 text-sm font-medium"><ArrowLeft className="w-4 h-4" /> Back</button>
            <div className="text-center text-gray-600 text-sm">Code sent via {sentMethod || 'email'} to: <span className="font-bold text-blue-600">{identifier}</span></div>
            {demoCode && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-3 text-center">
                <div className="text-xs text-amber-600 font-medium">Demo Code (SMS not configured)</div>
                <div className="text-2xl font-black text-amber-700 tracking-widest">{demoCode}</div>
              </div>
            )}
            <OTPInput value={otp} onChange={(val) => { setOtp(val); setError(''); }} disabled={loading} />
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500"><Clock className="w-4 h-4" /> {countdown > 0 ? `Expires in ${formatTime(countdown)}` : 'Code expired'}</div>
            {error && (
              <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /><span>{error}</span>
              </div>
            )}
            <Button onClick={handleVerifyOTP} disabled={loading || otp.length !== 6} className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold py-5 rounded-xl">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Verifying...</> : <><CheckCircle className="w-5 h-5 mr-2" /> Verify Code</>}
            </Button>
          </div>
        )}

        {step === 'newPassword' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div><Label className="text-blue-700 font-bold">New Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                placeholder="At least 6 characters" className="rounded-xl border-2 border-blue-300 mt-1" required />
            </div>
            <div><Label className="text-blue-700 font-bold">Confirm Password</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                placeholder="Re-enter password" className="rounded-xl border-2 border-blue-300 mt-1" required />
            </div>
            {error && (
              <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /><span>{error}</span>
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-5 rounded-xl">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Resetting...</> : <><Lock className="w-5 h-5 mr-2" /> Reset Password</>}
            </Button>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto"><CheckCircle className="w-10 h-10 text-green-500" /></div>
            <p className="text-gray-600">Your password has been reset successfully!</p>
            <Button onClick={() => { onClose(); onSuccess(); }} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-5 rounded-xl">Back to Login</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
