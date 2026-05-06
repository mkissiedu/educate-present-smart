import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Printer, X, Users, FileStack, QrCode, Search, 
  ChevronLeft, ChevronRight, Eye, Download, CheckCircle2,
  AlertCircle, Minus, Plus
} from 'lucide-react';
import { OMRSheetConfig, OMRQuestion } from '@/types/omr-scanner';

interface Student {
  id: string;
  name: string;
  index?: string;
}

interface Props {
  config: OMRSheetConfig;
  students: Student[];
  onClose: () => void;
}

interface SheetData {
  studentName: string;
  studentIndex: string;
  sheetNumber: number;
}

export function BulkOMRSheetGenerator({ config, students, onClose }: Props) {
  const [mode, setMode] = useState<'blank' | 'roster'>('roster');
  const [blankCopies, setBlankCopies] = useState(30);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [currentPreviewPage, setCurrentPreviewPage] = useState(0);
  const printRef = useRef<HTMLDivElement>(null);

  // Filter students based on search
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.index?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generate sheet data based on mode
  const generateSheetData = (): SheetData[] => {
    if (mode === 'blank') {
      return Array.from({ length: blankCopies }, (_, i) => ({
        studentName: '',
        studentIndex: '',
        sheetNumber: i + 1
      }));
    } else {
      return selectedStudents.map((student, i) => ({
        studentName: student.name,
        studentIndex: student.index || '',
        sheetNumber: i + 1
      }));
    }
  };

  const sheets = generateSheetData();

  const toggleStudent = (student: Student) => {
    setSelectedStudents(prev => 
      prev.find(s => s.id === student.id)
        ? prev.filter(s => s.id !== student.id)
        : [...prev, student]
    );
  };

  const selectAllStudents = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents([...filteredStudents]);
    }
  };

  const handlePrint = () => {
    setShowPreview(true);
    setTimeout(() => window.print(), 500);
  };

  const options = config.options_per_question === 5 ? ['A', 'B', 'C', 'D', 'E'] : ['A', 'B', 'C', 'D'];
  const questionsPerColumn = Math.ceil(config.total_questions / 2);

  // Print Preview Mode
  if (showPreview) {
    return (
      <div className="fixed inset-0 bg-white z-50 overflow-auto print:overflow-visible">
        {/* Print Controls - Hidden when printing */}
        <div className="print:hidden fixed top-0 left-0 right-0 bg-white border-b shadow-sm z-50 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                <X className="w-4 h-4 mr-2" /> Close Preview
              </Button>
              <span className="text-sm text-gray-600">
                Previewing {sheets.length} answer sheet{sheets.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPreviewPage === 0}
                onClick={() => setCurrentPreviewPage(p => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm px-2">
                Sheet {currentPreviewPage + 1} of {sheets.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPreviewPage === sheets.length - 1}
                onClick={() => setCurrentPreviewPage(p => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button onClick={() => window.print()} className="ml-4 bg-blue-600 hover:bg-blue-700">
                <Printer className="w-4 h-4 mr-2" />
                Print All Sheets
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Content - Shows one sheet at a time on screen */}
        <div className="print:hidden pt-20 pb-8 px-4">
          <div className="max-w-[210mm] mx-auto">
            {sheets[currentPreviewPage] && (
              <OMRSheetPage 
                config={config}
                sheetData={sheets[currentPreviewPage]}
                options={options}
                questionsPerColumn={questionsPerColumn}
              />
            )}
          </div>
        </div>

        {/* Print Content - All sheets with page breaks */}
        <div ref={printRef} className="hidden print:block">
          {sheets.map((sheet, index) => (
            <div 
              key={index} 
              className="print-sheet"
              style={{ pageBreakAfter: index < sheets.length - 1 ? 'always' : 'auto' }}
            >
              <OMRSheetPage 
                config={config}
                sheetData={sheet}
                options={options}
                questionsPerColumn={questionsPerColumn}
              />
            </div>
          ))}
        </div>

        {/* Print Styles */}
        <style>{`
          @media print {
            @page {
              size: A4;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
            }
            .print-sheet {
              width: 210mm;
              min-height: 297mm;
              padding: 0;
              margin: 0;
              box-sizing: border-box;
            }
          }
        `}</style>
      </div>
    );
  }

  // Configuration Mode
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileStack className="w-6 h-6 text-purple-600" />
            Generate Multiple OMR Answer Sheets
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Test Paper Info */}
          <div className="p-4 bg-purple-50 rounded-lg mb-6">
            <h3 className="font-semibold text-purple-800">{config.title}</h3>
            <p className="text-sm text-purple-600">
              {config.subject} - {config.grade_level} | {config.total_questions} Questions | {config.class_name}
            </p>
          </div>

          {/* Mode Selection */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card 
              className={`p-4 cursor-pointer transition-all ${
                mode === 'roster' 
                  ? 'ring-2 ring-purple-500 bg-purple-50' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setMode('roster')}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  mode === 'roster' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">From Class Roster</h4>
                  <p className="text-sm text-gray-500">Pre-fill student names & index numbers</p>
                </div>
              </div>
            </Card>

            <Card 
              className={`p-4 cursor-pointer transition-all ${
                mode === 'blank' 
                  ? 'ring-2 ring-purple-500 bg-purple-50' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setMode('blank')}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  mode === 'blank' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  <FileStack className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Blank Copies</h4>
                  <p className="text-sm text-gray-500">Students fill in their own details</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Blank Copies Mode */}
          {mode === 'blank' && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Number of Copies
                </Label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setBlankCopies(c => Math.max(1, c - 5))}
                    disabled={blankCopies <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={blankCopies}
                    onChange={(e) => setBlankCopies(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                    className="w-24 text-center text-lg font-semibold"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setBlankCopies(c => Math.min(100, c + 5))}
                    disabled={blankCopies >= 100}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Quick set: 
                  <Button variant="link" size="sm" className="px-2 h-auto" onClick={() => setBlankCopies(20)}>20</Button>
                  <Button variant="link" size="sm" className="px-2 h-auto" onClick={() => setBlankCopies(30)}>30</Button>
                  <Button variant="link" size="sm" className="px-2 h-auto" onClick={() => setBlankCopies(40)}>40</Button>
                  <Button variant="link" size="sm" className="px-2 h-auto" onClick={() => setBlankCopies(50)}>50</Button>
                </p>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Blank Sheets</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Students will need to write their name and index number on each sheet.
                      Make sure to instruct them to fill this information clearly for accurate scanning.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Roster Mode */}
          {mode === 'roster' && (
            <div className="space-y-4">
              {/* Search and Select All */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search students by name or index..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={selectAllStudents}
                >
                  {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              {/* Student List */}
              {students.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No students found in this class</p>
                  <p className="text-sm mt-1">Add students to the class roster first</p>
                </div>
              ) : (
                <ScrollArea className="h-64 border rounded-lg">
                  <div className="p-2 space-y-1">
                    {filteredStudents.map((student, index) => (
                      <div
                        key={student.id}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedStudents.find(s => s.id === student.id)
                            ? 'bg-purple-50 border border-purple-200'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                        onClick={() => toggleStudent(student)}
                      >
                        <Checkbox 
                          checked={!!selectedStudents.find(s => s.id === student.id)}
                          onCheckedChange={() => toggleStudent(student)}
                        />
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{student.name}</p>
                          {student.index && (
                            <p className="text-xs text-gray-500">Index: {student.index}</p>
                          )}
                        </div>
                        {selectedStudents.find(s => s.id === student.id) && (
                          <CheckCircle2 className="w-5 h-5 text-purple-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {/* Selection Summary */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">
                  {selectedStudents.length} of {students.length} students selected
                </span>
                {selectedStudents.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedStudents([])}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Clear Selection
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Print Tips */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Printing Tips
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Print on white A4 paper for best scanning results</li>
              <li>• Use high quality print settings (at least 300 DPI)</li>
              <li>• Ensure alignment markers (corner squares) are clearly visible</li>
              <li>• Print single-sided for easier scanning</li>
              <li>• Each sheet will print on a separate page</li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {mode === 'blank' ? (
              <span className="flex items-center gap-2">
                <FileStack className="w-4 h-4" />
                {blankCopies} blank sheet{blankCopies !== 1 ? 's' : ''} will be generated
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {selectedStudents.length} pre-filled sheet{selectedStudents.length !== 1 ? 's' : ''} will be generated
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              variant="outline"
              onClick={() => setShowPreview(true)}
              disabled={(mode === 'roster' && selectedStudents.length === 0)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button 
              onClick={handlePrint}
              disabled={(mode === 'roster' && selectedStudents.length === 0)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Printer className="w-4 h-4 mr-2" />
              Generate & Print
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Individual OMR Sheet Page Component
function OMRSheetPage({ 
  config, 
  sheetData, 
  options,
  questionsPerColumn
}: { 
  config: OMRSheetConfig;
  sheetData: SheetData;
  options: string[];
  questionsPerColumn: number;
}) {
  const leftColumnQuestions = config.questions.slice(0, questionsPerColumn);
  const rightColumnQuestions = config.questions.slice(questionsPerColumn);
  
  // Generate unique sheet ID
  const sheetId = `${config.test_paper_id.slice(0, 8)}-${sheetData.sheetNumber.toString().padStart(3, '0')}`;

  return (
    <div className="border-2 border-black bg-white relative" style={{ minHeight: '297mm', width: '210mm' }}>
      {/* Alignment Markers - Corner squares for scanner detection */}
      <div className="absolute top-2 left-2 w-6 h-6 bg-black" />
      <div className="absolute top-2 right-2 w-6 h-6 bg-black" />
      <div className="absolute bottom-2 left-2 w-6 h-6 bg-black" />
      <div className="absolute bottom-2 right-2 w-6 h-6 bg-black" />

      {/* Timing marks on left side */}
      <div className="absolute left-2 top-12 bottom-12 w-3 flex flex-col justify-between">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="w-3 h-2 bg-black" />
        ))}
      </div>

      {/* Header Section */}
      <div className="pt-10 px-12 pb-4 border-b-2 border-black">
        <div className="flex items-center justify-between mb-3">
          {config.school_logo && (
            <img src={config.school_logo} alt="Logo" className="w-14 h-14 object-contain" />
          )}
          <div className="text-center flex-1">
            <h1 className="text-lg font-bold uppercase">{config.school_name}</h1>
            <h2 className="text-base font-semibold">{config.title}</h2>
            <p className="text-sm">{config.subject} - {config.grade_level} | {config.term} {config.academic_year}</p>
          </div>
          {/* QR Code placeholder for sheet identification */}
          <div className="w-14 h-14 border border-black flex items-center justify-center text-[6px] text-center">
            <div>
              <QrCode className="w-8 h-8 mx-auto" />
              <span>{sheetId}</span>
            </div>
          </div>
        </div>

        {/* Student Info Section */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-semibold whitespace-nowrap">Student Name:</Label>
            <div className="flex-1 border-b-2 border-black h-6 flex items-end">
              <span className="text-sm">{sheetData.studentName}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm font-semibold whitespace-nowrap">Index No:</Label>
            <div className="flex-1 border-b-2 border-black h-6 flex items-end">
              <span className="text-sm">{sheetData.studentIndex}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-semibold whitespace-nowrap">Class:</Label>
            <div className="flex-1 border-b-2 border-black h-6 flex items-end">
              <span className="text-sm">{config.class_name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm font-semibold whitespace-nowrap">Date:</Label>
            <div className="flex-1 border-b-2 border-black h-6 flex items-end">
              <span className="text-sm">_______________</span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="px-12 py-3 bg-gray-100 border-b-2 border-black">
        <p className="text-xs font-semibold mb-1">INSTRUCTIONS:</p>
        <ul className="text-[10px] space-y-0.5">
          <li>• Use a dark pencil (2B or HB) to shade your answers completely</li>
          <li>• Fill the bubble completely: <span className="inline-block w-3 h-3 bg-black rounded-full mx-1 align-middle" /> NOT like this: <span className="inline-block w-3 h-3 border border-black rounded-full mx-1 align-middle" /></li>
          <li>• Erase cleanly if you need to change an answer</li>
          <li>• Do not make any stray marks on this sheet</li>
        </ul>
      </div>

      {/* Answer Grid */}
      <div className="px-12 py-4">
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-1">
            {leftColumnQuestions.map((q) => (
              <OMRRow 
                key={q.number} 
                questionNumber={q.number} 
                options={options}
                indicatorCode={q.indicator_code}
              />
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-1">
            {rightColumnQuestions.map((q) => (
              <OMRRow 
                key={q.number} 
                questionNumber={q.number} 
                options={options}
                indicatorCode={q.indicator_code}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer with sheet info */}
      <div className="absolute bottom-10 left-12 right-12 border-t-2 border-black pt-2">
        <div className="flex justify-between items-center text-[8px]">
          <span>Sheet ID: {sheetId}</span>
          <span>Sheet #{sheetData.sheetNumber}</span>
          <span>Total Questions: {config.total_questions}</span>
          <span>Generated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

// Individual OMR Row Component
function OMRRow({ 
  questionNumber, 
  options, 
  indicatorCode 
}: { 
  questionNumber: number; 
  options: string[];
  indicatorCode?: string;
}) {
  return (
    <div className="flex items-center gap-2 h-7">
      {/* Question number */}
      <div className="w-8 text-right font-bold text-sm">{questionNumber}.</div>
      
      {/* Bubbles */}
      <div className="flex gap-3">
        {options.map(opt => (
          <div key={opt} className="flex items-center gap-1">
            <span className="text-[10px] font-semibold w-3">{opt}</span>
            <div className="w-5 h-5 border-2 border-black rounded-full" />
          </div>
        ))}
      </div>

      {/* Indicator code (tiny, for reference) */}
      {indicatorCode && (
        <span className="text-[6px] text-gray-400 ml-2">{indicatorCode}</span>
      )}
    </div>
  );
}
