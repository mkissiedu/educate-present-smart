const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DB_URL = Deno.env.get('SUPABASE_URL') ?? '';
const DB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const H = { 'apikey': DB_KEY, 'Authorization': `Bearer ${DB_KEY}`, 'Content-Type': 'application/json' };

async function getEmailConfig(): Promise<{ api_key: string; from_email: string; from_name: string; provider: string } | null> {
  const resp = await fetch(
    `${DB_URL}/rest/v1/system_settings?setting_key=eq.smtp_config&select=setting_value&limit=1`,
    { headers: H }
  );
  if (!resp.ok) return null;
  const rows = await resp.json();
  return rows?.[0]?.setting_value ?? null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const RH = { 'Content-Type': 'application/json', ...corsHeaders };

  try {
    const { to, subject: emailSubject, templateType, templateData, html, text } = await req.json();

    if (!to) {
      return new Response(
        JSON.stringify({ success: false, error: 'Recipient email (to) is required' }),
        { status: 200, headers: RH }
      );
    }

    const config = await getEmailConfig();
    if (!config?.api_key || !config?.from_email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email not configured. Set up email settings in System Settings first.' }),
        { status: 200, headers: RH }
      );
    }

    // Build HTML body from template or use provided html/text
    let bodyHtml = html || '';
    let bodySubject = emailSubject || 'Notification from Catalyst';

    if (!bodyHtml && templateType === 'notification' && templateData) {
      bodySubject = templateData.title || bodySubject;
      bodyHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #7c3aed, #db2777); padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 22px;">Catalyst School Platform</h1>
          </div>
          <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #1f2937; margin-top: 0;">${templateData.title || 'Notification'}</h2>
            <p style="color: #4b5563; line-height: 1.6;">${templateData.message || ''}</p>
            ${templateData.actionUrl ? `<a href="${templateData.actionUrl}" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">${templateData.actionLabel || 'View'}</a>` : ''}
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">Catalyst School Management Platform</p>
          </div>
        </div>
      `;
    }

    if (!bodyHtml && text) {
      bodyHtml = `<p style="font-family: Arial, sans-serif; color: #1f2937;">${text.replace(/\n/g, '<br/>')}</p>`;
    }

    // Send via Resend (default) or other providers
    if (config.provider === 'resend' || !config.provider) {
      const resendResp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${config.from_name || 'Catalyst'} <${config.from_email}>`,
          to: Array.isArray(to) ? to : [to],
          subject: bodySubject,
          html: bodyHtml || '<p>No content</p>',
        }),
      });

      const resendData = await resendResp.json();

      if (!resendResp.ok) {
        return new Response(
          JSON.stringify({ success: false, sent: false, error: resendData.message || `Resend error (HTTP ${resendResp.status})` }),
          { status: 200, headers: RH }
        );
      }

      return new Response(
        JSON.stringify({ success: true, sent: true, id: resendData.id }),
        { status: 200, headers: RH }
      );
    }

    // SendGrid fallback
    if (config.provider === 'sendgrid') {
      const sgResp = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: Array.isArray(to) ? to[0] : to }] }],
          from: { email: config.from_email, name: config.from_name || 'Catalyst' },
          subject: bodySubject,
          content: [{ type: 'text/html', value: bodyHtml || '<p>No content</p>' }],
        }),
      });

      if (!sgResp.ok) {
        const err = await sgResp.text();
        return new Response(
          JSON.stringify({ success: false, sent: false, error: err }),
          { status: 200, headers: RH }
        );
      }

      return new Response(
        JSON.stringify({ success: true, sent: true }),
        { status: 200, headers: RH }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: `Unsupported email provider: ${config.provider}` }),
      { status: 200, headers: RH }
    );
  } catch (err: any) {
    console.error('send-email error:', err);
    return new Response(
      JSON.stringify({ success: false, sent: false, error: err.message || 'Internal server error' }),
      { status: 200, headers: RH }
    );
  }
});
