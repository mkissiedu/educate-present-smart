import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { uploadResource } from '@/lib/supabase-resources';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UploadResourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: () => void;
  lessonId?: string;
}

export function UploadResourceModal({ open, onOpenChange, onUploadComplete, lessonId }: UploadResourceModalProps) {
  const { currentUser } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !currentUser) return;

    setUploading(true);
    const { error } = await uploadResource(file, {
      title,
      description,
      subject,
      class_level: classLevel,
      lesson_id: lessonId,
      uploaded_by: currentUser.id,
    });

    setUploading(false);
    if (error) {
      toast.error('Failed to upload resource');
    } else {
      toast.success('Resource uploaded successfully');
      onUploadComplete();
      onOpenChange(false);
      setFile(null);
      setTitle('');
      setDescription('');
      setSubject('');
      setClassLevel('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Resource</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.mp3,.wav"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </div>
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Phonics, Math"
            />
          </div>
          <div>
            <Label htmlFor="classLevel">Class Level</Label>
            <Select value={classLevel} onValueChange={setClassLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select class level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PreK 1/Nursery 1">PreK 1/Nursery 1</SelectItem>
                <SelectItem value="PreK 2/Nursery 2">PreK 2/Nursery 2</SelectItem>
                <SelectItem value="KG 1">KG 1</SelectItem>
                <SelectItem value="KG 2">KG 2</SelectItem>
                <SelectItem value="Class 1">Class 1</SelectItem>
                <SelectItem value="Class 2">Class 2</SelectItem>
                <SelectItem value="Class 3">Class 3</SelectItem>
                <SelectItem value="Class 4">Class 4</SelectItem>
                <SelectItem value="Class 5">Class 5</SelectItem>
                <SelectItem value="Class 6">Class 6</SelectItem>
                <SelectItem value="JHS 1">JHS 1</SelectItem>
                <SelectItem value="JHS 2">JHS 2</SelectItem>
                <SelectItem value="JHS 3">JHS 3</SelectItem>
            </Select>
          </div>
          <Button type="submit" disabled={uploading} className="w-full">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            Upload
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
