// Types for bulk lesson import
import { CLASS_LEVELS, SUBJECTS } from '@/types/user';

export interface ImportedSlide {
  slideNumber: number;
  title: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'quiz' | 'timer' | 'game';
  imageUrl?: string;
  teacherNotes?: string;
  strand?: string;
  subStrand?: string;
  contentStandard?: string;
  indicators?: string;
  coreCompetences?: string;
  resources?: string;
  stickability?: string;
  differentiation?: string;
  keyWords?: string;
}

export interface ImportedLesson {
  title: string;
  subject: string;
  class: string;
  week: number;
  lessonNumber: number;
  duration: string;
  thumbnailUrl?: string;
  slides: ImportedSlide[];
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export interface ImportResult {
  lessons: ImportedLesson[];
  errors: ValidationError[];
  warnings: string[];
}

export const SLIDE_TITLES = [
  'Lesson Title',
  'Lesson Overview',
  'Resources',
  'Stickability',
  'Differentiation',
  'Key Words',
  'Phase 1: Starter',
  'Phase 2: Concept Development',
  'Skills Development',
  'Phase 2: Independent Practice',
  'Phase 2: Lesson Relevance',
  'Phase 3: Wrap Up'
];

export const VALID_SUBJECTS = SUBJECTS;

export const VALID_CLASSES = CLASS_LEVELS;
