import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { updateSystemSetting, SMSConfig } from '@/lib/supabase-settings';
import { 
  Phone, MessageSquare, Loader2, CheckCircle, AlertCircle, 
  ArrowRight, ArrowLeft, ExternalLink, Eye, EyeOff, 
  Sparkles, Shield, Zap, X 
} from 'lucide-react';

interface TwilioSetupWizardProps {
  onComplete: () => void;
  onSkip?: () => void;
  initialConfig?: SMSConfig;
}

export const TwilioSetupWizard: React.FC<TwilioSetupWizardProps> = ({ 
  onComplete, 
  onSkip, 
  initialConfig 
}) => {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<SMSConfig>(initialConfig || {
    provider: 'twilio',
    enabled: false,
    account_sid: '',
    auth_token: '',
    phone_number: '',
    whatsapp_number: '',
    whatsapp_enabled: false
  });
  const [showCredentials, setShowCredentials] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testPhone, setTestPhone] = useState('');
  
  const totalSteps = 5;

  const canProceed = () => {
    switch (step) {
      case 2:
        return config.account_sid?.startsWith('AC') && config.account_sid.length === 34;
      case 3:
        return config.auth_token && config.auth_token.length === 32;
      case 4:
        return config.phone_number?.startsWith('+') && config.phone_number.length >= 10;
      default:
        return true;
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('validate-twilio', {
        body: {
          accountSid: config.account_sid,
          authToken: config.auth_token,
          phoneNumber: config.phone_number,
          whatsappNumber: config.whatsapp_number,
          testPhoneNumber: testPhone || null
        }
      });
      
      if (error) throw error;
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ 
        success: false, 
        error: err.message || 'Connection test failed' 
      });
    }
    
    setTesting(false);
  };

  const handleSave = async () => {
    setSaving(true);
    
    const success = await updateSystemSetting('sms_config', {
      ...config,
      enabled: true,
      provider: 'twilio'
    });
    
    setSaving(false);
    
    if (success) {
      setStep(6);
      setTimeout(onComplete, 2000);
    }
  };

  return (
    <Card className="border-2 border-purple-300 shadow-xl max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <CardTitle>Twilio Setup Wizard</CardTitle>
              <CardDescription className="text-purple-100">
                Configure SMS & WhatsApp OTP
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-white/20 text-white">
              Step {Math.min(step, 5)}/{totalSteps}
            </Badge>
            {onSkip && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onSkip}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
        <Progress 
          value={(Math.min(step, 5) / totalSteps) * 100} 
          className="mt-4 h-2 bg-white/20" 
        />
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold">Welcome to Twilio Setup</h3>
            <p className="text-gray-600">
              Enable SMS and WhatsApp for secure OTP authentication.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-6">
              {[
                { icon: Shield, title: 'Secure', desc: 'OTP verification' },
                { icon: Zap, title: 'Fast', desc: 'Instant delivery' },
                { icon: MessageSquare, title: 'WhatsApp', desc: 'Optional support' }
              ].map((feature, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-lg">
                  <feature.icon className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="font-medium text-sm">{feature.title}</p>
                  <p className="text-xs text-gray-500">{feature.desc}</p>
                </div>
              ))}
            </div>
            <a 
              href="https://console.twilio.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-purple-600 hover:underline mt-4"
            >
              Open Twilio Console <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          </div>
        )}

        {/* Step 2: Account SID */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Enter Your Account SID</h3>
            <p className="text-gray-600 text-sm">
              Find this on your Twilio Console dashboard. It starts with "AC".
            </p>
            <div className="relative">
              <Label>Account SID *</Label>
              <Input
                type={showCredentials ? 'text' : 'password'}
                value={config.account_sid || ''}
                onChange={(e) => setConfig({ ...config, account_sid: e.target.value })}
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="pr-10 mt-1 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowCredentials(!showCredentials)}
                className="absolute right-3 top-8 text-gray-400"
              >
                {showCredentials ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {config.account_sid && !config.account_sid.startsWith('AC') && (
              <p className="text-red-500 text-sm">Account SID must start with "AC"</p>
            )}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <strong>Where to find it:</strong> Log into{' '}
              <a 
                href="https://console.twilio.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline"
              >
                Twilio Console
              </a>
              {' '}→ Dashboard → Account SID
            </div>
          </div>
        )}

        {/* Step 3: Auth Token */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Enter Your Auth Token</h3>
            <p className="text-gray-600 text-sm">
              The Auth Token is a 32-character alphanumeric string. Click "Show" on the Twilio dashboard to reveal it.
            </p>
            <div className="relative">
              <Label>Auth Token *</Label>
              <Input
                type={showCredentials ? 'text' : 'password'}
                value={config.auth_token || ''}
                onChange={(e) => setConfig({ ...config, auth_token: e.target.value })}
                placeholder="32-character auth token"
                className="pr-10 mt-1 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowCredentials(!showCredentials)}
                className="absolute right-3 top-8 text-gray-400"
              >
                {showCredentials ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {config.auth_token && config.auth_token.length !== 32 && (
              <p className="text-amber-600 text-sm">
                Auth Token should be exactly 32 characters (currently {config.auth_token.length})
              </p>
            )}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
              <strong>Important:</strong> The Auth Token is NOT a phone number. It's a 32-character code like: <code className="bg-amber-100 px-1 rounded">a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6</code>
            </div>
          </div>
        )}

        {/* Step 4: Phone Number */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">SMS Phone Number</h3>
            <p className="text-gray-600 text-sm">
              Your Twilio phone number with country code (e.g., +1234567890)
            </p>
            <div>
              <Label>Phone Number *</Label>
              <Input
                value={config.phone_number || ''}
                onChange={(e) => setConfig({ ...config, phone_number: e.target.value })}
                placeholder="+1234567890"
                className="mt-1"
              />
            </div>
            {config.phone_number && !config.phone_number.startsWith('+') && (
              <p className="text-amber-600 text-sm">Include country code starting with +</p>
            )}
            
            {/* WhatsApp Option */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <Switch
                  checked={config.whatsapp_enabled || false}
                  onCheckedChange={(v) => setConfig({ ...config, whatsapp_enabled: v })}
                />
                <div>
                  <p className="font-medium">Enable WhatsApp (Optional)</p>
                  <p className="text-sm text-gray-500">Send OTPs via WhatsApp</p>
                </div>
              </div>
              {config.whatsapp_enabled && (
                <div className="mt-3">
                  <Label>WhatsApp Number</Label>
                  <Input
                    value={config.whatsapp_number || ''}
                    onChange={(e) => setConfig({ ...config, whatsapp_number: e.target.value })}
                    placeholder="+1234567890"
                    className="mt-1"
                  />
                </div>
              )}
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <strong>Tip:</strong> Buy a number from Twilio Console → Phone Numbers → Buy a Number
            </div>
          </div>
        )}

        {/* Step 5: Test */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Test Your Configuration</h3>
            <p className="text-gray-600 text-sm">
              Validate your credentials before saving.
            </p>
            
            <div>
              <Label>Test Phone Number (Optional)</Label>
              <Input
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+233xxxxxxxxx"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a number to receive a test SMS
              </p>
            </div>
            
            <Button 
              onClick={handleTest} 
              disabled={testing}
              className="w-full"
            >
              {testing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              Test Connection
            </Button>
            
            {testResult && (
              <div className={`p-4 rounded-lg ${
                testResult.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {testResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    {testResult.success ? 'Success!' : 'Failed'}
                  </span>
                </div>
                {testResult.accountName && (
                  <p className="text-sm text-green-700">
                    Account: {testResult.accountName}
                  </p>
                )}
                {testResult.error && (
                  <p className="text-sm text-red-600">{testResult.error}</p>
                )}
                {testResult.testSmsSent && (
                  <p className="text-sm text-green-600 mt-1">
                    Test SMS sent successfully!
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 6: Complete */}
        {step === 6 && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-700">Setup Complete!</h3>
            <p className="text-gray-600">
              Twilio SMS/WhatsApp is now enabled for OTP delivery.
            </p>
          </div>
        )}

        {/* Navigation */}
        {step < 6 && (
          <div className="flex justify-between mt-6 pt-4 border-t">
            <div>
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {step < 5 && (
                <Button 
                  onClick={() => setStep(step + 1)} 
                  disabled={!canProceed()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
              {step === 5 && (
                <Button 
                  onClick={handleSave} 
                  disabled={saving || !testResult?.success}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Save & Enable
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
