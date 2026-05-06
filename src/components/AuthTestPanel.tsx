import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { callEdgeFunction, normalizeUser, normalizeSendOTPResponse, normalizeVerifyOTPResponse, SessionData } from '@/lib/edge-functions';
import { supabase } from '@/lib/supabase';
import {
  Play, CheckCircle, XCircle, Clock, ArrowRight, RefreshCw, Loader2,
  Shield, User, Key, UserPlus, Database, Wifi, ChevronDown,
  ChevronRight, Copy, AlertTriangle, Zap, ArrowLeft,
  Lock, ShieldCheck, ShieldOff, LogOut, Link2, Rocket
} from 'lucide-react';

import { useNavigate, useSearchParams } from 'react-router-dom';

// ─── Types ─────────────────────────────────────────────────────────

interface TestResult {
  name: string;
  status: 'idle' | 'running' | 'pass' | 'fail' | 'warn';
  duration?: number;
  request?: any;
  response?: any;
  normalized?: any;
  error?: string;
  versionMarker?: string;
  notes?: string[];
  timestamp?: string;
}

interface LogEntry {
  time: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  data?: any;
}

// ─── Helpers ───────────────────────────────────────────────────────

const timestamp = () => new Date().toISOString().split('T')[1].slice(0, 12);

const detectVersion = (data: any): string => {
  if (!data) return 'unknown';
  if (data.version) return data.version;
  if (data._version) return data._version;
  if (data.v) return data.v;
  const msg = JSON.stringify(data);
  const vMatch = msg.match(/V(\d+)/);
  if (vMatch) return `V${vMatch[1]}`;
  return 'no marker';
};

// ─── Component ─────────────────────────────────────────────────────

const AuthTestPanel: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, loginWithOTP, logout, sessionToken: contextSessionToken } = useAuth();

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [tests, setTests] = useState<Record<string, TestResult>>({
    'db-direct': { name: 'Direct DB Query', status: 'idle' },
    'send-otp': { name: 'Step 1: send-otp (Login)', status: 'idle' },
    'verify-otp': { name: 'Step 2: verify-otp (Login + JWT)', status: 'idle' },
    'validate-session': { name: 'Step 3: validate-session', status: 'idle' },
    'logout-session': { name: 'Step 4: logout-session', status: 'idle' },
    'validate-after-logout': { name: 'Step 5: validate-session (post-logout)', status: 'idle' },
    'send-otp-reset': { name: 'send-otp (Reset)', status: 'idle' },
    'verify-otp-reset': { name: 'verify-otp (Reset)', status: 'idle' },
    'reset-password': { name: 'reset-password', status: 'idle' },
    'create-user': { name: 'create-user', status: 'idle' },
  });
  const [expandedTest, setExpandedTest] = useState<string | null>(null);

  // Form state
  const [sendOtpEmail, setSendOtpEmail] = useState('teacher@ananse.edu');
  const [otpCode, setOtpCode] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [resetEmail, setResetEmail] = useState('teacher@ananse.edu');
  const [resetOtpCode, setResetOtpCode] = useState('');
  const [resetDemoCode, setResetDemoCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetUserId, setResetUserId] = useState('');
  const [newPassword, setNewPassword] = useState('newpass123');
  const [createName, setCreateName] = useState('Test Teacher E2E');
  const [createEmail, setCreateEmail] = useState(`test.e2e.${Date.now()}@ananse.edu`);
  const [createPassword, setCreatePassword] = useState('test123');
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [isRunningJWT, setIsRunningJWT] = useState(false);

  const [jwtToken, setJwtToken] = useState('');
  const [jwtSessionId, setJwtSessionId] = useState('');
  const [jwtExpiresAt, setJwtExpiresAt] = useState('');
  const [jwtUserId, setJwtUserId] = useState('');
  const [jwtUserData, setJwtUserData] = useState<any>(null);


  // Quick Login Test state
  const [isRunningQuick, setIsRunningQuick] = useState(false);
  const [quickTestStatus, setQuickTestStatus] = useState<'idle' | 'running' | 'pass' | 'fail'>('idle');
  const [quickTestResult, setQuickTestResult] = useState<{
    sendOtpData?: any;
    verifyOtpData?: any;
    userSession?: any;
    sessionData?: any;
    error?: string;
    sendDuration?: number;
    verifyDuration?: number;
    demoCode?: string;
  } | null>(null);
  const autoRunTriggeredRef = useRef(false);

  const logRef = useRef<HTMLDivElement>(null);


  const addLog = useCallback((level: LogEntry['level'], message: string, data?: any) => {
    setLogs(prev => [...prev, { time: timestamp(), level, message, data }]);
    setTimeout(() => logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' }), 50);
  }, []);

  const updateTest = useCallback((key: string, update: Partial<TestResult>) => {
    setTests(prev => ({ ...prev, [key]: { ...prev[key], ...update } }));
  }, []);

  // ─── Test 0: Direct DB Query ───────────────────────────────────

  const testDirectDB = async () => {
    const key = 'db-direct';
    updateTest(key, { status: 'running', timestamp: timestamp() });
    addLog('info', 'Testing direct PostgREST query to users table...');

    const start = Date.now();
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, assigned_classes, avatar, created_at')
        .eq('email', 'teacher@ananse.edu')
        .limit(1);

      const duration = Date.now() - start;

      if (error) {
        addLog('error', `Direct DB query failed: ${error.message}`, error);
        updateTest(key, {
          status: 'fail', duration, error: error.message,
          response: error,
          notes: [`PostgREST error code: ${error.code}`, `Hint: ${error.hint || 'none'}`]
        });
        return;
      }

      if (!data || data.length === 0) {
        addLog('warn', 'Direct DB query returned no rows for teacher@ananse.edu');
        updateTest(key, {
          status: 'warn', duration,
          response: data,
          notes: ['No user found with email teacher@ananse.edu', 'The user may not exist in the remote DB yet']
        });
        return;
      }

      const row = data[0];
      const columns = Object.keys(row);
      addLog('success', `Direct DB query returned user: ${row.name} (${row.role})`, row);
      addLog('info', `Columns present: ${columns.join(', ')}`);

      const expectedCols = ['id', 'name', 'email', 'role', 'assigned_classes', 'avatar', 'created_at'];
      const missingCols = expectedCols.filter(c => !(c in row));
      const notes = [
        `Found ${data.length} row(s)`,
        `Columns: ${columns.join(', ')}`,
        `User: ${row.name} (${row.email}) - ${row.role}`,
      ];
      if (missingCols.length > 0) {
        notes.push(`Missing expected columns: ${missingCols.join(', ')}`);
      }

      const { data: fullData } = await supabase.from('users').select('*').eq('email', 'teacher@ananse.edu').limit(1);
      if (fullData && fullData[0]) {
        const allCols = Object.keys(fullData[0]);
        const newCols = ['phone', 'school_id', 'is_active'];
        const hasNewCols = newCols.filter(c => allCols.includes(c));
        const missingNewCols = newCols.filter(c => !allCols.includes(c));
        notes.push(`All columns (SELECT *): ${allCols.join(', ')}`);
        if (hasNewCols.length > 0) notes.push(`New columns present: ${hasNewCols.join(', ')}`);
        if (missingNewCols.length > 0) notes.push(`New columns MISSING: ${missingNewCols.join(', ')} — ALTER TABLE needed on remote DB`);
        addLog('info', `Full column check: ${allCols.join(', ')}`, { hasNewCols, missingNewCols });
      }

      updateTest(key, {
        status: missingCols.length > 0 ? 'warn' : 'pass',
        duration,
        response: row,
        normalized: normalizeUser(row),
        notes,
      });
    } catch (err: any) {
      const duration = Date.now() - start;
      addLog('error', `Direct DB exception: ${err.message}`, err);
      updateTest(key, { status: 'fail', duration, error: err.message });
    }
  };

  // ─── Test 1: send-otp (Login) ──────────────────────────────────

  const testSendOTP = async () => {
    const key = 'send-otp';
    updateTest(key, { status: 'running', timestamp: timestamp() });
    const payload = { identifier: sendOtpEmail.trim(), type: 'login', preferWhatsApp: false };
    addLog('info', `Calling send-otp with: ${sendOtpEmail}`, payload);

    const start = Date.now();
    try {
      const { data, error, raw } = await callEdgeFunction('send-otp', payload);
      const duration = Date.now() - start;
      const version = detectVersion(data);

      if (error && !data) {
        addLog('error', `send-otp invoke error: ${error}`, raw);
        updateTest(key, { status: 'fail', duration, error, request: payload, response: raw, versionMarker: version });
        return null;
      }

      const normalized = normalizeSendOTPResponse(data);
      addLog(normalized.success ? 'success' : 'error', `send-otp response (${duration}ms):`, { raw: data, normalized });

      if (normalized.demoCode) {
        setDemoCode(normalized.demoCode);
        setOtpCode(normalized.demoCode);
        addLog('info', `Demo code captured: ${normalized.demoCode}`);
      }

      const notes = [
        `Version: ${version}`,
        `Success: ${normalized.success}`,
        `Method: ${normalized.method || 'unknown'}`,
        `Expires in: ${normalized.expiresIn}s`,
        `Demo code: ${normalized.demoCode || 'none'}`,
        `SMS sent: ${normalized.sent ?? 'unknown'}`,
      ];
      if (normalized.sendError) notes.push(`Send error: ${normalized.sendError}`);
      if (normalized.maskedEmail) notes.push(`Masked email: ${normalized.maskedEmail}`);
      if (normalized.maskedPhone) notes.push(`Masked phone: ${normalized.maskedPhone}`);

      updateTest(key, {
        status: normalized.success ? 'pass' : 'fail',
        duration, request: payload, response: data, normalized, versionMarker: version, notes,
        error: normalized.error,
      });

      return normalized;
    } catch (err: any) {
      const duration = Date.now() - start;
      addLog('error', `send-otp exception: ${err.message}`, err);
      updateTest(key, { status: 'fail', duration, error: err.message, request: payload });
      return null;
    }
  };

  // ─── Test 2: verify-otp (Login + JWT) ──────────────────────────

  const testVerifyOTP = async () => {
    const key = 'verify-otp';
    if (!otpCode || otpCode.length !== 6) {
      addLog('warn', 'Cannot verify OTP: need a 6-digit code. Run send-otp first.');
      updateTest(key, { status: 'fail', error: 'No OTP code. Run send-otp first.' });
      return null;
    }

    updateTest(key, { status: 'running', timestamp: timestamp() });
    const payload = { identifier: sendOtpEmail.trim(), code: otpCode.trim(), type: 'login' };
    addLog('info', `Calling verify-otp with code: ${otpCode}`, { ...payload, code: '***' });

    const start = Date.now();
    try {
      const { data, error, raw } = await callEdgeFunction('verify-otp', payload);
      const duration = Date.now() - start;
      const version = detectVersion(data);

      if (error && !data) {
        addLog('error', `verify-otp invoke error: ${error}`, raw);
        updateTest(key, { status: 'fail', duration, error, request: payload, response: raw, versionMarker: version });
        return null;
      }

      const normalized = normalizeVerifyOTPResponse(data);
      addLog(normalized.success ? 'success' : 'error', `verify-otp response (${duration}ms):`, { raw: data, normalized });

      const notes = [
        `Version: ${version}`,
        `Success: ${normalized.success}`,
        `Has user: ${!!normalized.user}`,
        `Has session (JWT): ${!!normalized.session}`,
        `Type: ${normalized.type || 'login'}`,
      ];

      if (normalized.user) {
        notes.push(`User ID: ${normalized.user.id}`);
        notes.push(`User name: ${normalized.user.name}`);
        notes.push(`User email: ${normalized.user.email}`);
        notes.push(`User role: ${normalized.user.role}`);
        notes.push(`Assigned classes: ${JSON.stringify(normalized.user.assignedClasses)}`);
        notes.push(`Phone: ${normalized.user.phone || 'not set'}`);
        notes.push(`School ID: ${normalized.user.school_id || 'not set'}`);
        addLog('success', `User verified: ${normalized.user.name} (${normalized.user.role})`);
        setJwtUserId(normalized.user.id);
        setJwtUserData(normalized.user);
      }

      // ── JWT Session Token Extraction ──
      if (normalized.session) {
        const { token, expiresAt, sessionId } = normalized.session;
        setJwtToken(token);
        setJwtSessionId(sessionId);
        setJwtExpiresAt(expiresAt);
        addLog('success', `JWT session token received!`, {
          sessionId,
          expiresAt,
          tokenLength: token?.length,
          tokenPrefix: token?.slice(0, 40) + '...',
        });
        notes.push(`─── JWT SESSION ───`);
        notes.push(`Session ID: ${sessionId}`);
        notes.push(`Token length: ${token?.length} chars`);
        notes.push(`Token prefix: ${token?.slice(0, 50)}...`);
        notes.push(`Expires at: ${expiresAt}`);

        // Decode JWT payload (base64url → JSON) for inspection
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payloadB64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const payloadJson = atob(payloadB64);
            const payload = JSON.parse(payloadJson);
            notes.push(`─── JWT PAYLOAD ───`);
            notes.push(`sub (user id): ${payload.sub}`);
            notes.push(`email: ${payload.email}`);
            notes.push(`role: ${payload.role}`);
            notes.push(`name: ${payload.name}`);
            notes.push(`jti (session id): ${payload.jti}`);
            notes.push(`iat: ${payload.iat} (${new Date(payload.iat * 1000).toISOString()})`);
            notes.push(`exp: ${payload.exp} (${new Date(payload.exp * 1000).toISOString()})`);
            notes.push(`iss: ${payload.iss}`);
            notes.push(`aud: ${payload.aud}`);
            addLog('info', `JWT payload decoded:`, payload);
          }
        } catch (decodeErr) {
          notes.push(`JWT decode error: ${decodeErr}`);
          addLog('warn', `Could not decode JWT payload: ${decodeErr}`);
        }
      } else {
        notes.push(`─── JWT SESSION ───`);
        notes.push(`WARNING: No session object in response!`);
        notes.push(`verify-otp may not be V5+ or session generation failed`);
        addLog('warn', 'No JWT session token in verify-otp response — edge function may not be V5+');
      }

      if (normalized.attemptsLeft !== undefined) {
        notes.push(`Attempts left: ${normalized.attemptsLeft}`);
      }

      updateTest(key, {
        status: normalized.success && normalized.user ? 'pass' : 'fail',
        duration, request: { ...payload, code: otpCode }, response: data, normalized, versionMarker: version, notes,
        error: normalized.error,
      });

      return normalized;
    } catch (err: any) {
      const duration = Date.now() - start;
      addLog('error', `verify-otp exception: ${err.message}`, err);
      updateTest(key, { status: 'fail', duration, error: err.message, request: payload });
      return null;
    }
  };

  // ─── Test 3: validate-session ──────────────────────────────────

  const testValidateSession = async (tokenOverride?: string) => {
    const key = 'validate-session';
    const token = tokenOverride || jwtToken;

    if (!token) {
      addLog('warn', 'Cannot validate session: no JWT token. Run verify-otp first.');
      updateTest(key, { status: 'fail', error: 'No JWT token. Run verify-otp (Step 2) first.' });
      return null;
    }

    updateTest(key, { status: 'running', timestamp: timestamp() });
    const payload = { token };
    addLog('info', `Calling validate-session with token (${token.length} chars): ${token.slice(0, 40)}...`);

    const start = Date.now();
    try {
      const { data, error, raw } = await callEdgeFunction('validate-session', payload);
      const duration = Date.now() - start;
      const version = detectVersion(data);

      if (error && !data?.success) {
        addLog('error', `validate-session invoke error: ${error}`, raw);
        updateTest(key, {
          status: 'fail', duration, error,
          request: { token: token.slice(0, 40) + '...' },
          response: raw || data, versionMarker: version,
        });
        return data;
      }

      const notes = [
        `Version: ${version}`,
        `Success: ${data?.success}`,
      ];

      if (data?.success && data?.user) {
        const user = data.user;
        notes.push(`─── VALIDATED USER ───`);
        notes.push(`User ID: ${user.id || user.sub}`);
        notes.push(`Name: ${user.name}`);
        notes.push(`Email: ${user.email}`);
        notes.push(`Role: ${user.role}`);
        if (user.assignedClasses || user.assigned_classes) {
          notes.push(`Classes: ${JSON.stringify(user.assignedClasses || user.assigned_classes)}`);
        }
        addLog('success', `Session VALID — user: ${user.name} (${user.role})`, user);
      } else {
        notes.push(`Error: ${data?.error || 'unknown'}`);
        notes.push(`Code: ${data?.code || 'none'}`);
        addLog('error', `Session INVALID: ${data?.error || 'unknown'}`, data);
      }

      updateTest(key, {
        status: data?.success ? 'pass' : 'fail',
        duration,
        request: { token: token.slice(0, 40) + '...' },
        response: data,
        versionMarker: version,
        notes,
        error: data?.error,
      });

      return data;
    } catch (err: any) {
      const duration = Date.now() - start;
      addLog('error', `validate-session exception: ${err.message}`, err);
      updateTest(key, {
        status: 'fail', duration, error: err.message,
        request: { token: token.slice(0, 40) + '...' },
      });
      return null;
    }
  };

  // ─── Test 4: logout-session ────────────────────────────────────

  const testLogoutSession = async (tokenOverride?: string) => {
    const key = 'logout-session';
    const token = tokenOverride || jwtToken;

    if (!token) {
      addLog('warn', 'Cannot logout session: no JWT token. Run verify-otp first.');
      updateTest(key, { status: 'fail', error: 'No JWT token. Run verify-otp (Step 2) first.' });
      return null;
    }

    updateTest(key, { status: 'running', timestamp: timestamp() });
    const payload = { token };
    addLog('info', `Calling logout-session with token (${token.length} chars): ${token.slice(0, 40)}...`);

    const start = Date.now();
    try {
      const { data, error, raw } = await callEdgeFunction('logout-session', payload);
      const duration = Date.now() - start;
      const version = detectVersion(data);

      if (error && !data?.success) {
        addLog('error', `logout-session invoke error: ${error}`, raw);
        updateTest(key, {
          status: 'fail', duration, error,
          request: { token: token.slice(0, 40) + '...' },
          response: raw || data, versionMarker: version,
        });
        return data;
      }

      const notes = [
        `Version: ${version}`,
        `Success: ${data?.success}`,
        `Message: ${data?.message || 'none'}`,
      ];

      if (data?.success) {
        notes.push(`Session ID: ${data?.sessionId || jwtSessionId || 'unknown'}`);
        notes.push(`Session is now REVOKED on the server`);
        addLog('success', `Session REVOKED successfully`, data);
      } else {
        notes.push(`Error: ${data?.error || 'unknown'}`);
        addLog('error', `Session revocation failed: ${data?.error || 'unknown'}`, data);
      }

      updateTest(key, {
        status: data?.success ? 'pass' : 'fail',
        duration,
        request: { token: token.slice(0, 40) + '...' },
        response: data,
        versionMarker: version,
        notes,
        error: data?.error,
      });

      return data;
    } catch (err: any) {
      const duration = Date.now() - start;
      addLog('error', `logout-session exception: ${err.message}`, err);
      updateTest(key, {
        status: 'fail', duration, error: err.message,
        request: { token: token.slice(0, 40) + '...' },
      });
      return null;
    }
  };

  // ─── Test 5: validate-session AFTER logout (should fail) ───────

  const testValidateAfterLogout = async (tokenOverride?: string) => {
    const key = 'validate-after-logout';
    const token = tokenOverride || jwtToken;

    if (!token) {
      addLog('warn', 'Cannot validate post-logout: no JWT token.');
      updateTest(key, { status: 'fail', error: 'No JWT token. Run the full JWT flow first.' });
      return null;
    }

    updateTest(key, { status: 'running', timestamp: timestamp() });
    const payload = { token };
    addLog('info', `Calling validate-session AFTER logout (expecting failure)...`);

    const start = Date.now();
    try {
      const { data, error, raw } = await callEdgeFunction('validate-session', payload);
      const duration = Date.now() - start;
      const version = detectVersion(data);

      const notes = [
        `Version: ${version}`,
        `─── EXPECTED: success=false (session revoked) ───`,
        `Actual success: ${data?.success}`,
      ];

      if (data?.success === false) {
        // This is the EXPECTED outcome — session should be revoked
        notes.push(`CORRECT: Session is rejected after logout`);
        notes.push(`Error returned: ${data?.error || 'none'}`);
        notes.push(`Code: ${data?.code || 'none'}`);
        addLog('success', `POST-LOGOUT VALIDATION CORRECTLY REJECTED: ${data?.error || 'session revoked'}`, data);

        updateTest(key, {
          status: 'pass',
          duration,
          request: { token: token.slice(0, 40) + '...' },
          response: data,
          versionMarker: version,
          notes,
        });
      } else if (data?.success === true) {
        // This is WRONG — session should have been revoked
        notes.push(`BUG: Session is still valid after logout!`);
        notes.push(`User returned: ${data?.user?.name || 'unknown'}`);
        addLog('error', `BUG: Session still valid after logout — revocation did not work!`, data);

        updateTest(key, {
          status: 'fail',
          duration,
          request: { token: token.slice(0, 40) + '...' },
          response: data,
          versionMarker: version,
          notes,
          error: 'Session still valid after logout — revocation failed',
        });
      } else {
        // Ambiguous response
        notes.push(`Ambiguous response — error: ${error || data?.error || 'unknown'}`);
        addLog('warn', `Ambiguous post-logout validation response`, { data, error });

        updateTest(key, {
          status: 'warn',
          duration,
          request: { token: token.slice(0, 40) + '...' },
          response: data || raw,
          versionMarker: version,
          notes,
          error: error || data?.error,
        });
      }

      return data;
    } catch (err: any) {
      const duration = Date.now() - start;
      addLog('error', `validate-after-logout exception: ${err.message}`, err);
      updateTest(key, {
        status: 'fail', duration, error: err.message,
        request: { token: token.slice(0, 40) + '...' },
      });
      return null;
    }
  };

  // ─── Run JWT E2E Flow (Steps 1-5) ─────────────────────────────

  const runJWTFlow = async () => {
    setIsRunningJWT(true);
    addLog('info', '');
    addLog('info', '══════════════════════════════════════════════════');
    addLog('info', '  JWT SESSION E2E FLOW — teacher@ananse.edu');
    addLog('info', '══════════════════════════════════════════════════');
    addLog('info', '');

    // Reset JWT-related tests
    ['send-otp', 'verify-otp', 'validate-session', 'logout-session', 'validate-after-logout'].forEach(k => {
      updateTest(k, { status: 'idle', duration: undefined, request: undefined, response: undefined, normalized: undefined, error: undefined, notes: undefined });
    });
    setJwtToken('');
    setJwtSessionId('');
    setJwtExpiresAt('');
    setJwtUserId('');
    setJwtUserData(null);

    // Step 1: send-otp
    addLog('info', '── STEP 1: send-otp ──');
    const sendResult = await testSendOTP();
    await new Promise(r => setTimeout(r, 500));

    if (!sendResult?.success) {
      addLog('error', 'FLOW ABORTED: send-otp failed');
      setIsRunningJWT(false);
      return;
    }

    // Step 2: verify-otp (captures JWT token)
    addLog('info', '── STEP 2: verify-otp (Login + JWT) ──');
    const verifyResult = await testVerifyOTP();
    await new Promise(r => setTimeout(r, 500));

    if (!verifyResult?.success || !verifyResult?.user) {
      addLog('error', 'FLOW ABORTED: verify-otp failed or no user returned');
      setIsRunningJWT(false);
      return;
    }

    // Check if we got a JWT token
    // The jwtToken state is set inside testVerifyOTP, but we need to read it from the result
    const capturedToken = verifyResult.session?.token;
    if (!capturedToken) {
      addLog('error', 'FLOW ABORTED: No JWT session token in verify-otp response');
      addLog('warn', 'The verify-otp edge function may not be V5+ or JWT generation failed');
      setIsRunningJWT(false);
      return;
    }

    addLog('success', `JWT token captured (${capturedToken.length} chars) — proceeding to validation`);

    // Step 3: validate-session
    addLog('info', '── STEP 3: validate-session ──');
    await new Promise(r => setTimeout(r, 300));
    const validateResult = await testValidateSession(capturedToken);
    await new Promise(r => setTimeout(r, 500));

    if (!validateResult?.success) {
      addLog('error', 'FLOW ABORTED: validate-session failed');
      setIsRunningJWT(false);
      return;
    }

    addLog('success', 'Session validated — user confirmed. Now revoking...');

    // Step 4: logout-session
    addLog('info', '── STEP 4: logout-session ──');
    await new Promise(r => setTimeout(r, 300));
    const logoutResult = await testLogoutSession(capturedToken);
    await new Promise(r => setTimeout(r, 500));

    if (!logoutResult?.success) {
      addLog('error', 'FLOW WARNING: logout-session failed — post-logout validation may still pass');
    } else {
      addLog('success', 'Session revoked. Now verifying revocation...');
    }

    // Step 5: validate-session AFTER logout (should fail)
    addLog('info', '── STEP 5: validate-session (post-logout — expect REJECTION) ──');
    await new Promise(r => setTimeout(r, 300));
    await testValidateAfterLogout(capturedToken);

    // Summary
    addLog('info', '');
    addLog('info', '══════════════════════════════════════════════════');
    addLog('info', '  JWT E2E FLOW COMPLETE — SUMMARY');
    addLog('info', '══════════════════════════════════════════════════');

    const jwtTests = ['send-otp', 'verify-otp', 'validate-session', 'logout-session', 'validate-after-logout'];
    // Read latest test state
    setTests(prev => {
      const passed = jwtTests.filter(k => prev[k]?.status === 'pass').length;
      const failed = jwtTests.filter(k => prev[k]?.status === 'fail').length;
      const warned = jwtTests.filter(k => prev[k]?.status === 'warn').length;

      addLog(failed === 0 ? 'success' : 'error',
        `Results: ${passed}/${jwtTests.length} passed, ${failed} failed, ${warned} warnings`
      );

      jwtTests.forEach(k => {
        const t = prev[k];
        addLog(
          t?.status === 'pass' ? 'success' : t?.status === 'fail' ? 'error' : 'warn',
          `  ${t?.status === 'pass' ? 'PASS' : t?.status === 'fail' ? 'FAIL' : 'WARN'} — ${t?.name} (${t?.duration || '?'}ms)`
        );
      });

      if (failed === 0) {
        addLog('success', '');
        addLog('success', 'ALL JWT SESSION TESTS PASSED!');
        addLog('success', 'The full lifecycle works: generate → validate → revoke → reject');
      }

      return prev;
    });

    setIsRunningJWT(false);
  };

  // ─── Test: send-otp (Reset) ────────────────────────────────────

  const testSendOTPReset = async () => {
    const key = 'send-otp-reset';
    updateTest(key, { status: 'running', timestamp: timestamp() });
    const payload = { identifier: resetEmail.trim(), type: 'reset', preferWhatsApp: false };
    addLog('info', `Calling send-otp (reset) with: ${resetEmail}`, payload);

    const start = Date.now();
    try {
      const { data, error, raw } = await callEdgeFunction('send-otp', payload);
      const duration = Date.now() - start;
      const version = detectVersion(data);

      if (error && !data) {
        addLog('error', `send-otp (reset) invoke error: ${error}`, raw);
        updateTest(key, { status: 'fail', duration, error, request: payload, response: raw, versionMarker: version });
        return;
      }

      const normalized = normalizeSendOTPResponse(data);
      addLog(normalized.success ? 'success' : 'error', `send-otp (reset) response (${duration}ms):`, { raw: data, normalized });

      if (normalized.demoCode) {
        setResetDemoCode(normalized.demoCode);
        setResetOtpCode(normalized.demoCode);
        addLog('info', `Reset demo code captured: ${normalized.demoCode}`);
      }

      updateTest(key, {
        status: normalized.success ? 'pass' : 'fail',
        duration, request: payload, response: data, normalized, versionMarker: version,
        notes: [
          `Version: ${version}`,
          `Success: ${normalized.success}`,
          `Demo code: ${normalized.demoCode || 'none'}`,
        ],
        error: normalized.error,
      });
    } catch (err: any) {
      const duration = Date.now() - start;
      addLog('error', `send-otp (reset) exception: ${err.message}`, err);
      updateTest(key, { status: 'fail', duration, error: err.message, request: payload });
    }
  };

  // ─── Test: verify-otp (Reset) ──────────────────────────────────

  const testVerifyOTPReset = async () => {
    const key = 'verify-otp-reset';
    if (!resetOtpCode || resetOtpCode.length !== 6) {
      addLog('warn', 'Cannot verify reset OTP: need a 6-digit code.');
      updateTest(key, { status: 'fail', error: 'No OTP code. Run send-otp (reset) first.' });
      return;
    }

    updateTest(key, { status: 'running', timestamp: timestamp() });
    const payload = { identifier: resetEmail.trim(), code: resetOtpCode.trim(), type: 'reset' };
    addLog('info', `Calling verify-otp (reset) with code: ${resetOtpCode}`);

    const start = Date.now();
    try {
      const { data, error, raw } = await callEdgeFunction('verify-otp', payload);
      const duration = Date.now() - start;
      const version = detectVersion(data);

      if (error && !data) {
        addLog('error', `verify-otp (reset) invoke error: ${error}`, raw);
        updateTest(key, { status: 'fail', duration, error, request: payload, response: raw, versionMarker: version });
        return;
      }

      const normalized = normalizeVerifyOTPResponse(data);
      addLog(normalized.success ? 'success' : 'error', `verify-otp (reset) response (${duration}ms):`, { raw: data, normalized });

      if (normalized.resetToken) {
        setResetToken(normalized.resetToken);
        addLog('info', `Reset token captured: ${normalized.resetToken.slice(0, 20)}...`);
      }
      if (normalized.userId) {
        setResetUserId(normalized.userId);
        addLog('info', `Reset userId captured: ${normalized.userId}`);
      }

      updateTest(key, {
        status: normalized.success ? 'pass' : 'fail',
        duration, request: payload, response: data, normalized, versionMarker: version,
        notes: [
          `Version: ${version}`,
          `Success: ${normalized.success}`,
          `Reset token: ${normalized.resetToken ? normalized.resetToken.slice(0, 20) + '...' : 'none'}`,
          `User ID: ${normalized.userId || 'none'}`,
          `Type: ${normalized.type || 'unknown'}`,
        ],
        error: normalized.error,
      });
    } catch (err: any) {
      const duration = Date.now() - start;
      addLog('error', `verify-otp (reset) exception: ${err.message}`, err);
      updateTest(key, { status: 'fail', duration, error: err.message, request: payload });
    }
  };

  // ─── Test: reset-password ──────────────────────────────────────

  const testResetPassword = async () => {
    const key = 'reset-password';
    const token = resetToken || resetUserId;
    if (!token) {
      addLog('warn', 'Cannot reset password: no reset token. Run verify-otp (reset) first.');
      updateTest(key, { status: 'fail', error: 'No reset token. Run verify-otp (reset) first.' });
      return;
    }

    updateTest(key, { status: 'running', timestamp: timestamp() });
    const payload = { resetToken: token, newPassword };
    addLog('info', `Calling reset-password with token: ${token.slice(0, 20)}...`);

    const start = Date.now();
    try {
      const { data, error, raw } = await callEdgeFunction('reset-password', payload);
      const duration = Date.now() - start;
      const version = detectVersion(data);

      if (error && !data) {
        addLog('error', `reset-password invoke error: ${error}`, raw);
        updateTest(key, { status: 'fail', duration, error, request: { ...payload, newPassword: '***' }, response: raw, versionMarker: version });
        return;
      }

      const success = data?.success;
      addLog(success ? 'success' : 'error', `reset-password response (${duration}ms):`, data);

      updateTest(key, {
        status: success ? 'pass' : 'fail',
        duration, request: { ...payload, newPassword: '***' }, response: data, versionMarker: version,
        notes: [
          `Version: ${version}`,
          `Success: ${success}`,
          `Message: ${data?.message || 'none'}`,
        ],
        error: data?.error,
      });
    } catch (err: any) {
      const duration = Date.now() - start;
      addLog('error', `reset-password exception: ${err.message}`, err);
      updateTest(key, { status: 'fail', duration, error: err.message });
    }
  };

  // ─── Test: create-user ─────────────────────────────────────────

  const testCreateUser = async () => {
    const key = 'create-user';
    updateTest(key, { status: 'running', timestamp: timestamp() });
    const payload = {
      name: createName,
      email: createEmail,
      password: createPassword,
      role: 'teacher',
      assignedClasses: ['KG 1', 'KG 2'],
    };
    addLog('info', `Calling create-user with: ${createEmail}`, { ...payload, password: '***' });

    const start = Date.now();
    try {
      const { data, error, raw } = await callEdgeFunction('create-user', payload);
      const duration = Date.now() - start;
      const version = detectVersion(data);

      if (error && !data) {
        addLog('error', `create-user invoke error: ${error}`, raw);
        updateTest(key, { status: 'fail', duration, error, request: { ...payload, password: '***' }, response: raw, versionMarker: version });
        return;
      }

      const success = data?.success !== false && data?.user;
      const normalizedUser = data?.user ? normalizeUser(data.user) : null;
      addLog(success ? 'success' : 'error', `create-user response (${duration}ms):`, data);

      const notes = [
        `Version: ${version}`,
        `Success: ${!!success}`,
      ];
      if (normalizedUser) {
        notes.push(`User ID: ${normalizedUser.id}`);
        notes.push(`User name: ${normalizedUser.name}`);
        notes.push(`User email: ${normalizedUser.email}`);
        notes.push(`User role: ${normalizedUser.role}`);
        notes.push(`Assigned classes: ${JSON.stringify(normalizedUser.assignedClasses)}`);
        addLog('success', `User created: ${normalizedUser.name} (${normalizedUser.id})`);
      }
      if (data?.error) notes.push(`Error: ${data.error}`);

      updateTest(key, {
        status: success ? 'pass' : 'fail',
        duration, request: { ...payload, password: '***' }, response: data, normalized: normalizedUser,
        versionMarker: version, notes, error: data?.error,
      });
    } catch (err: any) {
      const duration = Date.now() - start;
      addLog('error', `create-user exception: ${err.message}`, err);
      updateTest(key, { status: 'fail', duration, error: err.message });
    }
  };

  // ─── Establish Session (AuthContext) ────────────────────────────

  const establishSession = () => {
    const verifyResult = tests['verify-otp'];
    if (verifyResult.normalized?.user) {
      // Build session data from captured JWT state
      const sessionData: SessionData | undefined = jwtToken ? {
        token: jwtToken,
        expiresAt: jwtExpiresAt,
        sessionId: jwtSessionId,
      } : undefined;

      loginWithOTP(verifyResult.normalized.user, sessionData);
      addLog('success', `Session established for: ${verifyResult.normalized.user.name} (with JWT: ${!!sessionData})`);
      if (sessionData) {
        addLog('info', `JWT token stored in AuthContext + localStorage`);
      }
    } else {
      addLog('warn', 'No verified user to establish session with. Run verify-otp first.');
    }
  };

  // ─── Run All Tests ─────────────────────────────────────────────

  const runAllTests = async () => {
    setIsRunningAll(true);
    setLogs([]);
    addLog('info', '═══ Starting full end-to-end auth test suite ═══');

    // Step 0: Direct DB
    addLog('info', '── Step 0: Direct DB Query ──');
    await testDirectDB();
    await new Promise(r => setTimeout(r, 500));

    // JWT E2E Flow (Steps 1-5)
    await runJWTFlow();
    await new Promise(r => setTimeout(r, 500));

    // Reset password flow
    addLog('info', '── Reset Password Flow ──');
    await testSendOTPReset();
    await new Promise(r => setTimeout(r, 500));
    await testVerifyOTPReset();
    await new Promise(r => setTimeout(r, 500));
    await testResetPassword();
    await new Promise(r => setTimeout(r, 500));

    // Create user
    addLog('info', '── Create User ──');
    setCreateEmail(`test.e2e.${Date.now()}@ananse.edu`);
    await new Promise(r => setTimeout(r, 100));
    await testCreateUser();

    addLog('info', '═══ End-to-end test suite complete ═══');
    setIsRunningAll(false);
  };

  // ─── Quick Login Test (send-otp → verify-otp, self-contained) ──

  const runQuickLoginTest = async () => {
    const identifier = 'teacher@ananse.edu';
    setIsRunningQuick(true);
    setQuickTestStatus('running');
    setQuickTestResult(null);
    addLog('info', '');
    addLog('info', '══════════════════════════════════════════════════');
    addLog('info', `  QUICK LOGIN TEST — ${identifier}`);
    addLog('info', '  send-otp → capture demoCode → verify-otp');
    addLog('info', '══════════════════════════════════════════════════');

    try {
      // Step 1: send-otp
      addLog('info', `[Quick] Step 1: Calling send-otp with identifier: ${identifier}`);
      const sendStart = Date.now();
      const sendResp = await callEdgeFunction('send-otp', {
        identifier,
        type: 'login',
        preferWhatsApp: false,
      });
      const sendDuration = Date.now() - sendStart;
      addLog('info', `[Quick] send-otp responded in ${sendDuration}ms`, sendResp.data);

      if (sendResp.error && !sendResp.data) {
        const errMsg = `send-otp failed: ${sendResp.error}`;
        addLog('error', `[Quick] ${errMsg}`, sendResp.raw);
        setQuickTestStatus('fail');
        setQuickTestResult({ error: errMsg, sendOtpData: sendResp.raw, sendDuration });
        setIsRunningQuick(false);
        return;
      }

      const sendNormalized = normalizeSendOTPResponse(sendResp.data);
      if (!sendNormalized.success) {
        const errMsg = `send-otp returned success=false: ${sendNormalized.error || 'unknown'}`;
        addLog('error', `[Quick] ${errMsg}`, sendResp.data);
        setQuickTestStatus('fail');
        setQuickTestResult({ error: errMsg, sendOtpData: sendResp.data, sendDuration });
        setIsRunningQuick(false);
        return;
      }

      const capturedDemoCode = sendNormalized.demoCode;
      if (!capturedDemoCode || capturedDemoCode.length !== 6) {
        const errMsg = `send-otp succeeded but no 6-digit demoCode returned (got: ${capturedDemoCode || 'none'})`;
        addLog('error', `[Quick] ${errMsg}`, sendResp.data);
        setQuickTestStatus('fail');
        setQuickTestResult({ error: errMsg, sendOtpData: sendResp.data, sendDuration });
        setIsRunningQuick(false);
        return;
      }

      addLog('success', `[Quick] send-otp OK — demoCode captured: ${capturedDemoCode} (${sendDuration}ms)`);
      setDemoCode(capturedDemoCode);
      setOtpCode(capturedDemoCode);

      // Small delay between calls
      await new Promise(r => setTimeout(r, 300));

      // Step 2: verify-otp (using the captured demoCode directly, not from state)
      addLog('info', `[Quick] Step 2: Calling verify-otp with code: ${capturedDemoCode}`);
      const verifyStart = Date.now();
      const verifyResp = await callEdgeFunction('verify-otp', {
        identifier,
        code: capturedDemoCode,
        type: 'login',
      });
      const verifyDuration = Date.now() - verifyStart;
      addLog('info', `[Quick] verify-otp responded in ${verifyDuration}ms`, verifyResp.data);

      if (verifyResp.error && !verifyResp.data) {
        const errMsg = `verify-otp failed: ${verifyResp.error}`;
        addLog('error', `[Quick] ${errMsg}`, verifyResp.raw);
        setQuickTestStatus('fail');
        setQuickTestResult({
          error: errMsg,
          sendOtpData: sendResp.data,
          verifyOtpData: verifyResp.raw,
          sendDuration,
          verifyDuration,
          demoCode: capturedDemoCode,
        });
        setIsRunningQuick(false);
        return;
      }

      const verifyNormalized = normalizeVerifyOTPResponse(verifyResp.data);

      if (!verifyNormalized.success || !verifyNormalized.user) {
        const errMsg = `verify-otp returned success=${verifyNormalized.success}, user=${!!verifyNormalized.user}: ${verifyNormalized.error || 'no user object'}`;
        addLog('error', `[Quick] ${errMsg}`, verifyResp.data);
        setQuickTestStatus('fail');
        setQuickTestResult({
          error: errMsg,
          sendOtpData: sendResp.data,
          verifyOtpData: verifyResp.data,
          sendDuration,
          verifyDuration,
          demoCode: capturedDemoCode,
        });
        setIsRunningQuick(false);
        return;
      }

      // SUCCESS — extract user session
      const userObj = verifyNormalized.user;
      const sessionObj = verifyNormalized.session;

      addLog('success', `[Quick] verify-otp OK — User session returned (${verifyDuration}ms)`);
      addLog('success', `[Quick] ─── USER SESSION OBJECT ───`);
      addLog('success', `[Quick]   id:    ${userObj.id}`);
      addLog('success', `[Quick]   name:  ${userObj.name}`);
      addLog('success', `[Quick]   email: ${userObj.email}`);
      addLog('success', `[Quick]   role:  ${userObj.role}`);
      if (userObj.assignedClasses) {
        addLog('info', `[Quick]   assignedClasses: ${JSON.stringify(userObj.assignedClasses)}`);
      }
      if (sessionObj) {
        addLog('success', `[Quick] ─── JWT SESSION ───`);
        addLog('success', `[Quick]   sessionId: ${sessionObj.sessionId}`);
        addLog('info', `[Quick]   token: ${sessionObj.token?.slice(0, 50)}...`);
        addLog('info', `[Quick]   expiresAt: ${sessionObj.expiresAt}`);

        // Also set the JWT state for other tests
        setJwtToken(sessionObj.token);
        setJwtSessionId(sessionObj.sessionId);
        setJwtExpiresAt(sessionObj.expiresAt);
      }
      setJwtUserId(userObj.id);
      setJwtUserData(userObj);

      addLog('success', '');
      addLog('success', `[Quick] QUICK LOGIN TEST PASSED — Complete OTP login cycle confirmed!`);
      addLog('success', `[Quick] Total time: ${sendDuration + verifyDuration}ms (send: ${sendDuration}ms, verify: ${verifyDuration}ms)`);

      // Check required fields
      const requiredFields = ['id', 'name', 'email', 'role'];
      const missingFields = requiredFields.filter(f => !userObj[f]);
      if (missingFields.length > 0) {
        addLog('warn', `[Quick] WARNING: Missing required fields in user object: ${missingFields.join(', ')}`);
      } else {
        addLog('success', `[Quick] All required fields present: id, name, email, role`);
      }

      setQuickTestStatus('pass');
      setQuickTestResult({
        sendOtpData: sendResp.data,
        verifyOtpData: verifyResp.data,
        userSession: userObj,
        sessionData: sessionObj,
        sendDuration,
        verifyDuration,
        demoCode: capturedDemoCode,
      });

      // Also update the individual test cards
      updateTest('send-otp', {
        status: 'pass', duration: sendDuration,
        request: { identifier, type: 'login' },
        response: sendResp.data,
        normalized: sendNormalized,
        notes: [`Quick test: demoCode=${capturedDemoCode}`, `Duration: ${sendDuration}ms`],
      });
      updateTest('verify-otp', {
        status: 'pass', duration: verifyDuration,
        request: { identifier, code: capturedDemoCode, type: 'login' },
        response: verifyResp.data,
        normalized: verifyNormalized,
        notes: [
          `Quick test: user=${userObj.name}`,
          `Duration: ${verifyDuration}ms`,
          `User ID: ${userObj.id}`,
          `Email: ${userObj.email}`,
          `Role: ${userObj.role}`,
          `Has JWT: ${!!sessionObj}`,
        ],
      });

    } catch (err: any) {
      const errMsg = `Quick login test exception: ${err.message}`;
      addLog('error', `[Quick] ${errMsg}`, err);
      setQuickTestStatus('fail');
      setQuickTestResult({ error: errMsg });
    }

    setIsRunningQuick(false);
  };

  // ─── Auto-run on mount (or via URL param ?autorun=quick) ──────

  useEffect(() => {
    if (autoRunTriggeredRef.current) return;
    const autorun = searchParams.get('autorun');
    if (autorun === 'quick' || autorun === 'login') {
      autoRunTriggeredRef.current = true;
      // Small delay to let the component fully render
      setTimeout(() => runQuickLoginTest(), 500);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ─── UI Helpers ────────────────────────────────────────────────


  const statusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'fail': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warn': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'running': return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const statusBg = (status: TestResult['status']) => {
    switch (status) {
      case 'pass': return 'bg-green-50 border-green-200';
      case 'fail': return 'bg-red-50 border-red-200';
      case 'warn': return 'bg-amber-50 border-amber-200';
      case 'running': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const logColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warn': return 'text-amber-400';
      default: return 'text-blue-300';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const passCount = Object.values(tests).filter(t => t.status === 'pass').length;
  const failCount = Object.values(tests).filter(t => t.status === 'fail').length;
  const totalTests = Object.keys(tests).length;

  // JWT flow specific counts
  const jwtTestKeys = ['send-otp', 'verify-otp', 'validate-session', 'logout-session', 'validate-after-logout'];
  const jwtPassCount = jwtTestKeys.filter(k => tests[k]?.status === 'pass').length;
  const jwtFailCount = jwtTestKeys.filter(k => tests[k]?.status === 'fail').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/80 border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Auth + JWT Session Test Suite
              </h1>
              <p className="text-sm text-slate-400">
                End-to-end testing: OTP → JWT → Validate → Revoke against <code className="text-amber-400 bg-slate-700 px-1 rounded">bdiqvamaufgdvkjozenl</code>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Wifi className="w-4 h-4 text-green-400" />
              <span className="text-slate-300">databasepad.com</span>
            </div>
            <div className={`flex items-center gap-2 text-sm px-3 py-1 rounded-full ${isAuthenticated ? 'bg-green-900/50 text-green-300' : 'bg-slate-700 text-slate-400'}`}>
              <User className="w-3 h-3" />
              {isAuthenticated ? `${user?.name} (${user?.role})` : 'Not authenticated'}
            </div>
            {contextSessionToken && (
              <div className="flex items-center gap-2 text-sm px-3 py-1 rounded-full bg-purple-900/50 text-purple-300">
                <Lock className="w-3 h-3" />
                JWT in Context
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-400 font-bold">{passCount}</span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-300">{totalTests}</span>
              {failCount > 0 && <span className="text-red-400 font-bold">({failCount} failed)</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Test Controls */}
          <div className="lg:col-span-2 space-y-4">
            {/* Action Buttons */}
            <div className="flex gap-3 mb-6 flex-wrap">
              <Button
                onClick={runQuickLoginTest}
                disabled={isRunningQuick || isRunningJWT || isRunningAll}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold px-8 py-6 text-lg shadow-lg shadow-emerald-900/30"
              >
                {isRunningQuick ? (
                  <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Running Quick Test...</>
                ) : (
                  <><Rocket className="w-5 h-5 mr-2" /> Quick Login Test</>
                )}
              </Button>
              <Button
                onClick={runJWTFlow}
                disabled={isRunningJWT || isRunningAll || isRunningQuick}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold px-8 py-6 text-lg shadow-lg shadow-purple-900/30"
              >
                {isRunningJWT ? (
                  <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Running JWT Flow...</>
                ) : (
                  <><Link2 className="w-5 h-5 mr-2" /> Run JWT E2E Flow (Steps 1-5)</>
                )}
              </Button>
              <Button
                onClick={runAllTests}
                disabled={isRunningAll || isRunningJWT || isRunningQuick}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-6 py-6"
              >
                {isRunningAll ? (
                  <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Running All...</>
                ) : (
                  <><Play className="w-5 h-5 mr-2" /> Run All Tests</>
                )}
              </Button>
              <Button variant="outline" onClick={() => {
                setLogs([]);
                setTests(prev => {
                  const reset: Record<string, TestResult> = {};
                  Object.entries(prev).forEach(([k, v]) => {
                    reset[k] = { ...v, status: 'idle', duration: undefined, request: undefined, response: undefined, normalized: undefined, error: undefined, notes: undefined };
                  });
                  return reset;
                });
                setJwtToken(''); setJwtSessionId(''); setJwtExpiresAt('');
                setJwtUserId(''); setJwtUserData(null);
                setDemoCode(''); setOtpCode('');
                setQuickTestStatus('idle'); setQuickTestResult(null);
              }} className="border-slate-600 text-slate-300 hover:bg-slate-700 py-6">
                <RefreshCw className="w-4 h-4 mr-2" /> Reset All
              </Button>
              {isAuthenticated && (
                <Button variant="outline" onClick={logout} className="border-red-600 text-red-400 hover:bg-red-900/30 py-6">
                  <LogOut className="w-4 h-4 mr-2" /> Logout Context
                </Button>
              )}
            </div>

            {/* ═══ QUICK LOGIN TEST RESULT ═══ */}
            {quickTestStatus !== 'idle' && (
              <div className={`rounded-xl p-5 mb-4 border-2 ${
                quickTestStatus === 'pass' ? 'bg-gradient-to-r from-emerald-900/40 to-green-900/40 border-emerald-500/50' :
                quickTestStatus === 'fail' ? 'bg-gradient-to-r from-red-900/40 to-rose-900/40 border-red-500/50' :
                'bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border-blue-500/50 animate-pulse'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  {quickTestStatus === 'running' && <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />}
                  {quickTestStatus === 'pass' && <CheckCircle className="w-6 h-6 text-emerald-400" />}
                  {quickTestStatus === 'fail' && <XCircle className="w-6 h-6 text-red-400" />}
                  <span className={`font-bold text-lg ${
                    quickTestStatus === 'pass' ? 'text-emerald-300' :
                    quickTestStatus === 'fail' ? 'text-red-300' :
                    'text-blue-300'
                  }`}>
                    Quick Login Test: {quickTestStatus === 'running' ? 'Running...' : quickTestStatus === 'pass' ? 'PASSED' : 'FAILED'}
                  </span>
                  {quickTestResult?.demoCode && (
                    <span className="text-amber-400 font-mono text-sm bg-amber-900/30 px-2 py-0.5 rounded">
                      demoCode: {quickTestResult.demoCode}
                    </span>
                  )}
                  {quickTestResult?.sendDuration !== undefined && quickTestResult?.verifyDuration !== undefined && (
                    <span className="text-slate-400 text-xs">
                      {quickTestResult.sendDuration + quickTestResult.verifyDuration}ms total
                    </span>
                  )}
                </div>

                {quickTestResult?.error && (
                  <div className="text-sm text-red-300 bg-red-900/30 p-3 rounded-lg mb-3 border border-red-500/20">
                    <strong>Error:</strong> {quickTestResult.error}
                  </div>
                )}

                {quickTestResult?.userSession && (
                  <div className="bg-black/30 rounded-lg p-4 border border-emerald-500/20">
                    <div className="text-emerald-400 font-bold text-sm mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" /> User Session Object
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-slate-500 text-xs uppercase">id</span>
                        <div className="text-emerald-300 font-mono text-xs break-all">{quickTestResult.userSession.id}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 text-xs uppercase">name</span>
                        <div className="text-emerald-300 font-bold">{quickTestResult.userSession.name}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 text-xs uppercase">email</span>
                        <div className="text-emerald-300">{quickTestResult.userSession.email}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 text-xs uppercase">role</span>
                        <div className="text-emerald-300 font-bold">{quickTestResult.userSession.role}</div>
                      </div>
                      {quickTestResult.userSession.assignedClasses && (
                        <div className="col-span-2">
                          <span className="text-slate-500 text-xs uppercase">assignedClasses</span>
                          <div className="text-emerald-300 text-xs">{JSON.stringify(quickTestResult.userSession.assignedClasses)}</div>
                        </div>
                      )}
                    </div>
                    {quickTestResult.sessionData && (
                      <div className="mt-3 pt-3 border-t border-emerald-500/20">
                        <div className="text-purple-400 font-bold text-xs mb-1 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> JWT Session
                        </div>
                        <div className="text-xs text-slate-400">
                          Session ID: <span className="text-purple-300 font-mono">{quickTestResult.sessionData.sessionId}</span>
                        </div>
                        <div className="text-xs text-slate-400">
                          Expires: <span className="text-purple-300">{quickTestResult.sessionData.expiresAt}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-2 text-xs text-slate-500">
                  send-otp → capture demoCode → verify-otp | identifier: teacher@ananse.edu
                  {quickTestResult?.sendDuration !== undefined && ` | send: ${quickTestResult.sendDuration}ms`}
                  {quickTestResult?.verifyDuration !== undefined && ` | verify: ${quickTestResult.verifyDuration}ms`}
                </div>
              </div>
            )}



            {/* JWT Session Status Banner */}
            {jwtToken && (
              <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <Lock className="w-5 h-5 text-purple-400" />
                  <span className="text-purple-200 font-bold text-sm">JWT Session Token Captured</span>
                  <span className="text-xs text-purple-400 bg-purple-900/50 px-2 py-0.5 rounded-full">{jwtToken.length} chars</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-slate-400">Session ID: <span className="text-purple-300 font-mono">{jwtSessionId || 'N/A'}</span></div>
                  <div className="text-slate-400">User ID: <span className="text-purple-300 font-mono">{jwtUserId || 'N/A'}</span></div>
                  <div className="text-slate-400">Expires: <span className="text-purple-300">{jwtExpiresAt || 'N/A'}</span></div>
                  <div className="text-slate-400">Token: <span className="text-purple-300 font-mono">{jwtToken.slice(0, 30)}...</span>
                    <button onClick={() => copyToClipboard(jwtToken)} className="ml-1 text-purple-400 hover:text-purple-200"><Copy className="w-3 h-3 inline" /></button>
                  </div>
                </div>
              </div>
            )}

            {/* JWT Flow Score */}
            {(jwtPassCount > 0 || jwtFailCount > 0) && (
              <div className={`rounded-xl p-3 mb-4 flex items-center gap-3 ${
                jwtPassCount === 5 ? 'bg-green-900/30 border border-green-500/30' :
                jwtFailCount > 0 ? 'bg-red-900/30 border border-red-500/30' :
                'bg-amber-900/30 border border-amber-500/30'
              }`}>
                {jwtPassCount === 5 ? (
                  <ShieldCheck className="w-6 h-6 text-green-400" />
                ) : jwtFailCount > 0 ? (
                  <ShieldOff className="w-6 h-6 text-red-400" />
                ) : (
                  <Shield className="w-6 h-6 text-amber-400" />
                )}
                <div>
                  <span className={`font-bold text-sm ${
                    jwtPassCount === 5 ? 'text-green-300' : jwtFailCount > 0 ? 'text-red-300' : 'text-amber-300'
                  }`}>
                    JWT E2E Flow: {jwtPassCount}/5 passed
                  </span>
                  {jwtPassCount === 5 && (
                    <span className="text-green-400 text-xs ml-2">— Full lifecycle verified!</span>
                  )}
                </div>
              </div>
            )}

            {/* ═══ JWT SESSION FLOW ═══ */}
            <div className="border-t border-purple-500/30 my-2 flex items-center gap-2">
              <span className="text-xs text-purple-400 bg-purple-900/50 px-3 py-1 rounded-full font-bold">JWT SESSION E2E FLOW</span>
              <span className="text-xs text-slate-500">send-otp → verify-otp → validate → revoke → reject</span>
            </div>

            {/* Test 0: Direct DB */}
            <TestCard
              test={tests['db-direct']}
              icon={<Database className="w-5 h-5" />}
              expanded={expandedTest === 'db-direct'}
              onToggle={() => setExpandedTest(expandedTest === 'db-direct' ? null : 'db-direct')}
              statusIcon={statusIcon}
              statusBg={statusBg}
              copyToClipboard={copyToClipboard}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Query users table for teacher@ananse.edu</span>
                <Button size="sm" onClick={testDirectDB} disabled={tests['db-direct'].status === 'running'} className="bg-slate-600 hover:bg-slate-500 text-white">
                  <Play className="w-3 h-3 mr-1" /> Run
                </Button>
              </div>
            </TestCard>

            {/* Test 1: send-otp (Login) */}
            <TestCard
              test={tests['send-otp']}
              icon={<Shield className="w-5 h-5" />}
              expanded={expandedTest === 'send-otp'}
              onToggle={() => setExpandedTest(expandedTest === 'send-otp' ? null : 'send-otp')}
              statusIcon={statusIcon}
              statusBg={statusBg}
              copyToClipboard={copyToClipboard}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <Label className="text-slate-400 text-sm">Email:</Label>
                <Input value={sendOtpEmail} onChange={e => setSendOtpEmail(e.target.value)}
                  className="w-64 bg-slate-700 border-slate-600 text-white h-8 text-sm" />
                <Button size="sm" onClick={testSendOTP} disabled={tests['send-otp'].status === 'running'} className="bg-purple-600 hover:bg-purple-500 text-white">
                  <Play className="w-3 h-3 mr-1" /> Send OTP
                </Button>
                {demoCode && (
                  <span className="text-amber-400 font-mono font-bold text-sm bg-amber-900/30 px-2 py-1 rounded">
                    Code: {demoCode}
                  </span>
                )}
              </div>
            </TestCard>

            {/* Test 2: verify-otp (Login + JWT) */}
            <TestCard
              test={tests['verify-otp']}
              icon={<Key className="w-5 h-5" />}
              expanded={expandedTest === 'verify-otp'}
              onToggle={() => setExpandedTest(expandedTest === 'verify-otp' ? null : 'verify-otp')}
              statusIcon={statusIcon}
              statusBg={statusBg}
              copyToClipboard={copyToClipboard}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <Label className="text-slate-400 text-sm">OTP Code:</Label>
                <Input value={otpCode} onChange={e => setOtpCode(e.target.value)} maxLength={6}
                  className="w-32 bg-slate-700 border-slate-600 text-white h-8 text-sm font-mono tracking-widest" placeholder="000000" />
                <Button size="sm" onClick={testVerifyOTP} disabled={tests['verify-otp'].status === 'running' || otpCode.length !== 6} className="bg-green-600 hover:bg-green-500 text-white">
                  <Play className="w-3 h-3 mr-1" /> Verify + JWT
                </Button>
                {tests['verify-otp'].status === 'pass' && (
                  <Button size="sm" onClick={establishSession} className="bg-blue-600 hover:bg-blue-500 text-white">
                    <User className="w-3 h-3 mr-1" /> Establish Session
                  </Button>
                )}
                {jwtToken && (
                  <span className="text-purple-400 text-xs bg-purple-900/30 px-2 py-1 rounded flex items-center gap-1">
                    <Lock className="w-3 h-3" /> JWT captured
                  </span>
                )}
              </div>
            </TestCard>

            {/* Test 3: validate-session */}
            <TestCard
              test={tests['validate-session']}
              icon={<ShieldCheck className="w-5 h-5" />}
              expanded={expandedTest === 'validate-session'}
              onToggle={() => setExpandedTest(expandedTest === 'validate-session' ? null : 'validate-session')}
              statusIcon={statusIcon}
              statusBg={statusBg}
              copyToClipboard={copyToClipboard}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-slate-400">Validate JWT token with server</span>
                <Button size="sm" onClick={() => testValidateSession()} disabled={tests['validate-session'].status === 'running' || !jwtToken} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                  <Play className="w-3 h-3 mr-1" /> Validate
                </Button>
                {!jwtToken && <span className="text-xs text-slate-500">Needs JWT from Step 2</span>}
              </div>
            </TestCard>

            {/* Test 4: logout-session */}
            <TestCard
              test={tests['logout-session']}
              icon={<LogOut className="w-5 h-5" />}
              expanded={expandedTest === 'logout-session'}
              onToggle={() => setExpandedTest(expandedTest === 'logout-session' ? null : 'logout-session')}
              statusIcon={statusIcon}
              statusBg={statusBg}
              copyToClipboard={copyToClipboard}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-slate-400">Revoke session on server</span>
                <Button size="sm" onClick={() => testLogoutSession()} disabled={tests['logout-session'].status === 'running' || !jwtToken} className="bg-red-600 hover:bg-red-500 text-white">
                  <Play className="w-3 h-3 mr-1" /> Revoke Session
                </Button>
                {!jwtToken && <span className="text-xs text-slate-500">Needs JWT from Step 2</span>}
              </div>
            </TestCard>

            {/* Test 5: validate-after-logout */}
            <TestCard
              test={tests['validate-after-logout']}
              icon={<ShieldOff className="w-5 h-5" />}
              expanded={expandedTest === 'validate-after-logout'}
              onToggle={() => setExpandedTest(expandedTest === 'validate-after-logout' ? null : 'validate-after-logout')}
              statusIcon={statusIcon}
              statusBg={statusBg}
              copyToClipboard={copyToClipboard}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-slate-400">Validate AFTER revocation (expect rejection)</span>
                <Button size="sm" onClick={() => testValidateAfterLogout()} disabled={tests['validate-after-logout'].status === 'running' || !jwtToken} className="bg-amber-600 hover:bg-amber-500 text-white">
                  <Play className="w-3 h-3 mr-1" /> Validate (Expect Fail)
                </Button>
                {!jwtToken && <span className="text-xs text-slate-500">Needs JWT from Step 2</span>}
              </div>
            </TestCard>

            {/* ═══ RESET PASSWORD FLOW ═══ */}
            <div className="border-t border-slate-700 my-2 flex items-center gap-2">
              <span className="text-xs text-slate-500 bg-slate-800 px-2">RESET PASSWORD FLOW</span>
            </div>

            <TestCard
              test={tests['send-otp-reset']}
              icon={<Shield className="w-5 h-5" />}
              expanded={expandedTest === 'send-otp-reset'}
              onToggle={() => setExpandedTest(expandedTest === 'send-otp-reset' ? null : 'send-otp-reset')}
              statusIcon={statusIcon}
              statusBg={statusBg}
              copyToClipboard={copyToClipboard}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <Label className="text-slate-400 text-sm">Email:</Label>
                <Input value={resetEmail} onChange={e => setResetEmail(e.target.value)}
                  className="w-64 bg-slate-700 border-slate-600 text-white h-8 text-sm" />
                <Button size="sm" onClick={testSendOTPReset} disabled={tests['send-otp-reset'].status === 'running'} className="bg-purple-600 hover:bg-purple-500 text-white">
                  <Play className="w-3 h-3 mr-1" /> Send Reset OTP
                </Button>
                {resetDemoCode && (
                  <span className="text-amber-400 font-mono font-bold text-sm bg-amber-900/30 px-2 py-1 rounded">
                    Code: {resetDemoCode}
                  </span>
                )}
              </div>
            </TestCard>

            <TestCard
              test={tests['verify-otp-reset']}
              icon={<Key className="w-5 h-5" />}
              expanded={expandedTest === 'verify-otp-reset'}
              onToggle={() => setExpandedTest(expandedTest === 'verify-otp-reset' ? null : 'verify-otp-reset')}
              statusIcon={statusIcon}
              statusBg={statusBg}
              copyToClipboard={copyToClipboard}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <Label className="text-slate-400 text-sm">Reset OTP:</Label>
                <Input value={resetOtpCode} onChange={e => setResetOtpCode(e.target.value)} maxLength={6}
                  className="w-32 bg-slate-700 border-slate-600 text-white h-8 text-sm font-mono tracking-widest" placeholder="000000" />
                <Button size="sm" onClick={testVerifyOTPReset} disabled={tests['verify-otp-reset'].status === 'running' || resetOtpCode.length !== 6} className="bg-green-600 hover:bg-green-500 text-white">
                  <Play className="w-3 h-3 mr-1" /> Verify Reset
                </Button>
                {resetToken && (
                  <span className="text-green-400 text-xs bg-green-900/30 px-2 py-1 rounded">Token captured</span>
                )}
              </div>
            </TestCard>

            <TestCard
              test={tests['reset-password']}
              icon={<Key className="w-5 h-5" />}
              expanded={expandedTest === 'reset-password'}
              onToggle={() => setExpandedTest(expandedTest === 'reset-password' ? null : 'reset-password')}
              statusIcon={statusIcon}
              statusBg={statusBg}
              copyToClipboard={copyToClipboard}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <Label className="text-slate-400 text-sm">New Password:</Label>
                <Input value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  className="w-40 bg-slate-700 border-slate-600 text-white h-8 text-sm" />
                <Button size="sm" onClick={testResetPassword} disabled={tests['reset-password'].status === 'running' || (!resetToken && !resetUserId)} className="bg-orange-600 hover:bg-orange-500 text-white">
                  <Play className="w-3 h-3 mr-1" /> Reset Password
                </Button>
              </div>
            </TestCard>

            {/* ═══ CREATE USER ═══ */}
            <div className="border-t border-slate-700 my-2 flex items-center gap-2">
              <span className="text-xs text-slate-500 bg-slate-800 px-2">CREATE USER</span>
            </div>

            <TestCard
              test={tests['create-user']}
              icon={<UserPlus className="w-5 h-5" />}
              expanded={expandedTest === 'create-user'}
              onToggle={() => setExpandedTest(expandedTest === 'create-user' ? null : 'create-user')}
              statusIcon={statusIcon}
              statusBg={statusBg}
              copyToClipboard={copyToClipboard}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Label className="text-slate-400 text-sm w-12">Name:</Label>
                  <Input value={createName} onChange={e => setCreateName(e.target.value)}
                    className="w-48 bg-slate-700 border-slate-600 text-white h-8 text-sm" />
                  <Label className="text-slate-400 text-sm w-12">Email:</Label>
                  <Input value={createEmail} onChange={e => setCreateEmail(e.target.value)}
                    className="w-64 bg-slate-700 border-slate-600 text-white h-8 text-sm" />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-slate-400 text-sm w-12">Pass:</Label>
                  <Input value={createPassword} onChange={e => setCreatePassword(e.target.value)}
                    className="w-40 bg-slate-700 border-slate-600 text-white h-8 text-sm" />
                  <Button size="sm" onClick={() => setCreateEmail(`test.e2e.${Date.now()}@ananse.edu`)} variant="outline" className="border-slate-600 text-slate-400 h-8 text-xs">
                    <RefreshCw className="w-3 h-3 mr-1" /> New Email
                  </Button>
                  <Button size="sm" onClick={testCreateUser} disabled={tests['create-user'].status === 'running'} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                    <Play className="w-3 h-3 mr-1" /> Create User
                  </Button>
                </div>
              </div>
            </TestCard>
          </div>

          {/* Right: Log Console */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden sticky top-6">
              <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
                <span className="text-sm font-bold text-slate-300 flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-400" /> Console Log
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{logs.length} entries</span>
                  <Button variant="ghost" size="sm" onClick={() => setLogs([])} className="text-slate-500 hover:text-white h-6 px-2">
                    Clear
                  </Button>
                </div>
              </div>
              <div ref={logRef} className="h-[calc(100vh-200px)] overflow-y-auto p-3 font-mono text-xs space-y-1">
                {logs.length === 0 ? (
                  <div className="text-slate-600 text-center py-8">
                    Click "Run JWT E2E Flow" to test the full session lifecycle...
                  </div>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-slate-600 flex-shrink-0">{log.time}</span>
                      <span className={`${logColor(log.level)} flex-1 break-all`}>
                        {log.message}
                        {log.data && (
                          <details className="mt-1">
                            <summary className="text-slate-500 cursor-pointer hover:text-slate-300">data</summary>
                            <pre className="text-slate-400 mt-1 whitespace-pre-wrap text-[10px] bg-slate-800 p-2 rounded">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── TestCard Sub-component ──────────────────────────────────────

interface TestCardProps {
  test: TestResult;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  statusIcon: (status: TestResult['status']) => React.ReactNode;
  statusBg: (status: TestResult['status']) => string;
  copyToClipboard: (text: string) => void;
  children: React.ReactNode;
}

const TestCard: React.FC<TestCardProps> = ({ test, icon, expanded, onToggle, statusIcon, statusBg, copyToClipboard, children }) => {
  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${statusBg(test.status)}`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/5" onClick={onToggle}>
        <div className="text-slate-500">{icon}</div>
        {statusIcon(test.status)}
        <span className="font-bold text-slate-800 flex-1">{test.name}</span>
        {test.duration !== undefined && (
          <span className="text-xs text-slate-500 font-mono">{test.duration}ms</span>
        )}
        {test.versionMarker && test.versionMarker !== 'no marker' && (
          <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
            {test.versionMarker}
          </span>
        )}
        {expanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </div>

      {/* Controls */}
      <div className="px-4 pb-3">{children}</div>

      {/* Expanded Details */}
      {expanded && (test.response || test.error || test.notes) && (
        <div className="border-t border-slate-200 bg-white/50 px-4 py-3 space-y-3">
          {test.error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
              <strong>Error:</strong> {test.error}
            </div>
          )}

          {test.notes && test.notes.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase">Results</span>
              {test.notes.map((note, i) => (
                <div key={i} className={`text-sm flex items-start gap-1 ${
                  note.startsWith('───') ? 'text-purple-700 font-bold mt-2' :
                  note.startsWith('WARNING') || note.startsWith('BUG') ? 'text-red-600 font-bold' :
                  note.startsWith('CORRECT') ? 'text-green-600 font-bold' :
                  'text-slate-700'
                }`}>
                  {!note.startsWith('───') && <ArrowRight className="w-3 h-3 mt-1 flex-shrink-0 text-slate-400" />}
                  <span>{note}</span>
                </div>
              ))}
            </div>
          )}

          {test.request && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Request</span>
                <button onClick={() => copyToClipboard(JSON.stringify(test.request, null, 2))} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
              <pre className="text-xs bg-slate-100 p-2 rounded overflow-x-auto text-slate-700 max-h-32">
                {JSON.stringify(test.request, null, 2)}
              </pre>
            </div>
          )}

          {test.response && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Raw Response</span>
                <button onClick={() => copyToClipboard(JSON.stringify(test.response, null, 2))} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
              <pre className="text-xs bg-slate-100 p-2 rounded overflow-x-auto text-slate-700 max-h-48">
                {JSON.stringify(test.response, null, 2)}
              </pre>
            </div>
          )}

          {test.normalized && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Normalized (Frontend)</span>
                <button onClick={() => copyToClipboard(JSON.stringify(test.normalized, null, 2))} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
              <pre className="text-xs bg-green-50 p-2 rounded overflow-x-auto text-green-800 max-h-48 border border-green-200">
                {JSON.stringify(test.normalized, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuthTestPanel;
