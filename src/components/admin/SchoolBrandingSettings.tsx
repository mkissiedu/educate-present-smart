import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SchoolBranding, PRESET_COLOR_SCHEMES, DEFAULT_BRANDING } from '@/types/branding';
import { fetchSchoolBranding, upsertSchoolBranding, uploadSchoolLogo } from '@/lib/supabase-branding';
import { useBranding } from '@/contexts/BrandingContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import { Upload, Palette, Check, Loader2, Image, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const SchoolBrandingSettings: React.FC = () => {
  const { user } = useAuth();
  const { currentSchool } = useSchool();
  const { branding, setBranding, refreshBranding } = useBranding();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localBranding, setLocalBranding] = useState<SchoolBranding>(DEFAULT_BRANDING);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const schoolId = user?.school_id || currentSchool?.id;

  useEffect(() => {
    if (schoolId) loadBranding();
  }, [schoolId]);

  const loadBranding = async () => {
    if (!schoolId) return;
    setIsLoading(true);
    const data = await fetchSchoolBranding(schoolId);
    if (data) setLocalBranding(data);
    else setLocalBranding({ ...DEFAULT_BRANDING, school_id: schoolId });
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!schoolId) return;
    setIsSaving(true);
    const result = await upsertSchoolBranding({ ...localBranding, school_id: schoolId });
    if (result) {
      setBranding(result);
      toast({ title: 'Branding saved!', description: 'Your school branding has been updated.' });
    } else {
      toast({ title: 'Error', description: 'Failed to save branding.', variant: 'destructive' });
    }
    setIsSaving(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !schoolId) return;
    setUploading(true);
    const url = await uploadSchoolLogo(schoolId, file);
    if (url) {
      setLocalBranding(prev => ({ ...prev, logo_url: url }));
      toast({ title: 'Logo uploaded!', description: 'Your school logo has been uploaded.' });
    } else {
      toast({ title: 'Error', description: 'Failed to upload logo.', variant: 'destructive' });
    }
    setUploading(false);
  };

  const applyPreset = (preset: typeof PRESET_COLOR_SCHEMES[0]) => {
    setLocalBranding(prev => ({
      ...prev,
      primary_color: preset.primary,
      secondary_color: preset.secondary,
      accent_color: preset.accent,
      header_gradient_from: preset.gradientFrom,
      header_gradient_to: preset.gradientTo,
    }));
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">School Branding</h2>
        <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white/10 border-0">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><Image className="w-5 h-5" /> School Logo</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {localBranding.logo_url ? (
                <img src={localBranding.logo_url} alt="School Logo" className="w-24 h-24 object-contain bg-white rounded-lg p-2" />
              ) : (
                <div className="w-24 h-24 bg-white/20 rounded-lg flex items-center justify-center"><Image className="w-10 h-10 text-white/50" /></div>
              )}
              <div className="flex-1">
                <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} variant="outline" className="w-full">
                  {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                  Upload Logo
                </Button>
                <p className="text-xs text-gray-400 mt-2">Recommended: 200x200px PNG or SVG</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-0">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><Palette className="w-5 h-5" /> Color Presets</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_COLOR_SCHEMES.map((preset) => (
                <button key={preset.name} onClick={() => applyPreset(preset)} className="group relative p-1 rounded-lg hover:bg-white/10 transition-all" title={preset.name}>
                  <div className="h-8 rounded-md overflow-hidden flex">
                    <div className="flex-1" style={{ backgroundColor: preset.primary }} />
                    <div className="flex-1" style={{ backgroundColor: preset.secondary }} />
                    <div className="flex-1" style={{ backgroundColor: preset.accent }} />
                  </div>
                  <span className="text-[10px] text-gray-400 block mt-1 truncate">{preset.name}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <BrandingColorInputs localBranding={localBranding} setLocalBranding={setLocalBranding} />
      <BrandingPreview branding={localBranding} schoolName={currentSchool?.name} />
    </div>
  );
};

const BrandingColorInputs: React.FC<{ localBranding: SchoolBranding; setLocalBranding: React.Dispatch<React.SetStateAction<SchoolBranding>> }> = ({ localBranding, setLocalBranding }) => (
  <Card className="bg-white/10 border-0">
    <CardHeader><CardTitle className="text-white">Custom Colors</CardTitle></CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { key: 'primary_color', label: 'Primary' },
          { key: 'secondary_color', label: 'Secondary' },
          { key: 'accent_color', label: 'Accent' },
          { key: 'header_gradient_from', label: 'Header From' },
          { key: 'header_gradient_to', label: 'Header To' },
        ].map(({ key, label }) => (
          <div key={key}>
            <Label className="text-gray-300 text-sm">{label}</Label>
            <div className="flex items-center gap-2 mt-1">
              <input type="color" value={localBranding[key as keyof SchoolBranding] as string} onChange={(e) => setLocalBranding(prev => ({ ...prev, [key]: e.target.value }))} className="w-10 h-10 rounded cursor-pointer" />
              <Input value={localBranding[key as keyof SchoolBranding] as string} onChange={(e) => setLocalBranding(prev => ({ ...prev, [key]: e.target.value }))} className="bg-white/10 border-white/20 text-white text-xs" />
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const BrandingPreview: React.FC<{ branding: SchoolBranding; schoolName?: string }> = ({ branding, schoolName }) => (
  <Card className="bg-white/10 border-0">
    <CardHeader><CardTitle className="text-white">Preview</CardTitle></CardHeader>
    <CardContent>
      <div className="rounded-lg overflow-hidden shadow-lg">
        <div className="p-4" style={{ background: `linear-gradient(to right, ${branding.header_gradient_from}, ${branding.header_gradient_to})` }}>
          <div className="flex items-center gap-3">
            {branding.logo_url ? <img src={branding.logo_url} alt="Logo" className="h-10 bg-white rounded p-1" /> : <div className="w-10 h-10 bg-white/20 rounded" />}
            <div>
              <h3 className="text-white font-bold">{schoolName || 'Your School Name'}</h3>
              <p className="text-white/70 text-sm">Teacher Dashboard</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 p-4">
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded text-white text-sm" style={{ backgroundColor: branding.primary_color }}>Primary</button>
            <button className="px-4 py-2 rounded text-white text-sm" style={{ backgroundColor: branding.secondary_color }}>Secondary</button>
            <button className="px-4 py-2 rounded text-white text-sm" style={{ backgroundColor: branding.accent_color }}>Accent</button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);
