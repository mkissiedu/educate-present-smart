import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { resetToken, newPassword, adminReset, adminId, userId } = await req.json();

    if (!newPassword) {
      return new Response(JSON.stringify({ success: false, error: 'New password is required', code: 'MISSING_PASSWORD' }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (newPassword.length < 6) {
      return new Response(JSON.stringify({ success: false, error: 'Password must be at least 6 characters', code: 'PASSWORD_TOO_SHORT' }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    if (adminReset && adminId && userId) {
      // Admin-initiated password reset
      const { data: admin, error: adminError } = await supabase.from('users').select('*').eq('id', adminId).single();

      if (adminError || !admin) {
        return new Response(JSON.stringify({ success: false, error: 'Admin user not found', code: 'ADMIN_NOT_FOUND' }), {
          status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const adminRoles = ['school_admin', 'platform_admin', 'super_admin'];
      if (!adminRoles.includes(admin.role)) {
        return new Response(JSON.stringify({ success: false, error: 'Insufficient permissions to reset passwords', code: 'INSUFFICIENT_PERMISSIONS' }), {
          status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const { error: updateError } = await supabase.from('users')
        .update({ password_hash: newPassword, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (updateError) {
        console.error('Admin password reset error:', updateError);
        return new Response(JSON.stringify({ success: false, error: 'Failed to reset password', code: 'UPDATE_FAILED' }), {
          status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      return new Response(JSON.stringify({ success: true, message: 'Password has been reset successfully by admin' }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });

    } else if (resetToken) {
      // Token-based password reset
      const { data: tokenRecord, error: tokenError } = await supabase
        .from('password_reset_tokens')
        .select('*')
        .eq('token', resetToken)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (tokenError || !tokenRecord) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid or expired reset token. Please request a new password reset.', code: 'INVALID_TOKEN' }), {
          status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      await supabase.from('password_reset_tokens').update({ used: true }).eq('id', tokenRecord.id);

      const { error: updateError } = await supabase.from('users')
        .update({ password_hash: newPassword, updated_at: new Date().toISOString() })
        .eq('id', tokenRecord.user_id);

      if (updateError) {
        console.error('Password reset error:', updateError);
        return new Response(JSON.stringify({ success: false, error: 'Failed to update password', code: 'UPDATE_FAILED' }), {
          status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Invalidate all other reset tokens for this user
      await supabase.from('password_reset_tokens').update({ used: true }).eq('user_id', tokenRecord.user_id).eq('used', false);

      return new Response(JSON.stringify({ success: true, message: 'Password has been reset successfully. You can now log in with your new password.' }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });

    } else {
      return new Response(JSON.stringify({ success: false, error: 'Reset token or admin credentials required', code: 'MISSING_PARAMS' }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

  } catch (err: any) {
    console.error('reset-password error:', err);
    return new Response(JSON.stringify({ success: false, error: err.message || 'Internal server error', code: 'INTERNAL_ERROR' }), {
      status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
