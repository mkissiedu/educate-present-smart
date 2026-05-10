import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchSystemSetting, updateSystemSetting, EmailConfig, SMSConfig } from '@/lib/supabase-settings';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Mail, MessageSquare, Save, Loader2, CheckCircle, AlertCircle, Eye, EyeOff, Send, Phone, Wand2, Zap } from 'lucide-react';
import { TwilioConfigManager } from './TwilioConfigManager';
import { TwilioSetupWizard } from './TwilioSetupWizard';
import { TwilioQuickSetup } from './TwilioQuickSetup';


export const SystemSettings: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [smsConfig, setSmsConfig] = useState<SMSConfig | null>(null);

  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    provider: 'resend',
    api_key: '',
    from_email: '',
    from_name: 'Catalyst',
    enabled: false
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const email = await fetchSystemSetting<EmailConfig>('smtp_config');
    if (email) setEmailConfig({ ...emailConfig, ...email });
    const sms = await fetchSystemSetting<SMSConfig>('sms_config');
    setSmsConfig(sms);
    setLoading(false);
  };

  const showMessage = (msg: string, isError = false) => {
    isError ? setError(msg) : setSuccess(msg);
    setTimeout(() => {
      setSuccess('');
      setError('');
    }, 5000);
  };

  const handleSaveEmail = async () => {
    setSaving(true);
    const ok = await updateSystemSetting('smtp_config', emailConfig, user?.id);
    setSaving(false);
    showMessage(ok ? 'Email settings saved!' : 'Failed to save', !ok);
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      showMessage('Enter an email address', true);
      return;
    }
    setTestingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: testEmail,
          templateType: 'notification',
          templateData: {
            title: 'Test Email',
            message: 'Your email settings are working correctly!'
          }
        }
      });
      showMessage(
        data?.sent ? 'Test email sent!' : (error?.message || 'Failed to send'),
        !data?.sent
      );
    } catch (err: any) {
      showMessage(err.message, true);
    }
    setTestingEmail(false);
  };

  const handleWizardComplete = () => {
    setShowSetupWizard(false);
    loadSettings();
  };

  const isSMSConfigured = smsConfig?.enabled && smsConfig?.account_sid && smsConfig?.auth_token && smsConfig?.phone_number;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">System Settings</h2>
      
      {success && (
        <div className="flex items-center gap-2 bg-green-500/20 text-green-300 p-3 rounded-lg mb-4">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}
      
      {error && (
        <div className="flex items-center gap-2 bg-red-500/20 text-red-300 p-3 rounded-lg mb-4">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <Tabs defaultValue="email" className="space-y-4">
        <TabsList className="bg-white/10">
          <TabsTrigger value="email" className="data-[state=active]:bg-purple-600">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="sms" className="data-[state=active]:bg-purple-600">
            <Phone className="w-4 h-4 mr-2" />
            SMS/WhatsApp
          </TabsTrigger>
        </TabsList>

        {/* Email Tab */}
        <TabsContent value="email">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Switch
                  checked={emailConfig.enabled}
                  onCheckedChange={(v) => setEmailConfig({ ...emailConfig, enabled: v })}
                />
                <Label className="text-white">Enable Email Notifications</Label>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm text-blue-200">
                <p>
                  Select an email provider and enter your API key.{' '}
                  <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="underline">
                    Resend
                  </a>{' '}
                  offers 100 free emails/day.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Provider</Label>
                  <Select
                    value={emailConfig.provider}
                    onValueChange={(v: any) => setEmailConfig({ ...emailConfig, provider: v })}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resend">Resend</SelectItem>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="mailgun">Mailgun</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="relative">
                  <Label className="text-gray-300">API Key</Label>
                  <Input
                    type={showPasswords ? 'text' : 'password'}
                    value={emailConfig.api_key}
                    onChange={(e) => setEmailConfig({ ...emailConfig, api_key: e.target.value })}
                    placeholder="re_..."
                    className="bg-white/10 border-white/20 text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-8 text-gray-400"
                  >
                    {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                <div>
                  <Label className="text-gray-300">From Email</Label>
                  <Input
                    value={emailConfig.from_email}
                    onChange={(e) => setEmailConfig({ ...emailConfig, from_email: e.target.value })}
                    placeholder="noreply@yourdomain.com"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                
                <div>
                  <Label className="text-gray-300">From Name</Label>
                  <Input
                    value={emailConfig.from_name}
                    onChange={(e) => setEmailConfig({ ...emailConfig, from_name: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>
              
              <Button
                onClick={handleSaveEmail}
                disabled={saving}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Email Settings
              </Button>
              
              <div className="border-t border-white/10 pt-4 mt-4">
                <Label className="text-gray-300 mb-2 block">Test Email</Label>
                <div className="flex gap-2">
                  <Input
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@example.com"
                    className="bg-white/10 border-white/20 text-white flex-1"
                  />
                  <Button
                    onClick={handleTestEmail}
                    disabled={testingEmail}
                    variant="outline"
                    className="border-white/20 text-white bg-purple-600 hover:bg-purple-700"
                  >
                    {testingEmail ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Send
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMS Tab */}
        <TabsContent value="sms">
          {showSetupWizard ? (
            <TwilioSetupWizard
              onComplete={handleWizardComplete}
              onSkip={() => setShowSetupWizard(false)}
              initialConfig={smsConfig || undefined}
            />
          ) : (
            <div className="space-y-4">
              {/* Quick Setup - Always show first if not configured */}
              {!isSMSConfigured && (
                <TwilioQuickSetup />
              )}
              
              {/* Setup Wizard Prompt */}
              {!isSMSConfigured && (
                <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/30 rounded-full">
                          <Wand2 className="w-6 h-6 text-purple-300" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            Alternative: Setup Wizard
                          </h3>
                          <p className="text-purple-200 text-sm">
                            Use our guided wizard to configure Twilio step-by-step
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowSetupWizard(true)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Wand2 className="w-4 h-4 mr-2" />
                        Start Setup Wizard
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Main Config Manager - Show when configured */}
              {isSMSConfigured && (
                <>
                  <TwilioConfigManager />
                  
                  {/* Re-run Wizard Button */}
                  <Button
                    variant="outline"
                    onClick={() => setShowSetupWizard(true)}
                    className="border-purple-400/30 text-purple-300 hover:bg-purple-500/20"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    Re-run Setup Wizard
                  </Button>
                </>
              )}
            </div>
          )}
        </TabsContent>

      </Tabs>
    </div>
  );
};
