/**
 * OTP Authentication Module
 * 
 * Handles send-otp, verify-otp, and reset-password edge function calls.
 * Uses the edge-functions helper for proper response normalization
 * and user data mapping from the bdiqvamaufgdvkjozenl database.
 */

import {
  callEdgeFunction,
  normalizeSendOTPResponse,
  normalizeVerifyOTPResponse,
  NormalizedSendOTPResponse,
  NormalizedVerifyOTPResponse,
} from './edge-functions';

// Re-export types for backward compatibility
export type SendOTPResponse = NormalizedSendOTPResponse;
export type VerifyOTPResponse = NormalizedVerifyOTPResponse;

export interface ResetPasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// ─── Send OTP ────────────────────────────────────────────────────────

export const sendOTP = async (
  identifier: string,
  type: 'login' | 'reset' = 'login',
  preferWhatsApp: boolean = false
): Promise<SendOTPResponse> => {
  console.log('[OTP] sendOTP called:', { identifier, type, preferWhatsApp });

  const { data, error } = await callEdgeFunction('send-otp', {
    identifier: identifier.trim(),
    type,
    preferWhatsApp,
  });

  // If the call itself failed (network error, function not found, etc.)
  if (error && !data) {
    console.error('[OTP] sendOTP failed:', error);
    return { success: false, error };
  }

  // Normalize the response (handles snake_case → camelCase)
  const normalized = normalizeSendOTPResponse(data);
  console.log('[OTP] sendOTP normalized response:', normalized);

  return normalized;
};

// ─── Verify OTP ──────────────────────────────────────────────────────

export const verifyOTP = async (
  identifier: string,
  code: string,
  type: 'login' | 'reset' = 'login'
): Promise<VerifyOTPResponse> => {
  console.log('[OTP] verifyOTP called:', { identifier, code: '***', type });

  const { data, error } = await callEdgeFunction('verify-otp', {
    identifier: identifier.trim(),
    code: code.trim(),
    type,
  });

  // If the call itself failed
  if (error && !data) {
    console.error('[OTP] verifyOTP failed:', error);
    return { success: false, error };
  }

  // Normalize the response (maps DB user row to frontend User type + session)
  const normalized = normalizeVerifyOTPResponse(data);
  console.log('[OTP] verifyOTP normalized response:', {
    success: normalized.success,
    hasUser: !!normalized.user,
    userId: normalized.user?.id,
    userRole: normalized.user?.role,
    hasSession: !!normalized.session,
    sessionId: normalized.session?.sessionId,
    type: normalized.type,
  });

  return normalized;

};

// ─── Reset Password ──────────────────────────────────────────────────

export const resetPassword = async (
  resetToken: string,
  newPassword: string
): Promise<ResetPasswordResponse> => {
  console.log('[OTP] resetPassword called');

  const { data, error } = await callEdgeFunction('reset-password', {
    resetToken,
    newPassword,
  });

  if (error && !data) {
    return { success: false, error };
  }

  if (data?.error) {
    return { success: false, error: data.error };
  }

  return {
    success: data?.success ?? true,
    message: data?.message || 'Password reset successfully',
  };
};

// ─── Admin Reset Password ────────────────────────────────────────────

export const adminResetPassword = async (
  adminId: string,
  userId: string,
  newPassword: string
): Promise<ResetPasswordResponse> => {
  console.log('[OTP] adminResetPassword called for user:', userId);

  const { data, error } = await callEdgeFunction('reset-password', {
    adminReset: true,
    adminId,
    userId,
    newPassword,
  });

  if (error && !data) {
    return { success: false, error };
  }

  if (data?.error) {
    return { success: false, error: data.error };
  }

  return {
    success: data?.success ?? true,
    message: data?.message || 'Password reset successfully',
  };
};
