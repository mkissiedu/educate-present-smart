import React, { useState } from 'react';
import { Lesson } from '../types/lesson';
import { SlideContent } from './SlideContent';
import { X, ChevronLeft, ChevronRight, Grid3x3, Gamepad2, GraduationCap, LayoutList } from 'lucide-react';

interface Props {
  lesson: Lesson;
  onExit: () => void;
}

export const MobilePresentationMode: React.FC<Props> = ({ lesson, onExit }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showNav, setShowNav] = useState(false);

  const currentSlide = lesson.slides[currentSlideIndex];
  const nextSlide = () => currentSlideIndex < lesson.slides.length - 1 && setCurrentSlideIndex(currentSlideIndex + 1);
  const prevSlide = () => currentSlideIndex > 0 && setCurrentSlideIndex(currentSlideIndex - 1);

  const handleSwipe = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    const startX = (e.target as any).dataset.startX;
    const diff = touch.clientX - parseFloat(startX);
    if (Math.abs(diff) > 50) { diff > 0 ? prevSlide() : nextSlide(); }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-100 via-indigo-50 to-blue-100 z-50 flex flex-col">
      {/* Compact Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg p-2 flex items-center gap-2">
        <button onClick={onExit} className="p-2 bg-red-500 text-white rounded-full shadow-md active:scale-95">
          <X className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-purple-700 text-sm truncate">{lesson.title}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {lesson.class && <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" />{lesson.class}</span>}
          </div>
        </div>
        {/* Week and Lesson Number Badge */}
        <div className="flex items-center gap-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
          <span>W{lesson.week}</span>
          <span className="mx-0.5">|</span>
          <span>L{lesson.lessonNumber}</span>
        </div>
        <button onClick={() => setShowNav(!showNav)} className="p-2 bg-purple-200 text-purple-700 rounded-full shadow-md active:scale-95">
          <Grid3x3 className="w-5 h-5" />
        </button>
      </div>


      {/* Progress Bar */}
      <div className="h-1.5 bg-purple-200">
        <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${((currentSlideIndex + 1) / lesson.slides.length) * 100}%` }} />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-3" onTouchStart={(e) => { (e.target as any).dataset.startX = e.touches[0].clientX; }} onTouchEnd={handleSwipe}>
        {currentSlide.type === 'lesson-info' ? (
          <SlideContent slide={currentSlide} lesson={lesson} />
        ) : (
          <>
            {/* Slide Title */}
            <div className="bg-white rounded-xl p-4 mb-3 shadow-md border-2 border-purple-200">
              <h2 className="text-xl font-black text-purple-800 flex items-center gap-2">
                {currentSlide.type === 'game' && <Gamepad2 className="w-6 h-6 text-pink-500" />}
                <span className="text-purple-500 text-lg">{currentSlideIndex + 1}.</span>
                {currentSlide.title}
              </h2>
            </div>

            {/* Slide Content */}
            <div className="bg-white rounded-xl p-4 shadow-md border-2 border-purple-200 min-h-[50vh]">
              <div className="text-base">
                <SlideContent slide={currentSlide} lesson={lesson} />
              </div>
            </div>
          </>
        )}
      </div>


      {/* Bottom Navigation */}
      <div className="bg-white/95 backdrop-blur-sm p-3 flex items-center justify-between shadow-lg safe-area-pb">
        <button onClick={prevSlide} disabled={currentSlideIndex === 0} 
          className="p-5 bg-purple-500 text-white rounded-2xl shadow-lg disabled:opacity-30 active:scale-95 transition-transform">
          <ChevronLeft className="w-10 h-10" />
        </button>
        <div className="flex gap-1 max-w-[200px] overflow-x-auto py-1">
          {lesson.slides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlideIndex(i)} 
              className={`min-w-[14px] h-3.5 rounded-full transition-all ${i === currentSlideIndex ? 'bg-purple-600 w-10' : 'bg-purple-200 w-3.5'}`} />
          ))}
        </div>
        <button onClick={nextSlide} disabled={currentSlideIndex === lesson.slides.length - 1} 
          className="p-5 bg-purple-500 text-white rounded-2xl shadow-lg disabled:opacity-30 active:scale-95 transition-transform">
          <ChevronRight className="w-10 h-10" />
        </button>
      </div>

      {/* Slide Navigator Modal */}
      {showNav && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-end" onClick={() => setShowNav(false)}>
          <div className="bg-white rounded-t-3xl p-4 w-full max-h-[75vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            <h3 className="font-bold text-purple-700 mb-3 text-center text-lg flex items-center justify-center gap-2">
              <LayoutList className="w-5 h-5" /> Jump to Slide
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {lesson.slides.map((slide, i) => (
                <button key={i} onClick={() => { setCurrentSlideIndex(i); setShowNav(false); }} 
                  className={`p-3 rounded-xl text-xs font-bold transition-all text-left ${i === currentSlideIndex ? 'bg-purple-500 text-white scale-105 shadow-lg' : 'bg-purple-100 text-purple-700'}`}>
                  <span className="text-purple-300 mr-1">{i + 1}.</span>
                  <span className="truncate">{slide.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
