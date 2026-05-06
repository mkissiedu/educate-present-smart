import { supabase } from './supabase';

export interface TwilioInitConfig {
  account_sid: string;
  auth_token: string;
  phone_number: string;
  whatsapp_number?: string;
  whatsapp_enabled?: boolean;
}

/**
 * Initialize or update Twilio SMS configuration in the database
 * This creates the sms_config entry in system_settings table
 */
export const initializeTwilioConfig = async (config: TwilioInitConfig): Promise<{ success: boolean; error?: string }> => {
  try {
    const smsConfig = {
      provider: 'twilio',
      enabled: true,
      account_sid: config.account_sid,
      auth_token: config.auth_token,
      phone_number: config.phone_number,
      whatsapp_number: config.whatsapp_number || '',
      whatsapp_enabled: config.whatsapp_enabled || false
    };

    // First, try to check if the setting exists
    const { data: existing, error: fetchError } = await supabase
      .from('system_settings')
      .select('id')
      .eq('setting_key', 'sms_config')
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking existing config:', fetchError);
      return { success: false, error: fetchError.message };
    }

    if (existing) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('system_settings')
        .update({
          setting_value: smsConfig,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', 'sms_config');

      if (updateError) {
        console.error('Error updating config:', updateError);
        return { success: false, error: updateError.message };
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('system_settings')
        .insert({
          setting_key: 'sms_config',
          setting_value: smsConfig,
          description: 'Twilio SMS/WhatsApp configuration for OTP delivery',
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error inserting config:', insertError);
        return { success: false, error: insertError.message };
      }
    }

    console.log('Twilio configuration saved successfully');
    return { success: true };
  } catch (err: any) {
    console.error('Exception initializing Twilio config:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Verify that Twilio config exists and is properly configured
 */
export const verifyTwilioConfig = async (): Promise<{ 
  exists: boolean; 
  enabled: boolean; 
  hasCredentials: boolean;
  config?: any;
}> => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', 'sms_config')
      .maybeSingle();

    if (error || !data) {
      return { exists: false, enabled: false, hasCredentials: false };
    }

    const config = data.setting_value;
    return {
      exists: true,
      enabled: config?.enabled || false,
      hasCredentials: !!(config?.account_sid && config?.auth_token && config?.phone_number),
      config
    };
  } catch (err) {
    console.error('Error verifying Twilio config:', err);
    return { exists: false, enabled: false, hasCredentials: false };
  }
};

/**
 * Generate SQL script to manually insert Twilio config
 * User can run this in Supabase SQL editor if needed
 */
export const generateTwilioConfigSQL = (config: TwilioInitConfig): string => {
  const smsConfig = {
    provider: 'twilio',
    enabled: true,
    account_sid: config.account_sid,
    auth_token: config.auth_token,
    phone_number: config.phone_number,
    whatsapp_number: config.whatsapp_number || '',
    whatsapp_enabled: config.whatsapp_enabled || false
  };

  return `
-- Twilio SMS Configuration
-- Run this in Supabase SQL Editor

-- First, ensure the system_settings table exists
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID
);

-- Insert or update the SMS config
INSERT INTO system_settings (setting_key, setting_value, description, updated_at)
VALUES (
  'sms_config',
  '${JSON.stringify(smsConfig)}'::jsonb,
  'Twilio SMS/WhatsApp configuration for OTP delivery',
  NOW()
)
ON CONFLICT (setting_key) 
DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  updated_at = NOW();

-- Verify the config was saved
SELECT * FROM system_settings WHERE setting_key = 'sms_config';
`;
};
