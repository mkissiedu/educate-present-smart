import React from 'react';
import { Slide } from '@/types/lesson';
import { X, BookOpen, Gamepad2, HelpCircle, Timer, Image, Video, FileText, PlayCircle, Lightbulb, PenTool, CheckCircle, Wrench, Key, Package, LayoutList } from 'lucide-react';

interface Props {
  slides: Slide[];
  currentIndex: number;
  onSelect: (index: number) => void;
  onClose: () => void;
  isDarkMode: boolean;
}

const slideTypeConfig: Record<string, { icon: React.FC<any>; color: string; label: string }> = {
  'lesson-info': { icon: BookOpen, color: 'from-blue-500 to-blue-600', label: 'Info' },
  'text': { icon: FileText, color: 'from-gray-500 to-gray-600', label: 'Text' },
  'image': { icon: Image, color: 'from-green-500 to-green-600', label: 'Image' },
  'video': { icon: Video, color: 'from-red-500 to-red-600', label: 'Video' },
  'quiz': { icon: HelpCircle, color: 'from-amber-500 to-amber-600', label: 'Quiz' },
  'timer': { icon: Timer, color: 'from-cyan-500 to-cyan-600', label: 'Timer' },
  'game': { icon: Gamepad2, color: 'from-pink-500 to-pink-600', label: 'Game' },
  'key-words': { icon: Key, color: 'from-purple-500 to-purple-600', label: 'Keywords' },
  'resources': { icon: Package, color: 'from-teal-500 to-teal-600', label: 'Resources' },
  'differentiation': { icon: LayoutList, color: 'from-indigo-500 to-indigo-600', label: 'Diff.' },
  'phase-starter': { icon: PlayCircle, color: 'from-green-500 to-emerald-600', label: 'Starter' },
  'phase-development': { icon: Lightbulb, color: 'from-blue-500 to-blue-600', label: 'Develop' },
  'phase-skill': { icon: Wrench, color: 'from-teal-500 to-teal-600', label: 'Skill' },
  'phase-practice': { icon: PenTool, color: 'from-purple-500 to-purple-600', label: 'Practice' },
  'phase-wrapup': { icon: CheckCircle, color: 'from-orange-500 to-orange-600', label: 'Wrap Up' },
};

export const SmartBoardSlidePanel: React.FC<Props> = ({ slides, currentIndex, onSelect, onClose, isDarkMode }) => {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isDarkMode ? 'bg-black/80' : 'bg-black/60'}`} onClick={onClose}>
      <div className={`w-[90vw] max-w-5xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={`flex items-center justify-between p-5 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-2xl font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <LayoutList className="w-7 h-7 text-purple-500" />
            Slide Navigator
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Slides Grid */}
        <div className="p-5 overflow-y-auto max-h-[calc(85vh-80px)]">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {slides.map((slide, i) => {
              const config = slideTypeConfig[slide.type] || slideTypeConfig['text'];
              const Icon = config.icon;
              const isActive = i === currentIndex;

              return (
                <button key={slide.id} onClick={() => { onSelect(i); onClose(); }}
                  className={`relative group rounded-2xl overflow-hidden transition-all duration-300 text-left ${
                    isActive
                      ? 'ring-4 ring-purple-500 shadow-xl scale-105'
                      : isDarkMode
                        ? 'hover:ring-2 hover:ring-purple-400/50 hover:shadow-lg'
                        : 'hover:ring-2 hover:ring-purple-300 hover:shadow-lg'
                  }`}>
                  {/* Slide Preview */}
                  <div className={`aspect-[16/10] bg-gradient-to-br ${config.color} p-4 flex flex-col justify-between`}>
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                        {i + 1}
                      </span>
                      <span className="px-2 py-1 rounded-lg bg-white/20 text-white text-xs font-bold">
                        {config.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-white/80" />
                      <p className="text-white font-bold text-sm truncate">{slide.title}</p>
                    </div>
                  </div>

                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute inset-0 bg-purple-500/10 flex items-center justify-center">
                      <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-bold shadow-lg">
                        Current
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
