const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const RH = { 'Content-Type': 'application/json', ...corsHeaders };

  try {
    const { accountSid, authToken, fromNumber, toNumber } = await req.json();

    if (!accountSid || !authToken || !fromNumber || !toNumber) {
      return new Response(
        JSON.stringify({ success: false, error: 'accountSid, authToken, fromNumber, and toNumber are required' }),
        { status: 200, headers: RH }
      );
    }

    const credentials = btoa(`${accountSid}:${authToken}`);
    const body = new URLSearchParams({
      From: fromNumber,
      To: toNumber,
      Body: 'This is a test message from Catalyst School Management Platform. Your SMS configuration is working correctly!',
    });

    const resp = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      }
    );

    const data = await resp.json();

    if (!resp.ok || data.error_code) {
      return new Response(
        JSON.stringify({ success: false, error: data.message || `SMS failed (HTTP ${resp.status})` }),
        { status: 200, headers: RH }
      );
    }

    return new Response(
      JSON.stringify({ success: true, messageSid: data.sid, status: data.status }),
      { status: 200, headers: RH }
    );
  } catch (err: any) {
    console.error('send-test-sms error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Internal server error' }),
      { status: 200, headers: RH }
    );
  }
});
