import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Term, TermNumber, TermSettings, TermProgress, WeekStatus, SubjectProgress, LessonSchedule, ScheduleConflict, getDefaultTermDates, WEEKS_PER_TERM } from '@/types/term';
import { useLessonContext } from './LessonContext';
import { LESSONS_PER_WEEK, Lesson } from '@/types/lesson';
import { CLASS_SUBJECTS_MAP, ClassLevel } from '@/types/user';
import * as termDb from '@/lib/supabase-terms';

interface TermContextType {
  termSettings: TermSettings;
  currentTerm: Term | null;
  selectedTerm: Term | null;
  setSelectedTerm: (term: Term) => void;
  updateTermDates: (termNumber: TermNumber, startDate: string, endDate: string) => Promise<void>;
  getTermProgress: (term: Term, classLevel?: string) => TermProgress;
  getCurrentWeek: (term: Term) => number;
  schedules: Map<string, LessonSchedule>;
  scheduleLessonOnDate: (lessonId: string, date: string, time?: string) => Promise<boolean>;
  unscheduleLesson: (lessonId: string) => Promise<boolean>;
  getScheduleConflicts: (date: string, time: string, excludeLessonId?: string) => ScheduleConflict[];
  getLessonsForDate: (date: string) => Lesson[];
  isLoading: boolean;
  isSyncing: boolean;
}

const TermContext = createContext<TermContextType | undefined>(undefined);

export const useTermContext = () => {
  const ctx = useContext(TermContext);
  if (!ctx) throw new Error('useTermContext must be used within TermProvider');
  return ctx;
};

// Alias for convenience
export const useTerm = useTermContext;


const STORAGE_KEY = 'catalyst-term-settings';

export const TermProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { lessons, saveLesson } = useLessonContext();
  const currentYear = new Date().getFullYear().toString();
  
  const [termSettings, setTermSettings] = useState<TermSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore parse errors
    }
    return { academicYear: currentYear, terms: getDefaultTermDates(currentYear) };
  });

  const [selectedTerm, setSelectedTerm] = useState<Term | null>(termSettings.terms[0] || null);
  const [schedules, setSchedules] = useState<Map<string, LessonSchedule>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const loadFromDb = async () => {
      setIsLoading(true);
      try {
        const dbSettings = await termDb.fetchTermSettings(currentYear);
        if (dbSettings && dbSettings.terms && dbSettings.terms.length > 0) {
          setTermSettings(dbSettings);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(dbSettings));
        }
      } catch (err) {
        console.warn('[TermContext] Failed to fetch term settings from DB, using local defaults:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadFromDb();
  }, [currentYear]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(termSettings));
    } catch {
      // Ignore storage errors
    }
  }, [termSettings]);

  const currentTerm = useMemo(() => {
    const now = new Date();
    return termSettings.terms.find(t => {
      const start = new Date(t.startDate);
      const end = new Date(t.endDate);
      return now >= start && now <= end;
    }) || null;
  }, [termSettings]);

  const updateTermDates = async (termNumber: TermNumber, startDate: string, endDate: string) => {
    const newSettings = { ...termSettings, terms: termSettings.terms.map(t => t.termNumber === termNumber ? { ...t, startDate, endDate } : t) };
    setTermSettings(newSettings);
    setIsSyncing(true);
    try {
      await termDb.saveTermSettings(newSettings);
    } catch (err) {
      console.warn('[TermContext] Failed to save term settings to DB:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const getCurrentWeek = (term: Term): number => {
    const now = new Date();
    const start = new Date(term.startDate);
    if (now < start) return 0;
    const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(Math.floor(diffDays / 7) + 1, WEEKS_PER_TERM);
  };

  const scheduleLessonOnDate = async (lessonId: string, date: string, time?: string): Promise<boolean> => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return false;
    const updatedLesson = { ...lesson, scheduledDate: date, scheduledTime: time };
    await saveLesson(updatedLesson);
    const schedule: LessonSchedule = { lessonId, scheduledDate: date, scheduledTime: time, durationMinutes: parseInt(lesson.duration) || 30 };
    setSchedules(prev => new Map(prev).set(lessonId, schedule));
    try {
      await termDb.saveLessonSchedule({ lesson_id: lessonId, scheduled_date: date, scheduled_time: time, duration_minutes: schedule.durationMinutes });
    } catch (err) {
      console.warn('[TermContext] Failed to save lesson schedule to DB:', err);
    }
    return true;
  };

  const unscheduleLesson = async (lessonId: string): Promise<boolean> => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (lesson) {
      const updatedLesson = { ...lesson, scheduledDate: undefined, scheduledTime: undefined };
      await saveLesson(updatedLesson);
    }
    setSchedules(prev => { const m = new Map(prev); m.delete(lessonId); return m; });
    try {
      await termDb.deleteLessonSchedule(lessonId);
    } catch (err) {
      console.warn('[TermContext] Failed to delete lesson schedule from DB:', err);
    }
    return true;
  };

  const getScheduleConflicts = useCallback((date: string, time: string, excludeLessonId?: string): ScheduleConflict[] => {
    return lessons.filter(l => l.scheduledDate === date && l.scheduledTime === time && l.id !== excludeLessonId)
      .map(l => ({ lessonId: l.id, lessonTitle: l.title, scheduledTime: l.scheduledTime || '', durationMinutes: parseInt(l.duration) || 30 }));
  }, [lessons]);

  const getLessonsForDate = useCallback((date: string): Lesson[] => {
    return lessons.filter(l => l.scheduledDate === date).sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''));
  }, [lessons]);

  const getTermProgress = (term: Term, classLevel?: string): TermProgress => {
    const termLessons = lessons.filter(l => {
      if (classLevel && l.class !== classLevel) return false;
      return l.week >= 1 && l.week <= WEEKS_PER_TERM;
    });

    // Get subjects dynamically based on class level
    const subjects = classLevel ? (CLASS_SUBJECTS_MAP[classLevel as ClassLevel] || []) : ['Language & Literacy', 'Numeracy', 'Creative Arts', 'Our World Our People'];
    
    const subjectProgress: SubjectProgress[] = subjects.map(subject => {
      const subjectLessons = termLessons.filter(l => l.subject === subject);
      const expected = (LESSONS_PER_WEEK[subject] || 2) * WEEKS_PER_TERM;
      const indicators = new Set<string>();
      subjectLessons.forEach(l => l.curriculumInfo?.kgIndicatorIds?.forEach(id => indicators.add(id)));
      return { subject, lessonsPlanned: subjectLessons.length, lessonsCompleted: subjectLessons.filter(l => l.lastPresented).length, totalExpected: expected, indicatorsCovered: Array.from(indicators), percentComplete: Math.round((subjectLessons.length / expected) * 100) };
    });

    const weekStatuses: WeekStatus[] = Array.from({ length: WEEKS_PER_TERM }, (_, i) => {
      const week = i + 1;
      const weekLessons = termLessons.filter(l => l.week === week);
      const start = new Date(term.startDate);
      start.setDate(start.getDate() + (week - 1) * 7);
      const end = new Date(start); end.setDate(end.getDate() + 6);
      const now = new Date();
      return { week, startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0], isCurrentWeek: now >= start && now <= end, isPast: now > end, lessonsPlanned: weekLessons.length, lessonsCompleted: weekLessons.filter(l => l.lastPresented).length, totalExpected: 14 };
    });

    const currentWeek = getCurrentWeek(term);
    const totalLessons = termLessons.length;
    const completedLessons = termLessons.filter(l => l.lastPresented).length;

    return { term, currentWeek, weeksCompleted: Math.max(0, currentWeek - 1), totalLessons, completedLessons, percentComplete: Math.round((completedLessons / Math.max(totalLessons, 1)) * 100), subjectProgress, weekStatuses };
  };

  return (
    <TermContext.Provider value={{ termSettings, currentTerm, selectedTerm, setSelectedTerm, updateTermDates, getTermProgress, getCurrentWeek, schedules, scheduleLessonOnDate, unscheduleLesson, getScheduleConflicts, getLessonsForDate, isLoading, isSyncing }}>
      {children}
    </TermContext.Provider>
  );
};
