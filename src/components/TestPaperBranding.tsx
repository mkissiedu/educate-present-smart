import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Image } from 'lucide-react';

interface BrandingData {
  schoolName: string;
  schoolLogo: string;
  schoolAddress: string;
  schoolMotto: string;
  academicYear: string;
  term: string;
}

interface Props {
  branding: BrandingData;
  onChange: (branding: BrandingData) => void;
}

export function TestPaperBranding({ branding, onChange }: Props) {
  const update = (key: keyof BrandingData, value: string) => onChange({ ...branding, [key]: value });

  return (
    <div className="space-y-4 p-4 bg-slate-50 rounded-lg border">
      <div className="flex items-center gap-2 mb-2">
        <Building2 className="w-5 h-5 text-slate-600" />
        <h3 className="font-semibold text-slate-800">School Branding</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>School Name</Label>
          <Input value={branding.schoolName} onChange={e => update('schoolName', e.target.value)} placeholder="Enter school name" />
        </div>
        
        <div>
          <Label>School Logo URL</Label>
          <div className="flex gap-2">
            <Input value={branding.schoolLogo} onChange={e => update('schoolLogo', e.target.value)} placeholder="https://..." className="flex-1" />
            {branding.schoolLogo && <img src={branding.schoolLogo} alt="Logo" className="w-10 h-10 rounded object-contain border" />}
          </div>
        </div>
        
        <div>
          <Label>School Address</Label>
          <Input value={branding.schoolAddress} onChange={e => update('schoolAddress', e.target.value)} placeholder="Enter school address" />
        </div>
        
        <div>
          <Label>School Motto</Label>
          <Input value={branding.schoolMotto} onChange={e => update('schoolMotto', e.target.value)} placeholder="Enter school motto" />
        </div>
        
        <div>
          <Label>Academic Year</Label>
          <Input value={branding.academicYear} onChange={e => update('academicYear', e.target.value)} placeholder="2024/2025" />
        </div>
        
        <div>
          <Label>Term</Label>
          <Input value={branding.term} onChange={e => update('term', e.target.value)} placeholder="Term 1" />
        </div>
      </div>
    </div>
  );
}
