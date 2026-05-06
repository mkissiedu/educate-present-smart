import { Lesson } from './lesson';
import { ClassLevel, Subject } from './user';

export interface LessonTemplate {
  id: string;
  title: string;
  description?: string;
  subject: Subject | string;
  classLevel: ClassLevel | string;
  category: TemplateCategory;
  week: number;
  lessonNumber: number;
  lessonData: Lesson;
  authorId: string;
  authorName: string;
  isFeatured: boolean;
  useCount: number;
  thumbnailUrl?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}




export type TemplateCategory = 
  | 'General'
  | 'Phonics'
  | 'Reading'
  | 'Writing'
  | 'Math Basics'
  | 'Problem Solving'
  | 'Science'
  | 'Social Studies'
  | 'Arts & Crafts'
  | 'Music'
  | 'Physical Education'
  | 'Assessment';

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  'General',
  'Phonics',
  'Reading',
  'Writing',
  'Math Basics',
  'Problem Solving',
  'Science',
  'Social Studies',
  'Arts & Crafts',
  'Music',
  'Physical Education',
  'Assessment'
];

export interface TemplateFilters {
  subject?: string;
  classLevel?: string;
  category?: TemplateCategory;
  week?: number;
  lessonNumber?: number;
  searchQuery?: string;
  featuredOnly?: boolean;
}
