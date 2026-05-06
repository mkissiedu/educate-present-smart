import React from 'react';
import {
  Timer, Users, Pencil, Grid3x3, Maximize, Minimize,
  ClipboardCheck, Eye, EyeOff, ChevronLeft, ChevronRight,
  Monitor, GraduationCap, Palette, RotateCcw, RotateCw,
  Eraser, Type, Circle, Square, ArrowRight, PenTool,
  Highlighter, Sparkles, Volume2, VolumeX, Sun, Moon
} from 'lucide-react';

interface SmartBoardToolbarProps {
  currentSlideIndex: number;
  totalSlides: number;
  onPrev: () => void;
  onNext: () => void;
  onToggleNav: () => void;
  onToggleTimer: () => void;
  onTogglePoll: () => void;
  onToggleNamePicker: () => void;
  onToggleAssessment: () => void;
  onToggleAnnotations: () => void;
  onToggleFullscreen: () => void;
  onToggleTeacherNotes: () => void;
  showAnnotations: boolean;
  showTeacherNotes: boolean;
  isFullscreen: boolean;
  viewMode: 'teacher' | 'student' | 'dual';
  onViewModeChange: (mode: 'teacher' | 'student' | 'dual') => void;
  lessonTitle: string;
  week: number;
  lessonNumber: number;
  subject: string;
  classLevel?: string;
  onExit: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const SmartBoardToolbar: React.FC<SmartBoardToolbarProps> = ({
  currentSlideIndex, totalSlides, onPrev, onNext, onToggleNav,
  onToggleTimer, onTogglePoll, onToggleNamePicker, onToggleAssessment,
  onToggleAnnotations, onToggleFullscreen, onToggleTeacherNotes,
  showAnnotations, showTeacherNotes, isFullscreen,
  viewMode, onViewModeChange, lessonTitle, week, lessonNumber,
  subject, classLevel, onExit, isDarkMode, onToggleDarkMode
}) => {
  const progress = ((currentSlideIndex + 1) / totalSlides) * 100;

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} shadow-2xl border-r ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200/20">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm truncate">{lessonTitle}</h3>
            <p className="text-xs opacity-60">{subject} {classLevel && `• ${classLevel}`}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded-lg text-xs font-bold">W{week}</span>
          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-bold">L{lessonNumber}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="px-4 py-3">
        <div className="flex justify-between text-xs font-medium mb-1 opacity-70">
          <span>Progress</span>
          <span>{currentSlideIndex + 1}/{totalSlides}</span>
        </div>
        <div className={`h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Navigation */}
      <div className="px-4 py-2 flex items-center gap-2">
        <button onClick={onPrev} disabled={currentSlideIndex === 0}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold disabled:opacity-30 active:scale-95 transition-all shadow-lg text-lg">
          <ChevronLeft className="w-6 h-6 mx-auto" />
        </button>
        <button onClick={onToggleNav}
          className={`py-3 px-4 rounded-xl font-bold active:scale-95 transition-all text-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'}`}>
          <Grid3x3 className="w-6 h-6" />
        </button>
        <button onClick={onNext} disabled={currentSlideIndex === totalSlides - 1}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold disabled:opacity-30 active:scale-95 transition-all shadow-lg text-lg">
          <ChevronRight className="w-6 h-6 mx-auto" />
        </button>
      </div>

      {/* View Mode Toggle */}
      <div className="px-4 py-2">
        <p className="text-xs font-medium opacity-60 mb-2">Display Mode</p>
        <div className={`flex rounded-xl overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          {[
            { id: 'teacher' as const, label: 'Teacher', icon: GraduationCap },
            { id: 'student' as const, label: 'Board', icon: Monitor },
            { id: 'dual' as const, label: 'Dual', icon: Sparkles },
          ].map(mode => (
            <button key={mode.id} onClick={() => onViewModeChange(mode.id)}
              className={`flex-1 py-2.5 text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                viewMode === mode.id
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
                  : 'hover:bg-gray-200/50'
              }`}>
              <mode.icon className="w-4 h-4" />
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tools */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <p className="text-xs font-medium opacity-60 mb-2">Teaching Tools</p>
        <div className="grid grid-cols-2 gap-2">
          <ToolButton icon={Timer} label="Timer" onClick={onToggleTimer} isDark={isDarkMode} />
          <ToolButton icon={Users} label="Poll" onClick={onTogglePoll} isDark={isDarkMode} />
          <ToolButton icon={Sparkles} label="Pick Name" onClick={onToggleNamePicker} isDark={isDarkMode} />
          <ToolButton icon={ClipboardCheck} label="Assess" onClick={onToggleAssessment} isDark={isDarkMode} />
          <ToolButton icon={Pencil} label="Annotate" onClick={onToggleAnnotations} active={showAnnotations} isDark={isDarkMode} />
          <ToolButton icon={showTeacherNotes ? EyeOff : Eye} label="Notes" onClick={onToggleTeacherNotes} active={showTeacherNotes} isDark={isDarkMode} />
          <ToolButton icon={isFullscreen ? Minimize : Maximize} label={isFullscreen ? 'Exit FS' : 'Fullscreen'} onClick={onToggleFullscreen} isDark={isDarkMode} />
          <ToolButton icon={isDarkMode ? Sun : Moon} label={isDarkMode ? 'Light' : 'Dark'} onClick={onToggleDarkMode} isDark={isDarkMode} />
        </div>
      </div>

      {/* Exit */}
      <div className="p-4 border-t border-gray-200/20">
        <button onClick={onExit}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold active:scale-95 transition-all shadow-lg text-sm">
          Exit Presentation
        </button>
      </div>
    </div>
  );
};

const ToolButton: React.FC<{
  icon: React.FC<any>;
  label: string;
  onClick: () => void;
  active?: boolean;
  isDark?: boolean;
}> = ({ icon: Icon, label, onClick, active, isDark }) => (
  <button onClick={onClick}
    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl font-medium text-xs transition-all active:scale-95 ${
      active
        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
        : isDark
          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}>
    <Icon className="w-5 h-5" />
    {label}
  </button>
);
