import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Camera, X, Check, AlertCircle, Upload, RotateCcw, 
  Scan, CheckCircle2, XCircle, Save, Users 
} from 'lucide-react';
import { OMRSheetConfig, OMRQuestion, ScanDetection, getOMRGrade, OMR_GRADE_THRESHOLDS } from '@/types/omr-scanner';
import { processOMRScan } from '@/lib/supabase-omr';
import { cn } from '@/lib/utils';

interface Props {
  config: OMRSheetConfig;
  students: { id: string; name: string; index?: string }[];
  termId: string;
  schoolId: string;
  teacherId: string;
  onClose: () => void;
  onScanComplete?: () => void;
}

type ScanMode = 'camera' | 'upload' | 'manual';

export function OMRScanner({ config, students, termId, schoolId, teacherId, onClose, onScanComplete }: Props) {
  const [mode, setMode] = useState<ScanMode>('manual');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [answers, setAnswers] = useState<Map<number, string>>(new Map());
  const [processing, setProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<{
    correct: number;
    wrong: number;
    unanswered: number;
    percentage: number;
    grade: string;
    indicatorResults: { code: string; text: string; met: boolean; percentage: number }[];
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const options = config.options_per_question === 5 ? ['A', 'B', 'C', 'D', 'E'] : ['A', 'B', 'C', 'D'];

  // Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Unable to access camera. Please use manual entry or upload an image.');
      setMode('manual');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [mode]);

  // Capture image from camera
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageData);
        processImage(imageData);
      }
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setCapturedImage(imageData);
        processImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  // Process image (simplified - in production would use computer vision)
  const processImage = async (imageData: string) => {
    setProcessing(true);
    setError(null);

    // Simulated processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real implementation, this would:
    // 1. Detect alignment markers
    // 2. Correct perspective
    // 3. Locate bubble grid
    // 4. Analyze each bubble's fill level
    // 5. Determine selected answers

    // For now, show manual entry with the captured image as reference
    setProcessing(false);
    setError('Image captured. Please verify and enter answers manually below, or use the manual entry mode for accurate results.');
  };

  // Set answer for a question
  const setAnswer = (questionNumber: number, option: string) => {
    const newAnswers = new Map(answers);
    if (newAnswers.get(questionNumber) === option) {
      newAnswers.delete(questionNumber);
    } else {
      newAnswers.set(questionNumber, option);
    }
    setAnswers(newAnswers);
    setScanResult(null);
    setSaved(false);
  };

  // Calculate results
  const calculateResults = () => {
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;
    let totalMarks = 0;
    let marksObtained = 0;

    const indicatorMap = new Map<string, { code: string; text: string; correct: number; total: number }>();

    config.questions.forEach(q => {
      const selected = answers.get(q.number);
      totalMarks += q.marks;

      if (!selected) {
        unanswered++;
      } else if (selected === q.correct_option) {
        correct++;
        marksObtained += q.marks;
      } else {
        wrong++;
      }

      // Track indicator results
      if (q.indicator_code) {
        const existing = indicatorMap.get(q.indicator_code);
        const isCorrect = selected === q.correct_option;
        if (existing) {
          existing.total++;
          if (isCorrect) existing.correct++;
        } else {
          indicatorMap.set(q.indicator_code, {
            code: q.indicator_code,
            text: q.indicator_text || '',
            correct: isCorrect ? 1 : 0,
            total: 1
          });
        }
      }
    });

    const percentage = totalMarks > 0 ? Math.round((marksObtained / totalMarks) * 100) : 0;
    const grade = getOMRGrade(percentage);

    const indicatorResults = Array.from(indicatorMap.values()).map(i => ({
      code: i.code,
      text: i.text,
      percentage: Math.round((i.correct / i.total) * 100),
      met: (i.correct / i.total) >= 0.5
    }));

    setScanResult({ correct, wrong, unanswered, percentage, grade, indicatorResults });
  };

  // Save results to database
  const saveResults = async () => {
    if (!selectedStudent || !scanResult) return;

    setSaving(true);
    setError(null);

    const student = students.find(s => s.id === selectedStudent);
    if (!student) {
      setError('Please select a student');
      setSaving(false);
      return;
    }

    const answersArray = config.questions.map(q => ({
      questionNumber: q.number,
      questionId: q.question_id,
      selectedOption: answers.get(q.number) || null,
      correctOption: q.correct_option,
      indicatorCode: q.indicator_code,
      indicatorText: q.indicator_text,
      strand: q.strand,
      subStrand: q.sub_strand,
      marks: q.marks
    }));

    const result = await processOMRScan(
      student.id,
      student.name,
      config.test_paper_id,
      config.class_name,
      config.subject,
      config.grade_level,
      termId,
      schoolId,
      teacherId,
      answersArray,
      capturedImage || undefined
    );

    if (result) {
      setSaved(true);
      onScanComplete?.();
    } else {
      setError('Failed to save results. Please try again.');
    }

    setSaving(false);
  };

  // Reset for next student
  const resetForNextStudent = () => {
    setSelectedStudent('');
    setAnswers(new Map());
    setScanResult(null);
    setSaved(false);
    setCapturedImage(null);
    setError(null);
  };

  const questionsPerColumn = Math.ceil(config.total_questions / 2);
  const leftQuestions = config.questions.slice(0, questionsPerColumn);
  const rightQuestions = config.questions.slice(questionsPerColumn);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[95vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Scan className="w-6 h-6 text-blue-600" />
              OMR Scanner - {config.title}
            </h2>
            <p className="text-sm text-gray-500">{config.subject} | {config.total_questions} Questions</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          {/* Mode Selection */}
          <div className="flex gap-2 mb-6">
            <Button 
              variant={mode === 'manual' ? 'default' : 'outline'}
              onClick={() => setMode('manual')}
              className="flex-1"
            >
              <Users className="w-4 h-4 mr-2" />
              Manual Entry
            </Button>
            <Button 
              variant={mode === 'camera' ? 'default' : 'outline'}
              onClick={() => setMode('camera')}
              className="flex-1"
            >
              <Camera className="w-4 h-4 mr-2" />
              Camera Scan
            </Button>
            <Button 
              variant={mode === 'upload' ? 'default' : 'outline'}
              onClick={() => { setMode('upload'); fileInputRef.current?.click(); }}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Image
            </Button>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileUpload}
            />
          </div>

          {/* Camera View */}
          {mode === 'camera' && !capturedImage && (
            <div className="mb-6">
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
                {/* Overlay guide */}
                <div className="absolute inset-4 border-2 border-dashed border-white/50 rounded-lg pointer-events-none">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-400" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-400" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-400" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-400" />
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                  <Button onClick={captureImage} size="lg" className="bg-green-600 hover:bg-green-700">
                    <Camera className="w-5 h-5 mr-2" />
                    Capture
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-500 text-center mt-2">
                Align the answer sheet within the green corners and capture
              </p>
            </div>
          )}

          {/* Captured Image Preview */}
          {capturedImage && (
            <div className="mb-6">
              <div className="relative">
                <img src={capturedImage} alt="Captured" className="max-h-48 mx-auto rounded-lg" />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="absolute top-2 right-2"
                  onClick={() => { setCapturedImage(null); setError(null); }}
                >
                  <RotateCcw className="w-4 h-4 mr-1" /> Retake
                </Button>
              </div>
            </div>
          )}

          {/* Processing Indicator */}
          {processing && (
            <div className="text-center py-8">
              <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600">Processing image...</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
          )}

          {/* Student Selection */}
          <div className="mb-6">
            <Label className="text-base font-semibold">Select Student</Label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose a student..." />
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

          {/* Hidden Canvas for image processing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Manual Answer Entry Grid */}
          {!processing && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-4">Answer Entry</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-2">
                  {leftQuestions.map(q => (
                    <AnswerRow 
                      key={q.number}
                      question={q}
                      options={options}
                      selectedAnswer={answers.get(q.number)}
                      onSelect={(opt) => setAnswer(q.number, opt)}
                      showResult={scanResult !== null}
                    />
                  ))}
                </div>

                {/* Right Column */}
                <div className="space-y-2">
                  {rightQuestions.map(q => (
                    <AnswerRow 
                      key={q.number}
                      question={q}
                      options={options}
                      selectedAnswer={answers.get(q.number)}
                      onSelect={(opt) => setAnswer(q.number, opt)}
                      showResult={scanResult !== null}
                    />
                  ))}
                </div>
              </div>

              {/* Calculate Button */}
              <div className="mt-6 flex justify-center">
                <Button onClick={calculateResults} size="lg" disabled={answers.size === 0}>
                  <Check className="w-4 h-4 mr-2" />
                  Calculate Results
                </Button>
              </div>
            </div>
          )}

          {/* Results Display */}
          {scanResult && (
            <div className="mt-6 border rounded-lg overflow-hidden">
              {/* Score Summary */}
              <div className={cn(
                "p-6 text-white",
                scanResult.grade === 'M' && "bg-green-600",
                scanResult.grade === 'P' && "bg-blue-600",
                scanResult.grade === 'AP' && "bg-yellow-500",
                scanResult.grade === 'D' && "bg-red-500"
              )}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Overall Score</p>
                    <p className="text-4xl font-bold">{scanResult.percentage}%</p>
                    <p className="text-lg">{OMR_GRADE_THRESHOLDS[scanResult.grade as keyof typeof OMR_GRADE_THRESHOLDS].label}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex gap-4">
                      <div>
                        <p className="text-2xl font-bold">{scanResult.correct}</p>
                        <p className="text-sm opacity-90">Correct</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{scanResult.wrong}</p>
                        <p className="text-sm opacity-90">Wrong</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{scanResult.unanswered}</p>
                        <p className="text-sm opacity-90">Blank</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Indicator Results */}
              {scanResult.indicatorResults.length > 0 && (
                <div className="p-4 bg-white">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    NaCCA Curriculum Indicator Results
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-auto">
                    {scanResult.indicatorResults.map(ir => (
                      <div 
                        key={ir.code}
                        className={cn(
                          "flex items-center justify-between p-2 rounded",
                          ir.met ? "bg-green-50" : "bg-red-50"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {ir.met ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className="font-mono text-sm">{ir.code}</span>
                          <span className="text-sm text-gray-600 truncate max-w-xs">{ir.text}</span>
                        </div>
                        <span className={cn(
                          "font-semibold",
                          ir.met ? "text-green-600" : "text-red-500"
                        )}>
                          {ir.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
                {saved ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Results saved successfully!</span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    {selectedStudent ? 'Ready to save' : 'Select a student to save results'}
                  </p>
                )}
                <div className="flex gap-2">
                  {saved && (
                    <Button variant="outline" onClick={resetForNextStudent}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Next Student
                    </Button>
                  )}
                  <Button 
                    onClick={saveResults} 
                    disabled={!selectedStudent || saving || saved}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save to Gradebook
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Answer Row Component
function AnswerRow({ 
  question, 
  options, 
  selectedAnswer, 
  onSelect,
  showResult
}: { 
  question: OMRQuestion;
  options: string[];
  selectedAnswer?: string;
  onSelect: (option: string) => void;
  showResult: boolean;
}) {
  const isCorrect = selectedAnswer === question.correct_option;

  return (
    <div className={cn(
      "flex items-center gap-2 p-2 rounded",
      showResult && selectedAnswer && (isCorrect ? "bg-green-100" : "bg-red-100"),
      showResult && !selectedAnswer && "bg-gray-100"
    )}>
      <span className="w-8 font-bold text-sm">{question.number}.</span>
      <div className="flex gap-1">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className={cn(
              "w-8 h-8 rounded-full border-2 text-sm font-semibold transition-all",
              selectedAnswer === opt 
                ? "bg-blue-600 border-blue-600 text-white"
                : "border-gray-300 hover:border-blue-400",
              showResult && opt === question.correct_option && "ring-2 ring-green-500 ring-offset-1"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
      {showResult && (
        <span className="ml-2">
          {selectedAnswer ? (
            isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )
          ) : (
            <span className="text-xs text-gray-400">-</span>
          )}
        </span>
      )}
      {question.indicator_code && (
        <span className="ml-auto text-[10px] text-gray-400 font-mono">{question.indicator_code}</span>
      )}
    </div>
  );
}
