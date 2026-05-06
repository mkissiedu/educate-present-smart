import React from 'react';
import { Badge } from './ui/badge';
import { ChevronRight, Target, BookOpen, FileText, Lightbulb, X } from 'lucide-react';
import { CurriculumPath } from '@/lib/curriculum-utils';

interface CurriculumPathDisplayProps {
  path: CurriculumPath;
  onRemove?: () => void;
  compact?: boolean;
}

export const CurriculumPathDisplay: React.FC<CurriculumPathDisplayProps> = ({ path, onRemove, compact }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
        <Badge variant="outline" className="bg-emerald-100 text-emerald-700 text-xs">{path.indicator.code}</Badge>
        <span className="text-xs text-gray-600 flex-1 truncate">{path.indicator.description}</span>
        {onRemove && (
          <button onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
      <div className="flex items-center justify-between mb-3">
        <Badge className="bg-emerald-600">{path.level} - {path.subject}</Badge>
        {onRemove && (
          <button onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Target className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-medium text-emerald-800">{path.strand.name}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm ml-4">
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <BookOpen className="w-4 h-4 text-teal-600 flex-shrink-0" />
          <span className="text-teal-700">{path.subStrand.name}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm ml-8">
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <FileText className="w-4 h-4 text-cyan-600 flex-shrink-0" />
          <span className="text-cyan-700">{path.contentStandard.description}</span>
          <Badge variant="outline" className="text-xs">{path.contentStandard.code}</Badge>
        </div>
        
        <div className="flex items-start gap-2 text-sm ml-12 bg-white p-2 rounded-lg">
          <ChevronRight className="w-3 h-3 text-gray-400 mt-1" />
          <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-blue-600 text-xs">{path.indicator.code}</Badge>
            </div>
            <p className="text-blue-800">{path.indicator.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
