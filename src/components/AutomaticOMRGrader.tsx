import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  X, Upload, Scan, AlertTriangle, CheckCircle2, XCircle, 
  Eye, Edit2, Save, RotateCcw, FileImage, Zap, Clock,
  AlertCircle, ChevronLeft, ChevronRight, Users, Download,
  Loader2, ImageIcon, Trash2, RefreshCw
} from 'lucide-react';
import { OMRSheetConfig, OMRQuestion, getOMRGrade, OMR_GRADE_THRESHOLDS } from '@/types/omr-scanner';
import { processOMRScan, batchSaveOMRResults } from '@/lib/supabase-omr';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Props {
  config: OMRSheetConfig;
  students: { id: string; name: string; index?: string }[];
  termId: string;
  schoolId: string;
  teacherId: string;
  onClose: () => void;
  onGradingComplete?: () => void;
}

interface DetectedAnswer {
  questionNumber: number;
  detectedOption: string | null;
  confidence: number;
  bubbleAnalysis: {
    option: string;
    fillLevel: number;
    isSelected: boolean;
  }[];
  flags: string[];
}

interface ProcessedSheet {
  id: string;
  filename: string;
  imageData: string;
  status: 'pending' | 'processing' | 'completed' | 'error' | 'needs_review';
  studentInfo: {
    detectedName: string | null;
    detectedIndex: string | null;
    confidence: number;
  };
  matchedStudent: { id: string; name: string; index?: string } | null;
  answers: DetectedAnswer[];
  manualOverrides: Map<number, string>;
  overallConfidence: number;
  needsManualReview: boolean;
  reviewReasons: string[];
  processingTime: number;
  score?: {
    correct: number;
    wrong: number;
    unanswered: number;
    percentage: number;
    grade: string;
  };
  error?: string;
  saved: boolean;
}

export function AutomaticOMRGrader({ 
  config, 
  students, 
  termId, 
  schoolId, 
  teacherId, 
  onClose, 
  onGradingComplete 
}: Props) {
  const [sheets, setSheets] = useState<ProcessedSheet[]>([]);
  const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'upload' | 'review' | 'results'>('upload');
  const [savingAll, setSavingAll] = useState(false);
  const [autoMatchStudents, setAutoMatchStudents] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const options = config.options_per_question === 5 ? ['A', 'B', 'C', 'D', 'E'] : ['A', 'B', 'C', 'D'];

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newSheets: ProcessedSheet[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imageData = await readFileAsDataURL(file);
      
      newSheets.push({
        id: `sheet-${Date.now()}-${i}`,
        filename: file.name,
        imageData,
        status: 'pending',
        studentInfo: { detectedName: null, detectedIndex: null, confidence: 0 },
        matchedStudent: null,
        answers: [],
        manualOverrides: new Map(),
        overallConfidence: 0,
        needsManualReview: false,
        reviewReasons: [],
        processingTime: 0,
        saved: false
      });
    }

    setSheets(prev => [...prev, ...newSheets]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Process all sheets
  const processAllSheets = async () => {
    const pendingSheets = sheets.filter(s => s.status === 'pending');
    if (pendingSheets.length === 0) return;

    setProcessing(true);
    setActiveTab('review');

    for (let i = 0; i < pendingSheets.length; i++) {
      setCurrentProcessingIndex(i);
      await processSheet(pendingSheets[i].id);
    }

    setProcessing(false);
  };

  // Process a single sheet
  const processSheet = async (sheetId: string) => {
    setSheets(prev => prev.map(s => 
      s.id === sheetId ? { ...s, status: 'processing' } : s
    ));

    try {
      const sheet = sheets.find(s => s.id === sheetId);
      if (!sheet) return;

      const { data, error } = await supabase.functions.invoke('process-omr-image', {
        body: {
          imageBase64: sheet.imageData,
          totalQuestions: config.total_questions,
          optionsPerQuestion: config.options_per_question,
          questions: config.questions
        }
      });

      if (error) throw new Error(error.message);
      if (!data.success) throw new Error(data.error || 'Processing failed');

      // Auto-match student if enabled
      let matchedStudent = null;
      if (autoMatchStudents) {
        matchedStudent = matchStudent(data.studentInfo, sheet.filename);
      }

      // Calculate score
      const score = calculateScore(data.answers, new Map());

      setSheets(prev => prev.map(s => 
        s.id === sheetId ? {
          ...s,
          status: data.needsManualReview ? 'needs_review' : 'completed',
          studentInfo: data.studentInfo,
          matchedStudent,
          answers: data.answers,
          overallConfidence: data.overallConfidence,
          needsManualReview: data.needsManualReview,
          reviewReasons: data.reviewReasons,
          processingTime: data.processingTime,
          score
        } : s
      ));

    } catch (error: any) {
      setSheets(prev => prev.map(s => 
        s.id === sheetId ? {
          ...s,
          status: 'error',
          error: error.message
        } : s
      ));
    }
  };

  // Match student based on detected info or filename
  const matchStudent = (
    studentInfo: { detectedName: string | null; detectedIndex: string | null; confidence: number },
    filename: string
  ): { id: string; name: string; index?: string } | null => {
    // Try to match by index first
    if (studentInfo.detectedIndex) {
      const byIndex = students.find(s => s.index === studentInfo.detectedIndex);
      if (byIndex) return byIndex;
    }

    // Try to match by name
    if (studentInfo.detectedName) {
      const normalizedName = studentInfo.detectedName.toLowerCase();
      const byName = students.find(s => 
        s.name.toLowerCase().includes(normalizedName) ||
        normalizedName.includes(s.name.toLowerCase())
      );
      if (byName) return byName;
    }

    // Try to match from filename
    const baseName = filename.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[_-]/g, ' ');
    
    // Look for index in filename
    const indexMatch = baseName.match(/(\d{4,})/);
    if (indexMatch) {
      const byIndex = students.find(s => s.index === indexMatch[1]);
      if (byIndex) return byIndex;
    }

    // Look for name in filename
    const byFilename = students.find(s => 
      baseName.includes(s.name.toLowerCase()) ||
      s.name.toLowerCase().split(' ').some(part => baseName.includes(part))
    );
    if (byFilename) return byFilename;

    return null;
  };

  // Calculate score based on answers and overrides
  const calculateScore = (
    answers: DetectedAnswer[], 
    overrides: Map<number, string>
  ): { correct: number; wrong: number; unanswered: number; percentage: number; grade: string } => {
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;
    let totalMarks = 0;
    let marksObtained = 0;

    config.questions.forEach(q => {
      const answer = answers.find(a => a.questionNumber === q.number);
      const selectedOption = overrides.get(q.number) || answer?.detectedOption;
      
      totalMarks += q.marks;

      if (!selectedOption) {
        unanswered++;
      } else if (selectedOption === q.correct_option) {
        correct++;
        marksObtained += q.marks;
      } else {
        wrong++;
      }
    });

    const percentage = totalMarks > 0 ? Math.round((marksObtained / totalMarks) * 100) : 0;
    const grade = getOMRGrade(percentage);

    return { correct, wrong, unanswered, percentage, grade };
  };

  // Update manual override for a question
  const setManualOverride = (sheetId: string, questionNumber: number, option: string | null) => {
    setSheets(prev => prev.map(s => {
      if (s.id !== sheetId) return s;
      
      const newOverrides = new Map(s.manualOverrides);
      if (option === null) {
        newOverrides.delete(questionNumber);
      } else {
        newOverrides.set(questionNumber, option);
      }
      
      const newScore = calculateScore(s.answers, newOverrides);
      
      return {
        ...s,
        manualOverrides: newOverrides,
        score: newScore
      };
    }));
  };

  // Update matched student
  const updateMatchedStudent = (sheetId: string, studentId: string) => {
    const student = students.find(s => s.id === studentId);
    setSheets(prev => prev.map(s => 
      s.id === sheetId ? { ...s, matchedStudent: student || null } : s
    ));
  };

  // Save all completed sheets
  const saveAllResults = async () => {
    const sheetsToSave = sheets.filter(s => 
      (s.status === 'completed' || s.status === 'needs_review') && 
      s.matchedStudent && 
      !s.saved
    );

    if (sheetsToSave.length === 0) return;

    setSavingAll(true);

    for (const sheet of sheetsToSave) {
      await saveSheetResult(sheet);
    }

    setSavingAll(false);
    setActiveTab('results');
    onGradingComplete?.();
  };

  // Save a single sheet result
  const saveSheetResult = async (sheet: ProcessedSheet) => {
    if (!sheet.matchedStudent) return;

    const answersArray = config.questions.map(q => {
      const answer = sheet.answers.find(a => a.questionNumber === q.number);
      const selectedOption = sheet.manualOverrides.get(q.number) || answer?.detectedOption || null;
      
      return {
        questionNumber: q.number,
        questionId: q.question_id,
        selectedOption,
        correctOption: q.correct_option,
        indicatorCode: q.indicator_code,
        indicatorText: q.indicator_text,
        strand: q.strand,
        subStrand: q.sub_strand,
        marks: q.marks
      };
    });

    const result = await processOMRScan(
      sheet.matchedStudent.id,
      sheet.matchedStudent.name,
      config.test_paper_id,
      config.class_name,
      config.subject,
      config.grade_level,
      termId,
      schoolId,
      teacherId,
      answersArray,
      sheet.imageData
    );

    if (result) {
      setSheets(prev => prev.map(s => 
        s.id === sheet.id ? { ...s, saved: true } : s
      ));
    }
  };

  // Remove a sheet
  const removeSheet = (sheetId: string) => {
    setSheets(prev => prev.filter(s => s.id !== sheetId));
    if (selectedSheetId === sheetId) {
      setSelectedSheetId(null);
    }
  };

  // Reprocess a sheet
  const reprocessSheet = async (sheetId: string) => {
    setSheets(prev => prev.map(s => 
      s.id === sheetId ? { 
        ...s, 
        status: 'pending',
        answers: [],
        manualOverrides: new Map(),
        error: undefined
      } : s
    ));
    await processSheet(sheetId);
  };

  const selectedSheet = sheets.find(s => s.id === selectedSheetId);
  const pendingCount = sheets.filter(s => s.status === 'pending').length;
  const completedCount = sheets.filter(s => s.status === 'completed' || s.status === 'needs_review').length;
  const reviewCount = sheets.filter(s => s.status === 'needs_review').length;
  const errorCount = sheets.filter(s => s.status === 'error').length;
  const savedCount = sheets.filter(s => s.saved).length;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Zap className="w-6 h-6" />
              Automatic OMR Grading
            </h2>
            <p className="text-sm text-blue-100">{config.title} | {config.subject} | {config.total_questions} Questions</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="px-6 py-3 bg-gray-50 border-b flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <FileImage className="w-4 h-4 text-gray-500" />
            <span className="font-medium">{sheets.length}</span>
            <span className="text-gray-500">Sheets</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-500" />
            <span className="font-medium">{pendingCount}</span>
            <span className="text-gray-500">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="font-medium">{completedCount}</span>
            <span className="text-gray-500">Processed</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="font-medium">{reviewCount}</span>
            <span className="text-gray-500">Need Review</span>
          </div>
          {errorCount > 0 && (
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="font-medium">{errorCount}</span>
              <span className="text-gray-500">Errors</span>
            </div>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <Save className="w-4 h-4 text-blue-500" />
            <span className="font-medium">{savedCount}</span>
            <span className="text-gray-500">Saved</span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-6 mt-4 w-fit">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Sheets
            </TabsTrigger>
            <TabsTrigger value="review" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Review & Edit
              {reviewCount > 0 && (
                <Badge variant="destructive" className="ml-1">{reviewCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Results
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="flex-1 overflow-auto p-6">
            <div className="max-w-3xl mx-auto">
              {/* Upload Area */}
              <div 
                className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload Scanned OMR Sheets</h3>
                <p className="text-gray-500 mb-4">
                  Drag and drop or click to select images (JPG, PNG, PDF)
                </p>
                <Button>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Select Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              {/* Options */}
              <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="autoMatch" 
                    checked={autoMatchStudents}
                    onCheckedChange={(checked) => setAutoMatchStudents(checked as boolean)}
                  />
                  <Label htmlFor="autoMatch" className="text-sm">
                    Auto-match students by name/index
                  </Label>
                </div>
              </div>

              {/* Uploaded Files List */}
              {sheets.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Uploaded Sheets ({sheets.length})</h4>
                  <div className="space-y-2 max-h-64 overflow-auto">
                    {sheets.map((sheet, idx) => (
                      <div 
                        key={sheet.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <img 
                          src={sheet.imageData} 
                          alt={sheet.filename}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{sheet.filename}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {sheet.status === 'pending' && (
                              <Badge variant="outline" className="text-xs">Pending</Badge>
                            )}
                            {sheet.status === 'processing' && (
                              <Badge className="text-xs bg-blue-100 text-blue-700">
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                Processing
                              </Badge>
                            )}
                            {sheet.status === 'completed' && (
                              <Badge className="text-xs bg-green-100 text-green-700">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                {sheet.score?.percentage}%
                              </Badge>
                            )}
                            {sheet.status === 'needs_review' && (
                              <Badge className="text-xs bg-orange-100 text-orange-700">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Needs Review
                              </Badge>
                            )}
                            {sheet.status === 'error' && (
                              <Badge variant="destructive" className="text-xs">
                                <XCircle className="w-3 h-3 mr-1" />
                                Error
                              </Badge>
                            )}
                            {sheet.matchedStudent && (
                              <span className="text-xs text-gray-500">
                                → {sheet.matchedStudent.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeSheet(sheet.id)}
                        >
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Process Button */}
                  <div className="mt-6 flex justify-center">
                    <Button 
                      size="lg" 
                      onClick={processAllSheets}
                      disabled={processing || pendingCount === 0}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processing {currentProcessingIndex + 1} of {pendingCount}...
                        </>
                      ) : (
                        <>
                          <Scan className="w-5 h-5 mr-2" />
                          Process {pendingCount} Sheet{pendingCount !== 1 ? 's' : ''} with AI
                        </>
                      )}
                    </Button>
                  </div>

                  {processing && (
                    <div className="mt-4">
                      <Progress 
                        value={(currentProcessingIndex / pendingCount) * 100} 
                        className="h-2"
                      />
                      <p className="text-sm text-gray-500 text-center mt-2">
                        AI is analyzing bubble patterns and detecting answers...
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Review Tab */}
          <TabsContent value="review" className="flex-1 overflow-hidden flex">
            {/* Sheet List Sidebar */}
            <div className="w-64 border-r overflow-auto">
              <div className="p-3 border-b bg-gray-50">
                <h4 className="font-semibold text-sm">Processed Sheets</h4>
              </div>
              <div className="divide-y">
                {sheets.filter(s => s.status !== 'pending').map(sheet => (
                  <button
                    key={sheet.id}
                    onClick={() => setSelectedSheetId(sheet.id)}
                    className={cn(
                      "w-full p-3 text-left hover:bg-gray-50 transition-colors",
                      selectedSheetId === sheet.id && "bg-blue-50 border-l-4 border-blue-600"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {sheet.status === 'completed' && (
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      )}
                      {sheet.status === 'needs_review' && (
                        <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      )}
                      {sheet.status === 'error' && (
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      )}
                      {sheet.status === 'processing' && (
                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />
                      )}
                      <span className="font-medium text-sm truncate">
                        {sheet.matchedStudent?.name || sheet.filename}
                      </span>
                    </div>
                    {sheet.score && (
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-lg font-bold",
                          sheet.score.grade === 'M' && "text-green-600",
                          sheet.score.grade === 'P' && "text-blue-600",
                          sheet.score.grade === 'AP' && "text-yellow-600",
                          sheet.score.grade === 'D' && "text-red-500"
                        )}>
                          {sheet.score.percentage}%
                        </span>
                        <span className="text-xs text-gray-500">
                          {sheet.overallConfidence}% conf.
                        </span>
                      </div>
                    )}
                    {sheet.saved && (
                      <Badge variant="outline" className="text-xs mt-1">Saved</Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Detail View */}
            <div className="flex-1 overflow-auto">
              {selectedSheet ? (
                <SheetDetailView
                  sheet={selectedSheet}
                  config={config}
                  students={students}
                  options={options}
                  onOverride={(qNum, opt) => setManualOverride(selectedSheet.id, qNum, opt)}
                  onStudentChange={(studentId) => updateMatchedStudent(selectedSheet.id, studentId)}
                  onReprocess={() => reprocessSheet(selectedSheet.id)}
                  onSave={() => saveSheetResult(selectedSheet)}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a sheet to review</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto">
              {/* Summary */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-blue-600">{completedCount}</p>
                  <p className="text-sm text-gray-600">Processed</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">{savedCount}</p>
                  <p className="text-sm text-gray-600">Saved to Gradebook</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-orange-600">
                    {sheets.filter(s => !s.matchedStudent && s.status !== 'pending').length}
                  </p>
                  <p className="text-sm text-gray-600">Unmatched</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-purple-600">
                    {completedCount > 0 
                      ? Math.round(sheets.filter(s => s.score).reduce((sum, s) => sum + (s.score?.percentage || 0), 0) / completedCount)
                      : 0}%
                  </p>
                  <p className="text-sm text-gray-600">Average Score</p>
                </div>
              </div>

              {/* Results Table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Student</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Score</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Grade</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Confidence</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {sheets.filter(s => s.status !== 'pending').map(sheet => (
                      <tr key={sheet.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">
                              {sheet.matchedStudent?.name || 'Unmatched'}
                            </p>
                            <p className="text-xs text-gray-500">{sheet.filename}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {sheet.score ? (
                            <span className="font-semibold">{sheet.score.percentage}%</span>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {sheet.score && (
                            <Badge className={cn(
                              sheet.score.grade === 'M' && "bg-green-100 text-green-700",
                              sheet.score.grade === 'P' && "bg-blue-100 text-blue-700",
                              sheet.score.grade === 'AP' && "bg-yellow-100 text-yellow-700",
                              sheet.score.grade === 'D' && "bg-red-100 text-red-700"
                            )}>
                              {sheet.score.grade}
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full",
                                  sheet.overallConfidence >= 80 && "bg-green-500",
                                  sheet.overallConfidence >= 60 && sheet.overallConfidence < 80 && "bg-yellow-500",
                                  sheet.overallConfidence < 60 && "bg-red-500"
                                )}
                                style={{ width: `${sheet.overallConfidence}%` }}
                              />
                            </div>
                            <span className="text-sm">{sheet.overallConfidence}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {sheet.saved ? (
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Saved
                            </Badge>
                          ) : sheet.status === 'error' ? (
                            <Badge variant="destructive">Error</Badge>
                          ) : !sheet.matchedStudent ? (
                            <Badge variant="outline">No Student</Badge>
                          ) : (
                            <Badge variant="outline">Ready</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Save All Button */}
              <div className="mt-6 flex justify-center gap-4">
                <Button 
                  size="lg"
                  onClick={saveAllResults}
                  disabled={savingAll || sheets.filter(s => s.matchedStudent && !s.saved && s.status !== 'error').length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {savingAll ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Save All to Gradebook ({sheets.filter(s => s.matchedStudent && !s.saved && s.status !== 'error').length})
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Sheet Detail View Component
function SheetDetailView({
  sheet,
  config,
  students,
  options,
  onOverride,
  onStudentChange,
  onReprocess,
  onSave
}: {
  sheet: ProcessedSheet;
  config: OMRSheetConfig;
  students: { id: string; name: string; index?: string }[];
  options: string[];
  onOverride: (questionNumber: number, option: string | null) => void;
  onStudentChange: (studentId: string) => void;
  onReprocess: () => void;
  onSave: () => void;
}) {
  const [showImage, setShowImage] = useState(true);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold">{sheet.filename}</h3>
            {sheet.needsManualReview && (
              <Badge className="bg-orange-100 text-orange-700">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Needs Review
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onReprocess}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Reprocess
            </Button>
            <Button 
              size="sm" 
              onClick={onSave}
              disabled={!sheet.matchedStudent || sheet.saved}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="w-4 h-4 mr-1" />
              {sheet.saved ? 'Saved' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Student Selection */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label className="text-xs text-gray-500">Matched Student</Label>
            <Select 
              value={sheet.matchedStudent?.id || ''} 
              onValueChange={onStudentChange}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select student..." />
              </SelectTrigger>
              <SelectContent>
                {students.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} {s.index && `(${s.index})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-center">
            <Label className="text-xs text-gray-500">Confidence</Label>
            <p className={cn(
              "text-2xl font-bold",
              sheet.overallConfidence >= 80 && "text-green-600",
              sheet.overallConfidence >= 60 && sheet.overallConfidence < 80 && "text-yellow-600",
              sheet.overallConfidence < 60 && "text-red-500"
            )}>
              {sheet.overallConfidence}%
            </p>
          </div>
          <div className="text-center">
            <Label className="text-xs text-gray-500">Score</Label>
            <p className={cn(
              "text-2xl font-bold",
              sheet.score?.grade === 'M' && "text-green-600",
              sheet.score?.grade === 'P' && "text-blue-600",
              sheet.score?.grade === 'AP' && "text-yellow-600",
              sheet.score?.grade === 'D' && "text-red-500"
            )}>
              {sheet.score?.percentage || 0}%
            </p>
          </div>
        </div>

        {/* Review Reasons */}
        {sheet.reviewReasons.length > 0 && (
          <div className="mt-3 p-2 bg-orange-50 rounded-lg">
            <p className="text-xs font-medium text-orange-700 mb-1">Review Required:</p>
            <ul className="text-xs text-orange-600 list-disc list-inside">
              {sheet.reviewReasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Image Preview */}
          {showImage && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-3 py-2 border-b flex items-center justify-between">
                <span className="text-sm font-medium">Scanned Image</span>
                <Button variant="ghost" size="sm" onClick={() => setShowImage(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <img 
                src={sheet.imageData} 
                alt="Scanned sheet"
                className="w-full"
              />
            </div>
          )}

          {/* Answer Grid */}
          <div className={cn("space-y-2", !showImage && "col-span-2")}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Detected Answers</h4>
              {!showImage && (
                <Button variant="outline" size="sm" onClick={() => setShowImage(true)}>
                  <ImageIcon className="w-4 h-4 mr-1" />
                  Show Image
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {config.questions.map(q => {
                const answer = sheet.answers.find(a => a.questionNumber === q.number);
                const override = sheet.manualOverrides.get(q.number);
                const selectedOption = override || answer?.detectedOption;
                const isCorrect = selectedOption === q.correct_option;
                const hasFlags = answer?.flags && answer.flags.length > 0;

                return (
                  <div 
                    key={q.number}
                    className={cn(
                      "p-2 rounded-lg border",
                      hasFlags && "border-orange-300 bg-orange-50",
                      override && "border-blue-300 bg-blue-50",
                      !hasFlags && !override && "border-gray-200"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm w-6">{q.number}.</span>
                      <div className="flex gap-1 flex-1">
                        {options.map(opt => {
                          const bubble = answer?.bubbleAnalysis?.find(b => b.option === opt);
                          const isSelected = selectedOption === opt;
                          const isOverride = override === opt;
                          
                          return (
                            <button
                              key={opt}
                              onClick={() => onOverride(q.number, isOverride ? null : opt)}
                              className={cn(
                                "w-7 h-7 rounded-full border-2 text-xs font-semibold transition-all relative",
                                isSelected && isCorrect && "bg-green-500 border-green-500 text-white",
                                isSelected && !isCorrect && "bg-red-500 border-red-500 text-white",
                                !isSelected && "border-gray-300 hover:border-blue-400",
                                isOverride && "ring-2 ring-blue-400 ring-offset-1"
                              )}
                              title={bubble ? `Fill: ${bubble.fillLevel}%` : undefined}
                            >
                              {opt}
                              {bubble && bubble.fillLevel > 30 && bubble.fillLevel < 70 && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                      <span className={cn(
                        "text-xs px-1.5 py-0.5 rounded",
                        (answer?.confidence || 0) >= 80 && "bg-green-100 text-green-700",
                        (answer?.confidence || 0) >= 60 && (answer?.confidence || 0) < 80 && "bg-yellow-100 text-yellow-700",
                        (answer?.confidence || 0) < 60 && "bg-red-100 text-red-700"
                      )}>
                        {answer?.confidence || 0}%
                      </span>
                    </div>
                    {hasFlags && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {answer?.flags.map(flag => (
                          <span 
                            key={flag}
                            className="text-[10px] px-1.5 py-0.5 bg-orange-200 text-orange-700 rounded"
                          >
                            {flag.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              {sheet.score?.correct || 0} Correct
            </span>
            <span className="flex items-center gap-1">
              <XCircle className="w-4 h-4 text-red-500" />
              {sheet.score?.wrong || 0} Wrong
            </span>
            <span className="flex items-center gap-1 text-gray-500">
              {sheet.score?.unanswered || 0} Unanswered
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Processed in {sheet.processingTime}ms
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
