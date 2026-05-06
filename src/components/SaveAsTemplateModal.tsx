import React, { useState } from 'react';
import { Lesson, TOTAL_WEEKS, LESSONS_PER_WEEK } from '@/types/lesson';
import { TEMPLATE_CATEGORIES, TemplateCategory } from '@/types/template';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createTemplate } from '@/lib/supabase-templates';
import { useAuth } from '@/contexts/AuthContext';
import { Save, Loader2, CheckCircle, Calendar, Hash } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SaveAsTemplateModalProps {
  lesson: Lesson;
  isOpen: boolean;
  onClose: () => void;
}

export const SaveAsTemplateModal: React.FC<SaveAsTemplateModalProps> = ({ lesson, isOpen, onClose }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(lesson.title);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('General');
  const [week, setWeek] = useState<number>(lesson.week);
  const [lessonNumber, setLessonNumber] = useState<number>(lesson.lessonNumber);
  const [tags, setTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const maxLessons = LESSONS_PER_WEEK[lesson.subject] || 5;



  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const result = await createTemplate({
        title, description, subject: lesson.subject, classLevel: lesson.class || 'Nursery',
        category, week, lessonNumber, lessonData: { ...lesson, week, lessonNumber },
        authorId: user.id, authorName: user.name, isFeatured: false, thumbnailUrl: lesson.thumbnailUrl,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean)
      });
      if (result) {
        setSaved(true);
        toast({ title: 'Template Saved!', description: `Week ${week}, Lesson ${lessonNumber} saved as template.` });
        setTimeout(() => { onClose(); setSaved(false); }, 1500);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save template.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5 text-purple-500" /> Save as Template
          </DialogTitle>
        </DialogHeader>
        {saved ? (
          <div className="py-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-bold text-green-600">Template Saved Successfully!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Template Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter template title" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Week</Label>
                <Select value={week.toString()} onValueChange={(v) => setWeek(parseInt(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: TOTAL_WEEKS }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>Week {i + 1}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="flex items-center gap-1"><Hash className="w-3 h-3" /> Lesson #</Label>
                <Select value={lessonNumber.toString()} onValueChange={(v) => setLessonNumber(parseInt(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: maxLessons }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>Lesson {i + 1}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what this template is about..." rows={2} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as TemplateCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TEMPLATE_CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tags (comma separated)</Label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="phonics, reading, beginner" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving || !title} className="flex-1 bg-purple-500 hover:bg-purple-600">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Template
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
