import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, Target, Layers, CheckCircle } from 'lucide-react';
import { CurriculumInfo } from '../types/lesson';

interface LessonMetadataHeaderProps {
  curriculumInfo?: CurriculumInfo;
  lessonTitle: string;
}

export const LessonMetadataHeader: React.FC<LessonMetadataHeaderProps> = ({ 
  curriculumInfo, 
  lessonTitle 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!curriculumInfo) return null;

  const hasContent = curriculumInfo.strand || curriculumInfo.subStrand || 
    curriculumInfo.contentStandard || curriculumInfo.indicators?.length;

  if (!hasContent) return null;

  return (
    <div className="absolute top-12 left-0 right-0 z-30">
      <div className={`bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white shadow-lg transition-all duration-300 ${isExpanded ? 'max-h-96' : 'max-h-10'} overflow-hidden`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-2 flex items-center justify-between hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="font-semibold text-sm">Learning Objectives</span>
            {!isExpanded && curriculumInfo.strand && (
              <span className="text-xs opacity-80 ml-2">| {curriculumInfo.strandName || curriculumInfo.strand}</span>
            )}
          </div>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(curriculumInfo.strand || curriculumInfo.strandName) && (
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="w-4 h-4 text-yellow-300" />
                  <span className="text-xs font-bold uppercase tracking-wide text-yellow-300">Strand</span>
                </div>
                <p className="text-sm font-medium">{curriculumInfo.strandName || curriculumInfo.strand}</p>
              </div>
            )}

            {(curriculumInfo.subStrand || curriculumInfo.subStrandName) && (
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="w-4 h-4 text-green-300" />
                  <span className="text-xs font-bold uppercase tracking-wide text-green-300">Sub-Strand</span>
                </div>
                <p className="text-sm font-medium">{curriculumInfo.subStrandName || curriculumInfo.subStrand}</p>
              </div>
            )}

            {(curriculumInfo.contentStandard || curriculumInfo.contentStandardDesc) && (
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-blue-300" />
                  <span className="text-xs font-bold uppercase tracking-wide text-blue-300">Content Standard</span>
                </div>
                <p className="text-sm font-medium">{curriculumInfo.contentStandardDesc || curriculumInfo.contentStandard}</p>
              </div>
            )}

            {curriculumInfo.indicators && curriculumInfo.indicators.length > 0 && (
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-pink-300" />
                  <span className="text-xs font-bold uppercase tracking-wide text-pink-300">Indicators</span>
                </div>
                <ul className="text-sm space-y-1">
                  {curriculumInfo.indicators.slice(0, 3).map((ind, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-pink-300 mt-0.5">•</span>
                      <span>{ind}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
