// Progress Report Types

export interface TermScoreData {
  termId: string;
  termName: string;
  termNumber: number;
  academicYear: string;
  subjects: SubjectScore[];
  overallAverage: number;
  attendance: AttendanceData;
}

export interface SubjectScore {
  subject: string;
  cat1: number;
  cat2: number;
  cat3: number;
  cat4: number;
  ete: number;
  total: number;
  grade: string;
  previousTermTotal?: number;
  trend: 'up' | 'down' | 'stable';
}

export interface AttendanceData {
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
}

export interface StandardsAchievement {
  subject: string;
  strand: string;
  indicatorCode: string;
  indicatorText: string;
  status: 'M' | 'P' | 'AP' | 'D' | 'not-assessed';
  percentage: number;
  assessmentDate?: string;
}

export interface StandardsSummary {
  subject: string;
  totalIndicators: number;
  mastered: number;
  proficient: number;
  approachingProficiency: number;
  developing: number;
  notAssessed: number;
  masteryPercentage: number;
}

export interface ProgressReportData {
  student: {
    id: string;
    name: string;
    className: string;
    admissionNumber?: string;
    dateOfBirth?: string;
    parentName?: string;
    parentPhone?: string;
  };
  school: {
    name: string;
    logo?: string;
    address?: string;
    phone?: string;
    email?: string;
    motto?: string;
  };
  currentTerm: TermScoreData;
  previousTerms: TermScoreData[];
  standardsAchievement: StandardsAchievement[];
  standardsSummary: StandardsSummary[];
  teacherComments: string;
  headTeacherComments: string;
  conduct: string;
  promotionStatus: string;
  recommendations: AIRecommendation[];
  generatedAt: string;
}

export interface AIRecommendation {
  category: 'strength' | 'improvement' | 'action' | 'goal';
  subject?: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface TermComparison {
  subject: string;
  term1?: number;
  term2?: number;
  term3?: number;
  change: number;
  trend: 'improving' | 'declining' | 'stable';
}

export interface PerformancePattern {
  pattern: string;
  description: string;
  subjects: string[];
  recommendation: string;
}

export interface ReportGenerationOptions {
  includeCharts: boolean;
  includeStandards: boolean;
  includeRecommendations: boolean;
  includeAttendance: boolean;
  includeTermComparison: boolean;
  termsToCompare: number; // 1, 2, or 3 terms
}
