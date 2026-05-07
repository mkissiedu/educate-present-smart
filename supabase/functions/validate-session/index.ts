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

// ─── JWT Verification Helpers ──────────────────────────────────────

function base64UrlDecode(str: string): Uint8Array {
  let padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4;
  if (pad === 2) padded += '==';
  else if (pad === 3) padded += '=';
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function verifyJWT(token: string, secret: string): Promise<Record<string, any>> {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT format');

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const cryptoKey = await globalThis.crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'],
  );

  const isValid = await globalThis.crypto.subtle.verify(
    'HMAC', cryptoKey, base64UrlDecode(encodedSignature), new TextEncoder().encode(signingInput),
  );
  if (!isValid) throw new Error('Invalid JWT signature');

  const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(encodedPayload)));

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) throw new Error('JWT expired at ' + new Date(payload.exp * 1000).toISOString());
  if (payload.iat && payload.iat > now + 60) throw new Error('JWT issued in the future');

  return payload;
}

async function hashToken(token: string): Promise<string> {
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── Main Handler ──────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const token = body.token || req.headers.get('x-session-token') || null;

    if (!token) {
      return new Response(JSON.stringify({ success: false, error: 'No session token provided', code: 'NO_TOKEN' }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Step 1: Verify JWT
    let payload: Record<string, any>;
    try {
      payload = await verifyJWT(token, JWT_SECRET);
    } catch (jwtErr: any) {
      return new Response(JSON.stringify({ success: false, error: jwtErr.message, code: 'INVALID_TOKEN' }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Step 2: Check session in DB
    const tokenHash = await hashToken(token);
    const H = dbHeaders();
    const sessionRes = await fetch(
      `${DB_URL}/rest/v1/sessions?token_hash=eq.${encodeURIComponent(tokenHash)}&is_revoked=eq.false&select=*&limit=1`,
      { headers: H },
    );

    if (!sessionRes.ok) {
      const errText = await sessionRes.text();
      console.error('validate-session: Session lookup failed: ' + errText);
      return new Response(JSON.stringify({ success: false, error: 'Session lookup failed', code: 'DB_ERROR' }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const sessions = await sessionRes.json();
    if (!sessions || sessions.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Session not found or has been revoked', code: 'SESSION_NOT_FOUND' }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const session = sessions[0];

    // Step 3: Check DB-level expiration
    if (new Date(session.expires_at) < new Date()) {
      return new Response(JSON.stringify({ success: false, error: 'Session has expired', code: 'SESSION_EXPIRED' }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Step 4: Update last_active_at (fire-and-forget)
    fetch(`${DB_URL}/rest/v1/sessions?id=eq.${session.id}`, {
      method: 'PATCH',
      headers: { ...H, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ last_active_at: new Date().toISOString() }),
    }).catch(e => console.error('validate-session: update last_active_at failed:', e.message));

    // Step 5: Build user object
    const userData = session.user_data || {};
    const user = {
      id: payload.sub || session.user_id,
      name: payload.name || session.user_name,
      email: payload.email || session.user_email,
      role: payload.role || session.user_role,
      phone: userData.phone || null,
      assigned_classes: userData.assigned_classes || [],
      avatar: userData.avatar || null,
      school_id: userData.school_id || null,
    };

    return new Response(JSON.stringify({
      success: true,
      user,
      session: { sessionId: session.id, expiresAt: session.expires_at, lastActiveAt: session.last_active_at },
    }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

  } catch (err: any) {
    console.error('validate-session error:', err.message, err.stack);
    return new Response(JSON.stringify({ success: false, error: err.message || 'Internal server error', code: 'INTERNAL_ERROR' }), {
      status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
