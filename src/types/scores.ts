export interface StudentScore {
  id: string;
  student_id: string;
  term_id: string;
  subject: string;
  cat_1: number;
  cat_2: number;
  cat_3: number;
  cat_4: number;
  ete: number;
  total: number;
  grade: string;
  remarks: string;
  created_at: string;
  updated_at: string;
}

export interface ReportCard {
  id: string;
  student_id: string;
  term_id: string;
  academic_year: string;
  class_name: string;
  teacher_name: string;
  total_school_days: number;
  days_present: number;
  days_absent: number;
  conduct: string;
  teacher_remarks: string;
  head_teacher_remarks: string;
  promotion_status: string;
  next_term_begins: string;
  generated_at: string;
  sent_via_whatsapp: boolean;
  whatsapp_sent_at: string | null;
}

export interface ScoreEntry {
  subject: string;
  cat_1: number;
  cat_2: number;
  cat_3: number;
  cat_4: number;
  ete: number;
}

export interface CurriculumProgress {
  strand: string;
  indicator: string;
  status: 'mastered' | 'progressing' | 'needs-support';
  percentage: number;
}

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
}

// Indicator Achievement Status for Standards Map
export interface IndicatorStatus {
  indicatorCode: string;
  indicatorText: string;
  strand: string;
  subStrand: string;
  status: 'M' | 'P' | 'AP' | 'D' | 'not-assessed';
  percentage: number;
  assessmentDate?: string;
}

export interface StudentStandardsStatus {
  studentId: string;
  studentName: string;
  className: string;
  subject: string;
  termId: string;
  indicators: IndicatorStatus[];
  summary: {
    totalIndicators: number;
    mastered: number;
    proficient: number;
    approachingProficiency: number;
    developing: number;
    notAssessed: number;
  };
}

export const SUBJECTS = [
  'English Language',
  'Mathematics',
  'Science',
  'Social Studies',
  'Religious & Moral Education',
  'Creative Arts',
  'Ghanaian Language',
  'French',
  'Computing',
  'Physical Education',
  'Our World Our People'
];

// New Grade calculation based on 100-point scale
// M = Mastery (80% and above)
// P = Proficiency (66-79%)
// AP = Approaching Proficiency (50-65%)
// D = Developing (49% and below)
export const calculateGrade = (total: number): string => {
  const percentage = (total / 100) * 100;
  if (percentage >= 80) return 'M';
  if (percentage >= 66) return 'P';
  if (percentage >= 50) return 'AP';
  return 'D';
};

// Get grade from percentage (for indicator assessments)
export const getGradeFromPercentage = (percentage: number): 'M' | 'P' | 'AP' | 'D' => {
  if (percentage >= 80) return 'M';
  if (percentage >= 66) return 'P';
  if (percentage >= 50) return 'AP';
  return 'D';
};

export const getGradeRemark = (grade: string): string => {
  const remarks: Record<string, string> = {
    'M': 'Mastery',
    'P': 'Proficiency',
    'AP': 'Approaching Proficiency',
    'D': 'Developing'
  };
  return remarks[grade] || '';
};

export const getGradeDescription = (grade: string): string => {
  const descriptions: Record<string, string> = {
    'M': 'Student has fully mastered the learning objectives',
    'P': 'Student demonstrates proficiency in the learning objectives',
    'AP': 'Student is approaching proficiency and needs continued practice',
    'D': 'Student is developing understanding and needs additional support'
  };
  return descriptions[grade] || '';
};

export const getGradeColor = (grade: string): string => {
  const colors: Record<string, string> = {
    'M': 'bg-emerald-100 text-emerald-800',
    'P': 'bg-blue-100 text-blue-800',
    'AP': 'bg-amber-100 text-amber-800',
    'D': 'bg-red-100 text-red-800'
  };
  return colors[grade] || 'bg-gray-100 text-gray-800';
};

export const getGradeBgColor = (grade: string): string => {
  const colors: Record<string, string> = {
    'M': 'bg-emerald-500',
    'P': 'bg-blue-500',
    'AP': 'bg-amber-500',
    'D': 'bg-red-500'
  };
  return colors[grade] || 'bg-gray-500';
};

export const getGradeTextColor = (grade: string): string => {
  const colors: Record<string, string> = {
    'M': 'text-emerald-600',
    'P': 'text-blue-600',
    'AP': 'text-amber-600',
    'D': 'text-red-600'
  };
  return colors[grade] || 'text-gray-600';
};

// Grade thresholds for display
export const GRADE_THRESHOLDS = [
  { grade: 'M', label: 'Mastery', min: 80, max: 100, color: 'emerald' },
  { grade: 'P', label: 'Proficiency', min: 66, max: 79, color: 'blue' },
  { grade: 'AP', label: 'Approaching Proficiency', min: 50, max: 65, color: 'amber' },
  { grade: 'D', label: 'Developing', min: 0, max: 49, color: 'red' }
];
