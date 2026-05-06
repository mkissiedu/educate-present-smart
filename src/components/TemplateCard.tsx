import React from 'react';
import { LessonTemplate } from '@/types/template';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Copy, Star, Users, Trash2, Calendar, Hash } from 'lucide-react';

interface TemplateCardProps {
  template: LessonTemplate;
  onPreview: (template: LessonTemplate) => void;
  onDuplicate: (template: LessonTemplate) => void;
  onDelete?: (template: LessonTemplate) => void;
  showDelete?: boolean;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template, onPreview, onDuplicate, onDelete, showDelete
}) => {
  const subjectColors: Record<string, string> = {
    'Language & Literacy': 'bg-blue-100 text-blue-700',
    'Numeracy': 'bg-purple-100 text-purple-700',
    'Our World Our People': 'bg-green-100 text-green-700',
    "Ananse's Phonics": 'bg-amber-100 text-amber-700',
    'Creative Arts': 'bg-pink-100 text-pink-700',
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-300 overflow-hidden">
      <div className="relative h-32 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-300">
        {template.thumbnailUrl && (
          <img src={template.thumbnailUrl} alt={template.title} className="w-full h-full object-cover" />
        )}
        {template.isFeatured && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" /> Featured
          </div>
        )}
        <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-2">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />W{template.week}</span>
          <span className="flex items-center gap-1"><Hash className="w-3 h-3" />L{template.lessonNumber}</span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
          <h3 className="text-white font-bold text-sm truncate">{template.title}</h3>
        </div>
      </div>
      <CardContent className="p-3">
        <div className="flex flex-wrap gap-1 mb-2">
          <Badge className={subjectColors[template.subject] || 'bg-gray-100 text-gray-700'} variant="secondary">
            {template.subject}
          </Badge>
          <Badge variant="outline" className="text-xs">{template.classLevel}</Badge>
        </div>
        {template.description && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{template.description}</p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{template.useCount} uses</span>
          <span className="truncate max-w-[100px]">by {template.authorName}</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onPreview(template)}>
            <Eye className="w-3 h-3 mr-1" /> Preview
          </Button>
          <Button size="sm" className="flex-1 bg-purple-500 hover:bg-purple-600" onClick={() => onDuplicate(template)}>
            <Copy className="w-3 h-3 mr-1" /> Use
          </Button>
          {showDelete && onDelete && (
            <Button size="sm" variant="destructive" onClick={() => onDelete(template)}>
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
