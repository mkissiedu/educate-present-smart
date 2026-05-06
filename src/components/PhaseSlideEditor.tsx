import React, { useRef } from 'react';
import { PhaseData, CurriculumInfo } from '@/types/lesson';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, PlayCircle, Lightbulb, PenTool, CheckCircle, Wrench, Upload, FileText, X } from 'lucide-react';
import { AIContentGenerator } from './AIContentGenerator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface PhaseSlideEditorProps {
  phaseData: PhaseData;
  phaseType: 'starter' | 'development' | 'skill' | 'practice' | 'wrapup';
  onChange: (data: PhaseData) => void;
  lessonTitle?: string;
  subject?: string;
  classLevel?: string;
  curriculumInfo?: CurriculumInfo;
}

const phaseConfig = {
  starter: { icon: PlayCircle, color: 'green', title: 'Phase 1: Starter', description: 'Engage students and introduce the lesson' },
  development: { icon: Lightbulb, color: 'blue', title: 'Phase 2: Concept Development', description: 'Teach and explain new concepts' },
  skill: { icon: Wrench, color: 'teal', title: 'Phase 2: Skill Development', description: 'Build and practice specific skills' },
  practice: { icon: PenTool, color: 'purple', title: 'Phase 2: Independent Practice', description: 'Students practice independently' },
  wrapup: { icon: CheckCircle, color: 'orange', title: 'Phase 3: Wrap Up', description: 'Review and conclude the lesson' }
};

const colorClasses = {
  green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', badge: 'bg-green-600' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', badge: 'bg-blue-600' },
  teal: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-600', badge: 'bg-teal-600' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', badge: 'bg-purple-600' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', badge: 'bg-orange-600' }
};

export const PhaseSlideEditor: React.FC<PhaseSlideEditorProps> = ({ 
  phaseData, phaseType, onChange, lessonTitle, subject, classLevel, curriculumInfo 
}) => {
  const { user } = useAuth();
  const worksheetRef = useRef<HTMLInputElement>(null);
  const answerKeyRef = useRef<HTMLInputElement>(null);
  const config = phaseConfig[phaseType];
  const Icon = config.icon;
  const colors = colorClasses[config.color as keyof typeof colorClasses];
  const isSuperTeacher = user?.role === 'super_teacher';
  const isPractice = phaseType === 'practice';

  const addBullet = () => onChange({ ...phaseData, bullets: [...phaseData.bullets, ''] });
  const updateBullet = (index: number, value: string) => {
    const newBullets = [...phaseData.bullets];
    newBullets[index] = value;
    onChange({ ...phaseData, bullets: newBullets });
  };
  const removeBullet = (index: number) => onChange({ ...phaseData, bullets: phaseData.bullets.filter((_, i) => i !== index) });
  const handleAIGenerate = (bullets: string[]) => onChange({ ...phaseData, bullets: [...phaseData.bullets, ...bullets] });

  const uploadPdf = async (file: File, type: 'worksheet' | 'answerKey') => {
    const fileName = `${type}-${Date.now()}.pdf`;
    const { error } = await supabase.storage.from('lesson-materials').upload(fileName, file);
    if (error) return;
    const { data: { publicUrl } } = supabase.storage.from('lesson-materials').getPublicUrl(fileName);
    if (type === 'worksheet') onChange({ ...phaseData, worksheetPdfUrl: publicUrl, worksheetPdfName: file.name });
    else onChange({ ...phaseData, answerKeyPdfUrl: publicUrl, answerKeyPdfName: file.name });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-5 h-5 ${colors.text}`} />
        <div><span className={`font-semibold ${colors.text}`}>{config.title}</span><p className="text-xs text-gray-500">{config.description}</p></div>
      </div>
      
      <AIContentGenerator lessonTitle={lessonTitle || ''} subject={subject || ''} classLevel={classLevel || ''} curriculumInfo={curriculumInfo} phaseType={phaseType} onGenerate={handleAIGenerate} />
      
      {phaseData.bullets.length === 0 && <p className="text-gray-500 text-sm italic">No content added yet.</p>}
      
      {phaseData.bullets.map((bullet, index) => (
        <div key={index} className={`flex items-start gap-2 p-2 ${colors.bg} rounded-lg border ${colors.border}`}>
          <span className={`w-6 h-6 flex items-center justify-center ${colors.badge} text-white rounded-full text-xs font-bold mt-1`}>{index + 1}</span>
          <Textarea placeholder={`Activity ${index + 1}...`} value={bullet} onChange={(e) => updateBullet(index, e.target.value)} className="flex-1 min-h-[60px]" rows={2} />
          <Button size="sm" variant="ghost" onClick={() => removeBullet(index)} className="text-red-500 mt-1"><Trash2 className="w-4 h-4" /></Button>
        </div>
      ))}
      
      <Button onClick={addBullet} variant="outline" className={`w-full border-dashed ${colors.border} ${colors.text}`}><Plus className="w-4 h-4 mr-2" /> Add Point</Button>

      {isPractice && isSuperTeacher && (
        <div className="mt-4 p-4 bg-purple-50 rounded-xl border-2 border-purple-200 space-y-3">
          <div className="flex items-center gap-2"><FileText className="w-5 h-5 text-purple-600" /><span className="font-semibold text-purple-800">Worksheet & Answer Key</span><span className="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">Super Teacher</span></div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-purple-700 mb-1">Worksheet</p>
              {phaseData.worksheetPdfUrl ? (
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg border"><FileText className="w-5 h-5 text-purple-600" /><span className="text-xs flex-1 truncate">{phaseData.worksheetPdfName}</span><Button size="sm" variant="ghost" onClick={() => onChange({ ...phaseData, worksheetPdfUrl: '', worksheetPdfName: '' })} className="p-1"><X className="w-3 h-3" /></Button></div>
              ) : (<><input ref={worksheetRef} type="file" accept=".pdf" onChange={(e) => e.target.files?.[0] && uploadPdf(e.target.files[0], 'worksheet')} className="hidden" /><Button onClick={() => worksheetRef.current?.click()} variant="outline" size="sm" className="w-full text-xs"><Upload className="w-3 h-3 mr-1" /> Upload</Button></>)}
            </div>
            <div>
              <p className="text-xs font-medium text-purple-700 mb-1">Answer Key</p>
              {phaseData.answerKeyPdfUrl ? (
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg border"><FileText className="w-5 h-5 text-green-600" /><span className="text-xs flex-1 truncate">{phaseData.answerKeyPdfName}</span><Button size="sm" variant="ghost" onClick={() => onChange({ ...phaseData, answerKeyPdfUrl: '', answerKeyPdfName: '' })} className="p-1"><X className="w-3 h-3" /></Button></div>
              ) : (<><input ref={answerKeyRef} type="file" accept=".pdf" onChange={(e) => e.target.files?.[0] && uploadPdf(e.target.files[0], 'answerKey')} className="hidden" /><Button onClick={() => answerKeyRef.current?.click()} variant="outline" size="sm" className="w-full text-xs"><Upload className="w-3 h-3 mr-1" /> Upload</Button></>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
