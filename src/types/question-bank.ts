export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'fill_blank' | 'matching' | 'essay';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  match_pair?: string;
  option_order: number;
}

export interface Question {
  id: string;
  created_by?: string;
  question_text: string;
  question_type: QuestionType;
  difficulty: Difficulty;
  marks: number;
  curriculum_type: string;
  subject: string;
  grade_level: string;
  strand?: string;
  sub_strand?: string;
  indicator_code?: string;
  indicator_text?: string;
  explanation?: string;
  image_url?: string;
  is_approved: boolean;
  created_at: string;
  options?: QuestionOption[];
}

export interface TestPaper {
  id: string;
  created_by?: string;
  title: string;
  description?: string;
  subject: string;
  grade_level: string;
  curriculum_type: string;
  duration_minutes: number;
  total_marks: number;
  school_name?: string;
  school_logo_url?: string;
  school_address?: string;
  school_motto?: string;
  term?: string;
  academic_year?: string;
  instructions?: string;
  is_published: boolean;
  created_at: string;
  questions?: Question[];
}

export interface TestPaperQuestion {
  id: string;
  test_paper_id: string;
  question_id: string;
  question_order: number;
  marks_override?: number;
}

export interface QuestionFilter {
  curriculum_type?: string;
  subject?: string;
  grade_level?: string;
  strand?: string;
  sub_strand?: string;
  indicator_code?: string;
  difficulty?: Difficulty;
  question_type?: QuestionType;
}
