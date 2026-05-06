import { ClassLevel } from './user';

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizData {
  question: string;
  options: QuizOption[];
}

export interface TimerData {
  duration: number;
  autoStart: boolean;
}

export interface GameData {
  gameType: 'sound-match' | 'word-builder' | 'rhyme-time';
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  customItems?: GameItem[];
  targetScore?: number;
  timeLimit?: number;
}

export interface GameItem {
  id: string;
  prompt: string;
  answer: string;
  options?: string[];
  imageUrl?: string;
  audioUrl?: string;
}

export interface LessonResource {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'link';
  url: string;
  thumbnailUrl?: string;
}

export interface CurriculumInfo {
  strand?: string;
  strandName?: string;
  subStrand?: string;
  subStrandName?: string;
  contentStandard?: string;
  contentStandardCode?: string;
  contentStandardDesc?: string;
  indicators?: string[];
  indicatorDetails?: { code: string; description: string }[];
  coreCompetences?: string[];
  kgLevel?: 'KG1' | 'KG2';
  kgIndicatorIds?: string[];
}

export interface KeyWord {
  id: string;
  word: string;
  meaning?: string;
  pronunciation?: string;
  audioUrl?: string;
  audioSource?: 'file' | 'google';
}

export interface KeyWordsData {
  keywords: KeyWord[];
}

export interface ResourceItem {
  id: string;
  name: string;
  quantity?: string;
}

export interface ResourcesData {
  resources: ResourceItem[];
  textbookPdfUrl?: string;
  textbookPdfName?: string;
}

export interface DifferentiationData {
  extending: string[];
  consolidating: string[];
  beginning: string[];
}

export interface PhaseData {
  bullets: string[];
  worksheetPdfUrl?: string;
  worksheetPdfName?: string;
  answerKeyPdfUrl?: string;
  answerKeyPdfName?: string;
}

export interface Annotation {
  id: string;
  type: 'pen' | 'highlight' | 'text';
  color: string;
  points: { x: number; y: number }[];
}

export interface Slide {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'quiz' | 'timer' | 'game' | 'lesson-info' | 'key-words' | 'resources' | 'differentiation' | 'phase-starter' | 'phase-development' | 'phase-skill' | 'phase-practice' | 'phase-wrapup';
  templateSlideId?: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  links?: { title: string; url: string }[];
  quizData?: QuizData;
  timerData?: TimerData;
  gameData?: GameData;
  keyWordsData?: KeyWordsData;
  resourcesData?: ResourcesData;
  differentiationData?: DifferentiationData;
  phaseData?: PhaseData;
  annotations?: Annotation[];
  teacherNotes?: string;
  curriculumInfo?: CurriculumInfo;
}

export interface Lesson {
  id: string;
  title: string;
  subject: string;
  class?: ClassLevel;
  week: number;
  lessonNumber: number;
  duration: string;
  thumbnailUrl: string;
  slides: Slide[];
  resources?: LessonResource[];
  lastPresented?: string;
  isFavorite: boolean;
  curriculumInfo?: CurriculumInfo;
  scheduledDate?: string;
  scheduledTime?: string;
  // Planning workflow fields
  planningStatus?: 'plan' | 'teach';
  minPlanningTimeSeconds?: number;
}


export const LESSONS_PER_WEEK: Record<string, number> = {
  'Language & Literacy': 5,
  'Numeracy': 5,
  'Creative Arts': 2,
  'Our World Our People': 2,
  "Ananse's Phonics": 5,
  'English Language': 5,
  'Mathematics': 5,
  'Science': 3,
  'Social Studies': 2,
  'Computing': 2,
  'French': 2,
  'Ghanaian Language': 2,
  'Religious & Moral Education': 2,
  'Career Technology': 2,
  'Physical Education': 2,
};

export const TOTAL_WEEKS = 12;

export interface Poll {
  question: string;
  options: string[];
  votes: number[];
}
