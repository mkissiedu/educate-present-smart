import { kgCurriculums } from '@/data/nacca-kg-all-subjects';
import { lowerPrimaryCurriculums, LOWER_PRIMARY_SUBJECTS } from '@/data/nacca-lower-primary-all-subjects';
import { upperPrimaryCurriculums, UPPER_PRIMARY_SUBJECTS } from '@/data/nacca-upper-primary-all-subjects';
import { jhsCurriculums, JHS_SUBJECTS } from '@/data/nacca-jhs-all-subjects';
import { KG_SUBJECTS } from '@/data/nacca-kg-curriculum-types';
import { Strand } from '@/data/nacca-curriculum-types';
import { cklaCurriculums, CKLAGradeLevel, CKLASubject, CKLA_SUBJECTS } from '@/data/ckla-all-curriculums';
import { CKLAStrand } from '@/data/ckla-curriculum-types';

export type CurriculumSystem = 'NaCCA' | 'CKLA' | 'Custom';

export type NaCCAGradeLevel = 'KG1' | 'KG2' | 'B1' | 'B2' | 'B3' | 'B4' | 'B5' | 'B6' | 'JHS1' | 'JHS2' | 'JHS3';
export type GradeLevel = NaCCAGradeLevel | CKLAGradeLevel | string;
export type GradeCategory = 'KG' | 'Lower Primary' | 'Upper Primary' | 'JHS' | 'CKLA PreK-2' | 'Custom';

export const NACCA_GRADE_LEVELS: { value: NaCCAGradeLevel; label: string; category: GradeCategory }[] = [
  { value: 'KG1', label: 'KG 1', category: 'KG' },
  { value: 'KG2', label: 'KG 2', category: 'KG' },
  { value: 'B1', label: 'Class 1', category: 'Lower Primary' },
  { value: 'B2', label: 'Class 2', category: 'Lower Primary' },
  { value: 'B3', label: 'Class 3', category: 'Upper Primary' },
  { value: 'B4', label: 'Class 4', category: 'Upper Primary' },
  { value: 'B5', label: 'Class 5', category: 'Upper Primary' },
  { value: 'B6', label: 'Class 6', category: 'Upper Primary' },
  { value: 'JHS1', label: 'JHS 1', category: 'JHS' },
  { value: 'JHS2', label: 'JHS 2', category: 'JHS' },
  { value: 'JHS3', label: 'JHS 3', category: 'JHS' },
];

export const CKLA_GRADE_LEVELS: { value: CKLAGradeLevel; label: string }[] = [
  { value: 'PreK', label: 'Pre-K' },
  { value: 'K', label: 'Kindergarten' },
  { value: 'G1', label: 'Grade 1' },
  { value: 'G2', label: 'Grade 2' },
];

export const GRADE_LEVELS = NACCA_GRADE_LEVELS;

export const getGradeCategory = (level: GradeLevel): GradeCategory => {
  if (['PreK', 'K', 'G1', 'G2'].includes(level)) return 'CKLA PreK-2';
  if (level.startsWith('KG')) return 'KG';
  if (level === 'B1' || level === 'B2') return 'Lower Primary';
  if (level.startsWith('B')) return 'Upper Primary';
  if (level.startsWith('JHS')) return 'JHS';
  return 'Custom';
};

export const getSubjectsForLevel = (level: GradeLevel): string[] => {
  if (['PreK', 'K', 'G1', 'G2'].includes(level)) return [...CKLA_SUBJECTS];
  const category = getGradeCategory(level);
  switch (category) {
    case 'KG': return [...KG_SUBJECTS];
    case 'Lower Primary': return [...LOWER_PRIMARY_SUBJECTS];
    case 'Upper Primary': return [...UPPER_PRIMARY_SUBJECTS];
    case 'JHS': return [...JHS_SUBJECTS];
    default: return [];
  }
};

export interface UnifiedCurriculum {
  subject: string;
  level: GradeLevel;
  strands: Strand[] | CKLAStrand[];
}

export const getCurriculum = (level: GradeLevel, subject: string): UnifiedCurriculum | undefined => {
  if (['PreK', 'K', 'G1', 'G2'].includes(level)) {
    const curriculum = cklaCurriculums[level as CKLAGradeLevel]?.[subject as CKLASubject];
    if (curriculum) return { subject, level, strands: curriculum.strands };
    return undefined;
  }
  
  const category = getGradeCategory(level);
  if (category === 'KG') {
    const curriculum = kgCurriculums[level as 'KG1' | 'KG2']?.[subject];
    if (curriculum) return { subject, level, strands: curriculum.strands };
  }
  if (category === 'Lower Primary') {
    const curriculum = lowerPrimaryCurriculums[subject];
    if (curriculum) return { subject, level, strands: curriculum.strands };
  }
  if (category === 'Upper Primary') {
    const curriculum = upperPrimaryCurriculums[subject];
    if (curriculum) return { subject, level, strands: curriculum.strands };
  }
  if (category === 'JHS') {
    const curriculum = jhsCurriculums[subject];
    if (curriculum) return { subject, level, strands: curriculum.strands };
  }
  return undefined;
};
