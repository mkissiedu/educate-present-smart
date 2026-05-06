import React, { useState, useEffect, useCallback } from 'react';
import { Lesson, Slide } from '@/types/lesson';
import { PlanningSession, PlanningChecklist, DEFAULT_CHECKLIST, MIN_PLANNING_TIME_SECONDS } from '@/types/planning';
import { PlanningTimer } from './PlanningTimer';
import { PlanningChecklistComponent } from './PlanningChecklist';
import { SlideContent } from './SlideContent';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ChevronLeft, ChevronRight, BookOpen, FileText, Key, X, Save, Eye, GraduationCap, Users, Maximize2, Minimize2 } from 'lucide-react';
import * as planningDb from '@/lib/supabase-planning';
import { toast } from './ui/use-toast';

interface Props {
  lesson: Lesson;
  teacherId: string;
  existingSession?: PlanningSession;
  onComplete: () => void;
  onExit: () => void;
}

export const LessonPlanningMode: React.FC<Props> = ({ lesson, teacherId, existingSession, onComplete, onExit }) => {
  const [session, setSession] = useState<PlanningSession | null>(existingSession || null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [checklist, setChecklist] = useState<PlanningChecklist>(existingSession?.checklist || DEFAULT_CHECKLIST);
  const [notes, setNotes] = useState(existingSession?.notes || '');
  const [elapsedTime, setElapsedTime] = useState(existingSession?.planningDurationSeconds || 0);
  const [activeTab, setActiveTab] = useState<'slides' | 'textbook' | 'workbook' | 'answerkey'>('slides');
  const [viewMode, setViewMode] = useState<'teacher' | 'student' | 'dual'>('teacher');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [startTime] = useState(() => existingSession ? new Date(Date.now() - (existingSession.planningDurationSeconds * 1000)) : new Date());

  useEffect(() => {
    const initSession = async () => {
      if (!session) {
        const newSession = await planningDb.startPlanningSession(lesson.id, teacherId);
        if (newSession) setSession(newSession);
      }
    };
    initSession();
  }, [lesson.id, teacherId, session]);

  const handleTimeUpdate = useCallback((seconds: number) => setElapsedTime(seconds), []);

  const saveProgress = async () => {
    if (!session) return;
    await planningDb.updatePlanningProgress(session.id, elapsedTime, checklist, notes);
    toast({ title: 'Progress Saved', description: 'Your planning progress has been saved.' });
  };

  const handleComplete = async () => {
    if (!session || elapsedTime < MIN_PLANNING_TIME_SECONDS) {
      toast({ title: 'Cannot Complete', description: `Please complete at least ${MIN_PLANNING_TIME_SECONDS / 60} minutes of planning.`, variant: 'destructive' });
      return;
    }
    const success = await planningDb.completePlanningSession(session.id, elapsedTime);
    if (success) {
      toast({ title: 'Planning Complete!', description: 'You can now teach this lesson.' });
      onComplete();
    }
  };

  const canComplete = elapsedTime >= MIN_PLANNING_TIME_SECONDS;
  const slide = lesson.slides[currentSlide];

  // Get PDF URLs from lesson resources
  const textbookUrl = lesson.slides.find(s => s.resourcesData?.textbookPdfUrl)?.resourcesData?.textbookPdfUrl;
  const workbookUrl = lesson.slides.find(s => s.phaseData?.worksheetPdfUrl)?.phaseData?.worksheetPdfUrl;
  const answerKeyUrl = lesson.slides.find(s => s.phaseData?.answerKeyPdfUrl)?.phaseData?.answerKeyPdfUrl;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm px-4 py-3 flex items-center justify-between border-b border-white/20">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onExit} className="text-white hover:bg-white/20">
            <X className="w-5 h-5" />
          </Button>
          <div className="text-white">
            <h1 className="text-lg font-bold">{lesson.title}</h1>
            <p className="text-xs text-white/70">{lesson.subject} • Week {lesson.week} • Lesson {lesson.lessonNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-white/10 rounded-full p-1">
            {[
              { id: 'teacher', label: 'Teacher', icon: GraduationCap },
              { id: 'student', label: 'Student', icon: Users },
              { id: 'dual', label: 'Dual', icon: Maximize2 },
            ].map(mode => (
              <button key={mode.id} onClick={() => setViewMode(mode.id as any)}
                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all ${viewMode === mode.id ? 'bg-white text-gray-800' : 'text-white/70 hover:text-white'}`}>
                <mode.icon className="w-3 h-3" /> {mode.label}
              </button>
            ))}
          </div>
          <Button onClick={saveProgress} variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/20">
            <Save className="w-4 h-4 mr-1" /> Save Progress
          </Button>
          <Button onClick={handleComplete} disabled={!canComplete} size="sm"
            className={canComplete ? 'bg-green-600 hover:bg-green-700 text-white font-bold' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}>
            <GraduationCap className="w-4 h-4 mr-1" /> {canComplete ? 'Ready to Teach' : `${Math.ceil((MIN_PLANNING_TIME_SECONDS - elapsedTime) / 60)}m left`}
          </Button>
        </div>
      </div>


      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-12' : 'w-72'} bg-white/5 backdrop-blur-sm flex flex-col transition-all duration-300`}>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 text-white/70 hover:text-white self-end">
            {sidebarCollapsed ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          {!sidebarCollapsed && (
            <div className="p-3 space-y-3 overflow-y-auto flex-1">
              <PlanningTimer startTime={startTime} onTimeUpdate={handleTimeUpdate} isComplete={canComplete} />
              <PlanningChecklistComponent checklist={checklist} onChange={setChecklist} />
              <div className="bg-white rounded-xl p-3">
                <h3 className="font-bold text-gray-800 mb-2 text-sm">Planning Notes</h3>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes..."
                  className="min-h-[80px] resize-none text-sm" />
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col p-4">
          {/* Tabs */}
          <div className="flex gap-2 mb-3">
            {[
              { id: 'slides', label: 'Slides', icon: Eye },
              { id: 'textbook', label: 'Textbook', icon: BookOpen, url: textbookUrl },
              { id: 'workbook', label: 'Workbook', icon: FileText, url: workbookUrl },
              { id: 'answerkey', label: 'Answer Key', icon: Key, url: answerKeyUrl },
            ].map(tab => (
              <Button key={tab.id} variant={activeTab === tab.id ? 'default' : 'outline'} size="sm"
                onClick={() => setActiveTab(tab.id as any)}
                className={activeTab === tab.id ? 'bg-purple-600' : 'bg-white/10 text-white border-white/30'}>
                <tab.icon className="w-4 h-4 mr-1" /> {tab.label}
              </Button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white rounded-2xl overflow-hidden flex">
            {activeTab === 'slides' && slide && (
              <div className="flex-1 flex flex-col">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 flex justify-between items-center">
                  <span className="font-bold text-sm">{slide.title}</span>
                  <span className="text-xs">Slide {currentSlide + 1} / {lesson.slides.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <SlideContent slide={slide} lesson={lesson} />
                </div>
                <div className="p-3 border-t flex justify-between">
                  <Button size="sm" onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))} disabled={currentSlide === 0}>
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </Button>
                  <Button size="sm" onClick={() => setCurrentSlide(Math.min(lesson.slides.length - 1, currentSlide + 1))}
                    disabled={currentSlide === lesson.slides.length - 1}>
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
            {activeTab !== 'slides' && (
              <div className="flex-1 flex items-center justify-center text-gray-500 p-8">
                <div className="text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">PDF Viewer</p>
                  <p className="text-sm">Upload {activeTab} PDF in lesson editor</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
