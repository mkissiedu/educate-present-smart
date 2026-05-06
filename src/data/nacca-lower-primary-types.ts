export type LowerPrimaryLevel = 'B1' | 'B2';

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

export interface LowerPrimarySubjectCurriculum {
  subject: string;
  strands: Strand[];
}

export const LOWER_PRIMARY_SUBJECTS = [
  'English Language',
  'Mathematics',
  'Our World Our People',
  'Creative Arts',
  'Physical Education',
  'Ghanaian Language',
  'Religious & Moral Education',
  'French'
];

export const CORE_COMPETENCIES = [
  'Critical Thinking and Problem Solving (CP)',
  'Creativity and Innovation (CI)',
  'Communication and Collaboration (CC)',
  'Cultural Identity and Global Citizenship (CG)',
  'Personal Development and Leadership (PL)',
  'Digital Literacy (DL)'
];
