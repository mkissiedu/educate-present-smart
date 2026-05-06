import React from 'react';
import { Lesson } from '@/types/lesson';
import { openPrintWindow, getSlideTitle } from '@/lib/pdf-export';
import { Button } from '@/components/ui/button';
import { X, FileDown, Printer, Eye } from 'lucide-react';
import { useBranding } from '@/contexts/BrandingContext';
import { useSchool } from '@/contexts/SchoolContext';


interface LessonPDFExportProps {
  lesson: Lesson;
  onClose: () => void;
}

export const LessonPDFExport: React.FC<LessonPDFExportProps> = ({ lesson, onClose }) => {
  const { branding } = useBranding();
  const { currentSchool } = useSchool();

  const handleExport = () => {
    openPrintWindow(
      lesson, 
      branding.logo_url, 
      currentSchool?.name,
      { primary: branding.primary_color, secondary: branding.secondary_color }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-4 flex items-center justify-between" style={{ background: `linear-gradient(to right, ${branding.primary_color}, ${branding.secondary_color})` }}>
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <FileDown className="w-5 h-5" /> Export Lesson to PDF
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {branding.logo_url && (
            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
              <img src={branding.logo_url} alt="School Logo" className="h-12 object-contain" />
              <div>
                <p className="font-medium text-gray-700">{currentSchool?.name || 'Your School'}</p>
                <p className="text-xs text-gray-500">Logo will appear on exported PDF</p>
              </div>
            </div>
          )}
          
          <div className="border-2 rounded-xl p-4 mb-4" style={{ borderColor: `${branding.primary_color}40`, backgroundColor: `${branding.primary_color}08` }}>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p><span className="font-medium">Title:</span> {lesson.title}</p>
              <p><span className="font-medium">Subject:</span> {lesson.subject}</p>
              <p><span className="font-medium">Class:</span> {lesson.class || 'Not set'}</p>
              <p><span className="font-medium">Week:</span> Week {lesson.week}</p>
              <p><span className="font-medium">Lesson #:</span> Lesson {lesson.lessonNumber}</p>
              <p><span className="font-medium">Duration:</span> {lesson.duration}</p>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Eye className="w-4 h-4" /> Slides Preview ({lesson.slides.length} slides)
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {lesson.slides.map((slide, index) => {
                const title = getSlideTitle(index, slide);
                return (
                  <div key={slide.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="font-medium text-sm" style={{ color: branding.primary_color }}>{title}</p>
                    <p className="text-gray-500 text-xs truncate">{slide.content || 'No content'}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border rounded-lg p-3 text-sm" style={{ borderColor: `${branding.primary_color}40`, backgroundColor: `${branding.primary_color}08`, color: branding.primary_color }}>
            <p className="font-medium mb-1">PDF Export includes:</p>
            <ul className="list-disc list-inside space-y-1 text-xs opacity-80">
              <li>Cover page with school logo and branding colors</li>
              <li>All {lesson.slides.length} slides with content</li>
              <li>Professional formatting ready for printing</li>
            </ul>
          </div>
        </div>

        <div className="border-t p-4 flex gap-3 justify-end bg-gray-50">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleExport} style={{ background: `linear-gradient(to right, ${branding.primary_color}, ${branding.secondary_color})` }} className="text-white">
            <Printer className="w-4 h-4 mr-2" /> Export & Print PDF
          </Button>
        </div>
      </div>
    </div>
  );
};
