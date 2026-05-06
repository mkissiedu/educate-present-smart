// CKLA (Core Knowledge Language Arts) Curriculum Types

export type CKLAGradeLevel = 'PreK' | 'K' | 'G1' | 'G2';
export type CKLASubject = 'Skills Strand' | 'Knowledge Strand';

export const CKLA_GRADE_LEVELS: { value: CKLAGradeLevel; label: string }[] = [
  { value: 'PreK', label: 'Pre-Kindergarten' },
  { value: 'K', label: 'Kindergarten' },
  { value: 'G1', label: 'Grade 1' },
  { value: 'G2', label: 'Grade 2' },
];

export const CKLA_SUBJECTS: CKLASubject[] = ['Skills Strand', 'Knowledge Strand'];

export interface CKLAIndicator {
  id: string;
  code: string;
  description: string;
  skillType?: string;
}

export interface CKLAContentStandard {
  id: string;
  code: string;
  description: string;
  indicators: CKLAIndicator[];
}

export interface CKLASubStrand {
  id: string;
  name: string;
  contentStandards: CKLAContentStandard[];
}

export interface CKLAStrand {
  id: string;
  name: string;
  color: string;
  subStrands: CKLASubStrand[];
}

export interface CKLACurriculum {
  subject: CKLASubject;
  level: CKLAGradeLevel;
  strands: CKLAStrand[];
}

export const CKLA_CORE_SKILLS = [
  'Phonological Awareness',
  'Phonics & Word Recognition',
  'Fluency',
  'Vocabulary',
  'Comprehension',
  'Writing & Language',
  'Speaking & Listening'
];
