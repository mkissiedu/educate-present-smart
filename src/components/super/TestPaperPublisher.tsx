import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import { getTestPapers } from '@/lib/supabase-questions';
import { publishTestPaper, fetchPublishedTestPapers } from '@/lib/supabase-test-papers';
import { ASSESSMENT_PAPER_TYPES, AssessmentPaperType, PublishedTestPaper } from '@/types/assessment-types';
import { TestPaper } from '@/types/question-bank';
import { toast } from '@/components/ui/use-toast';
import { FileText, Upload, Globe, Building2, X, Check, Trash2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  testPaper?: TestPaper;
  onPublished?: () => void;
}

export function TestPaperPublisher({ isOpen, onClose, testPaper, onPublished }: Props) {
  const { user } = useAuth();
  const { schools } = useSchool();
  const [paperType, setPaperType] = useState<AssessmentPaperType>('CAT1');
  const [term, setTerm] = useState('Term 1');
  const [academicYear, setAcademicYear] = useState('2024/2025');
  const [publishMode, setPublishMode] = useState<'all' | 'selected'>('all');
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);

  if (!isOpen || !testPaper) return null;

  const handlePublish = async () => {
    if (!user) return;
    setPublishing(true);
    const result = await publishTestPaper(
      testPaper.id, paperType, testPaper.subject, testPaper.grade_level,
      term, academicYear, publishMode, user.id, publishMode === 'selected' ? selectedSchools : undefined
    );
    setPublishing(false);
    if (result) {
      toast({ title: 'Test Paper Published', description: `${testPaper.title} published as ${paperType}` });
      onPublished?.();
      onClose();
    } else {
      toast({ title: 'Error', description: 'Failed to publish test paper', variant: 'destructive' });
    }
  };

  const toggleSchool = (schoolId: string) => {
    setSelectedSchools(prev => prev.includes(schoolId) ? prev.filter(s => s !== schoolId) : [...prev, schoolId]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><Upload className="w-5 h-5 text-amber-600" /> Publish Test Paper</h2>
          <Button variant="ghost" size="sm" onClick={onClose}><X className="w-5 h-5" /></Button>
        </div>
        <div className="bg-amber-50 p-3 rounded-lg mb-4">
          <p className="font-medium text-amber-800">{testPaper.title}</p>
          <p className="text-sm text-amber-600">{testPaper.subject} • {testPaper.grade_level} • {testPaper.total_marks} marks</p>
        </div>
        <div className="space-y-4">
          <div>
            <Label>Assessment Type</Label>
            <Select value={paperType} onValueChange={(v) => setPaperType(v as AssessmentPaperType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ASSESSMENT_PAPER_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label} - {t.description}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Term</Label>
              <Select value={term} onValueChange={setTerm}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Term 1">Term 1</SelectItem>
                  <SelectItem value="Term 2">Term 2</SelectItem>
                  <SelectItem value="Term 3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Academic Year</Label>
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024/2025">2024/2025</SelectItem>
                  <SelectItem value="2025/2026">2025/2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Publish To</Label>
            <div className="flex gap-2 mt-2">
              <Button variant={publishMode === 'all' ? 'default' : 'outline'} onClick={() => setPublishMode('all')} className="flex-1">
                <Globe className="w-4 h-4 mr-2" /> All Schools
              </Button>
              <Button variant={publishMode === 'selected' ? 'default' : 'outline'} onClick={() => setPublishMode('selected')} className="flex-1">
                <Building2 className="w-4 h-4 mr-2" /> Selected
              </Button>
            </div>
          </div>
          {publishMode === 'selected' && (
            <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-1">
              {schools.map(school => (
                <label key={school.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <Checkbox checked={selectedSchools.includes(school.id)} onCheckedChange={() => toggleSchool(school.id)} />
                  <span className="text-sm">{school.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handlePublish} disabled={publishing} className="flex-1 bg-amber-600 hover:bg-amber-700">
            {publishing ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </div>
    </div>
  );
}
