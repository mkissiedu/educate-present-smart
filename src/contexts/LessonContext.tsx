import React, { createContext, useContext, useState, useEffect } from 'react';
import { Lesson, Slide } from '@/types/lesson';
import { lessons as initialLessons } from '@/data/lessons';
import { toast } from '@/components/ui/use-toast';
import * as db from '@/lib/supabase-db';
import { ImportResult, ImportedLesson, SLIDE_TITLES } from '@/lib/bulk-import-types';

interface LessonContextType {
  lessons: Lesson[];
  isLoading: boolean;
  saveLesson: (lesson: Lesson) => Promise<void>;
  deleteLesson: (id: string) => Promise<void>;
  deleteAllLessons: () => Promise<{ success: boolean; count: number }>;
  getLessonById: (id: string) => Lesson | undefined;
  getLessonsByIndicator: (indicatorId: string) => Lesson[];
  refreshLessons: () => Promise<void>;
  bulkImportLessons: (result: ImportResult) => Promise<number>;
}

const LessonContext = createContext<LessonContextType | undefined>(undefined);

export const useLessonContext = () => {
  const context = useContext(LessonContext);
  if (!context) throw new Error('useLessonContext must be used within LessonProvider');
  return context;
};

export const LessonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [isLoading, setIsLoading] = useState(true);

  const refreshLessons = async () => {
    setIsLoading(true);
    try {
      const dbLessons = await db.fetchLessons();
      setLessons(dbLessons.length > 0 ? dbLessons : initialLessons);
    } catch (err) {
      console.warn('[LessonContext] Failed to fetch lessons from DB, using local data:', err);
      setLessons(initialLessons);
    } finally { setIsLoading(false); }
  };

  useEffect(() => {
    refreshLessons();
    // NOTE: Realtime subscription removed to prevent "n is not iterable" websocket decode error.
    // The Supabase Realtime binary message decoder crashes when the server sends
    // malformed binary frames. Lessons are refreshed on save/delete actions instead.
  }, []);

  const saveLesson = async (lesson: Lesson) => {
    const existing = lessons.find(l => l.id === lesson.id);
    if (existing) {
      const success = await db.updateLesson(lesson.id, lesson);
      if (success) { setLessons(prev => prev.map(l => l.id === lesson.id ? lesson : l)); toast({ title: 'Lesson Updated' }); }
    } else {
      const newLesson = await db.createLesson(lesson);
      if (newLesson) { setLessons(prev => [newLesson, ...prev]); toast({ title: 'Lesson Created' }); }
    }
  };

  const deleteLesson = async (id: string) => {
    const success = await db.deleteLesson(id);
    if (success) { setLessons(prev => prev.filter(l => l.id !== id)); toast({ title: 'Lesson Deleted' }); }
  };

  const deleteAllLessons = async (): Promise<{ success: boolean; count: number }> => {
    const result = await db.deleteAllLessons();
    if (result.success) { setLessons([]); toast({ title: 'All Lessons Deleted', variant: 'destructive' }); }
    return result;
  };

  const getLessonById = (id: string) => lessons.find(l => l.id === id);

  const getLessonsByIndicator = (indicatorId: string): Lesson[] => {
    return lessons.filter(lesson => {
      const kgIds = lesson.curriculumInfo?.kgIndicatorIds || [];
      const slideKgIds = lesson.slides[0]?.curriculumInfo?.kgIndicatorIds || [];
      const indicators = lesson.curriculumInfo?.indicators || [];
      const slideIndicators = lesson.slides[0]?.curriculumInfo?.indicators || [];
      return kgIds.includes(indicatorId) || slideKgIds.includes(indicatorId) || 
             indicators.includes(indicatorId) || slideIndicators.includes(indicatorId);
    });
  };

  const convertImportedToLesson = (imported: ImportedLesson): Lesson => {
    const slides: Slide[] = imported.slides.map((s, idx) => ({
      id: `slide-${Date.now()}-${idx}`, title: s.title || SLIDE_TITLES[idx] || `Slide ${idx + 1}`,
      content: s.content || '', type: s.type || 'text', imageUrl: s.imageUrl, teacherNotes: s.teacherNotes,
    }));
    return {
      id: `lesson-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: imported.title, subject: imported.subject, class: imported.class as any,
      week: imported.week, lessonNumber: imported.lessonNumber, duration: imported.duration,
      thumbnailUrl: imported.thumbnailUrl || '/placeholder.svg', slides, isFavorite: false
    };
  };

  const bulkImportLessons = async (result: ImportResult): Promise<number> => {
    let imported = 0;
    for (const importedLesson of result.lessons) {
      const lesson = convertImportedToLesson(importedLesson);
      const newLesson = await db.createLesson(lesson);
      if (newLesson) { setLessons(prev => [newLesson, ...prev]); imported++; }
    }
    toast({ title: 'Bulk Import Complete', description: `Imported ${imported} lesson(s).` });
    return imported;
  };

  return (
    <LessonContext.Provider value={{ lessons, isLoading, saveLesson, deleteLesson, deleteAllLessons, getLessonById, getLessonsByIndicator, refreshLessons, bulkImportLessons }}>
      {children}
    </LessonContext.Provider>
  );
};
