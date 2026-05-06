import { Slide } from '@/types/lesson';

// Map of template slide IDs to their titles (teacher-focused only)
const SLIDE_TITLES: Record<string, string> = {
  'lesson-info': 'Lesson Information',
  'resources': 'Resources',
  'stickability': 'Stickability',
  'differentiation': 'Differentiation',
  'key-words': 'Key Words',
  'phase1-starter': 'Phase 1: Starter',
  'phase2-concept': 'Phase 2: Concept Development',
  'phase2-skill': 'Skills Development',
  'phase2-practice': 'Phase 2: Independent Practice',
  'phase2-relevance': 'Phase 2: Lesson Relevance',
  'phase3-wrapup': 'Phase 3: Wrap Up'
};

export const getSlideTitle = (slide: Slide): string => {
  const templateId = slide.templateSlideId;
  
  if (templateId && SLIDE_TITLES[templateId]) {
    return SLIDE_TITLES[templateId];
  }
  
  return slide.title;
};

export const getSlideShortTitle = (slide: Slide): string => {
  const templateId = slide.templateSlideId;
  
  if (templateId && SLIDE_TITLES[templateId]) {
    return SLIDE_TITLES[templateId];
  }
  
  return slide.title;
};

export const isTemplateSlide = (slide: Slide): boolean => {
  return !!slide.templateSlideId && !!SLIDE_TITLES[slide.templateSlideId];
};
