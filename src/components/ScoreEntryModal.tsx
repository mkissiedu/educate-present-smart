import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SUBJECTS, calculateGrade, getGradeRemark } from '@/types/scores';
import { saveStudentScore, getStudentScores } from '@/lib/supabase-scores';
import { Save, BookOpen } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  student: { id: string; name: string; class: string } | null;
  termId: string;
  termNumber: number;
}

export function ScoreEntryModal({ isOpen, onClose, student, termId, termNumber }: Props) {
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [scores, setScores] = useState({ cat_1: 0, cat_2: 0, cat_3: 0, cat_4: 0, ete: 0 });
  const [saving, setSaving] = useState(false);
  const [existingScores, setExistingScores] = useState<any[]>([]);

  const catLabels = {
    1: ['CAT 1', 'CAT 2', 'CAT 3', 'CAT 4', 'ETE 1'],
    2: ['CAT 5', 'CAT 6', 'CAT 7', 'CAT 8', 'ETE 2'],
    3: ['CAT 9', 'CAT 10', 'CAT 11', 'CAT 12', 'ETE 3']
  }[termNumber] || ['CAT 1', 'CAT 2', 'CAT 3', 'CAT 4', 'ETE'];

  useEffect(() => {
    if (student && termId) {
      getStudentScores(student.id, termId).then(setExistingScores);
    }
  }, [student, termId]);

  useEffect(() => {
    const existing = existingScores.find(s => s.subject === subject);
    if (existing) {
      setScores({ cat_1: existing.cat_1, cat_2: existing.cat_2, cat_3: existing.cat_3, cat_4: existing.cat_4, ete: existing.ete });
    } else {
      setScores({ cat_1: 0, cat_2: 0, cat_3: 0, cat_4: 0, ete: 0 });
    }
  }, [subject, existingScores]);

  const total = scores.cat_1 + scores.cat_2 + scores.cat_3 + scores.cat_4 + scores.ete;
  const grade = calculateGrade(total);

  const handleSave = async () => {
    if (!student) return;
    setSaving(true);
    await saveStudentScore({ student_id: student.id, term_id: termId, subject, ...scores, remarks: getGradeRemark(grade) });
    const updated = await getStudentScores(student.id, termId);
    setExistingScores(updated);
    setSaving(false);
  };

  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            Enter Scores - {student.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-sm text-purple-700">Class: {student.class} | Term {termNumber}</p>
          </div>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="grid grid-cols-5 gap-2">
            {['cat_1', 'cat_2', 'cat_3', 'cat_4', 'ete'].map((key, i) => (
              <div key={key}>
                <Label className="text-xs">{catLabels[i]} ({i < 3 ? '10' : i === 3 ? '20' : '50'})</Label>
                <Input type="number" min={0} max={i < 3 ? 10 : i === 3 ? 20 : 50} value={scores[key as keyof typeof scores]}
                  onChange={e => setScores(p => ({ ...p, [key]: Math.min(Number(e.target.value), i < 3 ? 10 : i === 3 ? 20 : 50) }))} />
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
            <span>Total: <strong>{total}/100</strong></span>
            <span className={`px-3 py-1 rounded font-bold ${grade === 'A' ? 'bg-green-500 text-white' : grade === 'F' ? 'bg-red-500 text-white' : 'bg-yellow-400'}`}>
              Grade: {grade}
            </span>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            <Save className="w-4 h-4 mr-2" />{saving ? 'Saving...' : 'Save Score'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
