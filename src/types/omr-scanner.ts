// Types for OMR (Optical Mark Recognition) scanning

export interface OMRAnswerSheet {
  id: string;
  test_paper_id: string;
  student_id?: string;
  student_name?: string;
  student_index?: string;
  class_name: string;
  subject: string;
  grade_level: string;
  term: string;
  academic_year: string;
  school_id: string;
  total_questions: number;
  answers: OMRAnswer[];
  scan_status: 'pending' | 'scanned' | 'verified' | 'error';
  scanned_at?: string;
  scanned_by?: string;
  verified_by?: string;
  created_at: string;
}

export interface OMRAnswer {
  question_number: number;
  question_id: string;
  selected_option: 'A' | 'B' | 'C' | 'D' | 'E' | null;
  correct_option: 'A' | 'B' | 'C' | 'D' | 'E';
  is_correct: boolean;
  indicator_code?: string;
  indicator_text?: string;
  strand?: string;
  sub_strand?: string;
  marks: number;
  marks_earned: number;
}

export interface OMRScanResult {
  id: string;
  answer_sheet_id: string;
  student_id: string;
  student_name: string;
  test_paper_id: string;
  class_name: string;
  subject: string;
  grade_level: string;
  term_id: string;
  school_id: string;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  unanswered: number;
  total_marks: number;
  marks_obtained: number;
  percentage: number;
  grade: 'M' | 'P' | 'AP' | 'D';
  indicator_results: IndicatorResult[];
  scanned_at: string;
  scanned_by: string;
  image_url?: string;
}

export interface IndicatorResult {
  indicator_code: string;
  indicator_text: string;
  strand: string;
  sub_strand: string;
  questions_count: number;
  correct_count: number;
  percentage: number;
  status: 'M' | 'P' | 'AP' | 'D';
  is_met: boolean;
}

export interface OMRSheetConfig {
  test_paper_id: string;
  title: string;
  subject: string;
  grade_level: string;
  class_name: string;
  term: string;
  academic_year: string;
  school_name: string;
  school_logo?: string;
  total_questions: number;
  options_per_question: 4 | 5;
  questions: OMRQuestion[];
  instructions: string[];
}

export interface OMRQuestion {
  number: number;
  question_id: string;
  correct_option: 'A' | 'B' | 'C' | 'D' | 'E';
  indicator_code?: string;
  indicator_text?: string;
  strand?: string;
  sub_strand?: string;
  marks: number;
}

export interface ScanDetection {
  questionNumber: number;
  detectedOption: 'A' | 'B' | 'C' | 'D' | 'E' | null;
  confidence: number;
  bubblePositions: { option: string; filled: boolean; intensity: number }[];
}

export interface StudentOMREntry {
  student_id: string;
  student_name: string;
  student_index: string;
}

// Grading thresholds
export const OMR_GRADE_THRESHOLDS = {
  M: { min: 80, label: 'Mastery', color: 'green' },
  P: { min: 66, label: 'Proficiency', color: 'blue' },
  AP: { min: 50, label: 'Approaching Proficiency', color: 'yellow' },
  D: { min: 0, label: 'Developing', color: 'red' }
};

export function getOMRGrade(percentage: number): 'M' | 'P' | 'AP' | 'D' {
  if (percentage >= 80) return 'M';
  if (percentage >= 66) return 'P';
  if (percentage >= 50) return 'AP';
  return 'D';
}

export function isIndicatorMet(percentage: number): boolean {
  return percentage >= 50; // AP or above is considered "met"
}

// Bulk Import Types
export interface BulkOMRImportJob {
  id: string;
  test_paper_id: string;
  test_paper_title: string;
  class_name: string;
  subject: string;
  grade_level: string;
  term_id: string;
  school_id: string;
  teacher_id: string;
  total_files: number;
  processed_files: number;
  successful_scans: number;
  failed_scans: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  started_at: string;
  completed_at?: string;
  results: BulkOMRScanItem[];
}

export interface BulkOMRScanItem {
  filename: string;
  student_id?: string;
  student_name?: string;
  student_index?: string;
  status: 'pending' | 'processing' | 'success' | 'error' | 'unmatched';
  error_message?: string;
  scan_result?: OMRScanResult;
  matched_by?: 'index' | 'name' | 'manual';
}

export interface BulkOMRSummaryReport {
  job_id: string;
  test_paper_title: string;
  class_name: string;
  subject: string;
  grade_level: string;
  scan_date: string;
  
  // Overall Statistics
  total_students_scanned: number;
  total_students_in_class: number;
  scan_coverage_percentage: number;
  
  // Score Statistics
  class_average: number;
  highest_score: number;
  lowest_score: number;
  median_score: number;
  standard_deviation: number;
  
  // Grade Distribution
  grade_distribution: {
    M: { count: number; percentage: number; students: string[] };
    P: { count: number; percentage: number; students: string[] };
    AP: { count: number; percentage: number; students: string[] };
    D: { count: number; percentage: number; students: string[] };
  };
  
  // Indicator Achievement
  indicator_summary: {
    indicator_code: string;
    indicator_text: string;
    strand: string;
    sub_strand: string;
    total_students: number;
    students_met: number;
    students_not_met: number;
    class_percentage: number;
    status: 'M' | 'P' | 'AP' | 'D';
    needs_intervention: boolean;
  }[];
  
  // Students needing intervention
  students_needing_support: {
    student_id: string;
    student_name: string;
    percentage: number;
    grade: string;
    weak_indicators: string[];
  }[];
  
  // Top performers
  top_performers: {
    student_id: string;
    student_name: string;
    percentage: number;
    grade: string;
    indicators_mastered: number;
  }[];
}

export interface StudentMatchResult {
  filename: string;
  detected_index?: string;
  detected_name?: string;
  matched_student?: {
    id: string;
    name: string;
    index?: string;
  };
  confidence: number;
  match_method?: 'index' | 'name' | 'manual';
}
