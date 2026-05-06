export type LessonStatus = 'plan' | 'teach';

export interface PlanningChecklist {
  reviewedContent: boolean;
  checkedTextbook: boolean;
  checkedWorkbook: boolean;
  checkedAnswerKey: boolean;
  addedNotes: boolean;
}

export interface PlanningSession {
  id: string;
  lessonId: string;
  teacherId: string;
  status: 'planning' | 'completed';
  planningStartTime: string;
  planningDurationSeconds: number;
  completedAt?: string;
  notes?: string;
  checklist: PlanningChecklist;
  createdAt: string;
  updatedAt: string;
}

export interface LessonWithPlanning {
  lessonId: string;
  teacherId: string;
  status: LessonStatus;
  planningSession?: PlanningSession;
  canTeach: boolean;
  remainingPlanningTime: number;
}

export const MIN_PLANNING_TIME_SECONDS = 300; // 5 minutes
export const DEFAULT_CHECKLIST: PlanningChecklist = {
  reviewedContent: false,
  checkedTextbook: false,
  checkedWorkbook: false,
  checkedAnswerKey: false,
  addedNotes: false,
};
