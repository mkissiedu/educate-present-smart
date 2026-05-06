import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, X, FolderOpen, FileImage, CheckCircle2, XCircle, 
  AlertCircle, Users, Play, Pause, RotateCcw, FileText,
  Search, ArrowRight, Loader2, Download
} from 'lucide-react';
import { 
  OMRSheetConfig, BulkOMRScanItem, BulkOMRImportJob, 
  OMRScanResult, getOMRGrade, IndicatorResult 
} from '@/types/omr-scanner';
import { processOMRScan } from '@/lib/supabase-omr';
import { cn } from '@/lib/utils';

interface Props {
  config: OMRSheetConfig;
  students: { id: string; name: string; index?: string }[];
  termId: string;
  schoolId: string;
  teacherId: string;
  onClose: () => void;
  onComplete?: (results: OMRScanResult[]) => void;
}

type ImportStep = 'upload' | 'match' | 'process' | 'complete';

export function BulkOMRImporter({ config, students, termId, schoolId, teacherId, onClose, onComplete }: Props) {
  const [step, setStep] = useState<ImportStep>('upload');
  const [files, setFiles] = useState<File[]>([]);
  const [scanItems, setScanItems] = useState<BulkOMRScanItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedResults, setCompletedResults] = useState<OMRScanResult[]>([]);
  const [manualAnswers, setManualAnswers] = useState<Map<string, Map<number, string>>>(new Map());
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const options = config.options_per_question === 5 ? ['A', 'B', 'C', 'D', 'E'] : ['A', 'B', 'C', 'D'];

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).filter(
      f => f.type.startsWith('image/')
    );
    if (selectedFiles.length > 0) {
      setFiles(prev => [...prev, ...selectedFiles]);
      initializeScanItems(selectedFiles);
    }
  };

  // Initialize scan items from files
  const initializeScanItems = (newFiles: File[]) => {
    const newItems: BulkOMRScanItem[] = newFiles.map(file => {
      // Try to extract student index from filename
      const filename = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
      const indexMatch = filename.match(/(\d{4,})/); // Look for 4+ digit number
      const detectedIndex = indexMatch ? indexMatch[1] : undefined;
      
      // Try to match student by index
      let matchedStudent = detectedIndex 
        ? students.find(s => s.index === detectedIndex)
        : undefined;
      
      // If no index match, try name matching
      if (!matchedStudent) {
        const normalizedFilename = filename.toLowerCase().replace(/[_-]/g, ' ');
        matchedStudent = students.find(s => 
          normalizedFilename.includes(s.name.toLowerCase()) ||
          s.name.toLowerCase().includes(normalizedFilename)
        );
      }

      return {
        filename: file.name,
        student_id: matchedStudent?.id,
        student_name: matchedStudent?.name,
        student_index: matchedStudent?.index || detectedIndex,
        status: matchedStudent ? 'pending' : 'unmatched',
        matched_by: matchedStudent ? (detectedIndex ? 'index' : 'name') : undefined
      };
    });

    setScanItems(prev => [...prev, ...newItems]);
  };

  // Remove a file
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setScanItems(prev => prev.filter((_, i) => i !== index));
  };

  // Manually assign student to a file
  const assignStudent = (fileIndex: number, studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setScanItems(prev => prev.map((item, i) => 
        i === fileIndex 
          ? { 
              ...item, 
              student_id: student.id, 
              student_name: student.name, 
              student_index: student.index,
              status: 'pending',
              matched_by: 'manual'
            }
          : item
      ));
    }
  };

  // Set answer for a question in manual entry
  const setAnswer = (filename: string, questionNumber: number, option: string) => {
    setManualAnswers(prev => {
      const newMap = new Map(prev);
      const fileAnswers = newMap.get(filename) || new Map();
      if (fileAnswers.get(questionNumber) === option) {
        fileAnswers.delete(questionNumber);
      } else {
        fileAnswers.set(questionNumber, option);
      }
      newMap.set(filename, fileAnswers);
      return newMap;
    });
  };

  // Process all matched files
  const processAllFiles = async () => {
    setProcessing(true);
    setStep('process');
    const results: OMRScanResult[] = [];
    
    for (let i = 0; i < scanItems.length; i++) {
      const item = scanItems[i];
      setCurrentIndex(i);
      
      if (item.status === 'unmatched' || !item.student_id) {
        setScanItems(prev => prev.map((it, idx) => 
          idx === i ? { ...it, status: 'error', error_message: 'No student matched' } : it
        ));
        continue;
      }

      setScanItems(prev => prev.map((it, idx) => 
        idx === i ? { ...it, status: 'processing' } : it
      ));

      try {
        // Get answers for this file (from manual entry)
        const fileAnswers = manualAnswers.get(item.filename) || new Map();
        
        // Build answers array
        const answersArray = config.questions.map(q => ({
          questionNumber: q.number,
          questionId: q.question_id,
          selectedOption: fileAnswers.get(q.number) || null,
          correctOption: q.correct_option,
          indicatorCode: q.indicator_code,
          indicatorText: q.indicator_text,
          strand: q.strand,
          subStrand: q.sub_strand,
          marks: q.marks
        }));

        // Process and save
        const result = await processOMRScan(
          item.student_id,
          item.student_name || '',
          config.test_paper_id,
          config.class_name,
          config.subject,
          config.grade_level,
          termId,
          schoolId,
          teacherId,
          answersArray
        );

        if (result) {
          results.push(result);
          setScanItems(prev => prev.map((it, idx) => 
            idx === i ? { ...it, status: 'success', scan_result: result } : it
          ));
        } else {
          setScanItems(prev => prev.map((it, idx) => 
            idx === i ? { ...it, status: 'error', error_message: 'Failed to save result' } : it
          ));
        }
      } catch (error) {
        setScanItems(prev => prev.map((it, idx) => 
          idx === i ? { ...it, status: 'error', error_message: String(error) } : it
        ));
      }

      // Small delay between processing
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setCompletedResults(results);
    setProcessing(false);
    setStep('complete');
    onComplete?.(results);
  };

  // Calculate statistics
  const matchedCount = scanItems.filter(i => i.student_id).length;
  const unmatchedCount = scanItems.filter(i => !i.student_id).length;
  const successCount = scanItems.filter(i => i.status === 'success').length;
  const errorCount = scanItems.filter(i => i.status === 'error').length;
  const progress = scanItems.length > 0 ? Math.round((currentIndex / scanItems.length) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Upload className="w-6 h-6" />
              Bulk OMR Import
            </h2>
            <p className="text-sm opacity-90">{config.title} | {config.subject} | {config.class_name}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[
              { key: 'upload', label: 'Upload Files', icon: Upload },
              { key: 'match', label: 'Match Students', icon: Users },
              { key: 'process', label: 'Process', icon: Play },
              { key: 'complete', label: 'Complete', icon: CheckCircle2 }
            ].map((s, i) => (
              <div key={s.key} className="flex items-center">
                <div className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg",
                  step === s.key && "bg-blue-100 text-blue-700",
                  ['upload', 'match', 'process', 'complete'].indexOf(step) > i && "text-green-600"
                )}>
                  <s.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{s.label}</span>
                </div>
                {i < 3 && <ArrowRight className="w-4 h-4 mx-2 text-gray-400" />}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Upload Step */}
          {step === 'upload' && (
            <div>
              {/* Upload Area */}
              <div 
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => folderInputRef.current?.click()}
              >
                <FolderOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload Scanned OMR Sheets</h3>
                <p className="text-gray-500 mb-4">
                  Select multiple images or an entire folder of scanned answer sheets
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                    <FileImage className="w-4 h-4 mr-2" />
                    Select Files
                  </Button>
                  <Button variant="outline" onClick={(e) => { e.stopPropagation(); folderInputRef.current?.click(); }}>
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Select Folder
                  </Button>
                </div>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  multiple
                  className="hidden" 
                  onChange={handleFileSelect}
                />
                <input 
                  ref={folderInputRef}
                  type="file" 
                  accept="image/*" 
                  multiple
                  // @ts-ignore - webkitdirectory is not in types
                  webkitdirectory=""
                  className="hidden" 
                  onChange={handleFileSelect}
                />
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold">{files.length} Files Selected</h3>
                    <Button variant="ghost" size="sm" onClick={() => { setFiles([]); setScanItems([]); }}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  </div>
                  <div className="border rounded-lg max-h-64 overflow-auto">
                    {files.map((file, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-2 border-b last:border-b-0 hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <FileImage className="w-5 h-5 text-blue-500" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {scanItems[i]?.student_name ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              {scanItems[i].student_name}
                            </span>
                          ) : (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                              Unmatched
                            </span>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => removeFile(i)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Tips for Best Results</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Name files with student index numbers (e.g., "12345.jpg") for automatic matching</li>
                  <li>• Ensure scanned images are clear and well-lit</li>
                  <li>• Supported formats: JPG, PNG, JPEG</li>
                  <li>• You can manually match unmatched files in the next step</li>
                </ul>
              </div>

              {/* Continue Button */}
              {files.length > 0 && (
                <div className="mt-6 flex justify-end">
                  <Button onClick={() => setStep('match')} size="lg">
                    Continue to Match Students
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Match Step */}
          {step === 'match' && (
            <div>
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-blue-600">{files.length}</p>
                  <p className="text-sm text-gray-600">Total Files</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">{matchedCount}</p>
                  <p className="text-sm text-gray-600">Matched</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-yellow-600">{unmatchedCount}</p>
                  <p className="text-sm text-gray-600">Need Matching</p>
                </div>
              </div>

              {/* Matching Table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">File</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Detected Index</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Matched Student</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Match Method</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {scanItems.map((item, i) => (
                      <tr key={i} className={cn(
                        "hover:bg-gray-50",
                        !item.student_id && "bg-yellow-50"
                      )}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <FileImage className="w-4 h-4 text-blue-500" />
                            <span className="text-sm truncate max-w-[150px]">{item.filename}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm">
                          {item.student_index || '-'}
                        </td>
                        <td className="px-4 py-3">
                          {item.student_id ? (
                            <span className="text-sm font-medium">{item.student_name}</span>
                          ) : (
                            <Select onValueChange={(v) => assignStudent(i, v)}>
                              <SelectTrigger className="w-48">
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
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {item.matched_by && (
                            <span className={cn(
                              "text-xs px-2 py-1 rounded",
                              item.matched_by === 'index' && "bg-green-100 text-green-700",
                              item.matched_by === 'name' && "bg-blue-100 text-blue-700",
                              item.matched_by === 'manual' && "bg-purple-100 text-purple-700"
                            )}>
                              {item.matched_by === 'index' ? 'By Index' : 
                               item.matched_by === 'name' ? 'By Name' : 'Manual'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {item.student_id ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Manual Answer Entry Section */}
              <div className="mt-6 border rounded-lg p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Enter Answers for Each Student
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Since automated scanning requires computer vision, please enter the answers manually for each student.
                </p>
                
                <div className="space-y-4 max-h-96 overflow-auto">
                  {scanItems.filter(item => item.student_id).map((item, itemIdx) => (
                    <div key={item.filename} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">{item.student_name}</span>
                          <span className="text-sm text-gray-500">({item.filename})</span>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {(manualAnswers.get(item.filename)?.size || 0)}/{config.total_questions} answered
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                        {config.questions.map(q => {
                          const selectedAnswer = manualAnswers.get(item.filename)?.get(q.number);
                          return (
                            <div key={q.number} className="text-center">
                              <span className="text-xs font-bold text-gray-500">{q.number}</span>
                              <div className="flex gap-0.5 justify-center mt-1">
                                {options.map(opt => (
                                  <button
                                    key={opt}
                                    onClick={() => setAnswer(item.filename, q.number, opt)}
                                    className={cn(
                                      "w-5 h-5 rounded-full text-[10px] font-semibold transition-all",
                                      selectedAnswer === opt 
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-200 hover:bg-gray-300 text-gray-600"
                                    )}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => setStep('upload')}>
                  Back
                </Button>
                <Button 
                  onClick={processAllFiles} 
                  disabled={matchedCount === 0}
                  size="lg"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Process {matchedCount} Files
                </Button>
              </div>
            </div>
          )}

          {/* Processing Step */}
          {step === 'process' && (
            <div className="text-center py-8">
              <Loader2 className="w-16 h-16 mx-auto text-blue-600 animate-spin mb-4" />
              <h3 className="text-xl font-semibold mb-2">Processing Scanned Sheets</h3>
              <p className="text-gray-500 mb-6">
                Processing {currentIndex + 1} of {scanItems.length} files...
              </p>
              
              <div className="max-w-md mx-auto mb-6">
                <Progress value={progress} className="h-3" />
                <p className="text-sm text-gray-500 mt-2">{progress}% Complete</p>
              </div>

              {/* Current Item */}
              {scanItems[currentIndex] && (
                <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
                  <p className="font-medium">{scanItems[currentIndex].student_name}</p>
                  <p className="text-sm text-gray-500">{scanItems[currentIndex].filename}</p>
                </div>
              )}
            </div>
          )}

          {/* Complete Step */}
          {step === 'complete' && (
            <div>
              {/* Success Summary */}
              <div className="text-center mb-8">
                <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-2xl font-bold mb-2">Bulk Import Complete!</h3>
                <p className="text-gray-500">
                  Successfully processed {successCount} of {scanItems.length} answer sheets
                </p>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-blue-600">{scanItems.length}</p>
                  <p className="text-sm text-gray-600">Total Files</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">{successCount}</p>
                  <p className="text-sm text-gray-600">Successful</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-red-500">{errorCount}</p>
                  <p className="text-sm text-gray-600">Failed</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-purple-600">
                    {completedResults.length > 0 
                      ? Math.round(completedResults.reduce((sum, r) => sum + r.percentage, 0) / completedResults.length)
                      : 0}%
                  </p>
                  <p className="text-sm text-gray-600">Class Average</p>
                </div>
              </div>

              {/* Results Table */}
              <div className="border rounded-lg overflow-hidden mb-6">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Student</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Score</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Percentage</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Grade</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {scanItems.map((item, i) => (
                      <tr key={i} className={cn(
                        "hover:bg-gray-50",
                        item.status === 'error' && "bg-red-50"
                      )}>
                        <td className="px-4 py-3 text-sm">{i + 1}</td>
                        <td className="px-4 py-3 font-medium">{item.student_name || item.filename}</td>
                        <td className="px-4 py-3 text-center">
                          {item.scan_result ? (
                            <span>
                              <span className="text-green-600">{item.scan_result.correct_answers}</span>
                              <span className="text-gray-400">/</span>
                              <span>{item.scan_result.total_questions}</span>
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-3 text-center font-semibold">
                          {item.scan_result?.percentage ?? '-'}%
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.scan_result && (
                            <span className={cn(
                              "px-3 py-1 rounded-full text-sm font-semibold",
                              item.scan_result.grade === 'M' && "bg-green-100 text-green-700",
                              item.scan_result.grade === 'P' && "bg-blue-100 text-blue-700",
                              item.scan_result.grade === 'AP' && "bg-yellow-100 text-yellow-700",
                              item.scan_result.grade === 'D' && "bg-red-100 text-red-700"
                            )}>
                              {item.scan_result.grade}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.status === 'success' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <XCircle className="w-5 h-5 text-red-500" />
                              <span className="text-xs text-red-500">{item.error_message}</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-3 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {students.length} students in class | {config.total_questions} questions
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              M (80%+)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              P (66-79%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              AP (50-65%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              D (&lt;50%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
