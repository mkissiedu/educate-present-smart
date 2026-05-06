import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { BookOpen, GraduationCap, Layers, Globe, Edit2, Plus } from 'lucide-react';
import { GradeLevel, NACCA_GRADE_LEVELS, CKLA_GRADE_LEVELS, getSubjectsForLevel, getGradeCategory, CurriculumSystem } from '@/lib/curriculum-data';

interface CurriculumMapHeaderProps {
  curriculumSystem: CurriculumSystem;
  level: GradeLevel;
  subject: string;
  onSystemChange: (system: CurriculumSystem) => void;
  onLevelChange: (level: GradeLevel) => void;
  onSubjectChange: (subject: string) => void;
  isEditMode?: boolean;
  onToggleEditMode?: () => void;
  onAddClass?: () => void;
  onAddSubject?: () => void;
  customLevels?: { value: string; label: string }[];
  customSubjects?: string[];
}

export const CurriculumMapHeader: React.FC<CurriculumMapHeaderProps> = ({
  curriculumSystem, level, subject, onSystemChange, onLevelChange, onSubjectChange,
  isEditMode, onToggleEditMode, onAddClass, onAddSubject, customLevels = [], customSubjects = []
}) => {
  const defaultSubjects = getSubjectsForLevel(level);
  const subjects = [...defaultSubjects, ...customSubjects];
  const category = getGradeCategory(level);

  const getSystemColor = () => {
    if (curriculumSystem === 'CKLA') return 'from-violet-600 via-purple-600 to-indigo-600';
    if (curriculumSystem === 'Custom') return 'from-rose-600 via-pink-600 to-fuchsia-600';
    switch (category) {
      case 'KG': return 'from-emerald-600 via-teal-600 to-cyan-600';
      case 'Lower Primary': return 'from-blue-600 via-indigo-600 to-purple-600';
      case 'Upper Primary': return 'from-orange-500 via-amber-500 to-yellow-500';
      case 'JHS': return 'from-rose-600 via-pink-600 to-fuchsia-600';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  const defaultLevels = curriculumSystem === 'CKLA' ? CKLA_GRADE_LEVELS : NACCA_GRADE_LEVELS;
  const gradeLevels = [...defaultLevels, ...customLevels.map(l => ({ value: l.value as GradeLevel, label: l.label }))];
  const levelLabel = gradeLevels.find(g => g.value === level)?.label || level;

  return (
    <div className={`bg-gradient-to-r ${getSystemColor()} rounded-xl p-6 text-white mb-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl"><BookOpen className="w-8 h-8" /></div>
          <div>
            <h1 className="text-2xl font-bold">{curriculumSystem} Curriculum Map</h1>
            <p className="text-white/80">{curriculumSystem === 'CKLA' ? 'Core Knowledge Language Arts' : curriculumSystem === 'Custom' ? 'Custom Curriculum' : `Ghana Education Service - ${category}`}</p>
          </div>
        </div>
        <Button variant={isEditMode ? "default" : "outline"} className={isEditMode ? "bg-white text-purple-600" : "bg-white/20 border-white/30 text-white hover:bg-white/30"} onClick={onToggleEditMode}>
          <Edit2 className="w-4 h-4 mr-2" /> {isEditMode ? 'Done Editing' : 'Edit Mode'}
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 mt-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          <Select value={curriculumSystem} onValueChange={(v) => onSystemChange(v as CurriculumSystem)}>
            <SelectTrigger className="w-32 bg-white/20 border-white/30 text-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="NaCCA" className="font-semibold text-emerald-600">NaCCA</SelectItem>
              <SelectItem value="CKLA" className="font-semibold text-violet-600">CKLA</SelectItem>
              <SelectItem value="Custom" className="font-semibold text-rose-600">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          <Select value={level} onValueChange={(v) => onLevelChange(v as GradeLevel)}>
            <SelectTrigger className="w-40 bg-white/20 border-white/30 text-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              {gradeLevels.map(g => <SelectItem key={g.value} value={g.value} className="font-semibold">{g.label}</SelectItem>)}
            </SelectContent>
          </Select>
          {isEditMode && <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={onAddClass}><Plus className="w-4 h-4" /></Button>}
        </div>

        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5" />
          <Select value={subject} onValueChange={onSubjectChange}>
            <SelectTrigger className="w-56 bg-white/20 border-white/30 text-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          {isEditMode && <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={onAddSubject}><Plus className="w-4 h-4" /></Button>}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <Badge className="bg-white/20 text-white hover:bg-white/30">{curriculumSystem}</Badge>
        <Badge className="bg-white/20 text-white hover:bg-white/30">{levelLabel}</Badge>
        <Badge className="bg-white/20 text-white hover:bg-white/30">{curriculumSystem === 'CKLA' ? 'US Standards' : curriculumSystem === 'Custom' ? 'Custom Standards' : 'Ghana Standards'}</Badge>
        {isEditMode && <Badge className="bg-yellow-400 text-yellow-900">Edit Mode Active</Badge>}
      </div>
    </div>
  );
};
