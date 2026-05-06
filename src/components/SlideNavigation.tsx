import React from 'react';
import { Slide } from '../types/lesson';
import { LayoutList, X } from 'lucide-react';

interface SlideNavigationProps {
  slides: Slide[];
  currentSlideIndex: number;
  onSlideChange: (index: number) => void;
  onClose: () => void;
}

export const SlideNavigation: React.FC<SlideNavigationProps> = ({
  slides,
  currentSlideIndex,
  onSlideChange,
  onClose
}) => {
  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-30 overflow-y-auto border-l-4 border-purple-400">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-purple-800 flex items-center gap-2">
            <LayoutList className="w-5 h-5" />
            Slide Navigator
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-3">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              onClick={() => onSlideChange(index)}
              className={`cursor-pointer rounded-xl p-4 transition-all border-2 ${
                currentSlideIndex === index
                  ? 'bg-purple-500 text-white border-purple-600 shadow-lg'
                  : 'bg-purple-50 hover:bg-purple-100 border-purple-200 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${currentSlideIndex === index ? 'text-purple-200' : 'text-purple-500'}`}>
                  {index + 1}.
                </span>
                <span className={`font-semibold ${currentSlideIndex === index ? 'text-white' : 'text-purple-800'}`}>
                  {slide.title}
                </span>
              </div>
              {slide.keyWordsData?.keywords?.length > 0 && (
                <div className={`text-xs mt-1 ${currentSlideIndex === index ? 'text-purple-100' : 'text-gray-500'}`}>
                  {slide.keyWordsData.keywords.length} key word(s)
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
