import { useState, useEffect, useMemo } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Student } from '@/types/student';
import { SUBJECTS, calculateGrade, getGradeRemark, getGradeColor } from '@/types/scores';
import { saveStudentScore, getStudentScores } from '@/lib/supabase-scores';
import { ClassSubjectMapping } from './ClassSubjectMappingEditor';
import { Save, Check, Loader2, SaveAll, AlertCircle, Grid3X3 } from 'lucide-react';
import { ClassAverageSummary } from './ClassAverageSummary';

interface Props {
  students: Student[];
  termId: string;
  termNumber: number;
  onScoresSaved?: () => void;
  assignedSubjects?: string[];
  selectedClass?: string;
  selectedSubject?: string;
  assignmentMode?: 'multi-class' | 'multi-subject' | 'multi-both';
  classSubjectMapping?: ClassSubjectMapping;
}

interface StudentScoreRow {
  studentId: string;
  studentName: string;
  cat_1: number;
  cat_2: number;
  cat_3: number;
  cat_4: number;
  ete: number;
  total: number;
  grade: string;
  saved: boolean;
}

export function GradebookScoreGrid({ 
  students, 
  termId, 
  termNumber, 
  onScoresSaved, 
  assignedSubjects,
  selectedClass,
  selectedSubject,
  assignmentMode,
  classSubjectMapping
}: Props) {
  // Filter subjects based on teacher's assigned subjects and class-subject mapping
  const availableSubjects = useMemo(() => {
    // If in multi-both mode with a selected class, filter by mapping
    if (assignmentMode === 'multi-both' && classSubjectMapping && selectedClass && selectedClass !== 'All') {
      const mappedSubjects = classSubjectMapping[selectedClass] || [];
      return SUBJECTS.filter(s => mappedSubjects.includes(s));
    }
    
    // Otherwise use assigned subjects
    if (assignedSubjects && assignedSubjects.length > 0) {
      return SUBJECTS.filter(s => assignedSubjects.includes(s));
    }
    return SUBJECTS;
  }, [assignedSubjects, assignmentMode, classSubjectMapping, selectedClass]);

  // Use selectedSubject if provided and valid, otherwise use first available
  const initialSubject = useMemo(() => {
    if (selectedSubject && availableSubjects.includes(selectedSubject)) {
      return selectedSubject;
    }
    return availableSubjects[0] || SUBJECTS[0];
  }, [selectedSubject, availableSubjects]);

  const [subject, setSubject] = useState(initialSubject);
  const [rows, setRows] = useState<StudentScoreRow[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [savingAll, setSavingAll] = useState(false);
  const [loading, setLoading] = useState(false);

  // Update subject when selectedSubject or availableSubjects changes
  useEffect(() => {
    if (selectedSubject && availableSubjects.includes(selectedSubject)) {
      setSubject(selectedSubject);
    } else if (availableSubjects.length > 0 && !availableSubjects.includes(subject)) {
      setSubject(availableSubjects[0]);
    }
  }, [selectedSubject, availableSubjects, subject]);

  // Check if current subject is valid for the selected class in multi-both mode
  const isSubjectValidForClass = useMemo(() => {
    if (assignmentMode !== 'multi-both' || !classSubjectMapping || !selectedClass || selectedClass === 'All') {
      return true;
    }
    const mappedSubjects = classSubjectMapping[selectedClass] || [];
    return mappedSubjects.includes(subject);
  }, [assignmentMode, classSubjectMapping, selectedClass, subject]);

  const catLabels = {
    1: ['CAT 1', 'CAT 2', 'CAT 3', 'CAT 4', 'ETE 1'],
    2: ['CAT 5', 'CAT 6', 'CAT 7', 'CAT 8', 'ETE 2'],
    3: ['CAT 9', 'CAT 10', 'CAT 11', 'CAT 12', 'ETE 3']
  }[termNumber] || ['CAT 1', 'CAT 2', 'CAT 3', 'CAT 4', 'ETE'];

  useEffect(() => {
    if (termId && students.length > 0) loadScores();
  }, [students, subject, termId]);

  const loadScores = async () => {
    setLoading(true);
    const newRows: StudentScoreRow[] = [];
    for (const s of students) {
      const scores = await getStudentScores(s.id, termId);
      const existing = scores.find(sc => sc.subject === subject);
      newRows.push({
        studentId: s.id,
        studentName: s.name || `${s.first_name} ${s.last_name}`,
        cat_1: existing?.cat_1 || 0, cat_2: existing?.cat_2 || 0,
        cat_3: existing?.cat_3 || 0, cat_4: existing?.cat_4 || 0,
        ete: existing?.ete || 0, total: existing?.total || 0,
        grade: existing?.grade || '-', saved: !!existing
      });
    }
    setRows(newRows);
    setLoading(false);
  };

  const updateRow = (idx: number, field: string, value: number) => {
    setRows(prev => {
      const updated = [...prev];
      const row = { ...updated[idx], [field]: value, saved: false };
      row.total = row.cat_1 + row.cat_2 + row.cat_3 + row.cat_4 + row.ete;
      row.grade = calculateGrade(row.total);
      updated[idx] = row;
      return updated;
    });
  };

  const saveRow = async (idx: number) => {
    const row = rows[idx];
    setSaving(row.studentId);
    await saveStudentScore({
      student_id: row.studentId, term_id: termId, subject,
      cat_1: row.cat_1, cat_2: row.cat_2, cat_3: row.cat_3, cat_4: row.cat_4,
      ete: row.ete, remarks: getGradeRemark(row.grade)
    });
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, saved: true } : r));
    setSaving(null);
    onScoresSaved?.();
  };

  const saveAllRows = async () => {
    setSavingAll(true);
    const unsaved = rows.filter(r => !r.saved);
    for (const row of unsaved) {
      await saveStudentScore({
        student_id: row.studentId, term_id: termId, subject,
        cat_1: row.cat_1, cat_2: row.cat_2, cat_3: row.cat_3, cat_4: row.cat_4,
        ete: row.ete, remarks: getGradeRemark(row.grade)
      });
    }
    setRows(prev => prev.map(r => ({ ...r, saved: true })));
    setSavingAll(false);
    onScoresSaved?.();
  };

  const unsavedCount = rows.filter(r => !r.saved).length;

  // Prepare data for ClassAverageSummary
  const summaryData = rows.map(r => ({
    studentId: r.studentId,
    studentName: r.studentName,
    total: r.total,
    grade: r.grade
  }));

  return (
    <div className="space-y-4">
      {/* Class Average Summary Card */}
      <ClassAverageSummary rows={summaryData} subject={subject} termNumber={termNumber} />

      {/* Warning if subject is not valid for class in multi-both mode */}
      {!isSubjectValidForClass && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-center gap-3 text-amber-700">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-medium">Subject not assigned to this class</p>
              <p className="text-sm text-amber-600">
                {subject} is not in your teaching assignment for {selectedClass}. 
                Please select a different subject or class.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-4 bg-white">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Subject</label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {availableSubjects.map(s => (
                    <SelectItem key={s} value={s}>
                      {s}
                      {assignmentMode === 'multi-both' && classSubjectMapping && selectedClass && selectedClass !== 'All' && (
                        classSubjectMapping[selectedClass]?.includes(s) ? (
                          <Badge variant="outline" className="ml-2 text-xs bg-emerald-50 text-emerald-600 border-emerald-200">
                            Assigned
                          </Badge>
                        ) : null
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Term {termNumber}</span>
              <span>•</span>
              <span>{students.length} students</span>
              {assignmentMode === 'multi-both' && selectedClass && selectedClass !== 'All' && (
                <>
                  <span>•</span>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">
                    <Grid3X3 className="w-3 h-3 mr-1" />
                    {selectedClass}
                  </Badge>
                </>
              )}
            </div>
          </div>
          {unsavedCount > 0 && (
            <Button onClick={saveAllRows} disabled={savingAll} className="bg-purple-600 hover:bg-purple-700">
              {savingAll ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <SaveAll className="w-4 h-4 mr-2" />}
              Save All ({unsavedCount})
            </Button>
          )}
        </div>
        {loading ? <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-purple-600" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-purple-50">
                <tr>
                  <th className="p-2 text-left font-semibold">Student</th>
                  {catLabels.map((l, i) => <th key={i} className="p-2 text-center w-16 font-semibold">{l}<br/><span className="text-xs text-gray-400 font-normal">({i < 3 ? 10 : i === 3 ? 20 : 50})</span></th>)}
                  <th className="p-2 text-center font-semibold">Total</th>
                  <th className="p-2 text-center font-semibold">Grade</th>
                  <th className="p-2 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={row.studentId} className={`border-b hover:bg-gray-50 ${!row.saved ? 'bg-yellow-50' : ''}`}>
                    <td className="p-2 font-medium">{row.studentName}</td>
                    {['cat_1', 'cat_2', 'cat_3', 'cat_4', 'ete'].map((f, i) => (
                      <td key={f} className="p-1">
                        <Input type="number" min={0} max={i < 3 ? 10 : i === 3 ? 20 : 50} className="w-14 h-8 text-center"
                          value={row[f as keyof StudentScoreRow] as number}
                          onChange={e => updateRow(idx, f, Math.min(Number(e.target.value), i < 3 ? 10 : i === 3 ? 20 : 50))} />
                      </td>
                    ))}
                    <td className="p-2 text-center font-bold">{row.total}/100</td>

                    <td className="p-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getGradeColor(row.grade)}`}>{row.grade}</span>
                    </td>
                    <td className="p-2">
                      <Button size="sm" variant={row.saved ? 'ghost' : 'default'} onClick={() => saveRow(idx)} disabled={saving === row.studentId || row.saved}>
                        {saving === row.studentId ? <Loader2 className="w-4 h-4 animate-spin" /> : row.saved ? <Check className="w-4 h-4 text-green-600" /> : <Save className="w-4 h-4" />}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
