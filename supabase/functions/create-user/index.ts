const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DB_URL = Deno.env.get('SUPABASE_URL') ?? '';
const DB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const H = { 'apikey': DB_KEY, 'Authorization': `Bearer ${DB_KEY}`, 'Content-Type': 'application/json' };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const RH = { 'Content-Type': 'application/json', ...corsHeaders };

  try {
    const { name, email, phone, password, role, assignedClasses, school_id } = await req.json();
    console.log('create-user: ' + email + ' role=' + role);

    if (!name || !email || !password || !role) {
      return new Response(JSON.stringify({ success: false, error: 'Name, email, password, and role are required', code: 'MISSING_FIELDS' }), { status: 200, headers: RH });
    }

    const validRoles = ['teacher', 'super_teacher', 'school_admin', 'platform_admin', 'super_admin'];
    if (!validRoles.includes(role)) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid role', code: 'INVALID_ROLE' }), { status: 200, headers: RH });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid email format', code: 'INVALID_EMAIL' }), { status: 200, headers: RH });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check for duplicate email
    const dupResp = await fetch(`${DB_URL}/rest/v1/users?email=eq.${encodeURIComponent(cleanEmail)}&select=id&limit=1`, { headers: H });
    if (!dupResp.ok) {
      const errText = await dupResp.text();
      return new Response(JSON.stringify({ success: false, error: 'Failed to verify email: ' + errText, code: 'DUP_CHECK_FAILED' }), { status: 200, headers: RH });
    }

    const existing = await dupResp.json();
    if (existing && existing.length > 0) {
      return new Response(JSON.stringify({ success: false, error: 'A user with this email already exists', code: 'EMAIL_EXISTS' }), { status: 200, headers: RH });
    }

    const userData: Record<string, any> = {
      name,
      email: cleanEmail,
      password_hash: password,
      role,
      assigned_classes: assignedClasses || [],
      created_at: new Date().toISOString(),
    };
    if (phone) userData.phone = String(phone).replace(/\s/g, '');
    if (school_id) userData.school_id = school_id;

    const insertResp = await fetch(`${DB_URL}/rest/v1/users`, {
      method: 'POST',
      headers: { ...H, 'Prefer': 'return=representation' },
      body: JSON.stringify(userData),
    });

    if (!insertResp.ok) {
      const errText = await insertResp.text();
      console.error('create-user insert failed: ' + insertResp.status + ' ' + errText);
      return new Response(JSON.stringify({ success: false, error: 'Failed to insert user: ' + errText, code: 'INSERT_FAILED' }), { status: 200, headers: RH });
    }

    const inserted = await insertResp.json();
    if (!inserted || inserted.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'No record returned', code: 'NO_RECORD_RETURNED' }), { status: 200, headers: RH });
    }

    const u = inserted[0];
    console.log('create-user: success id=' + u.id);

    return new Response(JSON.stringify({
      success: true,
      user: { id: u.id, name: u.name, email: u.email, phone: u.phone || null, role: u.role, assigned_classes: u.assigned_classes || [], school_id: u.school_id || null, avatar: u.avatar || null, is_active: true },
    }), { status: 200, headers: RH });

  } catch (err: any) {
    console.error('create-user error:', err);
    return new Response(JSON.stringify({ success: false, error: err.message || 'Internal server error', code: 'INTERNAL_ERROR' }), { status: 200, headers: RH });
  }
});
