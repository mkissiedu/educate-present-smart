/**
 * Edge Function Caller — V4
 *
 * Calls Supabase edge functions via direct fetch() using the same project
 * URL and anon key as the database client (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).
 *
 * Expected version markers:
 *   send-otp: V15
 *   verify-otp: V5
 *   reset-password: V2
 *   create-user: V7
 *   create-school: V1
 *   validate-session: V1
 *   logout-session: V1
 */

import { User, UserRole, ClassLevel } from '@/types/user';

// ─── Edge Function Endpoint Config ─────────────────────────────────
// Edge functions are co-located with the database on the same Supabase project.
// Both are derived from the same VITE_SUPABASE_* env vars so they stay in sync.

const EDGE_FUNCTION_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const EDGE_FUNCTION_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// ─── Response Types ────────────────────────────────────────────────

export interface EdgeFunctionResponse<T = any> {
  data: T | null;
  error: string | null;
  status: number;
  raw?: any; // raw response for debugging
}

// ─── Call Edge Function ────────────────────────────────────────────

export async function callEdgeFunction<T = any>(
  functionName: string,
  body: Record<string, any>
): Promise<EdgeFunctionResponse<T>> {
  const startTime = Date.now();
  const sanitizedBody = { ...body };
  if (sanitizedBody.password) sanitizedBody.password = '***';
  if (sanitizedBody.newPassword) sanitizedBody.newPassword = '***';
  console.log(`[EdgeFn] Calling ${functionName} via direct fetch...`, sanitizedBody);

  const url = `${EDGE_FUNCTION_BASE_URL}/${functionName}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': EDGE_FUNCTION_ANON_KEY,
        'Authorization': `Bearer ${EDGE_FUNCTION_ANON_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const elapsed = Date.now() - startTime;
    console.log(`[EdgeFn] ${functionName} HTTP ${response.status} (${elapsed}ms)`);

    // Parse the response body
    let data: any = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (parseErr) {
        console.error(`[EdgeFn] ${functionName} JSON parse error:`, parseErr);
        const text = await response.text();
        return { data: null, error: `Invalid JSON response: ${text.substring(0, 200)}`, status: response.status, raw: text };
      }
    } else {
      const text = await response.text();
      // Try to parse as JSON anyway (some responses may not set content-type correctly)
      try {
        data = JSON.parse(text);
      } catch {
        if (!response.ok) {
          return { data: null, error: `HTTP ${response.status}: ${text.substring(0, 200)}`, status: response.status, raw: text };
        }
        data = { text };
      }
    }

    // Handle non-2xx HTTP status
    if (!response.ok) {
      const errorMsg = data?.error || data?.message || `HTTP ${response.status} from ${functionName}`;
      console.error(`[EdgeFn] ${functionName} error response (${elapsed}ms):`, errorMsg, data);
      return { data: data as T, error: errorMsg, status: response.status, raw: data };
    }

    console.log(`[EdgeFn] ${functionName} response (${elapsed}ms):`, data);

    // Unwrap double-wrapped responses: { data: { success: true, ... } }
    let unwrapped = data;
    if (data && typeof data === 'object' && 'data' in data && typeof data.data === 'object' && data.data !== null) {
      // Check if the inner data looks like the actual response
      if ('success' in data.data || 'user' in data.data || 'error' in data.data) {
        console.log(`[EdgeFn] ${functionName} unwrapping double-wrapped response`);
        unwrapped = data.data;
      }
    }

    // Handle edge function returning an error in the data payload
    if (unwrapped && typeof unwrapped === 'object' && unwrapped.error && unwrapped.success === false) {
      return { data: unwrapped as T, error: unwrapped.error, status: unwrapped.status || 400, raw: data };
    }

    return { data: unwrapped as T, error: null, status: response.status, raw: data };
  } catch (err: any) {
    const elapsed = Date.now() - startTime;
    console.error(`[EdgeFn] ${functionName} exception (${elapsed}ms):`, err);
    
    // Provide helpful error messages for common issues
    let errorMsg = err.message || `Failed to call ${functionName}`;
    if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError') || errorMsg.includes('ERR_')) {
      errorMsg = `Network error calling ${functionName}. Check internet connection and CORS settings.`;
    }
    
    return { data: null, error: errorMsg, status: 0, raw: err };
  }
}


// ─── Normalize User from DB row ────────────────────────────────────

/**
 * Maps a raw database user row (snake_case) to the frontend User type (camelCase).
 * Handles both snake_case DB columns and already-mapped camelCase fields.
 * 
 * Remote DB columns (bdiqvamaufgdvkjozenl):
 *   id, name, email, password_hash, role, assigned_classes, avatar, created_at
 *   (phone, school_id, is_active may or may not exist depending on ALTER TABLE status)
 */
export function normalizeUser(raw: any): User | null {
  if (!raw || typeof raw !== 'object') return null;

  const id = raw.id;
  const email = raw.email;

  if (!id || !email) {
    console.warn('[normalizeUser] Missing required fields (id, email):', raw);
    return null;
  }

  const name = raw.name || email.split('@')[0] || 'User';
  const role = (raw.role as UserRole) || 'teacher';

  // Handle assigned_classes - could be snake_case from DB, camelCase from frontend, or JSON string
  let assignedClasses: ClassLevel[] = [];
  const rawClasses = raw.assignedClasses ?? raw.assigned_classes;
  if (Array.isArray(rawClasses)) {
    assignedClasses = rawClasses;
  } else if (typeof rawClasses === 'string') {
    try { assignedClasses = JSON.parse(rawClasses); } catch { assignedClasses = []; }
  }

  return {
    id,
    name,
    email,
    phone: raw.phone || undefined,
    role,
    assignedClasses,
    avatar: raw.avatar || undefined,
    school_id: raw.school_id || undefined,
    school_name: raw.school_name || undefined,
  };
}

// ─── Normalize Send-OTP Response ────────────────────────────────────

export interface NormalizedSendOTPResponse {
  success: boolean;
  message?: string;
  error?: string;
  code?: string;
  expiresIn?: number;
  demoCode?: string;
  sent?: boolean;
  sendError?: string;
  method?: 'email' | 'sms' | 'whatsapp';
  maskedPhone?: string;
  maskedEmail?: string;
  version?: string;
}

/**
 * Normalizes the send-otp edge function response, handling both
 * snake_case (from edge function) and camelCase field names.
 * 
 * send-otp V13 response shape:
 * {
 *   success: true,
 *   message: "OTP sent",
 *   otp_code: "123456",  // demo mode
 *   expires_in: 600,
 *   sent: false,
 *   send_error: "...",
 *   method: "email",
 *   masked_email: "t***@ananse.edu"
 * }
 */
export function normalizeSendOTPResponse(raw: any): NormalizedSendOTPResponse {
  if (!raw) return { success: false, error: 'Empty response from server' };

  return {
    success: !!raw.success,
    message: raw.message,
    error: raw.error,
    code: raw.code,
    // Handle both snake_case and camelCase for all fields
    expiresIn: raw.expiresIn ?? raw.expires_in ?? raw.expiry ?? 600,
    demoCode: raw.demoCode ?? raw.demo_code ?? raw.otp_code ?? raw.otpCode,
    sent: raw.sent,
    sendError: raw.sendError ?? raw.send_error,
    method: raw.method,
    maskedPhone: raw.maskedPhone ?? raw.masked_phone,
    maskedEmail: raw.maskedEmail ?? raw.masked_email,
    version: raw.version ?? raw._version ?? raw.v,
  };
}

// ─── Normalize Verify-OTP Response ────────────────────────────────────

export interface SessionData {
  token: string;
  expiresAt: string;
  sessionId: string;
}

export interface NormalizedVerifyOTPResponse {
  success: boolean;
  user?: User;
  session?: SessionData;
  error?: string;
  attemptsLeft?: number;
  type?: string;
  resetToken?: string;
  userId?: string;
  version?: string;
}

/**
 * Normalizes the verify-otp edge function response, mapping the
 * raw DB user row to the frontend User type.
 * 
 * verify-otp V5 response shape (login):
 * {
 *   success: true,
 *   type: "login",
 *   user: { id, name, email, role, assigned_classes, ... },
 *   session: { token, expiresAt, sessionId }
 * }
 * 
 * verify-otp V5 response shape (reset):
 * {
 *   success: true,
 *   type: "reset",
 *   resetToken: "uuid",
 *   userId: "uuid"
 * }
 */
export function normalizeVerifyOTPResponse(raw: any): NormalizedVerifyOTPResponse {
  if (!raw) return { success: false, error: 'Empty response from server' };

  if (!raw.success) {
    return {
      success: false,
      error: raw.error || 'Verification failed',
      attemptsLeft: raw.attemptsLeft ?? raw.attempts_left,
      version: raw.version ?? raw._version,
    };
  }

  // Map the user data if present
  const user = raw.user ? normalizeUser(raw.user) : undefined;

  // Extract session data if present (from verify-otp V5+)
  let session: SessionData | undefined;
  if (raw.session && raw.session.token) {
    session = {
      token: raw.session.token,
      expiresAt: raw.session.expiresAt ?? raw.session.expires_at,
      sessionId: raw.session.sessionId ?? raw.session.session_id ?? raw.session.id,
    };
  }

  return {
    success: true,
    user: user || undefined,
    session,
    type: raw.type,
    resetToken: raw.resetToken ?? raw.reset_token,
    userId: raw.userId ?? raw.user_id ?? raw.user?.id,
    version: raw.version ?? raw._version,
  };
}

