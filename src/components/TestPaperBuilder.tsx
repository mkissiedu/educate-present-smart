import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Printer, X, QrCode, Scan, BarChart3, Upload, FileStack } from 'lucide-react';
import { Question, TestPaper } from '@/types/question-bank';
import { TestPaperBranding } from './TestPaperBranding';
import { createTestPaper, addQuestionsToTestPaper } from '@/lib/supabase-questions';
import { allCurriculums } from '@/data/nacca-all-subjects';
import { OMRAnswerSheet, generateOMRConfig } from './OMRAnswerSheet';
import { OMRScanner } from './OMRScanner';
import { OMRResultsViewer } from './OMRResultsViewer';
import { BulkOMRImporter } from './BulkOMRImporter';
import { BulkOMRSummaryReport } from './BulkOMRSummaryReport';
import { OMRSheetConfig, OMRScanResult } from '@/types/omr-scanner';

interface Props {
  questions: Question[];
  onClose: () => void;
  onSaved?: () => void;
  students?: { id: string; name: string; index?: string }[];
  termId?: string;
  schoolId?: string;
  teacherId?: string;
  savedPaperId?: string;
}

const GRADES = ['KG1', 'KG2', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'JHS1', 'JHS2', 'JHS3'];

export function TestPaperBuilder({ questions, onClose, onSaved, students = [], termId = '', schoolId = '', teacherId = '', savedPaperId }: Props) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(questions[0]?.subject || '');
  const [grade, setGrade] = useState(questions[0]?.grade_level || '');
  const [className, setClassName] = useState('');
  const [duration, setDuration] = useState(60);
  const [instructions, setInstructions] = useState('Answer all questions. Show all working where necessary.');
  const [branding, setBranding] = useState({ schoolName: '', schoolLogo: '', schoolAddress: '', schoolMotto: '', academicYear: '2024/2025', term: 'Term 1' });
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testPaperId, setTestPaperId] = useState(savedPaperId || '');
  
  // OMR States
  const [showOMRSheet, setShowOMRSheet] = useState(false);
  const [showOMRScanner, setShowOMRScanner] = useState(false);
  const [showOMRResults, setShowOMRResults] = useState(false);
  const [showBulkImporter, setShowBulkImporter] = useState(false);
  const [showBulkReport, setShowBulkReport] = useState(false);
  const [bulkResults, setBulkResults] = useState<OMRScanResult[]>([]);
  const [omrConfig, setOmrConfig] = useState<OMRSheetConfig | null>(null);

  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
  const subjects = Object.keys(allCurriculums);
  
  // Count multiple choice questions
  const mcQuestions = questions.filter(q => q.options && q.options.length >= 2);
  const hasMCQuestions = mcQuestions.length > 0;

  const getOrCreateConfig = () => {
    if (omrConfig) return omrConfig;
    
    const config = generateOMRConfig(
      testPaperId || `temp-${Date.now()}`,
      title || 'Untitled Test',
      subject,
      grade,
      className || grade,
      branding.term,
      branding.academicYear,
      branding.schoolName,
      branding.schoolLogo,
      questions.map(q => ({
        id: q.id,
        question_text: q.question_text,
        options: q.options,
        indicator_code: q.indicator_code,
        indicator_text: q.indicator_text,
        strand: q.strand,
        sub_strand: q.sub_strand,
        marks: q.marks
      }))
    );
    setOmrConfig(config);
    return config;
  };

  const handleSave = async () => {
    setSaving(true);
    const paper = await createTestPaper({ 
      title, 
      subject, 
      grade_level: grade, 
      curriculum_type: 'NaCCA', 
      duration_minutes: duration, 
      total_marks: totalMarks, 
      school_name: branding.schoolName, 
      school_logo_url: branding.schoolLogo, 
      school_address: branding.schoolAddress, 
      school_motto: branding.schoolMotto, 
      term: branding.term, 
      academic_year: branding.academicYear, 
      instructions, 
      is_published: false 
    });
    if (paper) { 
      await addQuestionsToTestPaper(paper.id, questions.map(q => q.id)); 
      setTestPaperId(paper.id);
      onSaved?.(); 
    }
    setSaving(false);
  };

  const handlePrint = () => { 
    setShowPreview(true); 
    setTimeout(() => window.print(), 500); 
  };

  const handleGenerateOMRSheet = () => {
    getOrCreateConfig();
    setShowOMRSheet(true);
  };

  const handleOpenScanner = () => {
    getOrCreateConfig();
    setShowOMRScanner(true);
  };

  const handleOpenBulkImporter = () => {
    getOrCreateConfig();
    setShowBulkImporter(true);
  };

  const handleBulkImportComplete = (results: OMRScanResult[]) => {
    setBulkResults(results);
    setShowBulkImporter(false);
    if (results.length > 0) {
      setShowBulkReport(true);
    }
  };

  // OMR Answer Sheet Modal
  if (showOMRSheet && omrConfig) {
    return <OMRAnswerSheet config={omrConfig} onClose={() => setShowOMRSheet(false)} />;
  }

  // OMR Scanner Modal
  if (showOMRScanner && omrConfig) {
    return (
      <OMRScanner 
        config={omrConfig}
        students={students}
        termId={termId}
        schoolId={schoolId}
        teacherId={teacherId}
        onClose={() => setShowOMRScanner(false)}
        onScanComplete={() => {}}
      />
    );
  }

  // OMR Results Viewer
  if (showOMRResults && testPaperId) {
    return (
      <OMRResultsViewer
        testPaperId={testPaperId}
        testPaperTitle={title}
        className={className || grade}
        subject={subject}
        termId={termId}
        schoolId={schoolId}
        onClose={() => setShowOMRResults(false)}
      />
    );
  }

  // Bulk OMR Importer
  if (showBulkImporter && omrConfig) {
    return (
      <BulkOMRImporter
        config={omrConfig}
        students={students}
        termId={termId}
        schoolId={schoolId}
        teacherId={teacherId}
        onClose={() => setShowBulkImporter(false)}
        onComplete={handleBulkImportComplete}
      />
    );
  }

  // Bulk OMR Summary Report
  if (showBulkReport && bulkResults.length > 0) {
    return (
      <BulkOMRSummaryReport
        results={bulkResults}
        testPaperTitle={title || 'Test Paper'}
        className={className || grade}
        subject={subject}
        gradeLevel={grade}
        totalStudentsInClass={students.length}
        onClose={() => setShowBulkReport(false)}
      />
    );
  }

  if (showPreview) return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto p-8 print:p-0">
      <Button onClick={() => setShowPreview(false)} className="print:hidden fixed top-4 right-4">
        <X className="w-4 h-4" />
      </Button>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6 border-b pb-4">
          {branding.schoolLogo && <img src={branding.schoolLogo} alt="Logo" className="w-20 h-20 mx-auto mb-2 object-contain" />}
          <h1 className="text-xl font-bold">{branding.schoolName}</h1>
          <p className="text-sm">{branding.schoolAddress}</p>
          {branding.schoolMotto && <p className="text-sm italic">"{branding.schoolMotto}"</p>}
          <div className="mt-3">
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="text-sm">{subject} - {grade} | {branding.term} {branding.academicYear}</p>
            <p className="text-sm">Duration: {duration} mins | Total Marks: {totalMarks}</p>
          </div>
        </div>
        <p className="text-sm mb-4 p-2 bg-gray-100 rounded">{instructions}</p>
        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={q.id} className="border-b pb-3">
              <p className="font-medium">
                {i + 1}. {q.question_text} 
                <span className="text-sm text-gray-500">({q.marks} marks)</span>
              </p>
              {q.options?.map((o, j) => (
                <p key={j} className="ml-6 text-sm">{String.fromCharCode(65 + j)}. {o.option_text}</p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Create Test Paper
          </h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="End of Term Examination" />
          </div>
          <div>
            <Label>Subject</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Grade</Label>
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Class Name</Label>
            <Input value={className} onChange={e => setClassName(e.target.value)} placeholder="e.g., B3A, JHS2B" />
          </div>
          <div>
            <Label>Duration (mins)</Label>
            <Input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} />
          </div>
        </div>

        <TestPaperBranding branding={branding} onChange={setBranding} />
        
        <div className="mt-4">
          <Label>Instructions</Label>
          <Textarea value={instructions} onChange={e => setInstructions(e.target.value)} rows={2} />
        </div>

        {/* Question Summary */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">{questions.length} Questions | Total: {totalMarks} marks</p>
              {hasMCQuestions && (
                <p className="text-sm text-blue-600">
                  {mcQuestions.length} multiple choice questions available for OMR scanning
                </p>
              )}
            </div>
          </div>
        </div>

        {/* OMR Section */}
        {hasMCQuestions && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 flex items-center gap-2 mb-3">
              <QrCode className="w-5 h-5" />
              OMR Answer Sheet & Scanning
            </h3>
            <p className="text-sm text-green-700 mb-3">
              Generate scannable bubble sheets for multiple choice questions. 
              Results are automatically linked to NaCCA curriculum indicators.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                onClick={handleGenerateOMRSheet}
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Generate Answer Sheet
              </Button>
              <Button 
                variant="outline" 
                onClick={handleOpenScanner}
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <Scan className="w-4 h-4 mr-2" />
                Scan Single
              </Button>
              <Button 
                variant="outline" 
                onClick={handleOpenBulkImporter}
                className="border-indigo-300 text-indigo-700 hover:bg-indigo-100"
              >
                <FileStack className="w-4 h-4 mr-2" />
                Bulk Import
              </Button>
              {testPaperId && (
                <Button 
                  variant="outline" 
                  onClick={() => setShowOMRResults(true)}
                  className="border-purple-300 text-purple-700 hover:bg-purple-100"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Results
                </Button>
              )}
            </div>
            
            {/* Bulk Import Info */}
            <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <p className="text-sm text-indigo-800">
                <strong>Bulk Import:</strong> Upload multiple scanned OMR sheets at once. 
                Students are automatically matched by index number from filenames (e.g., "12345.jpg").
                A comprehensive summary report with class-wide indicator statistics is generated after processing.
              </p>
            </div>
          </div>
        )}

        {/* Indicator Mapping Info */}
        {questions.some(q => q.indicator_code) && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Curriculum Mapping:</strong> {questions.filter(q => q.indicator_code).length} questions 
              are linked to NaCCA indicators. Scan results will automatically track standards achievement.
            </p>
          </div>
        )}

        {/* Bulk Results Available */}
        {bulkResults.length > 0 && (
          <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-purple-800">
                <strong>Recent Bulk Import:</strong> {bulkResults.length} students processed
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowBulkReport(true)}
                className="border-purple-300 text-purple-700 hover:bg-purple-100"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View Summary Report
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-6 justify-end border-t pt-4">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Preview & Print
          </Button>
          <Button onClick={handleSave} disabled={saving || !title}>
            {saving ? 'Saving...' : testPaperId ? 'Update Test Paper' : 'Save Test Paper'}
          </Button>
        </div>
      </div>
    </div>
  );
}
