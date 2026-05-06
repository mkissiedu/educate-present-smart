// Assessment paper types for CAT and ETE
export type AssessmentPaperType = 
  | 'CAT1' | 'CAT2' | 'CAT3' | 'CAT4' | 'CAT5' | 'CAT6' 
  | 'CAT7' | 'CAT8' | 'CAT9' | 'CAT10' | 'CAT11' | 'CAT12'
  | 'ETE1' | 'ETE2' | 'ETE3';

export interface PublishedTestPaper {
  id: string;
  test_paper_id: string;
  paper_type: AssessmentPaperType;
  subject: string;
  class_level: string;
  term: string;
  academic_year: string;
  publish_mode: 'all' | 'selected';
  published_by?: string;
  published_at: string;
  is_active: boolean;
  school_ids: string[];
}

export interface AcademicCalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  event_type: 'term_start' | 'term_end' | 'holiday' | 'exam_period' | 'vacation' | 'event';
  is_global: boolean;
  school_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SchoolCalendarOverride {
  id: string;
  school_id: string;
  global_event_id?: string;
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  is_hidden: boolean;
  created_at: string;
}

export interface ContentAnalytics {
  id: string;
  super_teacher_id: string;
  content_type: 'lesson' | 'question' | 'test_paper';
  action: 'created' | 'edited' | 'submitted' | 'approved' | 'published';
  content_id?: string;
  subject?: string;
  class_level?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export const ASSESSMENT_PAPER_TYPES: { value: AssessmentPaperType; label: string; description: string }[] = [
  { value: 'CAT1', label: 'CAT 1', description: 'Continuous Assessment Test 1' },
  { value: 'CAT2', label: 'CAT 2', description: 'Continuous Assessment Test 2' },
  { value: 'CAT3', label: 'CAT 3', description: 'Continuous Assessment Test 3' },
  { value: 'CAT4', label: 'CAT 4', description: 'Continuous Assessment Test 4' },
  { value: 'CAT5', label: 'CAT 5', description: 'Continuous Assessment Test 5' },
  { value: 'CAT6', label: 'CAT 6', description: 'Continuous Assessment Test 6' },
  { value: 'CAT7', label: 'CAT 7', description: 'Continuous Assessment Test 7' },
  { value: 'CAT8', label: 'CAT 8', description: 'Continuous Assessment Test 8' },
  { value: 'CAT9', label: 'CAT 9', description: 'Continuous Assessment Test 9' },
  { value: 'CAT10', label: 'CAT 10', description: 'Continuous Assessment Test 10' },
  { value: 'CAT11', label: 'CAT 11', description: 'Continuous Assessment Test 11' },
  { value: 'CAT12', label: 'CAT 12', description: 'Continuous Assessment Test 12' },
  { value: 'ETE1', label: 'ETE 1', description: 'End of Term Examination 1' },
  { value: 'ETE2', label: 'ETE 2', description: 'End of Term Examination 2' },
  { value: 'ETE3', label: 'ETE 3', description: 'End of Term Examination 3' },
];
