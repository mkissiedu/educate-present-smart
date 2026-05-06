import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  X, Search, Download, BarChart3, CheckCircle2, XCircle, 
  TrendingUp, Users, FileText, Printer, Filter
} from 'lucide-react';
import { OMRScanResult, IndicatorResult, OMR_GRADE_THRESHOLDS } from '@/types/omr-scanner';
import { getTestPaperOMRResults, getClassOMRSummary, getStudentIndicatorReport } from '@/lib/supabase-omr';
import { cn } from '@/lib/utils';

interface Props {
  testPaperId: string;
  testPaperTitle: string;
  className: string;
  subject: string;
  termId: string;
  schoolId: string;
  onClose: () => void;
}

type ViewMode = 'students' | 'indicators' | 'individual';

export function OMRResultsViewer({ testPaperId, testPaperTitle, className, subject, termId, schoolId, onClose }: Props) {
  const [results, setResults] = useState<OMRScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<OMRScanResult | null>(null);
  const [classSummary, setClassSummary] = useState<{
    totalStudents: number;
    averageScore: number;
    gradeDistribution: { M: number; P: number; AP: number; D: number };
    indicatorSummary: { code: string; text: string; metCount: number; totalCount: number; percentage: number }[];
  } | null>(null);

  useEffect(() => {
    loadResults();
  }, [testPaperId]);

  const loadResults = async () => {
    setLoading(true);
    const [resultsData, summaryData] = await Promise.all([
      getTestPaperOMRResults(testPaperId),
      getClassOMRSummary(className, subject, termId, schoolId)
    ]);
    setResults(resultsData);
    setClassSummary(summaryData);
    setLoading(false);
  };

  const filteredResults = results.filter(r => 
    r.student_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  const exportCSV = () => {
    const headers = ['Student Name', 'Score', 'Percentage', 'Grade', 'Correct', 'Wrong', 'Unanswered'];
    const rows = results.map(r => [
      r.student_name,
      `${r.marks_obtained}/${r.total_marks}`,
      `${r.percentage}%`,
      r.grade,
      r.correct_answers,
      r.wrong_answers,
      r.unanswered
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OMR_Results_${testPaperTitle.replace(/\s+/g, '_')}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              OMR Scan Results
            </h2>
            <p className="text-sm text-gray-500">{testPaperTitle} | {className} | {subject}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Class Summary */}
        {classSummary && classSummary.totalStudents > 0 && (
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{classSummary.totalStudents}</p>
                <p className="text-sm text-gray-600">Students Scanned</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-indigo-600">{Math.round(classSummary.averageScore)}%</p>
                <p className="text-sm text-gray-600">Class Average</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{classSummary.gradeDistribution.M}</p>
                <p className="text-sm text-gray-600">Mastery (M)</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{classSummary.gradeDistribution.P}</p>
                <p className="text-sm text-gray-600">Proficient (P)</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-500">
                  {classSummary.gradeDistribution.AP + classSummary.gradeDistribution.D}
                </p>
                <p className="text-sm text-gray-600">Need Support</p>
              </div>
            </div>
          </div>
        )}

        {/* View Mode Tabs */}
        <div className="px-6 py-3 border-b flex gap-2">
          <Button 
            variant={viewMode === 'students' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => { setViewMode('students'); setSelectedStudent(null); }}
          >
            <Users className="w-4 h-4 mr-2" />
            Student Results
          </Button>
          <Button 
            variant={viewMode === 'indicators' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => { setViewMode('indicators'); setSelectedStudent(null); }}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Indicator Analysis
          </Button>
          {selectedStudent && (
            <Button 
              variant={viewMode === 'individual' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('individual')}
            >
              <FileText className="w-4 h-4 mr-2" />
              {selectedStudent.student_name}
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Student Results View */}
          {viewMode === 'students' && (
            <div>
              {/* Search */}
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Results Table */}
              {filteredResults.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No scan results found</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Student Name</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">Score</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">Percentage</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">Grade</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">Indicators Met</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredResults.map((r, idx) => {
                        const indicatorsMet = (r.indicator_results as IndicatorResult[]).filter(i => i.is_met).length;
                        const totalIndicators = (r.indicator_results as IndicatorResult[]).length;
                        
                        return (
                          <tr key={r.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">{idx + 1}</td>
                            <td className="px-4 py-3 font-medium">{r.student_name}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-green-600">{r.correct_answers}</span>
                              <span className="text-gray-400">/</span>
                              <span>{r.total_questions}</span>
                            </td>
                            <td className="px-4 py-3 text-center font-semibold">{r.percentage}%</td>
                            <td className="px-4 py-3 text-center">
                              <span className={cn(
                                "px-3 py-1 rounded-full text-sm font-semibold",
                                r.grade === 'M' && "bg-green-100 text-green-700",
                                r.grade === 'P' && "bg-blue-100 text-blue-700",
                                r.grade === 'AP' && "bg-yellow-100 text-yellow-700",
                                r.grade === 'D' && "bg-red-100 text-red-700"
                              )}>
                                {r.grade}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={cn(
                                "font-medium",
                                indicatorsMet === totalIndicators ? "text-green-600" : "text-gray-600"
                              )}>
                                {indicatorsMet}/{totalIndicators}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => { setSelectedStudent(r); setViewMode('individual'); }}
                              >
                                View Details
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Indicator Analysis View */}
          {viewMode === 'indicators' && classSummary && (
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                NaCCA Curriculum Indicator Performance
              </h3>

              {classSummary.indicatorSummary.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No indicator data available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {classSummary.indicatorSummary.map(ind => (
                    <div key={ind.code} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-mono text-sm font-semibold text-blue-600">{ind.code}</span>
                          <p className="text-sm text-gray-600 mt-1">{ind.text}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{ind.percentage}%</p>
                          <p className="text-sm text-gray-500">{ind.metCount}/{ind.totalCount} students met</p>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all",
                            ind.percentage >= 80 && "bg-green-500",
                            ind.percentage >= 66 && ind.percentage < 80 && "bg-blue-500",
                            ind.percentage >= 50 && ind.percentage < 66 && "bg-yellow-500",
                            ind.percentage < 50 && "bg-red-500"
                          )}
                          style={{ width: `${ind.percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>0%</span>
                        <span className={cn(
                          "font-medium",
                          ind.percentage >= 50 ? "text-green-600" : "text-red-500"
                        )}>
                          {ind.percentage >= 50 ? 'Standard Met' : 'Needs Intervention'}
                        </span>
                        <span>100%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Individual Student View */}
          {viewMode === 'individual' && selectedStudent && (
            <div className="print:block">
              {/* Student Header */}
              <div className={cn(
                "p-6 rounded-lg text-white mb-6",
                selectedStudent.grade === 'M' && "bg-green-600",
                selectedStudent.grade === 'P' && "bg-blue-600",
                selectedStudent.grade === 'AP' && "bg-yellow-500",
                selectedStudent.grade === 'D' && "bg-red-500"
              )}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold">{selectedStudent.student_name}</h3>
                    <p className="opacity-90">{selectedStudent.class_name} | {selectedStudent.subject}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-5xl font-bold">{selectedStudent.percentage}%</p>
                    <p className="text-lg">{OMR_GRADE_THRESHOLDS[selectedStudent.grade as keyof typeof OMR_GRADE_THRESHOLDS].label}</p>
                  </div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-gray-800">{selectedStudent.total_questions}</p>
                  <p className="text-sm text-gray-600">Total Questions</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">{selectedStudent.correct_answers}</p>
                  <p className="text-sm text-gray-600">Correct</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-red-500">{selectedStudent.wrong_answers}</p>
                  <p className="text-sm text-gray-600">Wrong</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-gray-400">{selectedStudent.unanswered}</p>
                  <p className="text-sm text-gray-600">Unanswered</p>
                </div>
              </div>

              {/* Indicator Results */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    NaCCA Curriculum Standards Achievement
                  </h4>
                </div>
                <div className="divide-y">
                  {(selectedStudent.indicator_results as IndicatorResult[]).map(ir => (
                    <div key={ir.indicator_code} className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {ir.is_met ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-500" />
                        )}
                        <div>
                          <p className="font-mono text-sm font-semibold">{ir.indicator_code}</p>
                          <p className="text-sm text-gray-600">{ir.indicator_text}</p>
                          <p className="text-xs text-gray-400">{ir.strand} &gt; {ir.sub_strand}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-lg font-bold",
                          ir.is_met ? "text-green-600" : "text-red-500"
                        )}>
                          {ir.percentage}%
                        </p>
                        <p className="text-xs text-gray-500">
                          {ir.correct_count}/{ir.questions_count} correct
                        </p>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          ir.is_met ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        )}>
                          {ir.is_met ? 'Standard Met' : 'Not Met'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scanned Info */}
              <div className="mt-4 text-sm text-gray-500 text-right">
                Scanned on {new Date(selectedStudent.scanned_at).toLocaleString()}
              </div>
            </div>
          )}
        </div>

        {/* Grade Legend */}
        <div className="border-t px-6 py-3 bg-gray-50 flex items-center justify-center gap-6 text-sm">
          <span className="font-medium text-gray-600">Grade Scale:</span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            M (80%+) Mastery
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            P (66-79%) Proficiency
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            AP (50-65%) Approaching
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            D (&lt;50%) Developing
          </span>
        </div>
      </div>
    </div>
  );
}
