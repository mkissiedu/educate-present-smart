const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DB_URL = Deno.env.get('SUPABASE_URL') ?? '';
const DB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const JWT_SECRET = Deno.env.get('JWT_SECRET') ?? 'ananse-fallback-secret-change-me';

function dbHeaders() {
  return { 'apikey': DB_KEY, 'Authorization': `Bearer ${DB_KEY}`, 'Content-Type': 'application/json' };
}

// ─── JWT Helpers ───────────────────────────────────────────────────

function base64UrlEncode(data: string | Uint8Array): string {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function signJWT(payload: Record<string, any>, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const signingInput = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}`;
  const cryptoKey = await globalThis.crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const signature = await globalThis.crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(signingInput));
  return `${signingInput}.${base64UrlEncode(new Uint8Array(signature))}`;
}

async function hashToken(token: string): Promise<string> {
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── Main Handler ──────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { identifier, code, type = 'login' } = await req.json();
    console.log('verify-otp: identifier=' + identifier + ' type=' + type);

    if (!identifier || !code) {
      return new Response(JSON.stringify({ success: false, error: 'Identifier and code are required', code: 'MISSING_PARAMS' }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const H = dbHeaders();

    // Step 1: Look up most recent valid OTP
    const now = new Date().toISOString();
    const otpRes = await fetch(
      `${DB_URL}/rest/v1/otp_codes?identifier=eq.${encodeURIComponent(identifier)}&type=eq.${type}&used=eq.false&expires_at=gt.${now}&order=created_at.desc&limit=1&select=*`,
      { headers: H },
    );
    if (!otpRes.ok) {
      const err = await otpRes.text();
      return new Response(JSON.stringify({ success: false, error: 'OTP lookup failed', detail: err.substring(0, 200), code: 'DB_ERROR' }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const otpRecords = await otpRes.json();
    if (!otpRecords || otpRecords.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Code expired or invalid. Please request a new code.', code: 'EXPIRED_OR_INVALID' }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const otpRecord = otpRecords[0];

    // Step 2: Check max attempts
    if (otpRecord.attempts >= otpRecord.max_attempts) {
      await fetch(`${DB_URL}/rest/v1/otp_codes?id=eq.${otpRecord.id}`, {
        method: 'PATCH', headers: { ...H, 'Prefer': 'return=minimal' }, body: JSON.stringify({ used: true }),
      });
      return new Response(JSON.stringify({ success: false, error: 'Too many failed attempts. Please request a new code.', attemptsLeft: 0, code: 'MAX_ATTEMPTS' }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Step 3: Constant-time code comparison
    const submitted = String(code).padStart(6, '0');
    const stored = String(otpRecord.code).padStart(6, '0');
    let match = submitted.length === stored.length;
    if (match) { let r = 0; for (let i = 0; i < submitted.length; i++) r |= submitted.charCodeAt(i) ^ stored.charCodeAt(i); match = r === 0; }

    if (!match) {
      const newAttempts = otpRecord.attempts + 1;
      await fetch(`${DB_URL}/rest/v1/otp_codes?id=eq.${otpRecord.id}`, {
        method: 'PATCH', headers: { ...H, 'Prefer': 'return=minimal' }, body: JSON.stringify({ attempts: newAttempts }),
      });
      return new Response(JSON.stringify({ success: false, error: 'Invalid code. Please try again.', attemptsLeft: otpRecord.max_attempts - newAttempts, code: 'INVALID_CODE' }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Step 4: Mark OTP used
    await fetch(`${DB_URL}/rest/v1/otp_codes?id=eq.${otpRecord.id}`, {
      method: 'PATCH', headers: { ...H, 'Prefer': 'return=minimal' }, body: JSON.stringify({ used: true }),
    });

    // Step 5: Look up user
    const isEmail = identifier.includes('@');
    const userParam = isEmail
      ? `email=eq.${encodeURIComponent(identifier.toLowerCase().trim())}`
      : `phone=eq.${encodeURIComponent(identifier.replace(/\s/g, ''))}`;

    const userRes = await fetch(`${DB_URL}/rest/v1/users?${userParam}&select=*&limit=1`, { headers: H });
    if (!userRes.ok) {
      return new Response(JSON.stringify({ success: false, error: 'User lookup failed', code: 'DB_ERROR' }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const users = await userRes.json();
    if (!users || users.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'User account not found', code: 'USER_NOT_FOUND' }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const user = users[0];
    console.log('verify-otp: user found id=' + user.id + ' role=' + user.role);

    if (type === 'login') {
      // Step 6: Generate JWT session token
      const sessionId = globalThis.crypto.randomUUID();
      const issuedAt = Math.floor(Date.now() / 1000);
      const expiresAt = issuedAt + 24 * 60 * 60; // 24 hours
      const expiresAtISO = new Date(expiresAt * 1000).toISOString();

      const token = await signJWT({
        sub: user.id, email: user.email, role: user.role, name: user.name,
        jti: sessionId, iat: issuedAt, exp: expiresAt, iss: 'ananse-edu', aud: 'ananse-client',
      }, JWT_SECRET);

      // Step 7: Store session in DB
      const tokenHash = await hashToken(token);
      await fetch(`${DB_URL}/rest/v1/sessions`, {
        method: 'POST',
        headers: { ...H, 'Prefer': 'return=minimal' },
        body: JSON.stringify({
          id: sessionId, user_id: user.id, token_hash: tokenHash,
          user_email: user.email, user_role: user.role, user_name: user.name,
          user_data: { assigned_classes: user.assigned_classes || [], avatar: user.avatar || null, school_id: user.school_id || null, phone: user.phone || null },
          expires_at: expiresAtISO, is_revoked: false,
        }),
      }).catch(e => console.error('verify-otp: session storage failed:', e.message));

      return new Response(JSON.stringify({
        success: true, type: 'login',
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, assigned_classes: user.assigned_classes || [], avatar: user.avatar, school_id: user.school_id },
        session: { token, expiresAt: expiresAtISO, sessionId },
      }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

    } else if (type === 'reset') {
      const resetToken = globalThis.crypto.randomUUID();
      const tokenExpiry = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      await fetch(`${DB_URL}/rest/v1/password_reset_tokens`, {
        method: 'POST',
        headers: { ...H, 'Prefer': 'return=minimal' },
        body: JSON.stringify({ user_id: user.id, token: resetToken, expires_at: tokenExpiry, used: false }),
      });
      return new Response(JSON.stringify({ success: true, type: 'reset', resetToken, userId: user.id }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ success: false, error: 'Invalid OTP type', code: 'INVALID_TYPE' }), {
      status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (err: any) {
    console.error('verify-otp error:', err.message, err.stack);
    return new Response(JSON.stringify({ success: false, error: err.message || 'Internal server error', code: 'INTERNAL_ERROR' }), {
      status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
