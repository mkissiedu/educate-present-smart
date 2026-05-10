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
    const { school, admin, createdBy } = await req.json();
    console.log('create-school:', school?.name, '| admin:', admin?.email);

    if (!school?.name || !school?.code) {
      return new Response(JSON.stringify({ success: false, error: 'School name and code are required', code: 'MISSING_FIELDS' }), { status: 200, headers: RH });
    }
    if (!admin?.name || !admin?.email || !admin?.password) {
      return new Response(JSON.stringify({ success: false, error: 'Admin name, email, and password are required', code: 'MISSING_ADMIN_FIELDS' }), { status: 200, headers: RH });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(admin.email)) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid admin email format', code: 'INVALID_EMAIL' }), { status: 200, headers: RH });
    }

    const cleanEmail = admin.email.toLowerCase().trim();
    const cleanCode = school.code.toUpperCase().trim();
    const now = new Date().toISOString();

    // Check for duplicate school code
    const dupSchoolResp = await fetch(
      `${DB_URL}/rest/v1/schools?code=eq.${encodeURIComponent(cleanCode)}&select=id&limit=1`,
      { headers: H }
    );
    if (!dupSchoolResp.ok) {
      const t = await dupSchoolResp.text();
      return new Response(JSON.stringify({ success: false, error: 'Failed to check school code: ' + t, code: 'DUP_CHECK_FAILED' }), { status: 200, headers: RH });
    }
    const existingSchools = await dupSchoolResp.json();
    if (existingSchools?.length > 0) {
      return new Response(JSON.stringify({ success: false, error: 'A school with this code already exists', code: 'CODE_EXISTS' }), { status: 200, headers: RH });
    }

    // Check for duplicate admin email
    const dupUserResp = await fetch(
      `${DB_URL}/rest/v1/users?email=eq.${encodeURIComponent(cleanEmail)}&select=id&limit=1`,
      { headers: H }
    );
    if (!dupUserResp.ok) {
      const t = await dupUserResp.text();
      return new Response(JSON.stringify({ success: false, error: 'Failed to check admin email: ' + t, code: 'DUP_CHECK_FAILED' }), { status: 200, headers: RH });
    }
    const existingUsers = await dupUserResp.json();
    if (existingUsers?.length > 0) {
      return new Response(JSON.stringify({ success: false, error: 'A user with this email already exists', code: 'EMAIL_EXISTS' }), { status: 200, headers: RH });
    }

    // Insert school
    const schoolPayload: Record<string, any> = {
      name: school.name,
      code: cleanCode,
      is_active: true,
      created_at: now,
      updated_at: now,
    };
    if (school.address) schoolPayload.address = school.address;
    if (school.phone) schoolPayload.phone = school.phone;
    if (school.email) schoolPayload.email = school.email;
    if (school.motto) schoolPayload.motto = school.motto;
    if (school.academic_year) schoolPayload.academic_year = school.academic_year;
    if (school.logo_url) schoolPayload.logo_url = school.logo_url;

    const schoolInsertResp = await fetch(`${DB_URL}/rest/v1/schools`, {
      method: 'POST',
      headers: { ...H, 'Prefer': 'return=representation' },
      body: JSON.stringify(schoolPayload),
    });

    if (!schoolInsertResp.ok) {
      const errText = await schoolInsertResp.text();
      console.error('create-school: school insert failed:', schoolInsertResp.status, errText);
      return new Response(JSON.stringify({ success: false, error: 'Failed to create school: ' + errText, code: 'SCHOOL_INSERT_FAILED' }), { status: 200, headers: RH });
    }

    const schoolInserted = await schoolInsertResp.json();
    if (!schoolInserted || schoolInserted.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'No school record returned', code: 'NO_RECORD_RETURNED' }), { status: 200, headers: RH });
    }
    const createdSchool = schoolInserted[0];
    console.log('create-school: school created id=' + createdSchool.id);

    // Insert admin user linked to the new school
    const adminPayload: Record<string, any> = {
      name: admin.name,
      email: cleanEmail,
      password_hash: admin.password,
      role: 'school_admin',
      school_id: createdSchool.id,
      assigned_classes: [],
      created_at: now,
      updated_at: now,
    };
    if (admin.phone) adminPayload.phone = String(admin.phone).replace(/\s/g, '');
    if (createdBy) adminPayload.created_by = createdBy;

    const userInsertResp = await fetch(`${DB_URL}/rest/v1/users`, {
      method: 'POST',
      headers: { ...H, 'Prefer': 'return=representation' },
      body: JSON.stringify(adminPayload),
    });

    if (!userInsertResp.ok) {
      const errText = await userInsertResp.text();
      console.error('create-school: admin insert failed:', userInsertResp.status, errText);
      // Roll back the school so we don't leave orphaned records
      await fetch(`${DB_URL}/rest/v1/schools?id=eq.${createdSchool.id}`, { method: 'DELETE', headers: H });
      return new Response(JSON.stringify({ success: false, error: 'Failed to create admin user: ' + errText, code: 'ADMIN_INSERT_FAILED' }), { status: 200, headers: RH });
    }

    const userInserted = await userInsertResp.json();
    if (!userInserted || userInserted.length === 0) {
      await fetch(`${DB_URL}/rest/v1/schools?id=eq.${createdSchool.id}`, { method: 'DELETE', headers: H });
      return new Response(JSON.stringify({ success: false, error: 'No admin record returned', code: 'NO_RECORD_RETURNED' }), { status: 200, headers: RH });
    }
    const u = userInserted[0];
    console.log('create-school: admin created id=' + u.id);

    return new Response(JSON.stringify({
      success: true,
      school: createdSchool,
      admin: {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || null,
        role: u.role,
        assigned_classes: u.assigned_classes || [],
        school_id: u.school_id,
        avatar: u.avatar || null,
        is_active: true,
      },
    }), { status: 200, headers: RH });

  } catch (err: any) {
    console.error('create-school error:', err);
    return new Response(JSON.stringify({ success: false, error: err.message || 'Internal server error', code: 'INTERNAL_ERROR' }), { status: 200, headers: RH });
  }
});
