import { useState, useEffect, useCallback } from 'react';
import { PlanningSession } from '@/types/planning';
import { getTeacherPlanningStatus, getPlanningSession } from '@/lib/supabase-planning';

export const usePlanningStatus = (teacherId: string | undefined) => {
  const [planningStatus, setPlanningStatus] = useState<Map<string, PlanningSession>>(new Map());
  const [loading, setLoading] = useState(true);

  const loadPlanningStatus = useCallback(async () => {
    if (!teacherId) {
      setLoading(false);
      return;
    }
    
    try {
      const status = await getTeacherPlanningStatus(teacherId);
      setPlanningStatus(status);
    } catch (error) {
      console.error('Error loading planning status:', error);
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    loadPlanningStatus();
  }, [loadPlanningStatus]);

  const getPlanningSessionForLesson = useCallback((lessonId: string): PlanningSession | undefined => {
    return planningStatus.get(lessonId);
  }, [planningStatus]);

  const isLessonPlanned = useCallback((lessonId: string): boolean => {
    const session = planningStatus.get(lessonId);
    return session?.status === 'completed';
  }, [planningStatus]);

  const isLessonPlanning = useCallback((lessonId: string): boolean => {
    const session = planningStatus.get(lessonId);
    return session?.status === 'planning';
  }, [planningStatus]);

  const refreshPlanningStatus = useCallback(async () => {
    await loadPlanningStatus();
  }, [loadPlanningStatus]);

  const refreshSingleLesson = useCallback(async (lessonId: string) => {
    if (!teacherId) return;
    
    try {
      const session = await getPlanningSession(lessonId, teacherId);
      if (session) {
        setPlanningStatus(prev => {
          const newMap = new Map(prev);
          newMap.set(lessonId, session);
          return newMap;
        });
      }
    } catch (error) {
      console.error('Error refreshing lesson planning status:', error);
    }
  }, [teacherId]);

  return {
    planningStatus,
    loading,
    getPlanningSessionForLesson,
    isLessonPlanned,
    isLessonPlanning,
    refreshPlanningStatus,
    refreshSingleLesson,
  };
};
