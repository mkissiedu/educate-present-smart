import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import { publishContent } from '@/lib/supabase-schools';
import { Lesson } from '@/types/lesson';
import { Globe, School, Upload, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface PublishContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: Lesson;
  onPublished: () => void;
}

export const PublishContentModal: React.FC<PublishContentModalProps> = ({ isOpen, onClose, lesson, onPublished }) => {
  const { user } = useAuth();
  const { schools } = useSchool();
  const [publishMode, setPublishMode] = useState<'all' | 'selected'>('all');
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  const toggleSchool = (schoolId: string) => {
    setSelectedSchools(prev => prev.includes(schoolId) ? prev.filter(id => id !== schoolId) : [...prev, schoolId]);
  };

  const handlePublish = async () => {
    if (publishMode === 'selected' && selectedSchools.length === 0) {
      toast({ title: 'Select Schools', description: 'Please select at least one school', variant: 'destructive' });
      return;
    }

    setIsPublishing(true);
    try {
      const success = await publishContent({
        content_type: 'lesson',
        content_id: lesson.id,
        title: lesson.title,
        subject: lesson.subject,
        class_level: lesson.class,
        publish_mode: publishMode,
        selected_schools: publishMode === 'selected' ? selectedSchools : undefined,
      }, user?.id || '');

      if (success) {
        toast({ title: 'Content Published!', description: publishMode === 'all' ? 'Available to all schools' : `Published to ${selectedSchools.length} school(s)` });
        onPublished();
        onClose();
      } else {
        toast({ title: 'Publish Failed', variant: 'destructive' });
      }
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <Upload className="w-5 h-5 text-amber-500" /> Publish Content
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-amber-50 rounded-lg p-3">
            <h3 className="font-bold text-amber-900">{lesson.title}</h3>
            <p className="text-amber-700 text-sm">{lesson.subject} • {lesson.class}</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Publish To:</label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setPublishMode('all')}
                className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${publishMode === 'all' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-white'}`}>
                <Globe className={`w-5 h-5 ${publishMode === 'all' ? 'text-amber-500' : 'text-gray-400'}`} />
                <span className="font-medium text-gray-900">All Schools</span>
              </button>
              <button onClick={() => setPublishMode('selected')}
                className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${publishMode === 'selected' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-white'}`}>
                <School className={`w-5 h-5 ${publishMode === 'selected' ? 'text-amber-500' : 'text-gray-400'}`} />
                <span className="font-medium text-gray-900">Selected Schools</span>
              </button>
            </div>
          </div>
          {publishMode === 'selected' && (
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50">
              {schools.map(school => (
                <label key={school.id} className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer">
                  <Checkbox checked={selectedSchools.includes(school.id)} onCheckedChange={() => toggleSchool(school.id)} />
                  <span className="text-sm text-gray-900">{school.name}</span>
                </label>
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100">Cancel</Button>
            <Button onClick={handlePublish} disabled={isPublishing} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white">
              {isPublishing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
              Publish
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
