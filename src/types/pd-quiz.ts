// PD Quiz Types

export interface QuizQuestion {
  id: string;
  module_id: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  question_text: string;
  options: QuizOption[]; // For multiple choice
  correct_answer?: string; // For true/false and short_answer
  points: number;
  explanation?: string;
  order_index: number;
  created_at: string;
}

export interface QuizOption {
  id: string;
  text: string;
  is_correct: boolean;
}

export interface QuizSettings {
  id: string;
  module_id: string;
  passing_score: number; // Percentage (0-100)
  max_attempts: number; // 0 = unlimited
  time_limit_minutes?: number; // null = no limit
  shuffle_questions: boolean;
  shuffle_options: boolean;
  show_correct_answers: boolean;
  allow_review: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuizAttempt {
  id: string;
  module_id: string;
  teacher_id: string;
  enrollment_id?: string;
  status: 'in_progress' | 'completed' | 'timed_out';
  started_at: string;
  completed_at?: string;
  time_spent_seconds?: number;
  total_questions: number;
  correct_answers: number;
  score_percent: number;
  passed: boolean;
  answers: QuizAnswer[];
  created_at: string;
}

export interface QuizAnswer {
  question_id: string;
  answer: string | string[]; // string for single answer, string[] for multiple select
  is_correct: boolean;
  points_earned: number;
}

export interface QuizState {
  currentQuestionIndex: number;
  answers: Record<string, string | string[]>;
  timeRemaining?: number;
  isSubmitting: boolean;
}

// Default quiz settings
export const DEFAULT_QUIZ_SETTINGS: Omit<QuizSettings, 'id' | 'module_id' | 'created_at' | 'updated_at'> = {
  passing_score: 70,
  max_attempts: 3,
  time_limit_minutes: undefined,
  shuffle_questions: false,
  shuffle_options: false,
  show_correct_answers: true,
  allow_review: true
};
