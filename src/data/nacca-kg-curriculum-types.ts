export type KGLevel = 'KG1' | 'KG2';
export type Term = 'Term 1' | 'Term 2' | 'Term 3';

export interface LearningIndicator {
  id: string;
  code: string;
  description: string;
  activities?: string[];
}

export interface ContentStandard {
  id: string;
  code: string;
  description: string;
  indicators: LearningIndicator[];
}

export interface SubStrand {
  id: string;
  name: string;
  contentStandards: ContentStandard[];
}

export interface Strand {
  id: string;
  name: string;
  subStrands: SubStrand[];
}

export interface KGSubjectCurriculum {
  subject: string;
  level: KGLevel;
  strands: Strand[];
}

export interface WeeklyPlan {
  week: number;
  term: Term;
  theme: string;
  strandId: string;
  subStrandId: string;
  contentStandardId: string;
  indicatorIds: string[];
  suggestedActivities: string[];
}

export interface CurriculumAlignment {
  lessonId: string;
  subject: string;
  level: KGLevel;
  strandId: string;
  subStrandId: string;
  contentStandardId: string;
  indicatorIds: string[];
  coreCompetencies: string[];
}

export const CORE_COMPETENCIES = [
  'Critical Thinking and Problem Solving (CP)',
  'Creativity and Innovation (CI)',
  'Communication and Collaboration (CC)',
  'Cultural Identity and Global Citizenship (CG)',
  'Personal Development and Leadership (PL)',
  'Digital Literacy (DL)'
];

export const KG_SUBJECTS = [
  'Language & Literacy',
  'Numeracy',
  'Our World Our People',
  'Creative Arts',
  'Physical Education'
];
