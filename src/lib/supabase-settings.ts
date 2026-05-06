import { supabase } from './supabase';

export type EmailProvider = 'resend' | 'sendgrid' | 'mailgun';

export interface EmailConfig {
  provider: EmailProvider;
  api_key: string;
  from_email: string;
  from_name: string;
  domain?: string; // For Mailgun
  enabled: boolean;
}

// Legacy SMTP config for backward compatibility
export interface SMTPConfig extends EmailConfig {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
}

export interface SMSConfig {
  provider: 'twilio' | 'custom';
  enabled: boolean;
  // Twilio credentials
  account_sid?: string;
  auth_token?: string;
  phone_number?: string;
  // WhatsApp settings
  whatsapp_number?: string;
  whatsapp_enabled?: boolean;
  // Custom provider settings
  api_key?: string;
  sender_id?: string;
  api_url?: string;
}

export interface TwilioCredentials {
  account_sid: string;
  auth_token: string;
  phone_number: string;
  whatsapp_number?: string;
  whatsapp_enabled: boolean;
}

export interface SMSTemplate {
  id: string;
  template_key: string;
  template_name: string;
  template_content: string;
  placeholders: string[];
  is_active: boolean;
}

export const fetchSystemSetting = async <T>(key: string): Promise<T | null> => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', key)
      .single();
    
    if (error) {
      console.error('Fetch setting error:', key, error.message, error.code);
      return null;
    }
    return data?.setting_value as T;
  } catch (err: any) {
    console.error('Fetch setting exception:', key, err.message);
    return null;
  }
};

export const updateSystemSetting = async (key: string, value: any, updatedBy?: string): Promise<boolean> => {
  try {
    console.log('Updating setting:', key, value);
    
    const { data, error } = await supabase
      .from('system_settings')
      .update({
        setting_value: value,
        updated_at: new Date().toISOString(),
        updated_by: updatedBy || null
      })
      .eq('setting_key', key)
      .select();
    
    if (error) {
      console.error('Update setting error:', key, error.message, error.code);
      return false;
    }
    
    if (!data || data.length === 0) {
      const { error: insertError } = await supabase
        .from('system_settings')
        .insert({
          setting_key: key,
          setting_value: value,
          description: key === 'smtp_config' ? 'Email configuration' : 'SMS provider configuration',
          updated_at: new Date().toISOString(),
          updated_by: updatedBy || null
        });
      
      if (insertError) {
        console.error('Insert setting error:', key, insertError.message);
        return false;
      }
    }
    
    console.log('Setting saved successfully:', key);
    return true;
  } catch (err: any) {
    console.error('Update setting exception:', key, err.message);
    return false;
  }
};

export const fetchSMSTemplates = async (): Promise<SMSTemplate[]> => {
  try {
    const { data, error } = await supabase.from('sms_templates').select('*').order('template_name');
    if (error) return [];
    return data as SMSTemplate[];
  } catch { return []; }
};

export const updateSMSTemplate = async (id: string, content: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('sms_templates').update({ template_content: content, updated_at: new Date().toISOString() }).eq('id', id);
    return !error;
  } catch { return false; }
};

export const createSMSTemplate = async (template: Omit<SMSTemplate, 'id'>): Promise<SMSTemplate | null> => {
  try {
    const { data, error } = await supabase.from('sms_templates').insert(template).select().single();
    return error ? null : data as SMSTemplate;
  } catch { return null; }
};

export const deleteSMSTemplate = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('sms_templates').delete().eq('id', id);
    return !error;
  } catch { return false; }
};
