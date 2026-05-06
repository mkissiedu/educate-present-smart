export type TermNumber = 1 | 2 | 3;

export interface Term {
  id: string;
  termNumber: TermNumber;
  name: string;
  startDate: string;
  endDate: string;
  academicYear: string;
  weeksCount: number;
}

export interface TermSettings {
  academicYear: string;
  terms: Term[];
}

export interface LessonSchedule {
  lessonId: string;
  scheduledDate: string;
  scheduledTime?: string;
  durationMinutes: number;
}

export interface ScheduleConflict {
  lessonId: string;
  lessonTitle: string;
  scheduledTime: string;
  durationMinutes: number;
}

export interface WeekStatus {
  week: number;
  startDate: string;
  endDate: string;
  isCurrentWeek: boolean;
  isPast: boolean;
  lessonsPlanned: number;
  lessonsCompleted: number;
  totalExpected: number;
}

export interface SubjectProgress {
  subject: string;
  lessonsPlanned: number;
  lessonsCompleted: number;
  totalExpected: number;
  indicatorsCovered: string[];
  percentComplete: number;
}

export interface TermProgress {
  term: Term;
  currentWeek: number;
  weeksCompleted: number;
  totalLessons: number;
  completedLessons: number;
  percentComplete: number;
  subjectProgress: SubjectProgress[];
  weekStatuses: WeekStatus[];
}

export interface CurriculumCoverage {
  subject: string;
  totalIndicators: number;
  coveredIndicators: number;
  percentCovered: number;
  strandsCovered: { name: string; covered: number; total: number }[];
}

export interface TermReport {
  term: Term;
  generatedAt: string;
  progress: TermProgress;
  curriculumCoverage: CurriculumCoverage[];
  lessonsPerWeek: { week: number; count: number }[];
  recommendations: string[];
}

export const WEEKS_PER_TERM = 12;
export const TERMS_PER_YEAR = 3;

export const DEFAULT_TERM_NAMES: Record<TermNumber, string> = {
  1: 'Term 1',
  2: 'Term 2',
  3: 'Term 3'
};

export const getDefaultTermDates = (year: string): Term[] => {
  return [
    { id: `${year}-t1`, termNumber: 1, name: 'Term 1', startDate: `${year}-09-01`, endDate: `${year}-12-15`, academicYear: year, weeksCount: 12 },
    { id: `${year}-t2`, termNumber: 2, name: 'Term 2', startDate: `${parseInt(year)+1}-01-10`, endDate: `${parseInt(year)+1}-04-10`, academicYear: year, weeksCount: 12 },
    { id: `${year}-t3`, termNumber: 3, name: 'Term 3', startDate: `${parseInt(year)+1}-05-01`, endDate: `${parseInt(year)+1}-07-31`, academicYear: year, weeksCount: 12 }
  ];
};

export const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00'
];
