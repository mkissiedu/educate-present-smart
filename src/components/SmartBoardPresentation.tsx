import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Lesson, Slide } from '@/types/lesson';
import { SlideContent } from './SlideContent';
import { SmartBoardToolbar } from './SmartBoardToolbar';
import { SmartBoardSlidePanel } from './SmartBoardSlidePanel';
import { TimerWidget } from './TimerWidget';
import { PollWidget } from './PollWidget';
import { NamePickerWidget } from './NamePickerWidget';
import { LiveAssessmentWidget } from './LiveAssessmentWidget';
import { CompactSlideTimer } from './CompactSlideTimer';
import { AnnotationTools, ToolType } from './AnnotationTools';
import { DrawAction, drawLine, drawCircle, drawRectangle, drawArrow, drawText } from './AnnotationHelpers';
import {
  ChevronLeft, ChevronRight, Eye, EyeOff, Monitor, GraduationCap,
  Sparkles, BookOpen, Gamepad2, PlayCircle, Lightbulb, PenTool,
  CheckCircle, Wrench, Key, Package, FileText, HelpCircle, Timer,
  Image, Video, LayoutList, PanelLeftClose, PanelLeft, Clock
} from 'lucide-react';

interface SmartBoardPresentationProps {
  lesson: Lesson;
  onExit: () => void;
}

type ViewMode = 'teacher' | 'student' | 'dual';

const phaseLabels: Record<string, { label: string; color: string; icon: React.FC<any> }> = {
  'lesson-info': { label: 'Lesson Overview', color: 'from-blue-500 to-blue-600', icon: BookOpen },
  'key-words': { label: 'Key Words', color: 'from-purple-500 to-purple-600', icon: Key },
  'resources': { label: 'Resources', color: 'from-teal-500 to-teal-600', icon: Package },
  'phase-starter': { label: 'Starter Activity', color: 'from-green-500 to-emerald-600', icon: PlayCircle },
  'phase-development': { label: 'Main Development', color: 'from-blue-500 to-indigo-600', icon: Lightbulb },
  'phase-skill': { label: 'Skill Building', color: 'from-teal-500 to-cyan-600', icon: Wrench },
  'phase-practice': { label: 'Practice', color: 'from-purple-500 to-violet-600', icon: PenTool },
  'phase-wrapup': { label: 'Wrap Up & Review', color: 'from-orange-500 to-amber-600', icon: CheckCircle },
  'quiz': { label: 'Quiz Time', color: 'from-amber-500 to-yellow-600', icon: HelpCircle },
  'game': { label: 'Interactive Game', color: 'from-pink-500 to-rose-600', icon: Gamepad2 },
  'differentiation': { label: 'Differentiation', color: 'from-indigo-500 to-indigo-600', icon: LayoutList },
  'text': { label: 'Content', color: 'from-gray-500 to-gray-600', icon: FileText },
  'image': { label: 'Visual Content', color: 'from-green-500 to-green-600', icon: Image },
  'video': { label: 'Video', color: 'from-red-500 to-red-600', icon: Video },
  'timer': { label: 'Timed Activity', color: 'from-cyan-500 to-cyan-600', icon: Timer },
};

export const SmartBoardPresentation: React.FC<SmartBoardPresentationProps> = ({ lesson, onExit }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('teacher');
  const [showTeacherNotes, setShowTeacherNotes] = useState(true);
  const [showSlideNav, setShowSlideNav] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showPoll, setShowPoll] = useState(false);
  const [showNamePicker, setShowNamePicker] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedTool, setSelectedTool] = useState<ToolType>('pen');
  const [selectedColor, setSelectedColor] = useState('#ff6b6b');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [drawHistory, setDrawHistory] = useState<DrawAction[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [elapsedTime, setElapsedTime] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentSlide = lesson.slides[currentSlideIndex];

  // Timer for elapsed time
  useEffect(() => {
    const interval = setInterval(() => setElapsedTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawHistory.slice(0, historyIndex + 1).forEach(action => {
      if (action.tool === 'pen' && action.points) drawLine(ctx, action.points, action.color);
      else if (action.tool === 'circle' && action.startX !== undefined) drawCircle(ctx, action.startX, action.startY!, action.endX!, action.endY!, action.color);
      else if (action.tool === 'rectangle' && action.startX !== undefined) drawRectangle(ctx, action.startX, action.startY!, action.endX!, action.endY!, action.color);
      else if (action.tool === 'arrow' && action.startX !== undefined) drawArrow(ctx, action.startX, action.startY!, action.endX!, action.endY!, action.color);
      else if (action.tool === 'text' && action.startX !== undefined) drawText(ctx, action.startX, action.startY!, action.text!, action.color, action.fontSize);
    });
  }, [drawHistory, historyIndex]);

  // Fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); nextSlide(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prevSlide(); }
      else if (e.key === 'Escape') { if (showSlideNav) setShowSlideNav(false); else if (isFullscreen) document.exitFullscreen(); }
      else if (e.key === 'f' || e.key === 'F') toggleFullscreen();
      else if (e.key === 'g') setShowSlideNav(true);
      else if (e.key === 's' || e.key === 'S') setShowSidebar(prev => !prev);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, showSlideNav, isFullscreen]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) await containerRef.current?.requestFullscreen();
      else await document.exitFullscreen();
    } catch (err) { /* ignore */ }
  };

  const nextSlide = () => {
    if (currentSlideIndex < lesson.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
      setDrawHistory([]);
      setHistoryIndex(-1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
      setDrawHistory([]);
      setHistoryIndex(-1);
    }
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left) * (canvas.width / rect.width), y: (e.clientY - rect.top) * (canvas.height / rect.height) };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    setIsDrawing(true);
    setStartPos(pos);
    if (selectedTool === 'pen') setCurrentPoints([pos]);
    else if (selectedTool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        const newHistory = [...drawHistory.slice(0, historyIndex + 1), { tool: 'text' as const, color: selectedColor, startX: pos.x, startY: pos.y, text, fontSize: 28 }];
        setDrawHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
      setIsDrawing(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;
    const pos = getMousePos(e);
    if (selectedTool === 'pen') setCurrentPoints(prev => [...prev, pos]);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;
    const pos = getMousePos(e);
    let action: DrawAction | null = null;
    if (selectedTool === 'pen' && currentPoints.length > 0) action = { tool: 'pen', color: selectedColor, points: [...currentPoints, pos] };
    else if (selectedTool === 'circle') action = { tool: 'circle', color: selectedColor, startX: startPos.x, startY: startPos.y, endX: pos.x, endY: pos.y };
    else if (selectedTool === 'rectangle') action = { tool: 'rectangle', color: selectedColor, startX: startPos.x, startY: startPos.y, endX: pos.x, endY: pos.y };
    else if (selectedTool === 'arrow') action = { tool: 'arrow', color: selectedColor, startX: startPos.x, startY: startPos.y, endX: pos.x, endY: pos.y };
    if (action) {
      const newHistory = [...drawHistory.slice(0, historyIndex + 1), action];
      setDrawHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
    setIsDrawing(false);
    setCurrentPoints([]);
    setStartPos(null);
  };

  const phaseConfig = phaseLabels[currentSlide.type] || phaseLabels['text'];
  const PhaseIcon = phaseConfig.icon;

  const renderMainSlide = (showNotes: boolean) => {
    return (
      <div className={`h-full flex flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-gray-50 to-white'}`}>
        {/* Slide Phase Header */}
        <div className={`bg-gradient-to-r ${phaseConfig.color} px-6 py-3 flex items-center justify-between shadow-lg`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <PhaseIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white font-black text-xl">{currentSlide.title}</h2>
              <p className="text-white/70 text-sm font-medium">{phaseConfig.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {currentSlide.timerData && currentSlide.timerData.duration > 0 && (
              <CompactSlideTimer key={currentSlideIndex} duration={currentSlide.timerData.duration} autoStart={currentSlide.timerData.autoStart} onComplete={nextSlide} />
            )}
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5">
              <span className="text-white font-bold text-sm">{currentSlideIndex + 1}</span>
              <span className="text-white/60 text-sm">/</span>
              <span className="text-white/80 font-medium text-sm">{lesson.slides.length}</span>
            </div>
            <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1.5">
              <Clock className="w-4 h-4 text-white/80" />
              <span className="text-white font-medium text-sm">{formatTime(elapsedTime)}</span>
            </div>
          </div>
        </div>

        {/* Slide Content */}
        <div className="flex-1 overflow-y-auto relative">
          <div className={`p-6 lg:p-8 ${viewMode === 'student' ? 'text-lg' : ''}`}>
            {currentSlide.type === 'lesson-info' ? (
              <SlideContent slide={currentSlide} lesson={lesson} />
            ) : (
              <div className={`${isDarkMode ? 'bg-gray-700/50' : 'bg-white'} rounded-2xl shadow-lg p-6 lg:p-8 border-2 ${isDarkMode ? 'border-gray-600' : 'border-purple-100'} min-h-[60vh]`}>
                <SlideContent slide={currentSlide} lesson={lesson} />
              </div>
            )}
          </div>

          {/* Annotation Canvas */}
          {showAnnotations && (
            <canvas ref={canvasRef}
              className="absolute inset-0 pointer-events-auto cursor-crosshair z-10"
              width={1920} height={1080}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            />
          )}
        </div>

        {/* Teacher Notes Panel */}
        {showNotes && showTeacherNotes && currentSlide.teacherNotes && (
          <div className={`border-t-2 ${isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-amber-200 bg-amber-50'} px-6 py-4`}>
            <div className="flex items-center gap-2 mb-2">
              <Eye className={`w-5 h-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
              <span className={`font-bold text-sm ${isDarkMode ? 'text-amber-400' : 'text-amber-800'}`}>Teacher Notes</span>
              <span className="text-xs opacity-50">(only visible on teacher screen)</span>
            </div>
            <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-amber-200' : 'text-amber-900'}`}>{currentSlide.teacherNotes}</p>
          </div>
        )}

        {/* Bottom Slide Strip */}
        <div className={`border-t ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'} px-4 py-2`}>
          <div className="flex items-center gap-2 overflow-x-auto">
            {lesson.slides.map((slide, i) => {
              const cfg = phaseLabels[slide.type] || phaseLabels['text'];
              const SlideIcon = cfg.icon;
              return (
                <button key={slide.id} onClick={() => { setCurrentSlideIndex(i); setDrawHistory([]); setHistoryIndex(-1); }}
                  className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    i === currentSlideIndex
                      ? `bg-gradient-to-r ${cfg.color} text-white shadow-lg scale-105`
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
                  }`}>
                  <SlideIcon className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline truncate max-w-[100px]">{slide.title}</span>
                  <span className="lg:hidden">{i + 1}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className={`fixed inset-0 z-50 flex ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Sidebar Toggle (when hidden) */}
      {!showSidebar && (
        <button onClick={() => setShowSidebar(true)}
          className="absolute top-4 left-4 z-50 p-3 rounded-xl bg-purple-600 text-white shadow-xl hover:bg-purple-700 transition-all">
          <PanelLeft className="w-5 h-5" />
        </button>
      )}

      {/* Teacher Controls Sidebar */}
      {showSidebar && (
        <div className="w-56 xl:w-64 flex-shrink-0 relative">
          <SmartBoardToolbar
            currentSlideIndex={currentSlideIndex}
            totalSlides={lesson.slides.length}
            onPrev={prevSlide}
            onNext={nextSlide}
            onToggleNav={() => setShowSlideNav(true)}
            onToggleTimer={() => setShowTimer(!showTimer)}
            onTogglePoll={() => setShowPoll(!showPoll)}
            onToggleNamePicker={() => setShowNamePicker(!showNamePicker)}
            onToggleAssessment={() => setShowAssessment(!showAssessment)}
            onToggleAnnotations={() => setShowAnnotations(!showAnnotations)}
            onToggleFullscreen={toggleFullscreen}
            onToggleTeacherNotes={() => setShowTeacherNotes(!showTeacherNotes)}
            showAnnotations={showAnnotations}
            showTeacherNotes={showTeacherNotes}
            isFullscreen={isFullscreen}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            lessonTitle={lesson.title}
            week={lesson.week}
            lessonNumber={lesson.lessonNumber}
            subject={lesson.subject}
            classLevel={lesson.class}
            onExit={onExit}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          />
          <button onClick={() => setShowSidebar(false)}
            className="absolute top-4 right-[-16px] z-50 p-1.5 rounded-full bg-purple-600 text-white shadow-lg hover:bg-purple-700">
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {viewMode === 'dual' ? (
          <div className="flex-1 grid grid-cols-2 gap-1 p-1">
            {/* Teacher View */}
            <div className="rounded-xl overflow-hidden shadow-xl">
              <div className="h-full flex flex-col">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-white" />
                  <span className="text-white font-bold text-sm">Teacher View</span>
                </div>
                <div className="flex-1 overflow-hidden">
                  {renderMainSlide(true)}
                </div>
              </div>
            </div>
            {/* Student View */}
            <div className="rounded-xl overflow-hidden shadow-xl">
              <div className="h-full flex flex-col">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-white" />
                  <span className="text-white font-bold text-sm">Smart Board View</span>
                </div>
                <div className="flex-1 overflow-hidden">
                  {renderMainSlide(false)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            {renderMainSlide(viewMode === 'teacher')}
          </div>
        )}
      </div>

      {/* Slide Navigator Modal */}
      {showSlideNav && (
        <SmartBoardSlidePanel
          slides={lesson.slides}
          currentIndex={currentSlideIndex}
          onSelect={(i) => { setCurrentSlideIndex(i); setDrawHistory([]); setHistoryIndex(-1); }}
          onClose={() => setShowSlideNav(false)}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Annotation Tools */}
      {showAnnotations && (
        <AnnotationTools
          selectedTool={selectedTool}
          selectedColor={selectedColor}
          onToolChange={setSelectedTool}
          onColorChange={setSelectedColor}
          onPresetSelect={(p) => { setSelectedTool(p.tool); setSelectedColor(p.color); }}
          onClear={() => { setDrawHistory([]); setHistoryIndex(-1); }}
          onUndo={() => historyIndex > -1 && setHistoryIndex(historyIndex - 1)}
          onRedo={() => historyIndex < drawHistory.length - 1 && setHistoryIndex(historyIndex + 1)}
          onSaveImage={() => {}}
          onSavePDF={() => {}}
          canUndo={historyIndex > -1}
          canRedo={historyIndex < drawHistory.length - 1}
        />
      )}

      {/* Widgets */}
      {showTimer && <TimerWidget onClose={() => setShowTimer(false)} />}
      {showPoll && <PollWidget onClose={() => setShowPoll(false)} lessonId={lesson.id} />}
      {showNamePicker && <NamePickerWidget onClose={() => setShowNamePicker(false)} />}
      {showAssessment && <LiveAssessmentWidget classLevel={lesson.class || 'KG 1'} lessonId={lesson.id} onClose={() => setShowAssessment(false)} />}

      {/* Touch Navigation Zones (for smart boards) */}
      {!showAnnotations && (
        <>
          <div className="absolute left-0 top-1/3 bottom-1/3 w-16 cursor-pointer opacity-0 hover:opacity-100 transition-opacity z-30 flex items-center justify-center"
            onClick={prevSlide}>
            <div className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
              <ChevronLeft className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="absolute right-0 top-1/3 bottom-1/3 w-16 cursor-pointer opacity-0 hover:opacity-100 transition-opacity z-30 flex items-center justify-center"
            onClick={nextSlide}>
            <div className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
              <ChevronRight className="w-8 h-8 text-white" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
