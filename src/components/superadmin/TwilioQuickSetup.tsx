import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  initializeTwilioConfig, 
  verifyTwilioConfig, 
  generateTwilioConfigSQL,
  TwilioInitConfig 
} from '@/lib/init-twilio-config';
import { 
  Zap, CheckCircle, AlertCircle, Loader2, Copy, 
  Database, Eye, EyeOff, Terminal, RefreshCw
} from 'lucide-react';

export const TwilioQuickSetup: React.FC = () => {
  const [config, setConfig] = useState<TwilioInitConfig>({
    account_sid: '',
    auth_token: '',
    phone_number: '',
    whatsapp_number: '',
    whatsapp_enabled: false
  });
  const [status, setStatus] = useState<{
    exists: boolean;
    enabled: boolean;
    hasCredentials: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [showSQL, setShowSQL] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setLoading(true);
    const result = await verifyTwilioConfig();
    setStatus(result);
    if (result.config) {
      setConfig({
        account_sid: result.config.account_sid || '',
        auth_token: result.config.auth_token || '',
        phone_number: result.config.phone_number || '',
        whatsapp_number: result.config.whatsapp_number || '',
        whatsapp_enabled: result.config.whatsapp_enabled || false
      });
    }
    setLoading(false);
  };

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSave = async () => {
    if (!config.account_sid || !config.auth_token || !config.phone_number) {
      showMessage('Please fill in all required fields (Account SID, Auth Token, Phone Number)', 'error');
      return;
    }

    if (!config.account_sid.startsWith('AC')) {
      showMessage('Account SID should start with "AC"', 'error');
      return;
    }

    setSaving(true);
    const result = await initializeTwilioConfig(config);
    setSaving(false);

    if (result.success) {
      showMessage('Twilio configuration saved successfully! OTP login should now work.');
      checkStatus();
    } else {
      showMessage(`Failed to save: ${result.error}`, 'error');
    }
  };

  const copySQL = () => {
    const sql = generateTwilioConfigSQL(config);
    navigator.clipboard.writeText(sql);
    showMessage('SQL copied to clipboard!');
  };

  if (loading) {
    return (
      <Card className="border-2 border-orange-200">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-orange-200">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Zap className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-orange-800">Quick Twilio Setup</CardTitle>
              <CardDescription>Initialize Twilio credentials in the database</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={status?.hasCredentials ? 'default' : 'destructive'} 
              className={status?.hasCredentials ? 'bg-green-500' : ''}
            >
              {status?.hasCredentials ? 'Configured' : 'Not Configured'}
            </Badge>
            <Button variant="ghost" size="icon" onClick={checkStatus}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Status Display */}
        <div className={`p-4 rounded-lg ${
          status?.hasCredentials 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {status?.hasCredentials ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            )}
            <span className={`font-medium ${status?.hasCredentials ? 'text-green-700' : 'text-yellow-700'}`}>
              {status?.hasCredentials 
                ? 'Twilio credentials are configured' 
                : 'Twilio credentials need to be configured'}
            </span>
          </div>
          <div className="text-sm space-y-1">
            <p className={status?.exists ? 'text-green-600' : 'text-gray-500'}>
              {status?.exists ? '✓ Config entry exists' : '○ Config entry missing'}
            </p>
            <p className={status?.enabled ? 'text-green-600' : 'text-gray-500'}>
              {status?.enabled ? '✓ SMS enabled' : '○ SMS disabled'}
            </p>
            <p className={status?.hasCredentials ? 'text-green-600' : 'text-gray-500'}>
              {status?.hasCredentials ? '✓ Credentials present' : '○ Credentials missing'}
            </p>
          </div>
        </div>

        {/* Credential Input Form */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Enter Twilio Credentials</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCredentials(!showCredentials)}
              className="text-gray-500"
            >
              {showCredentials ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
              {showCredentials ? 'Hide' : 'Show'}
            </Button>
          </div>

          <div className="grid gap-4">
            <div>
              <Label>Account SID <span className="text-red-500">*</span></Label>
              <Input
                type={showCredentials ? 'text' : 'password'}
                value={config.account_sid}
                onChange={(e) => setConfig({ ...config, account_sid: e.target.value })}
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="mt-1 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Starts with "AC", found on Twilio Console dashboard</p>
            </div>

            <div>
              <Label>Auth Token <span className="text-red-500">*</span></Label>
              <Input
                type={showCredentials ? 'text' : 'password'}
                value={config.auth_token}
                onChange={(e) => setConfig({ ...config, auth_token: e.target.value })}
                placeholder="32-character auth token"
                className="mt-1 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">32-character alphanumeric token from Twilio Console</p>
            </div>

            <div>
              <Label>Phone Number <span className="text-red-500">*</span></Label>
              <Input
                value={config.phone_number}
                onChange={(e) => setConfig({ ...config, phone_number: e.target.value })}
                placeholder="+1234567890"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Your Twilio phone number with country code (e.g., +1234567890)</p>
            </div>

            <div>
              <Label>WhatsApp Number (Optional)</Label>
              <Input
                value={config.whatsapp_number || ''}
                onChange={(e) => setConfig({ ...config, whatsapp_number: e.target.value })}
                placeholder="+1234567890"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">WhatsApp-enabled Twilio number (if using WhatsApp)</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          disabled={saving || !config.account_sid || !config.auth_token || !config.phone_number}
          className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Database className="w-4 h-4 mr-2" />
          )}
          Save to Database
        </Button>

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

        {/* SQL Alternative */}
        <div className="border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSQL(!showSQL)}
            className="mb-3"
          >
            <Terminal className="w-4 h-4 mr-2" />
            {showSQL ? 'Hide SQL Script' : 'Show SQL Script (Alternative)'}
          </Button>

          {showSQL && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                If the above doesn't work, copy this SQL and run it in Supabase SQL Editor:
              </p>
              <div className="relative">
                <Textarea
                  readOnly
                  value={generateTwilioConfigSQL(config)}
                  className="font-mono text-xs h-48 bg-gray-900 text-green-400"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={copySQL}
                  className="absolute top-2 right-2"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
