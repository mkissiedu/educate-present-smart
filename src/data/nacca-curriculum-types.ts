export interface CurriculumIndicator {
  id: string;
  code: string;
  description: string;
}

export interface ContentStandard {
  id: string;
  code: string;
  description: string;
  indicators: CurriculumIndicator[];
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

export interface SubjectCurriculum {
  subject: string;
  strands: Strand[];
}

export const CORE_COMPETENCES = [
  'Critical Thinking and Problem Solving',
  'Creativity and Innovation',
  'Communication and Collaboration',
  'Cultural Identity and Global Citizenship',
  'Personal Development and Leadership',
  'Digital Literacy'
];

export const WEEKS = Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`);
export const LESSON_NUMBERS = Array.from({ length: 5 }, (_, i) => `Lesson ${i + 1}`);
