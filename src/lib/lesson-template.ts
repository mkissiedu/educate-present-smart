import { Slide } from '@/types/lesson';

export const createLessonTemplateSlides = (): Slide[] => [
  { id: '1', title: 'Lesson Information', content: '', type: 'lesson-info', templateSlideId: 'lesson-info' },
  { id: '2', title: 'Teaching & Learning Resources', content: '', type: 'resources', templateSlideId: 'resources', resourcesData: { resources: [], textbookPdfUrl: '', textbookPdfName: '' } },
  { id: '3', title: 'Differentiation', content: '', type: 'differentiation', templateSlideId: 'differentiation', differentiationData: { extending: [], consolidating: [], beginning: [] } },
  { id: '4', title: 'Key Words', content: '', type: 'key-words', templateSlideId: 'key-words', keyWordsData: { keywords: [] } },
  { id: '5', title: 'Phase 1: Starter', content: '', type: 'phase-starter', templateSlideId: 'phase-starter', phaseData: { bullets: [] } },
  { id: '6', title: 'Phase 2: Concept Development', content: '', type: 'phase-development', templateSlideId: 'phase-development', phaseData: { bullets: [] } },
  { id: '7', title: 'Phase 2: Skill Development', content: '', type: 'phase-skill', templateSlideId: 'phase-skill', phaseData: { bullets: [] } },
  { id: '8', title: 'Phase 2: Independent Practice', content: '', type: 'phase-practice', templateSlideId: 'phase-practice', phaseData: { bullets: [], worksheetPdfUrl: '', worksheetPdfName: '', answerKeyPdfUrl: '', answerKeyPdfName: '' } },
  { id: '9', title: 'Phase 3: Wrap Up', content: '', type: 'phase-wrapup', templateSlideId: 'phase-wrapup', phaseData: { bullets: [] } }
];

export const TEMPLATE_SLIDE_TITLES: Record<string, string> = {
  'lesson-info': 'Lesson Information',
  'resources': 'Teaching & Learning Resources',
  'differentiation': 'Differentiation',
  'key-words': 'Key Words',
  'phase-starter': 'Phase 1: Starter',
  'phase-development': 'Phase 2: Concept Development',
  'phase-skill': 'Phase 2: Skill Development',
  'phase-practice': 'Phase 2: Independent Practice',
  'phase-wrapup': 'Phase 3: Wrap Up'
};
