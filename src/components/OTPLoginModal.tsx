import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { OTPInput } from './OTPInput';
import { sendOTP, verifyOTP } from '@/lib/otp-auth';
import { User } from '@/types/user';
import { SessionData } from '@/lib/edge-functions';
import { normalizeUser } from '@/lib/edge-functions';
import { Mail, Phone, Shield, ArrowLeft, Loader2, CheckCircle, AlertCircle, Clock, MessageSquare, WifiOff } from 'lucide-react';
import { ANANSE_IMAGE } from './AnanseMascot';

interface OTPLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User, session?: SessionData) => void;
  onForgotPassword?: () => void;
}


type Step = 'identifier' | 'verify' | 'success';

export const OTPLoginModal: React.FC<OTPLoginModalProps> = ({ isOpen, onClose, onSuccess, onForgotPassword }) => {
  const [step, setStep] = useState<Step>('identifier');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [demoCode, setDemoCode] = useState('');
  const [sentMethod, setSentMethod] = useState<'email' | 'sms' | 'whatsapp' | ''>('');
  const [preferWhatsApp, setPreferWhatsApp] = useState(false);
  const [maskedContact, setMaskedContact] = useState('');
  const [verifiedUser, setVerifiedUser] = useState<User | null>(null);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (!isOpen) {
      setStep('identifier'); setIdentifier(''); setOtp(''); setError(''); 
      setDemoCode(''); setSentMethod(''); setMaskedContact('');
      setVerifiedUser(null);
    }
  }, [isOpen]);

  const isEmail = identifier.includes('@');
  const isPhone = /^\+?\d{10,15}$/.test(identifier.replace(/\s/g, ''));

  const handleSendOTP = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isEmail && !isPhone) {
      setError('Please enter a valid email or phone number');
      return;
    }
    setLoading(true); setError('');
    console.log('[OTPModal] Sending OTP to:', identifier);
    
    try {
      const result = await sendOTP(identifier.trim(), 'login', preferWhatsApp);
      console.log('[OTPModal] sendOTP result:', result);
      
      if (result.success) {
        setStep('verify');
        setCountdown(result.expiresIn || 600);
        if (result.demoCode) {
          setDemoCode(result.demoCode);
          console.log('[OTPModal] Demo code received:', result.demoCode);
        }
        if (result.method) setSentMethod(result.method);
        setMaskedContact(result.maskedPhone || result.maskedEmail || identifier);
        
        // Show delivery status info
        if (!result.sent && result.sendError) {
          console.log('[OTPModal] OTP delivery issue:', result.sendError);
        }
      } else {
        // Provide more helpful error messages
        let errorMsg = result.error || 'Failed to send OTP';
        if (result.code === 'USER_NOT_FOUND') {
          errorMsg = 'No account found with this email or phone number. Please contact your school administrator.';
        } else if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
          errorMsg = 'Connection error. Please check your internet connection and try again.';
        }
        setError(errorMsg);
      }
    } catch (err: any) {
      console.error('[OTPModal] sendOTP exception:', err);
      setError('Connection error. Please check your internet and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) { setError('Please enter the complete 6-digit code'); return; }
    setLoading(true); setError('');
    console.log('[OTPModal] Verifying OTP for:', identifier);
    
    try {
      const result = await verifyOTP(identifier.trim(), otp, 'login');
      console.log('[OTPModal] verifyOTP result:', {
        success: result.success,
        hasUser: !!result.user,
        userId: result.user?.id,
        userRole: result.user?.role,
        hasSession: !!result.session,
        sessionId: result.session?.sessionId,
        error: result.error,
      });
      
      if (result.success && result.user) {
        // Double-check the user is properly normalized
        const normalizedUser = normalizeUser(result.user) || result.user;
        console.log('[OTPModal] Normalized user:', {
          id: normalizedUser.id,
          name: normalizedUser.name,
          email: normalizedUser.email,
          role: normalizedUser.role,
          assignedClasses: normalizedUser.assignedClasses,
        });

        // Log session info
        if (result.session) {
          console.log('[OTPModal] Session token received:', {
            sessionId: result.session.sessionId,
            expiresAt: result.session.expiresAt,
            tokenLength: result.session.token?.length,
          });
        } else {
          console.warn('[OTPModal] No session token in verify-otp response');
        }
        
        // Show success state briefly
        setVerifiedUser(normalizedUser);
        setStep('success');
        
        // Navigate after brief success feedback — pass session to onSuccess
        setTimeout(() => {
          onSuccess(normalizedUser, result.session);
          onClose();
        }, 800);

      } else {
        let errorMsg = result.error || 'Invalid code. Please try again.';
        if (result.attemptsLeft !== undefined) {
          errorMsg = `${result.error || 'Invalid code'} (${result.attemptsLeft} attempt${result.attemptsLeft !== 1 ? 's' : ''} remaining)`;
        }
        if (errorMsg.includes('expired')) {
          errorMsg = 'This code has expired. Please request a new one.';
        }
        setError(errorMsg);
      }
    } catch (err: any) {
      console.error('[OTPModal] verifyOTP exception:', err);
      setError('Connection error. Please check your internet and try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const getMethodIcon = () => {
    if (sentMethod === 'whatsapp') return <MessageSquare className="w-4 h-4 text-green-500" />;
    if (sentMethod === 'sms') return <Phone className="w-4 h-4 text-blue-500" />;
    return <Mail className="w-4 h-4 text-purple-500" />;
  };

  const getMethodText = () => {
    if (sentMethod === 'whatsapp') return 'WhatsApp';
    if (sentMethod === 'sms') return 'SMS';
    return 'email';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { setError(''); } onClose(); }}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-purple-50 to-pink-50 border-4 border-purple-300 rounded-3xl">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <img src={ANANSE_IMAGE} alt="Ananse" className="w-16 h-16 rounded-full border-4 border-amber-400 shadow-lg object-cover" />
          </div>
          <DialogTitle className="text-2xl font-black text-purple-600 text-center">
            {step === 'identifier' ? 'Login with OTP' : step === 'verify' ? 'Enter Verification Code' : 'Login Successful!'}
          </DialogTitle>
        </DialogHeader>

        {step === 'identifier' ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="text-center text-gray-600 text-sm mb-4">
              Enter your email or phone number to receive a one-time password via SMS, WhatsApp, or email
            </div>
            <div>
              <Label className="text-purple-700 font-bold flex items-center gap-2">
                {isPhone ? <Phone className="w-4 h-4" /> : <Mail className="w-4 h-4" />} Email or Phone
              </Label>
              <Input value={identifier} onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                placeholder="email@example.com or +233..." className="rounded-xl border-2 border-purple-300 mt-1" required />
            </div>
            
            {isPhone && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border-2 border-green-200">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Prefer WhatsApp</span>
                </div>
                <Switch checked={preferWhatsApp} onCheckedChange={setPreferWhatsApp} />
              </div>
            )}
            
            {error && (
              <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                {error.includes('Connection') ? <WifiOff className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                <span>{error}</span>
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-5 rounded-xl">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Sending...</> : <><Shield className="w-5 h-5 mr-2" /> Send OTP Code</>}
            </Button>
            {onForgotPassword && (
              <Button type="button" variant="ghost" onClick={onForgotPassword} className="w-full text-purple-600 text-sm">
                Forgot Password?
              </Button>
            )}
          </form>
        ) : step === 'verify' ? (
          <div className="space-y-4">
            <button onClick={() => { setStep('identifier'); setOtp(''); setError(''); setDemoCode(''); }} className="flex items-center gap-1 text-purple-600 hover:text-purple-800 text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="text-center text-gray-600 text-sm flex items-center justify-center gap-2">
              {getMethodIcon()} Code sent via {getMethodText()} to: <span className="font-bold text-purple-600">{maskedContact}</span>
            </div>
            {demoCode && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-3 text-center">
                <div className="text-xs text-amber-600 font-medium">Demo Code (SMS/Email not configured)</div>
                <div className="text-2xl font-black text-amber-700 tracking-widest">{demoCode}</div>
                <div className="text-xs text-amber-500 mt-1">Configure SMS in System Settings to enable delivery</div>
              </div>
            )}

            <OTPInput value={otp} onChange={(val) => { setOtp(val); setError(''); }} disabled={loading} />
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" /> {countdown > 0 ? `Expires in ${formatTime(countdown)}` : 'Code expired'}
            </div>
            {error && (
              <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                {error.includes('Connection') ? <WifiOff className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                <span>{error}</span>
              </div>
            )}
            <Button onClick={handleVerifyOTP} disabled={loading || otp.length !== 6} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-5 rounded-xl">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Verifying...</> : <><CheckCircle className="w-5 h-5 mr-2" /> Verify & Login</>}
            </Button>
            <Button variant="ghost" onClick={() => { setOtp(''); setError(''); handleSendOTP(); }} disabled={loading || countdown > 540} className="w-full text-purple-600">
              Resend Code {countdown > 540 && `(wait ${formatTime(countdown - 540)})`}
            </Button>
          </div>
        ) : (
          /* Success step */
          <div className="space-y-4 text-center py-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">Welcome, {verifiedUser?.name || 'User'}!</p>
              <p className="text-sm text-gray-500 mt-1">
                Logged in as <span className="font-semibold text-purple-600 capitalize">{verifiedUser?.role?.replace('_', ' ')}</span>
              </p>
              {verifiedUser?.email && (
                <p className="text-xs text-gray-400 mt-1">{verifiedUser.email}</p>
              )}
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-green-600">
              <Loader2 className="w-4 h-4 animate-spin" /> Redirecting to dashboard...
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
