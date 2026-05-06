import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, Send, Download, Printer, TrendingUp, TrendingDown, Minus,
  Award, Target, BookOpen, Calendar, Brain, Sparkles, CheckCircle,
  AlertTriangle, Clock, User, School, BarChart3, PieChart, Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { 
  getStudentMultiTermScores, 
  getStudentAttendanceForTerm,
  getStudentStandardsAchievement,
  calculateStandardsSummary,
  calculateTermComparison,
  getTermComparisonData,
  getTermsForAcademicYear,
  saveProgressReport,
  getSavedProgressReport
} from '@/lib/supabase-progress-report';
import { 
  ProgressReportData, 
  SubjectScore, 
  AIRecommendation,
  ReportGenerationOptions,
  TermComparison
} from '@/types/progress-report';
import { calculateGrade, getGradeColor, getGradeRemark, GRADE_THRESHOLDS } from '@/types/scores';
import { useBranding } from '@/contexts/BrandingContext';
import {
  TermComparisonChart,
  PerformanceTrendChart,
  GradeDistributionChart,
  StandardsMasteryChart,
  SubjectRadarChart,
  AttendanceChart
} from './ProgressReportCharts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  student: { 
    id: string; 
    name: string; 
    class: string; 
    admissionNumber?: string;
    parentPhone?: string;
    parentName?: string;
  } | null;
  term: { id: string; name: string; number: number; academicYear: string; startDate?: string; endDate?: string } | null;
  schoolId?: string;
}

export function ProgressReportGenerator({ isOpen, onClose, student, term, schoolId }: Props) {
  const { branding } = useBranding();
  const reportRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [generatingRecommendations, setGeneratingRecommendations] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Report data
  const [currentScores, setCurrentScores] = useState<SubjectScore[]>([]);
  const [termComparison, setTermComparison] = useState<TermComparison[]>([]);
  const [attendance, setAttendance] = useState({ totalDays: 0, present: 0, absent: 0, late: 0, excused: 0, percentage: 0 });
  const [standardsAchievement, setStandardsAchievement] = useState<any[]>([]);
  const [standardsSummary, setStandardsSummary] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [aiSummary, setAiSummary] = useState('');
  const [parentGuidance, setParentGuidance] = useState('');
  
  // Editable fields
  const [teacherComments, setTeacherComments] = useState('');
  const [headTeacherComments, setHeadTeacherComments] = useState('');
  const [conduct, setConduct] = useState('Good');
  const [promotionStatus, setPromotionStatus] = useState('Promoted');
  
  // Options
  const [options, setOptions] = useState<ReportGenerationOptions>({
    includeCharts: true,
    includeStandards: true,
    includeRecommendations: true,
    includeAttendance: true,
    includeTermComparison: true,
    termsToCompare: 3
  });

  useEffect(() => {
    if (isOpen && student && term) {
      loadReportData();
    }
  }, [isOpen, student, term]);

  const loadReportData = async () => {
    if (!student || !term) return;
    setLoading(true);

    try {
      // Get all terms for the academic year
      const terms = await getTermsForAcademicYear(term.academicYear);
      const termIds = terms.map(t => t.id);
      
      // Get scores for all terms
      const scoresMap = await getStudentMultiTermScores(student.id, termIds);
      
      // Get current term scores
      const currentTermScores = scoresMap.get(term.id) || [];
      
      // Get previous term scores for comparison
      const currentTermIndex = terms.findIndex(t => t.id === term.id);
      const previousTermId = currentTermIndex > 0 ? terms[currentTermIndex - 1].id : null;
      const previousScores = previousTermId ? scoresMap.get(previousTermId) || [] : [];
      
      // Calculate trends
      const scoresWithTrends = calculateTermComparison(currentTermScores, previousScores);
      setCurrentScores(scoresWithTrends);
      
      // Get term comparison data for charts
      const comparisonData = getTermComparisonData(scoresMap, terms);
      setTermComparison(comparisonData);
      
      // Get attendance
      const startDate = term.startDate || `${term.academicYear.split('/')[0]}-09-01`;
      const endDate = term.endDate || new Date().toISOString().split('T')[0];
      const attendanceData = await getStudentAttendanceForTerm(student.id, startDate, endDate);
      setAttendance(attendanceData);
      
      // Get standards achievement
      const standards = await getStudentStandardsAchievement(student.id, term.id);
      setStandardsAchievement(standards);
      
      // Calculate standards summary
      const summary = calculateStandardsSummary(standards);
      setStandardsSummary(summary);
      
      // Load saved report if exists
      const savedReport = await getSavedProgressReport(student.id, term.id);
      if (savedReport) {
        setTeacherComments(savedReport.teacher_comments || '');
        setHeadTeacherComments(savedReport.head_teacher_comments || '');
        setConduct(savedReport.conduct || 'Good');
        setPromotionStatus(savedReport.promotion_status || 'Promoted');
        if (savedReport.ai_recommendations) {
          const aiData = savedReport.ai_recommendations;
          setRecommendations(aiData.recommendations || []);
          setAiSummary(aiData.overallSummary || '');
          setParentGuidance(aiData.parentGuidance || '');
        }
      }
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIRecommendations = async () => {
    if (!student || !term) return;
    setGeneratingRecommendations(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-progress-recommendations', {
        body: {
          studentName: student.name,
          className: student.class,
          currentScores,
          attendance,
          standardsSummary,
          termName: term.name
        }
      });

      if (error) throw error;

      if (data) {
        setRecommendations(data.recommendations || []);
        setAiSummary(data.overallSummary || '');
        setParentGuidance(data.parentGuidance || '');
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setGeneratingRecommendations(false);
    }
  };

  const handleSaveReport = async () => {
    if (!student || !term) return;
    
    await saveProgressReport(student.id, term.id, {
      teacherComments,
      headTeacherComments,
      conduct,
      promotionStatus,
      recommendations: JSON.stringify({ recommendations, overallSummary: aiSummary, parentGuidance })
    });
  };

  const handlePrint = () => {
    const printContent = reportRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const primaryColor = branding?.primary_color || '#7c3aed';
    const schoolName = branding?.school_name || 'School';
    const schoolLogo = branding?.logo_url || '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Progress Report - ${student?.name}</title>
        <style>
          @media print { 
            .page-break { page-break-before: always; }
            .no-print { display: none !important; }
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
            color: #333;
            font-size: 12px;
            line-height: 1.5;
          }
          .header { 
            text-align: center; 
            padding: 20px; 
            border-bottom: 3px solid ${primaryColor};
            margin-bottom: 20px;
          }
          .header img { max-height: 60px; margin-bottom: 10px; }
          .header h1 { color: ${primaryColor}; font-size: 20px; margin-bottom: 5px; }
          .header h2 { font-size: 16px; color: #666; font-weight: normal; }
          .student-info {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .student-info div { font-size: 11px; }
          .student-info strong { color: ${primaryColor}; }
          .section { margin-bottom: 20px; }
          .section-title { 
            color: ${primaryColor}; 
            font-size: 14px; 
            font-weight: bold;
            border-bottom: 2px solid ${primaryColor};
            padding-bottom: 5px;
            margin-bottom: 10px;
          }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: center; font-size: 11px; }
          th { background: ${primaryColor}; color: white; }
          .grade-M { background: #d1fae5; color: #065f46; }
          .grade-P { background: #dbeafe; color: #1e40af; }
          .grade-AP { background: #fef3c7; color: #92400e; }
          .grade-D { background: #fee2e2; color: #991b1b; }
          .trend-up { color: #10b981; }
          .trend-down { color: #ef4444; }
          .attendance-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
          .attendance-item { text-align: center; padding: 10px; border-radius: 6px; }
          .recommendation { 
            padding: 10px; 
            margin-bottom: 8px; 
            border-radius: 6px;
            border-left: 4px solid ${primaryColor};
            background: #f8f9fa;
          }
          .recommendation.strength { border-left-color: #10b981; }
          .recommendation.improvement { border-left-color: #f59e0b; }
          .recommendation.action { border-left-color: #3b82f6; }
          .recommendation.goal { border-left-color: #8b5cf6; }
          .comments-box { 
            border: 1px solid #ddd; 
            padding: 15px; 
            border-radius: 6px;
            min-height: 60px;
            margin-bottom: 10px;
          }
          .signature-row {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-top: 30px;
          }
          .signature-box {
            border-top: 1px solid #333;
            padding-top: 5px;
            text-align: center;
            font-size: 11px;
          }
          .grade-legend {
            display: flex;
            gap: 15px;
            font-size: 10px;
            margin-top: 10px;
            flex-wrap: wrap;
          }
          .grade-legend span { padding: 2px 8px; border-radius: 4px; }
          .print-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${primaryColor};
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
          }
          @media print { .print-btn { display: none; } }
        </style>
      </head>
      <body>
        <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
        ${printContent.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const overallAverage = currentScores.length > 0 
    ? Math.round(currentScores.reduce((sum, s) => sum + s.total, 0) / currentScores.length) 
    : 0;
  const overallGrade = calculateGrade(overallAverage);

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'strength': return <Award className="w-4 h-4 text-green-600" />;
      case 'improvement': return <Target className="w-4 h-4 text-amber-600" />;
      case 'action': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'goal': return <Sparkles className="w-4 h-4 text-purple-600" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  if (!student || !term) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Progress Report - {student.name}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <span className="ml-3 text-gray-600">Loading report data...</span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                <TabsTrigger value="scores" className="text-xs">Scores</TabsTrigger>
                <TabsTrigger value="standards" className="text-xs">Standards</TabsTrigger>
                <TabsTrigger value="recommendations" className="text-xs">AI Insights</TabsTrigger>
                <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-purple-600" />
                      <span className="text-xs text-purple-700 font-medium">Overall Average</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-800">{overallAverage}%</div>
                    <Badge className={`mt-1 ${getGradeColor(overallGrade)}`}>
                      {overallGrade} - {getGradeRemark(overallGrade)}
                    </Badge>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-green-700 font-medium">Attendance</span>
                    </div>
                    <div className="text-2xl font-bold text-green-800">{attendance.percentage}%</div>
                    <div className="text-xs text-green-600 mt-1">
                      {attendance.present}/{attendance.totalDays} days present
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span className="text-xs text-blue-700 font-medium">Subjects</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-800">{currentScores.length}</div>
                    <div className="text-xs text-blue-600 mt-1">
                      {currentScores.filter(s => s.grade === 'M' || s.grade === 'P').length} at proficiency+
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-amber-600" />
                      <span className="text-xs text-amber-700 font-medium">Standards</span>
                    </div>
                    <div className="text-2xl font-bold text-amber-800">
                      {standardsSummary.reduce((sum, s) => sum + s.mastered + s.proficient, 0)}
                    </div>
                    <div className="text-xs text-amber-600 mt-1">
                      indicators mastered/proficient
                    </div>
                  </div>
                </div>

                {/* Charts */}
                {options.includeCharts && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <PieChart className="w-4 h-4" />
                        Grade Distribution
                      </h3>
                      <GradeDistributionChart scores={currentScores} />
                    </div>

                    <div className="bg-white border rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Subject Performance
                      </h3>
                      <SubjectRadarChart scores={currentScores} />
                    </div>

                    {options.includeTermComparison && termComparison.length > 0 && (
                      <div className="col-span-2 bg-white border rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Term-over-Term Comparison
                        </h3>
                        <TermComparisonChart data={termComparison} />
                      </div>
                    )}
                  </div>
                )}

                {/* Attendance Chart */}
                {options.includeAttendance && (
                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Attendance Breakdown
                    </h3>
                    <AttendanceChart attendance={attendance} />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="scores" className="space-y-4">
                <div className="bg-white border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-purple-600 text-white">
                        <th className="p-3 text-left text-sm">Subject</th>
                        <th className="p-2 text-center text-xs">CAT 1</th>
                        <th className="p-2 text-center text-xs">CAT 2</th>
                        <th className="p-2 text-center text-xs">CAT 3</th>
                        <th className="p-2 text-center text-xs">CAT 4</th>
                        <th className="p-2 text-center text-xs">ETE</th>
                        <th className="p-2 text-center text-xs">Total</th>
                        <th className="p-2 text-center text-xs">Grade</th>
                        <th className="p-2 text-center text-xs">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentScores.map((score, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="p-3 font-medium text-sm">{score.subject}</td>
                          <td className="p-2 text-center text-sm">{score.cat1}</td>
                          <td className="p-2 text-center text-sm">{score.cat2}</td>
                          <td className="p-2 text-center text-sm">{score.cat3}</td>
                          <td className="p-2 text-center text-sm">{score.cat4}</td>
                          <td className="p-2 text-center text-sm">{score.ete}</td>
                          <td className="p-2 text-center font-bold text-sm">{score.total}</td>
                          <td className="p-2 text-center">
                            <Badge className={getGradeColor(score.grade)}>{score.grade}</Badge>
                          </td>
                          <td className="p-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {getTrendIcon(score.trend)}
                              {score.previousTermTotal !== undefined && (
                                <span className="text-xs text-gray-500">
                                  ({score.previousTermTotal})
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-purple-100 font-bold">
                        <td className="p-3" colSpan={6}>Overall Average</td>
                        <td className="p-2 text-center">{overallAverage}</td>
                        <td className="p-2 text-center">
                          <Badge className={getGradeColor(overallGrade)}>{overallGrade}</Badge>
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Grade Legend */}
                <div className="flex flex-wrap gap-3 p-3 bg-gray-50 rounded-lg">
                  {GRADE_THRESHOLDS.map(g => (
                    <div key={g.grade} className="flex items-center gap-2 text-xs">
                      <Badge className={getGradeColor(g.grade)}>{g.grade}</Badge>
                      <span>{g.label} ({g.min}-{g.max}%)</span>
                    </div>
                  ))}
                </div>

                {/* Performance Trend Chart */}
                {currentScores.some(s => s.previousTermTotal !== undefined) && (
                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Performance Trend</h3>
                    <PerformanceTrendChart currentScores={currentScores} />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="standards" className="space-y-4">
                {standardsSummary.length > 0 ? (
                  <>
                    <div className="bg-white border rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Standards Mastery by Subject</h3>
                      <StandardsMasteryChart summaries={standardsSummary} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {standardsSummary.map((summary, index) => (
                        <div key={index} className="bg-white border rounded-lg p-4">
                          <h4 className="font-medium text-sm mb-3">{summary.subject}</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span>Mastery Rate</span>
                              <span className="font-bold">{summary.masteryPercentage}%</span>
                            </div>
                            <Progress value={summary.masteryPercentage} className="h-2" />
                            <div className="grid grid-cols-4 gap-2 mt-3 text-xs">
                              <div className="text-center p-2 bg-emerald-50 rounded">
                                <div className="font-bold text-emerald-700">{summary.mastered}</div>
                                <div className="text-emerald-600">M</div>
                              </div>
                              <div className="text-center p-2 bg-blue-50 rounded">
                                <div className="font-bold text-blue-700">{summary.proficient}</div>
                                <div className="text-blue-600">P</div>
                              </div>
                              <div className="text-center p-2 bg-amber-50 rounded">
                                <div className="font-bold text-amber-700">{summary.approachingProficiency}</div>
                                <div className="text-amber-600">AP</div>
                              </div>
                              <div className="text-center p-2 bg-red-50 rounded">
                                <div className="font-bold text-red-700">{summary.developing}</div>
                                <div className="text-red-600">D</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No standards assessments recorded yet</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-600" />
                    AI-Powered Recommendations
                  </h3>
                  <Button 
                    onClick={generateAIRecommendations} 
                    disabled={generatingRecommendations}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {generatingRecommendations ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Recommendations
                      </>
                    )}
                  </Button>
                </div>

                {aiSummary && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-medium text-purple-800 mb-2">Overall Summary</h4>
                    <p className="text-sm text-purple-700">{aiSummary}</p>
                  </div>
                )}

                {recommendations.length > 0 ? (
                  <div className="space-y-3">
                    {recommendations.map((rec, index) => (
                      <div 
                        key={index} 
                        className={`p-4 rounded-lg border-l-4 bg-gray-50 ${
                          rec.category === 'strength' ? 'border-green-500' :
                          rec.category === 'improvement' ? 'border-amber-500' :
                          rec.category === 'action' ? 'border-blue-500' :
                          'border-purple-500'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {getCategoryIcon(rec.category)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{rec.title}</span>
                              {rec.subject && (
                                <Badge variant="outline" className="text-xs">{rec.subject}</Badge>
                              )}
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  rec.priority === 'high' ? 'border-red-300 text-red-700' :
                                  rec.priority === 'medium' ? 'border-amber-300 text-amber-700' :
                                  'border-gray-300 text-gray-700'
                                }`}
                              >
                                {rec.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{rec.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Click "Generate Recommendations" to get AI-powered insights</p>
                  </div>
                )}

                {parentGuidance && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Guidance for Parents
                    </h4>
                    <p className="text-sm text-blue-700">{parentGuidance}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="preview" className="space-y-4">
                {/* Report Options */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-3">Report Options</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox 
                        checked={options.includeCharts} 
                        onCheckedChange={(checked) => setOptions({...options, includeCharts: !!checked})}
                      />
                      Include Charts
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox 
                        checked={options.includeStandards} 
                        onCheckedChange={(checked) => setOptions({...options, includeStandards: !!checked})}
                      />
                      Include Standards
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox 
                        checked={options.includeRecommendations} 
                        onCheckedChange={(checked) => setOptions({...options, includeRecommendations: !!checked})}
                      />
                      Include AI Recommendations
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox 
                        checked={options.includeAttendance} 
                        onCheckedChange={(checked) => setOptions({...options, includeAttendance: !!checked})}
                      />
                      Include Attendance
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox 
                        checked={options.includeTermComparison} 
                        onCheckedChange={(checked) => setOptions({...options, includeTermComparison: !!checked})}
                      />
                      Include Term Comparison
                    </label>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Teacher's Comments</label>
                    <Textarea 
                      value={teacherComments} 
                      onChange={(e) => setTeacherComments(e.target.value)}
                      placeholder="Enter teacher's comments..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Head Teacher's Comments</label>
                    <Textarea 
                      value={headTeacherComments} 
                      onChange={(e) => setHeadTeacherComments(e.target.value)}
                      placeholder="Enter head teacher's comments..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Conduct</label>
                    <Select value={conduct} onValueChange={setConduct}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Excellent">Excellent</SelectItem>
                        <SelectItem value="Very Good">Very Good</SelectItem>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Satisfactory">Satisfactory</SelectItem>
                        <SelectItem value="Needs Improvement">Needs Improvement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Promotion Status</label>
                    <Select value={promotionStatus} onValueChange={setPromotionStatus}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Promoted">Promoted</SelectItem>
                        <SelectItem value="Repeat">Repeat</SelectItem>
                        <SelectItem value="On Trial">On Trial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Print Preview */}
                <div ref={reportRef} className="bg-white border rounded-lg p-6 print:p-0 print:border-0">
                  {/* Header */}
                  <div className="header text-center pb-4 border-b-2 border-purple-600 mb-4">
                    {branding?.logo_url && (
                      <img src={branding.logo_url} alt="School Logo" className="h-16 mx-auto mb-2" />
                    )}
                    <h1 className="text-xl font-bold text-purple-700">{branding?.school_name || 'School Name'}</h1>
                    <h2 className="text-lg text-gray-600">Student Progress Report</h2>
                    <p className="text-sm text-gray-500">{term.name} - {term.academicYear}</p>
                  </div>

                  {/* Student Info */}
                  <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="text-sm">
                      <strong className="text-purple-700">Student:</strong> {student.name}
                    </div>
                    <div className="text-sm">
                      <strong className="text-purple-700">Class:</strong> {student.class}
                    </div>
                    <div className="text-sm">
                      <strong className="text-purple-700">Admission No:</strong> {student.admissionNumber || 'N/A'}
                    </div>
                  </div>

                  {/* Scores Table */}
                  <div className="section mb-4">
                    <h3 className="section-title text-purple-700 font-bold border-b-2 border-purple-600 pb-1 mb-3">
                      Academic Performance
                    </h3>
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-purple-600 text-white">
                          <th className="border p-2 text-left">Subject</th>
                          <th className="border p-2 text-center">CAT 1</th>
                          <th className="border p-2 text-center">CAT 2</th>
                          <th className="border p-2 text-center">CAT 3</th>
                          <th className="border p-2 text-center">CAT 4</th>
                          <th className="border p-2 text-center">ETE</th>
                          <th className="border p-2 text-center">Total</th>
                          <th className="border p-2 text-center">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentScores.map((score, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                            <td className="border p-2">{score.subject}</td>
                            <td className="border p-2 text-center">{score.cat1}</td>
                            <td className="border p-2 text-center">{score.cat2}</td>
                            <td className="border p-2 text-center">{score.cat3}</td>
                            <td className="border p-2 text-center">{score.cat4}</td>
                            <td className="border p-2 text-center">{score.ete}</td>
                            <td className="border p-2 text-center font-bold">{score.total}</td>
                            <td className={`border p-2 text-center font-bold grade-${score.grade}`}>
                              {score.grade}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-purple-100 font-bold">
                          <td className="border p-2" colSpan={6}>Overall Average</td>
                          <td className="border p-2 text-center">{overallAverage}</td>
                          <td className={`border p-2 text-center grade-${overallGrade}`}>{overallGrade}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="grade-legend flex gap-4 mt-2 text-xs">
                      <span className="grade-M px-2 py-1 rounded">M = Mastery (80%+)</span>
                      <span className="grade-P px-2 py-1 rounded">P = Proficiency (66-79%)</span>
                      <span className="grade-AP px-2 py-1 rounded">AP = Approaching (50-65%)</span>
                      <span className="grade-D px-2 py-1 rounded">D = Developing (&lt;50%)</span>
                    </div>
                  </div>

                  {/* Attendance */}
                  {options.includeAttendance && (
                    <div className="section mb-4">
                      <h3 className="section-title text-purple-700 font-bold border-b-2 border-purple-600 pb-1 mb-3">
                        Attendance Summary
                      </h3>
                      <div className="attendance-grid grid grid-cols-4 gap-3">
                        <div className="attendance-item bg-blue-50 p-3 rounded text-center">
                          <div className="text-xs text-gray-500">Total Days</div>
                          <div className="text-xl font-bold text-blue-700">{attendance.totalDays}</div>
                        </div>
                        <div className="attendance-item bg-green-50 p-3 rounded text-center">
                          <div className="text-xs text-gray-500">Present</div>
                          <div className="text-xl font-bold text-green-700">{attendance.present}</div>
                        </div>
                        <div className="attendance-item bg-red-50 p-3 rounded text-center">
                          <div className="text-xs text-gray-500">Absent</div>
                          <div className="text-xl font-bold text-red-700">{attendance.absent}</div>
                        </div>
                        <div className="attendance-item bg-amber-50 p-3 rounded text-center">
                          <div className="text-xs text-gray-500">Attendance Rate</div>
                          <div className="text-xl font-bold text-amber-700">{attendance.percentage}%</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Recommendations */}
                  {options.includeRecommendations && recommendations.length > 0 && (
                    <div className="section mb-4">
                      <h3 className="section-title text-purple-700 font-bold border-b-2 border-purple-600 pb-1 mb-3">
                        Personalized Recommendations
                      </h3>
                      {aiSummary && (
                        <p className="text-sm mb-3 italic text-gray-600">{aiSummary}</p>
                      )}
                      <div className="space-y-2">
                        {recommendations.map((rec, index) => (
                          <div 
                            key={index} 
                            className={`recommendation p-3 rounded border-l-4 bg-gray-50 ${rec.category}`}
                          >
                            <div className="font-medium text-sm">{rec.title}</div>
                            <div className="text-xs text-gray-600">{rec.description}</div>
                          </div>
                        ))}
                      </div>
                      {parentGuidance && (
                        <div className="mt-3 p-3 bg-blue-50 rounded">
                          <div className="font-medium text-sm text-blue-800">For Parents:</div>
                          <div className="text-xs text-blue-700">{parentGuidance}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Comments */}
                  <div className="section mb-4">
                    <h3 className="section-title text-purple-700 font-bold border-b-2 border-purple-600 pb-1 mb-3">
                      Comments & Remarks
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs font-medium text-gray-500 mb-1">Teacher's Comments:</div>
                        <div className="comments-box border p-3 rounded min-h-[50px] text-sm">
                          {teacherComments || 'No comments provided'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-500 mb-1">Head Teacher's Comments:</div>
                        <div className="comments-box border p-3 rounded min-h-[50px] text-sm">
                          {headTeacherComments || 'No comments provided'}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs font-medium text-gray-500">Conduct:</span>
                          <span className="ml-2 font-medium">{conduct}</span>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500">Promotion Status:</span>
                          <span className="ml-2 font-medium">{promotionStatus}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="signature-row grid grid-cols-2 gap-8 mt-8">
                    <div className="signature-box border-t pt-2 text-center">
                      <div className="text-xs text-gray-500">Class Teacher's Signature</div>
                    </div>
                    <div className="signature-box border-t pt-2 text-center">
                      <div className="text-xs text-gray-500">Head Teacher's Signature</div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleSaveReport}>
            <Download className="w-4 h-4 mr-2" />
            Save Report
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print / PDF
          </Button>
          <Button 
            onClick={() => {
              if (student?.parentPhone) {
                const msg = `Progress Report for ${student.name}\n${term?.name} - ${term?.academicYear}\nOverall Average: ${overallAverage}% (${overallGrade})\nAttendance: ${attendance.percentage}%`;
                window.open(`https://wa.me/${student.parentPhone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
              }
            }}
            disabled={!student?.parentPhone}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Send className="w-4 h-4 mr-2" />
            Send via WhatsApp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
