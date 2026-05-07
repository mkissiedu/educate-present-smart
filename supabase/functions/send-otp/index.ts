const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DB_URL = Deno.env.get('SUPABASE_URL') ?? '';
const DB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const dbHeaders: Record<string, string> = {
  'apikey': DB_KEY,
  'Authorization': `Bearer ${DB_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
};

async function dbGet(table: string, params: string): Promise<any[]> {
  const res = await fetch(`${DB_URL}/rest/v1/${table}?${params}`, { method: 'GET', headers: dbHeaders });
  if (!res.ok) throw new Error(`DB GET ${table} ${res.status}: ${await res.text()}`);
  return await res.json();
}

async function dbPost(table: string, body: Record<string, any>): Promise<any[]> {
  const res = await fetch(`${DB_URL}/rest/v1/${table}`, { method: 'POST', headers: dbHeaders, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`DB POST ${table} ${res.status}: ${await res.text()}`);
  return await res.json();
}

async function dbPatch(table: string, params: string, body: Record<string, any>): Promise<void> {
  const res = await fetch(`${DB_URL}/rest/v1/${table}?${params}`, {
    method: 'PATCH',
    headers: { ...dbHeaders, 'Prefer': 'return=minimal' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`DB PATCH ${table} ${res.status}: ${await res.text()}`);
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  return `${local[0]}***@${domain}`;
}

function maskPhone(phone: string): string {
  if (phone.length <= 6) return '***' + phone.slice(-3);
  return phone.slice(0, 4) + '***' + phone.slice(-3);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { identifier, type = 'login', preferWhatsApp = false } = await req.json();
    console.log('send-otp: identifier=' + identifier);

    if (!identifier) {
      return new Response(JSON.stringify({ success: false, error: 'Identifier is required', code: 'MISSING_IDENTIFIER' }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const isEmail = identifier.includes('@');
    const isPhone = /^\+?\d{10,15}$/.test(identifier.replace(/\s/g, ''));

    // Look up user
    let queryParam: string;
    if (isEmail) {
      queryParam = `email=eq.${encodeURIComponent(identifier.toLowerCase().trim())}&select=*`;
    } else if (isPhone) {
      queryParam = `phone=eq.${encodeURIComponent(identifier.replace(/\s/g, ''))}&select=*`;
    } else {
      queryParam = `email=eq.${encodeURIComponent(identifier.toLowerCase().trim())}&select=*`;
    }

    const users = await dbGet('users', queryParam);
    const user = users.length > 0 ? users[0] : null;

    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No account found with this email or phone number',
        code: 'USER_NOT_FOUND',
      }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Generate 6-digit OTP
    const codeArray = new Uint32Array(1);
    crypto.getRandomValues(codeArray);
    const code = String(codeArray[0] % 1000000).padStart(6, '0');

    // Invalidate previous unused OTPs
    try {
      await dbPatch('otp_codes', `identifier=eq.${encodeURIComponent(identifier)}&used=eq.false`, { used: true });
    } catch (_e) { /* ignore */ }

    // Insert new OTP
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await dbPost('otp_codes', { identifier, code, type, expires_at: expiresAt, attempts: 0, max_attempts: 5, used: false });

    const maskedEmail = user.email ? maskEmail(user.email) : undefined;
    const maskedPhone = user.phone ? maskPhone(user.phone) : undefined;
    const method = isEmail ? 'email' : (preferWhatsApp ? 'whatsapp' : 'sms');

    let sent = false;
    let sendError: string | undefined;

    if (!isEmail && (method === 'sms' || method === 'whatsapp')) {
      try {
        const configs = await dbGet('system_settings', 'setting_key=eq.sms_config&select=setting_value');
        const config = configs.length > 0 ? configs[0]?.setting_value : null;
        if (config?.enabled && config?.account_sid && config?.auth_token && config?.from_number) {
          const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${config.account_sid}/Messages.json`;
          const twilioAuth = btoa(`${config.account_sid}:${config.auth_token}`);
          const fromNum = (method === 'whatsapp' && config.whatsapp_enabled && config.whatsapp_number)
            ? `whatsapp:${config.whatsapp_number}` : config.from_number;
          const toNum = (method === 'whatsapp' && config.whatsapp_enabled)
            ? `whatsapp:${user.phone}` : user.phone;
          const body = new URLSearchParams({
            From: fromNum, To: toNum,
            Body: `Your verification code is: ${code}. It expires in 10 minutes.`,
          });
          const twilioRes = await fetch(twilioUrl, {
            method: 'POST',
            headers: { 'Authorization': `Basic ${twilioAuth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
          });
          sent = twilioRes.ok;
          if (!sent) sendError = 'SMS/WhatsApp delivery failed';
        } else {
          sendError = 'SMS provider not configured';
        }
      } catch (e: any) { sendError = `Twilio error: ${e.message}`; }

    } else if (isEmail) {
      try {
        const configs = await dbGet('system_settings', 'setting_key=eq.smtp_config&select=setting_value');
        const config = configs.length > 0 ? configs[0]?.setting_value : null;
        if (config?.enabled && config?.api_key && config?.provider) {
          const emailBody = `<h2>Your Verification Code</h2><p>Your code is: <strong style="font-size:24px;letter-spacing:4px;">${code}</strong></p><p>This code expires in 10 minutes.</p>`;
          if (config.provider === 'resend') {
            const res = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${config.api_key}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ from: config.from_email || 'noreply@catalyst.edu', to: user.email, subject: `Your verification code: ${code}`, html: emailBody }),
            });
            sent = res.ok;
          } else if (config.provider === 'sendgrid') {
            const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${config.api_key}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                personalizations: [{ to: [{ email: user.email }] }],
                from: { email: config.from_email || 'noreply@catalyst.edu' },
                subject: `Your verification code: ${code}`,
                content: [{ type: 'text/html', value: emailBody }],
              }),
            });
            sent = res.ok || res.status === 202;
          }
          if (!sent) sendError = 'Email delivery failed';
        } else {
          sendError = 'Email provider not configured';
        }
      } catch (e: any) { sendError = `Email error: ${e.message}`; }
    }

    const response: Record<string, any> = {
      success: true,
      message: sent ? 'OTP sent successfully' : 'OTP generated (delivery not configured)',
      expiresIn: 600,
      sent,
      method,
    };
    if (maskedPhone) response.maskedPhone = maskedPhone;
    if (maskedEmail) response.maskedEmail = maskedEmail;
    if (!sent) {
      response.sendError = sendError || 'Delivery method not configured';
      response.demoCode = code;
    }

    return new Response(JSON.stringify(response), {
      status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (err: any) {
    console.error('send-otp error:', err);
    return new Response(JSON.stringify({ success: false, error: err.message || 'Internal server error', code: 'INTERNAL_ERROR' }), {
      status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
