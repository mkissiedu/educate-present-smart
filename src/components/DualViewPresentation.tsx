import React, { useState } from 'react';
import { Lesson, Slide } from '@/types/lesson';
import { SlideContent } from './SlideContent';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, X, GraduationCap, Users, Maximize2, Minimize2, Monitor, Eye } from 'lucide-react';

interface Props {
  lesson: Lesson;
  onExit: () => void;
}

type ViewMode = 'teacher' | 'student' | 'dual';

export const DualViewPresentation: React.FC<Props> = ({ lesson, onExit }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('teacher');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const slide = lesson.slides[currentSlide];

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  const nextSlide = () => {
    if (currentSlide < lesson.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  // Teacher view shows teacher notes and full content
  const renderTeacherView = () => (
    <div className="h-full flex flex-col bg-white rounded-xl overflow-hidden shadow-xl">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          <span className="font-bold">Teacher View</span>
        </div>
        <span className="text-sm text-white/80">Slide {currentSlide + 1}/{lesson.slides.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-2xl font-bold text-purple-800 mb-4">{slide.title}</h2>
        <SlideContent slide={slide} lesson={lesson} />
        {slide.teacherNotes && (
          <div className="mt-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
            <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
              <Eye className="w-4 h-4" /> Teacher Notes
            </h3>
            <p className="text-amber-900">{slide.teacherNotes}</p>
          </div>
        )}
      </div>
    </div>
  );

  // Student view shows simplified content without teacher notes
  const renderStudentView = () => (
    <div className="h-full flex flex-col bg-white rounded-xl overflow-hidden shadow-xl">
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          <span className="font-bold">Student View</span>
        </div>
        <span className="text-sm text-white/80">Slide {currentSlide + 1}/{lesson.slides.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">{slide.title}</h2>
        <SlideContent slide={slide} lesson={lesson} />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onExit} className="text-white hover:bg-white/20">
            <X className="w-5 h-5" />
          </Button>
          <div className="text-white">
            <h1 className="text-lg font-bold">{lesson.title}</h1>
            <p className="text-xs text-white/70">{lesson.subject} • Week {lesson.week}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-white/10 rounded-full p-1">
            {[
              { id: 'teacher', label: 'Teacher', icon: GraduationCap },
              { id: 'student', label: 'Student', icon: Users },
              { id: 'dual', label: 'Dual', icon: Monitor },
            ].map(mode => (
              <button key={mode.id} onClick={() => setViewMode(mode.id as ViewMode)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 transition-all ${viewMode === mode.id ? 'bg-white text-purple-700' : 'text-white/70 hover:text-white'}`}>
                <mode.icon className="w-3 h-3" /> {mode.label}
              </button>
            ))}
          </div>
          <Button variant="ghost" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 overflow-hidden">
        {viewMode === 'dual' ? (
          <div className="h-full grid grid-cols-2 gap-4">
            {renderTeacherView()}
            {renderStudentView()}
          </div>
        ) : viewMode === 'teacher' ? (
          <div className="h-full max-w-5xl mx-auto">
            {renderTeacherView()}
          </div>
        ) : (
          <div className="h-full max-w-5xl mx-auto">
            {renderStudentView()}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="bg-black/30 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <Button onClick={prevSlide} disabled={currentSlide === 0} variant="outline"
          className="border-white/30 text-white hover:bg-white/20 disabled:opacity-30">
          <ChevronLeft className="w-5 h-5 mr-1" /> Previous
        </Button>
        <div className="flex items-center gap-2">
          {lesson.slides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/60'}`}
            />
          ))}
        </div>
        <Button onClick={nextSlide} disabled={currentSlide === lesson.slides.length - 1} variant="outline"
          className="border-white/30 text-white hover:bg-white/20 disabled:opacity-30">
          Next <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </div>
  );
};
