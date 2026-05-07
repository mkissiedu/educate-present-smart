const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DB_URL = Deno.env.get('SUPABASE_URL') ?? '';
const DB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

function dbHeaders() {
  return { 'apikey': DB_KEY, 'Authorization': `Bearer ${DB_KEY}`, 'Content-Type': 'application/json' };
}

async function hashToken(token: string): Promise<string> {
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const { token, revokeAll = false, userId } = body;

    if (!token && !userId) {
      return new Response(JSON.stringify({ success: false, error: 'No session token or user ID provided', code: 'MISSING_PARAMS' }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const H = dbHeaders();

    if (revokeAll && userId) {
      // Revoke ALL sessions for this user
      const revokeRes = await fetch(
        `${DB_URL}/rest/v1/sessions?user_id=eq.${encodeURIComponent(userId)}&is_revoked=eq.false`,
        { method: 'PATCH', headers: { ...H, 'Prefer': 'return=representation' }, body: JSON.stringify({ is_revoked: true, last_active_at: new Date().toISOString() }) },
      );

      if (!revokeRes.ok) {
        const errText = await revokeRes.text();
        console.error('logout-session: revoke all failed: ' + errText);
        return new Response(JSON.stringify({ success: false, error: 'Failed to revoke sessions', code: 'DB_ERROR' }), {
          status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const revokedSessions = await revokeRes.json();
      const count = Array.isArray(revokedSessions) ? revokedSessions.length : 0;

      return new Response(JSON.stringify({ success: true, message: 'All sessions revoked', revokedCount: count }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (token) {
      // Revoke single session by token hash
      const tokenHash = await hashToken(token);

      const lookupRes = await fetch(
        `${DB_URL}/rest/v1/sessions?token_hash=eq.${encodeURIComponent(tokenHash)}&is_revoked=eq.false&select=id,user_id,user_email&limit=1`,
        { headers: H },
      );

      if (!lookupRes.ok) {
        const errText = await lookupRes.text();
        return new Response(JSON.stringify({ success: false, error: 'Session lookup failed', code: 'DB_ERROR' }), {
          status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const sessions = await lookupRes.json();
      if (!sessions || sessions.length === 0) {
        // Idempotent — already revoked is fine
        return new Response(JSON.stringify({ success: true, message: 'Session already revoked or not found', alreadyRevoked: true }), {
          status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const session = sessions[0];
      const revokeRes = await fetch(
        `${DB_URL}/rest/v1/sessions?id=eq.${session.id}`,
        { method: 'PATCH', headers: { ...H, 'Prefer': 'return=minimal' }, body: JSON.stringify({ is_revoked: true, last_active_at: new Date().toISOString() }) },
      );

      if (!revokeRes.ok) {
        const errText = await revokeRes.text();
        return new Response(JSON.stringify({ success: false, error: 'Failed to revoke session', code: 'DB_ERROR' }), {
          status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      return new Response(JSON.stringify({ success: true, message: 'Session revoked successfully', sessionId: session.id }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ success: false, error: 'Invalid request parameters', code: 'INVALID_PARAMS' }), {
      status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (err: any) {
    console.error('logout-session error:', err.message, err.stack);
    return new Response(JSON.stringify({ success: false, error: err.message || 'Internal server error', code: 'INTERNAL_ERROR' }), {
      status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
