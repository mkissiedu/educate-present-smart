import React, { useState } from 'react';
import { ImportedLesson, ValidationError } from '@/lib/bulk-import-types';
import { AlertCircle, CheckCircle, BookOpen, Calendar, Clock, ChevronDown, ChevronUp, FileText } from 'lucide-react';

interface Props {
  lessons: ImportedLesson[];
  errors: ValidationError[];
  warnings: string[];
}

export const BulkImportPreview: React.FC<Props> = ({ lessons, errors, warnings }) => {
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null);

  if (errors.length > 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span className="font-bold">Validation Errors ({errors.length})</span>
        </div>
        <div className="max-h-60 overflow-y-auto space-y-2">
          {errors.map((err, idx) => (
            <div key={idx} className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-sm">
              <span className="text-red-300">{err.field}:</span>
              <span className="text-white ml-2">{err.message}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-green-400">
        <CheckCircle className="w-5 h-5" />
        <span className="font-bold">{lessons.length} lesson(s) ready to import</span>
      </div>
      
      {warnings.length > 0 && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
          <p className="text-yellow-300 text-sm font-medium">Notes:</p>
          {warnings.map((w, i) => <p key={i} className="text-yellow-200 text-sm">{w}</p>)}
        </div>
      )}

      <div className="max-h-80 overflow-y-auto space-y-3">
        {lessons.map((lesson, idx) => (
          <div key={idx} className="bg-white/10 rounded-xl border border-white/20 overflow-hidden">
            <div className="p-4 cursor-pointer hover:bg-white/5" onClick={() => setExpandedLesson(expandedLesson === idx ? null : idx)}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white truncate">{lesson.title}</h4>
                  <p className="text-sm text-white/70">{lesson.subject} • {lesson.class}</p>
                  <div className="flex gap-4 mt-2 text-xs text-white/60">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> W{lesson.week} L{lesson.lessonNumber}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {lesson.duration}</span>
                    <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {lesson.slides.filter(s => s.content).length}/{lesson.slides.length} slides</span>
                  </div>
                </div>
                {expandedLesson === idx ? <ChevronUp className="w-5 h-5 text-white/50" /> : <ChevronDown className="w-5 h-5 text-white/50" />}
              </div>
            </div>
            
            {expandedLesson === idx && (
              <div className="border-t border-white/10 p-3 bg-black/20 max-h-48 overflow-y-auto">
                <p className="text-xs text-white/50 mb-2">Slide Content Preview:</p>
                {lesson.slides.slice(0, 6).map((slide, sIdx) => (
                  <div key={sIdx} className="text-xs mb-2">
                    <span className="text-blue-300 font-medium">{slide.title}:</span>
                    <span className="text-white/70 ml-1">{slide.content?.substring(0, 80) || '(empty)'}{slide.content?.length > 80 ? '...' : ''}</span>
                  </div>
                ))}
                {lesson.slides.length > 6 && <p className="text-xs text-white/40">...and {lesson.slides.length - 6} more slides</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
