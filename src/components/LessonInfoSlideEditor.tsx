import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CurriculumAlignmentSelector } from './CurriculumAlignmentSelector';
import { CurriculumPathDisplay } from './CurriculumPathDisplay';
import { allCurriculums } from '@/data/nacca-all-subjects';
import { Image, Upload, BookOpen, GraduationCap, Calendar, Hash, Target, CalendarDays } from 'lucide-react';
import { CLASS_LEVELS, CLASS_SUBJECTS_MAP, CLASS_CURRICULUM_MAP, ClassLevel } from '@/types/user';
import { LESSONS_PER_WEEK, TOTAL_WEEKS, CurriculumInfo } from '@/types/lesson';
import { getIndicatorPaths } from '@/lib/curriculum-utils';
import { WEEKS_PER_TERM } from '@/types/term';
import { GradeLevel } from '@/lib/curriculum-data';
import { useAuth } from '@/contexts/AuthContext';

interface CurriculumValues {
  strand?: string; subStrand?: string; contentStandard?: string;
  indicators?: string[]; coreCompetences?: string[];
  gradeLevel?: GradeLevel; kgIndicatorIds?: string[];
}

interface Props {
  lessonTitle: string; subject: string; classLevel: ClassLevel;
  week: number; lessonNumber: number; imageUrl?: string;
  curriculumValues: CurriculumValues;
  onTitleChange: (title: string) => void; onSubjectChange: (subject: string) => void;
  onClassChange: (classLevel: ClassLevel) => void; onWeekChange: (week: number) => void;
  onLessonNumberChange: (num: number) => void; onImageChange: (url: string) => void;
  onCurriculumChange: (values: CurriculumInfo) => void;
}

const classToGradeLevel = (classLevel: ClassLevel): GradeLevel => {
  const map: Record<string, GradeLevel> = {
    'KG 1': 'KG1', 'KG 2': 'KG2', 'Class 1': 'B1', 'Class 2': 'B2', 'Class 3': 'B3',
    'Class 4': 'B4', 'Class 5': 'B5', 'Class 6': 'B6', 'JHS 1': 'JHS1', 'JHS 2': 'JHS2', 'JHS 3': 'JHS3'
  };
  return map[classLevel] || 'KG1';
};

export const LessonInfoSlideEditor: React.FC<Props> = ({
  lessonTitle, subject, classLevel, week, lessonNumber, imageUrl, curriculumValues,
  onTitleChange, onSubjectChange, onClassChange, onWeekChange, onLessonNumberChange, onImageChange, onCurriculumChange
}) => {
  const { isSuperTeacher, assignedSubjects, assignedClasses } = useAuth();
  
  const availableCurriculums = CLASS_CURRICULUM_MAP[classLevel] || ['NaCCA'];
  let availableSubjects = CLASS_SUBJECTS_MAP[classLevel] || [];
  let availableClasses = CLASS_LEVELS;
  
  // Filter by super teacher assignments
  if (isSuperTeacher && assignedSubjects.length > 0) {
    availableSubjects = availableSubjects.filter(s => assignedSubjects.includes(s));
    availableClasses = CLASS_LEVELS.filter(c => assignedClasses.includes(c));
  }
  
  const hasNaCCA = availableCurriculums.includes('NaCCA');
  const hasAnanse = availableCurriculums.includes("Ananse's Phonics");
  const isKGLevel = classLevel === 'KG 1' || classLevel === 'KG 2';
  const isPreK = classLevel === 'PreK 1/Nursery 1' || classLevel === 'PreK 2/Nursery 2';
  
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>(classToGradeLevel(classLevel));
  const [currSubject, setCurrSubject] = useState(subject);

  const termInfo = useMemo(() => {
    const termNumber = Math.ceil(week / WEEKS_PER_TERM);
    const weekInTerm = ((week - 1) % WEEKS_PER_TERM) + 1;
    return { termNumber: Math.min(termNumber, 3), weekInTerm };
  }, [week]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const reader = new FileReader(); reader.onloadend = () => onImageChange(reader.result as string); reader.readAsDataURL(file); }
  };

  const handleIndicators = (ids: string[]) => onCurriculumChange({ ...curriculumValues, gradeLevel, kgIndicatorIds: ids });
  const lessonsPerWeek = LESSONS_PER_WEEK[subject] || 5;
  const indicatorPaths = getIndicatorPaths(curriculumValues.kgIndicatorIds || []);

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-purple-600" /><span className="text-xs font-semibold text-red-500">* Required</span></div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            <CalendarDays className="w-3 h-3" />Term {termInfo.termNumber} • Week {termInfo.weekInTerm}
          </div>
        </div>
        <Input value={lessonTitle} onChange={(e) => onTitleChange(e.target.value)} placeholder="Lesson Title" className="text-lg font-bold mb-3 border-purple-200" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
          <div><label className="text-xs font-bold text-purple-700 mb-1 flex items-center gap-1"><GraduationCap className="w-3 h-3" />Class</label>
            <select value={classLevel} onChange={(e) => { onClassChange(e.target.value as ClassLevel); setGradeLevel(classToGradeLevel(e.target.value as ClassLevel)); }} className="w-full px-3 py-2 rounded-lg border-2 border-purple-200 text-sm font-medium">{availableClasses.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className="text-xs font-bold text-purple-700 mb-1 flex items-center gap-1"><GraduationCap className="w-3 h-3" />Subject</label>
            <select value={subject} onChange={(e) => { onSubjectChange(e.target.value); setCurrSubject(e.target.value); }} className="w-full px-3 py-2 rounded-lg border-2 border-purple-200 text-sm font-medium">{availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          <div><label className="text-xs font-bold text-red-500 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" />Week *</label>
            <select value={week} onChange={(e) => onWeekChange(parseInt(e.target.value))} className="w-full px-3 py-2 rounded-lg border-2 border-red-300 bg-red-50 text-sm font-medium">{Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1).map(w => <option key={w} value={w}>Week {w}</option>)}</select></div>
          <div><label className="text-xs font-bold text-red-500 mb-1 flex items-center gap-1"><Hash className="w-3 h-3" />Lesson # *</label>
            <select value={lessonNumber} onChange={(e) => onLessonNumberChange(parseInt(e.target.value))} className="w-full px-3 py-2 rounded-lg border-2 border-red-300 bg-red-50 text-sm font-medium">{Array.from({ length: lessonsPerWeek }, (_, i) => i + 1).map(l => <option key={l} value={l}>Lesson {l}</option>)}</select></div>
        </div>
        <div className="flex gap-3 items-center bg-white/50 p-3 rounded-lg">
          {imageUrl ? <img src={imageUrl} alt="Lesson" className="w-20 h-20 object-cover rounded-lg border-2 border-purple-200" /> : <div className="w-20 h-20 bg-purple-100 rounded-lg border-2 border-dashed border-purple-300 flex items-center justify-center"><Image className="w-6 h-6 text-purple-400" /></div>}
          <div><input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="lesson-img" /><label htmlFor="lesson-img"><Button type="button" variant="outline" size="sm" className="border-purple-300" asChild><span><Upload className="w-4 h-4 mr-1" />Image</span></Button></label></div>
        </div>
      </div>

      {hasNaCCA && !isPreK && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200">
          <CurriculumAlignmentSelector level={gradeLevel} subject={currSubject} selectedIndicators={curriculumValues.kgIndicatorIds || []} onSelectIndicators={handleIndicators} onLevelChange={setGradeLevel} onSubjectChange={setCurrSubject} lessonTitle={lessonTitle} />
          {indicatorPaths.length > 0 && (
            <div className="mt-4 space-y-3">
              <h4 className="font-semibold text-emerald-800 flex items-center gap-2"><Target className="w-4 h-4" />Aligned Standards ({indicatorPaths.length})</h4>
              {indicatorPaths.map(({ indicator, path }) => (
                <CurriculumPathDisplay key={indicator.id} path={path} onRemove={() => handleIndicators((curriculumValues.kgIndicatorIds || []).filter(id => id !== indicator.id))} />
              ))}
            </div>
          )}
        </div>
      )}

      {(isKGLevel || isPreK || (hasAnanse && subject === "Ananse's Phonics")) && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
          <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2"><Target className="w-4 h-4" />Ananse's Phonics (CKLA)</h4>
          <p className="text-xs text-amber-600 mb-2">Phonics-based curriculum for early literacy</p>
        </div>
      )}
    </div>
  );
};
