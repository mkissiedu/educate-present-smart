import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Printer, X, Download, QrCode } from 'lucide-react';
import { OMRSheetConfig, OMRQuestion } from '@/types/omr-scanner';

interface Props {
  config: OMRSheetConfig;
  onClose: () => void;
}

export function OMRAnswerSheet({ config, onClose }: Props) {
  const [studentName, setStudentName] = useState('');
  const [studentIndex, setStudentIndex] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const questionsPerColumn = Math.ceil(config.total_questions / 2);
  const leftColumnQuestions = config.questions.slice(0, questionsPerColumn);
  const rightColumnQuestions = config.questions.slice(questionsPerColumn);

  const handlePrint = () => {
    setShowPreview(true);
    setTimeout(() => window.print(), 500);
  };

  const options = config.options_per_question === 5 ? ['A', 'B', 'C', 'D', 'E'] : ['A', 'B', 'C', 'D'];

  // Generate unique sheet ID for tracking
  const sheetId = `${config.test_paper_id.slice(0, 8)}-${Date.now().toString(36)}`;

  if (showPreview) {
    return (
      <div className="fixed inset-0 bg-white z-50 overflow-auto print:overflow-visible">
        <Button 
          onClick={() => setShowPreview(false)} 
          className="print:hidden fixed top-4 right-4 z-50"
          variant="outline"
        >
          <X className="w-4 h-4 mr-2" /> Close Preview
        </Button>

        <div ref={printRef} className="max-w-[210mm] mx-auto p-4 print:p-0 print:m-0">
          {/* OMR Sheet */}
          <div className="border-2 border-black bg-white relative" style={{ minHeight: '297mm' }}>
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
                    <span className="text-sm">{studentName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-semibold whitespace-nowrap">Index No:</Label>
                  <div className="flex-1 border-b-2 border-black h-6 flex items-end">
                    <span className="text-sm">{studentIndex}</span>
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
                  {leftColumnQuestions.map((q, idx) => (
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
                  {rightColumnQuestions.map((q, idx) => (
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

            {/* Footer with indicator legend */}
            <div className="absolute bottom-10 left-12 right-12 border-t-2 border-black pt-2">
              <div className="flex justify-between items-center text-[8px]">
                <span>Sheet ID: {sheetId}</span>
                <span>Total Questions: {config.total_questions}</span>
                <span>Generated: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <QrCode className="w-6 h-6 text-blue-600" />
            Generate OMR Answer Sheet
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Sheet Info */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800">{config.title}</h3>
            <p className="text-sm text-blue-600">{config.subject} - {config.grade_level} | {config.total_questions} Questions</p>
          </div>

          {/* Student Info (Optional - can be filled by hand) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Student Name (Optional)</Label>
              <Input 
                value={studentName} 
                onChange={e => setStudentName(e.target.value)}
                placeholder="Leave blank for students to fill"
              />
            </div>
            <div>
              <Label>Index Number (Optional)</Label>
              <Input 
                value={studentIndex} 
                onChange={e => setStudentIndex(e.target.value)}
                placeholder="Leave blank for students to fill"
              />
            </div>
          </div>

          {/* Indicator Mapping Info */}
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Curriculum Indicator Mapping</h4>
            <p className="text-sm text-green-700 mb-2">
              This answer sheet is linked to NaCCA curriculum indicators. When scanned, 
              results will automatically track which standards each student has met.
            </p>
            <div className="text-xs text-green-600 max-h-32 overflow-auto">
              {config.questions.filter(q => q.indicator_code).slice(0, 5).map(q => (
                <div key={q.number} className="flex gap-2">
                  <span className="font-mono">Q{q.number}:</span>
                  <span>{q.indicator_code}</span>
                </div>
              ))}
              {config.questions.filter(q => q.indicator_code).length > 5 && (
                <div className="text-gray-500">...and {config.questions.filter(q => q.indicator_code).length - 5} more</div>
              )}
            </div>
          </div>

          {/* Print Instructions */}
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Printing Tips</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Print on white A4 paper for best scanning results</li>
              <li>• Use high quality print settings</li>
              <li>• Ensure alignment markers (corner squares) are clearly visible</li>
              <li>• Print one sheet per student</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
              <Printer className="w-4 h-4 mr-2" />
              Preview & Print
            </Button>
          </div>
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

// Export function to generate OMR config from test paper questions
export function generateOMRConfig(
  testPaperId: string,
  title: string,
  subject: string,
  gradeLevel: string,
  className: string,
  term: string,
  academicYear: string,
  schoolName: string,
  schoolLogo: string | undefined,
  questions: {
    id: string;
    question_text: string;
    options?: { option_text: string; is_correct: boolean }[];
    indicator_code?: string;
    indicator_text?: string;
    strand?: string;
    sub_strand?: string;
    marks: number;
  }[]
): OMRSheetConfig {
  const mcQuestions = questions.filter(q => q.options && q.options.length >= 2);
  
  const omrQuestions: OMRQuestion[] = mcQuestions.map((q, idx) => {
    const correctIndex = q.options?.findIndex(o => o.is_correct) || 0;
    const correctOption = ['A', 'B', 'C', 'D', 'E'][correctIndex] as 'A' | 'B' | 'C' | 'D' | 'E';
    
    return {
      number: idx + 1,
      question_id: q.id,
      correct_option: correctOption,
      indicator_code: q.indicator_code,
      indicator_text: q.indicator_text,
      strand: q.strand,
      sub_strand: q.sub_strand,
      marks: q.marks
    };
  });

  const maxOptions = Math.max(...mcQuestions.map(q => q.options?.length || 4));

  return {
    test_paper_id: testPaperId,
    title,
    subject,
    grade_level: gradeLevel,
    class_name: className,
    term,
    academic_year: academicYear,
    school_name: schoolName,
    school_logo: schoolLogo,
    total_questions: omrQuestions.length,
    options_per_question: maxOptions >= 5 ? 5 : 4,
    questions: omrQuestions,
    instructions: [
      'Use a dark pencil (2B or HB) to shade your answers',
      'Fill the bubble completely',
      'Erase cleanly if you need to change an answer',
      'Do not make any stray marks on this sheet'
    ]
  };
}
