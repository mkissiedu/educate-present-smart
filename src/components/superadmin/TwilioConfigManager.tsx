import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { fetchSystemSetting, updateSystemSetting, SMSConfig } from '@/lib/supabase-settings';
import { supabase } from '@/lib/supabase';
import { 
  Phone, MessageSquare, Loader2, CheckCircle, AlertCircle, 
  Send, Eye, EyeOff, Zap, RefreshCw, ExternalLink, Settings2
} from 'lucide-react';

interface ValidationResult {
  success: boolean;
  accountName?: string;
  error?: string;
  validations?: {
    smsNumber?: boolean;
    whatsappNumber?: boolean;
  };
  testSmsSent?: boolean;
  testSmsError?: string;
}

export const TwilioConfigManager: React.FC = () => {
  const [config, setConfig] = useState<SMSConfig>({
    provider: 'twilio',
    enabled: false,
    account_sid: '',
    auth_token: '',
    phone_number: '',
    whatsapp_number: '',
    whatsapp_enabled: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [showCredentials, setShowCredentials] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    const data = await fetchSystemSetting<SMSConfig>('sms_config');
    if (data) {
      setConfig({ ...config, ...data });
    }
    setLoading(false);
  };

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleValidate = async () => {
    if (!config.account_sid || !config.auth_token) {
      showMessage('Please enter Account SID and Auth Token', 'error');
      return;
    }
    
    setValidating(true);
    setValidationResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('validate-twilio', {
        body: {
          accountSid: config.account_sid,
          authToken: config.auth_token,
          phoneNumber: config.phone_number,
          whatsappNumber: config.whatsapp_number
        }
      });
      
      if (error) throw error;
      setValidationResult(data);
      
      if (data?.success) {
        showMessage(`Connected to Twilio: ${data.accountName}`);
      } else {
        showMessage(data?.error || 'Validation failed', 'error');
      }
    } catch (err: any) {
      showMessage(err.message || 'Failed to validate credentials', 'error');
    }
    
    setValidating(false);
  };

  const handleSave = async () => {
    if (!config.account_sid || !config.auth_token) {
      showMessage('Account SID and Auth Token are required', 'error');
      return;
    }
    
    setSaving(true);
    const success = await updateSystemSetting('sms_config', {
      ...config,
      provider: 'twilio'
    });
    setSaving(false);
    
    if (success) {
      showMessage('Configuration saved successfully!');
    } else {
      showMessage('Failed to save configuration', 'error');
    }
  };

  const handleTestSMS = async () => {
    if (!testPhone) {
      showMessage('Enter a phone number to test', 'error');
      return;
    }
    
    if (!config.account_sid || !config.auth_token || !config.phone_number) {
      showMessage('Please configure and save Twilio credentials first', 'error');
      return;
    }
    
    setTesting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-test-sms', {
        body: {
          accountSid: config.account_sid,
          authToken: config.auth_token,
          fromNumber: config.phone_number,
          toNumber: testPhone
        }
      });
      
      if (error) throw error;
      
      if (data?.success) {
        showMessage(`Test SMS sent to ${testPhone}`);
      } else {
        showMessage(data?.error || 'Failed to send test SMS', 'error');
      }
    } catch (err: any) {
      showMessage(err.message || 'Failed to send test SMS', 'error');
    }
    
    setTesting(false);
  };

  if (loading) {
    return (
      <Card className="border-2 border-purple-200">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Settings2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-purple-800">Twilio SMS Configuration</CardTitle>
              <CardDescription>Configure SMS & WhatsApp for OTP delivery</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={config.enabled ? 'default' : 'secondary'} 
              className={config.enabled ? 'bg-green-500' : ''}
            >
              {config.enabled ? 'Active' : 'Inactive'}
            </Badge>
            <Button variant="ghost" size="icon" onClick={loadConfig}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-6">
        {/* Enable Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <Label className="font-semibold">Enable Twilio SMS</Label>
            <p className="text-sm text-gray-500">Send OTP codes via SMS</p>
          </div>
          <Switch 
            checked={config.enabled} 
            onCheckedChange={(enabled) => setConfig({ ...config, enabled })} 
          />
        </div>

        {/* Credentials Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Twilio Credentials</h3>
            <a 
              href="https://console.twilio.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-purple-600 hover:underline flex items-center gap-1"
            >
              Open Twilio Console <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Account SID</Label>
              <div className="relative mt-1">
                <Input
                  type={showCredentials ? 'text' : 'password'}
                  value={config.account_sid || ''}
                  onChange={(e) => setConfig({ ...config, account_sid: e.target.value })}
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="pr-10 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowCredentials(!showCredentials)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCredentials ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Starts with "AC", found on Twilio dashboard</p>
            </div>
            
            <div>
              <Label>Auth Token</Label>
              <div className="relative mt-1">
                <Input
                  type={showCredentials ? 'text' : 'password'}
                  value={config.auth_token || ''}
                  onChange={(e) => setConfig({ ...config, auth_token: e.target.value })}
                  placeholder="32-character auth token"
                  className="pr-10 font-mono text-sm"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">32-character alphanumeric token</p>
            </div>
          </div>
          
          <div>
            <Label>SMS Phone Number</Label>
            <Input
              value={config.phone_number || ''}
              onChange={(e) => setConfig({ ...config, phone_number: e.target.value })}
              placeholder="+1234567890"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Your Twilio phone number with country code</p>
          </div>
        </div>

        {/* Validate Button */}
        <Button 
          onClick={handleValidate} 
          disabled={validating || !config.account_sid || !config.auth_token}
          variant="outline"
          className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
        >
          {validating ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Zap className="w-4 h-4 mr-2" />
          )}
          Validate Credentials
        </Button>

        {/* Validation Result */}
        {validationResult && (
          <div className={`p-4 rounded-lg ${
            validationResult.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-2 font-medium">
              {validationResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={validationResult.success ? 'text-green-700' : 'text-red-700'}>
                {validationResult.success 
                  ? `Connected: ${validationResult.accountName}` 
                  : 'Connection Failed'}
              </span>
            </div>
            {validationResult.error && (
              <p className="text-red-600 text-sm mt-2">{validationResult.error}</p>
            )}
            {validationResult.validations?.smsNumber && (
              <p className="text-green-600 text-sm mt-1">SMS phone number verified</p>
            )}
          </div>
        )}

        {/* WhatsApp Section */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg mb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">WhatsApp Integration</span>
            </div>
            <Switch 
              checked={config.whatsapp_enabled || false} 
              onCheckedChange={(v) => setConfig({ ...config, whatsapp_enabled: v })} 
            />
          </div>
          
          {config.whatsapp_enabled && (
            <div>
              <Label>WhatsApp Number</Label>
              <Input
                value={config.whatsapp_number || ''}
                onChange={(e) => setConfig({ ...config, whatsapp_number: e.target.value })}
                placeholder="+1234567890"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">WhatsApp-enabled Twilio number</p>
            </div>
          )}
        </div>

        {/* Test SMS Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Send Test SMS
          </h4>
          <div className="flex gap-2">
            <Input
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="+233xxxxxxxxx"
              className="flex-1"
            />
            <Button 
              onClick={handleTestSMS} 
              disabled={testing || !testPhone || !config.account_sid}
              size="sm"
            >
              {testing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            Enter a phone number to receive a test SMS message
          </p>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {message.text}
          </div>
        )}

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <CheckCircle className="w-4 h-4 mr-2" />
          )}
          Save Configuration
        </Button>
      </CardContent>
    </Card>
  );
};
