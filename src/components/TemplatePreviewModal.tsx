import React from 'react';
import { LessonTemplate } from '@/types/template';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Star, Users, BookOpen, Clock, Calendar, Hash } from 'lucide-react';

interface TemplatePreviewModalProps {
  template: LessonTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onDuplicate: (template: LessonTemplate) => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template, isOpen, onClose, onDuplicate
}) => {
  if (!template) return null;
  const lesson = template.lessonData;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                {template.title}
                {template.isFeatured && <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />}
              </DialogTitle>
              <p className="text-purple-100 text-sm mt-1">{template.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge className="bg-white/20 text-white">{template.subject}</Badge>
            <Badge className="bg-white/20 text-white">{template.classLevel}</Badge>
            <Badge className="bg-white/20 text-white">{template.category}</Badge>
            <Badge className="bg-yellow-400/30 text-white flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Week {template.week}
            </Badge>
            <Badge className="bg-green-400/30 text-white flex items-center gap-1">
              <Hash className="w-3 h-3" /> Lesson {template.lessonNumber}
            </Badge>
          </div>

        </DialogHeader>
        
        <ScrollArea className="h-[50vh] p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3 text-sm">
              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <Users className="w-5 h-5 mx-auto text-purple-500 mb-1" />
                <span className="font-bold text-purple-700">{template.useCount}</span>
                <p className="text-xs text-gray-500">Uses</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <BookOpen className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                <span className="font-bold text-blue-700">{lesson.slides?.length || 0}</span>
                <p className="text-xs text-gray-500">Slides</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <Clock className="w-5 h-5 mx-auto text-green-500 mb-1" />
                <span className="font-bold text-green-700">{lesson.duration || '45 min'}</span>
                <p className="text-xs text-gray-500">Duration</p>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg text-center">
                <Calendar className="w-5 h-5 mx-auto text-amber-500 mb-1" />
                <span className="font-bold text-amber-700">W{template.week} L{template.lessonNumber}</span>
                <p className="text-xs text-gray-500">Week/Lesson</p>
              </div>

            </div>

            <div>
              <h4 className="font-bold text-gray-700 mb-2">Slides Overview</h4>
              <div className="space-y-2">
                {lesson.slides?.slice(0, 8).map((slide, idx) => (
                  <div key={slide.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                    <span className="text-sm font-medium">{slide.title}</span>
                    <Badge variant="outline" className="ml-auto text-xs">{slide.type}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-gray-500 flex items-center gap-4">
              <span>Created by: {template.authorName}</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />{new Date(template.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t bg-gray-50 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Close</Button>
          <Button className="flex-1 bg-purple-500 hover:bg-purple-600" onClick={() => { onDuplicate(template); onClose(); }}>
            <Copy className="w-4 h-4 mr-2" /> Use This Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
