import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { allCurriculums } from '@/data/nacca-all-subjects';
import { ChevronRight } from 'lucide-react';

interface Props {
  onSelect: (data: { subject: string; grade: string; strand: string; subStrand: string; indicatorCode: string; indicatorText: string }) => void;
  assignedSubjects?: string[];
  assignedClasses?: string[];
}

const GRADE_LEVELS = ['KG1', 'KG2', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'JHS1', 'JHS2', 'JHS3'];

// Map class levels to grade codes
const CLASS_TO_GRADE: Record<string, string> = {
  'KG 1': 'KG1', 'KG 2': 'KG2',
  'Class 1': 'B1', 'Class 2': 'B2', 'Class 3': 'B3', 'Class 4': 'B4', 'Class 5': 'B5', 'Class 6': 'B6',
  'JHS 1': 'JHS1', 'JHS 2': 'JHS2', 'JHS 3': 'JHS3',
};

export function CurriculumIndicatorSelector({ onSelect, assignedSubjects, assignedClasses }: Props) {
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [strandId, setStrandId] = useState('');
  const [subStrandId, setSubStrandId] = useState('');
  const [indicatorId, setIndicatorId] = useState('');

  const allSubjects = Object.keys(allCurriculums);
  const subjects = assignedSubjects && assignedSubjects.length > 0 
    ? allSubjects.filter(s => assignedSubjects.includes(s))
    : allSubjects;

  // Convert assigned classes to grade codes
  const assignedGrades = assignedClasses?.map(c => CLASS_TO_GRADE[c]).filter(Boolean) || [];
  const grades = assignedGrades.length > 0 ? GRADE_LEVELS.filter(g => assignedGrades.includes(g)) : GRADE_LEVELS;

  const curriculum = subject ? allCurriculums[subject] : null;
  const strands = curriculum?.strands || [];
  const strand = strands.find(s => s.id === strandId);
  const subStrands = strand?.subStrands || [];
  const subStrand = subStrands.find(s => s.id === subStrandId);
  const standards = subStrand?.contentStandards || [];
  const indicators = standards.flatMap(cs => cs.indicators.map(i => ({ ...i, standardCode: cs.code })));
  const selectedIndicator = indicators.find(i => i.id === indicatorId);

  const handleSelect = () => {
    if (selectedIndicator && strand && subStrand) {
      onSelect({ subject, grade, strand: strand.name, subStrand: subStrand.name, indicatorCode: selectedIndicator.code, indicatorText: selectedIndicator.description });
    }
  };

  return (
    <div className="space-y-4 p-4 bg-slate-50 rounded-lg border">
      <h3 className="font-semibold text-slate-800 flex items-center gap-2"><ChevronRight className="w-5 h-5" />Select Curriculum Indicator</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Select value={subject} onValueChange={v => { setSubject(v); setStrandId(''); setSubStrandId(''); setIndicatorId(''); }}>
          <SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger>
          <SelectContent>{subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={grade} onValueChange={setGrade}>
          <SelectTrigger><SelectValue placeholder="Grade" /></SelectTrigger>
          <SelectContent>{grades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={strandId} onValueChange={v => { setStrandId(v); setSubStrandId(''); setIndicatorId(''); }}>
          <SelectTrigger><SelectValue placeholder="Strand" /></SelectTrigger>
          <SelectContent>{strands.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={subStrandId} onValueChange={v => { setSubStrandId(v); setIndicatorId(''); }}>
          <SelectTrigger><SelectValue placeholder="Sub-Strand" /></SelectTrigger>
          <SelectContent>{subStrands.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={indicatorId} onValueChange={setIndicatorId}>
          <SelectTrigger><SelectValue placeholder="Indicator" /></SelectTrigger>
          <SelectContent>{indicators.map(i => <SelectItem key={i.id} value={i.id}>{i.code}</SelectItem>)}</SelectContent>
        </Select>
        <Button onClick={handleSelect} disabled={!selectedIndicator || !grade}>Continue</Button>
      </div>
      {selectedIndicator && <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">{selectedIndicator.code}: {selectedIndicator.description}</p>}
    </div>
  );
}
