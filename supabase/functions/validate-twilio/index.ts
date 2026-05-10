const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const RH = { 'Content-Type': 'application/json', ...corsHeaders };

  try {
    const { accountSid, authToken, phoneNumber, whatsappNumber } = await req.json();

    if (!accountSid || !authToken) {
      return new Response(
        JSON.stringify({ success: false, error: 'Account SID and Auth Token are required' }),
        { status: 200, headers: RH }
      );
    }

    const credentials = btoa(`${accountSid}:${authToken}`);

    // Verify credentials by fetching account info from Twilio
    const accountResp = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`,
      { headers: { Authorization: `Basic ${credentials}` } }
    );

    if (!accountResp.ok) {
      const err = await accountResp.json().catch(() => ({}));
      return new Response(
        JSON.stringify({ success: false, error: err.message || `Invalid credentials (HTTP ${accountResp.status})` }),
        { status: 200, headers: RH }
      );
    }

    const account = await accountResp.json();
    const validations: Record<string, boolean> = {};

    // Verify SMS phone number if provided
    if (phoneNumber) {
      const numResp = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers.json?PhoneNumber=${encodeURIComponent(phoneNumber)}`,
        { headers: { Authorization: `Basic ${credentials}` } }
      );
      if (numResp.ok) {
        const numData = await numResp.json();
        validations.smsNumber = (numData.incoming_phone_numbers?.length ?? 0) > 0;
      }
    }

    // Verify WhatsApp number if provided
    if (whatsappNumber) {
      const waResp = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers.json?PhoneNumber=${encodeURIComponent(whatsappNumber)}`,
        { headers: { Authorization: `Basic ${credentials}` } }
      );
      if (waResp.ok) {
        const waData = await waResp.json();
        validations.whatsappNumber = (waData.incoming_phone_numbers?.length ?? 0) > 0;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        accountName: account.friendly_name || account.status,
        status: account.status,
        validations,
      }),
      { status: 200, headers: RH }
    );
  } catch (err: any) {
    console.error('validate-twilio error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Internal server error' }),
      { status: 200, headers: RH }
    );
  }
});
