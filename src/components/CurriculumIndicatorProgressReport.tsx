import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import { 
  X, Target, TrendingUp, TrendingDown, Minus, User, Users, 
  Printer, Download, FileText, BarChart3, AlertTriangle, 
  CheckCircle2, Lightbulb, BookOpen, Award, Loader2, ChevronDown,
  ChevronRight, ArrowLeft, PieChart, Calendar
} from 'lucide-react';
import { 
  getStudentIndicatorAssessments, 
  getClassIndicatorAssessments,
  IndicatorAssessment 
} from '@/lib/supabase-indicator-assessments';
import { getCurriculum, GradeLevel } from '@/lib/curriculum-data';
import { getGradeColor, getGradeRemark, getGradeBgColor, GRADE_THRESHOLDS } from '@/types/scores';
import { useBranding } from '@/contexts/BrandingContext';
import { useTerm } from '@/contexts/TermContext';
import { supabase } from '@/lib/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  className: string;
  subject: string;
  students: { id: string; name: string; index?: string }[];
  schoolId: string;
  teacherId: string;
}

interface IndicatorData {
  code: string;
  text: string;
  strand: string;
  subStrand: string;
}

interface StudentIndicatorResult {
  studentId: string;
  studentName: string;
  indicators: {
    code: string;
    status: 'M' | 'P' | 'AP' | 'D' | 'not-assessed';
    score: number;
    assessmentDate?: string;
    trend?: 'up' | 'down' | 'same' | 'new';
    previousScore?: number;
  }[];
  summary: {
    mastered: number;
    proficient: number;
    approachingProficiency: number;
    developing: number;
    notAssessed: number;
    total: number;
    masteryRate: number;
  };
}

interface Recommendation {
  type: 'strength' | 'improvement' | 'action' | 'goal';
  indicator?: string;
  indicatorText?: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  forStudent?: string;
}

export function CurriculumIndicatorProgressReport({ 
  isOpen, 
  onClose, 
  className, 
  subject, 
  students,
  schoolId,
  teacherId 
}: Props) {
  const { branding } = useBranding();
  const { currentTerm, terms } = useTerm();
  const reportRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'individual' | 'class'>('class');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedStrands, setExpandedStrands] = useState<string[]>([]);
  
  // Data
  const [allIndicators, setAllIndicators] = useState<IndicatorData[]>([]);
  const [studentResults, setStudentResults] = useState<StudentIndicatorResult[]>([]);
  const [previousTermAssessments, setPreviousTermAssessments] = useState<Map<string, IndicatorAssessment[]>>(new Map());
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  
  // Report options
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const [includeTrends, setIncludeTrends] = useState(true);

  useEffect(() => {
    if (isOpen && className && subject) {
      loadIndicators();
      loadAssessmentData();
    }
  }, [isOpen, className, subject, currentTerm]);

  const loadIndicators = () => {
    const curriculum = getCurriculum(className as GradeLevel, subject);
    if (!curriculum?.strands) {
      setAllIndicators([]);
      return;
    }

    const indicators: IndicatorData[] = [];
    curriculum.strands.forEach((strand: any) => {
      strand.subStrands?.forEach((subStrand: any) => {
        subStrand.contentStandards?.forEach((standard: any) => {
          standard.indicators?.forEach((indicator: any) => {
            indicators.push({
              code: indicator.code,
              text: indicator.description || indicator.text,
              strand: strand.name,
              subStrand: subStrand.name
            });
          });
        });
      });
    });
    setAllIndicators(indicators);
  };

  const loadAssessmentData = async () => {
    if (!currentTerm) return;
    setLoading(true);

    try {
      // Get current term assessments for all students in the class
      const currentAssessments = await getClassIndicatorAssessments(
        className,
        subject,
        currentTerm.id,
        schoolId
      );

      // Get previous term assessments for trend analysis
      const currentTermIndex = terms.findIndex(t => t.id === currentTerm.id);
      const previousTerm = currentTermIndex > 0 ? terms[currentTermIndex - 1] : null;
      
      let prevAssessments: IndicatorAssessment[] = [];
      if (previousTerm) {
        prevAssessments = await getClassIndicatorAssessments(
          className,
          subject,
          previousTerm.id,
          schoolId
        );
      }

      // Create a map of previous assessments by student and indicator
      const prevMap = new Map<string, IndicatorAssessment[]>();
      prevAssessments.forEach(a => {
        const key = a.student_id;
        if (!prevMap.has(key)) prevMap.set(key, []);
        prevMap.get(key)!.push(a);
      });
      setPreviousTermAssessments(prevMap);

      // Process results for each student
      const results: StudentIndicatorResult[] = students.map(student => {
        const studentAssessments = currentAssessments.filter(a => a.student_id === student.id);
        const studentPrevAssessments = prevMap.get(student.id) || [];
        
        // Create assessment map
        const assessmentMap = new Map<string, IndicatorAssessment>();
        studentAssessments.forEach(a => assessmentMap.set(a.indicator_code, a));
        
        const prevAssessmentMap = new Map<string, IndicatorAssessment>();
        studentPrevAssessments.forEach(a => prevAssessmentMap.set(a.indicator_code, a));

        // Build indicator results
        const indicators = allIndicators.map(ind => {
          const current = assessmentMap.get(ind.code);
          const previous = prevAssessmentMap.get(ind.code);
          
          let trend: 'up' | 'down' | 'same' | 'new' = 'new';
          if (current && previous) {
            if (current.score > previous.score) trend = 'up';
            else if (current.score < previous.score) trend = 'down';
            else trend = 'same';
          }

          return {
            code: ind.code,
            status: current?.status || 'not-assessed' as const,
            score: current?.score || 0,
            assessmentDate: current?.assessment_date,
            trend: previous ? trend : 'new',
            previousScore: previous?.score
          };
        });

        // Calculate summary
        const summary = {
          mastered: indicators.filter(i => i.status === 'M').length,
          proficient: indicators.filter(i => i.status === 'P').length,
          approachingProficiency: indicators.filter(i => i.status === 'AP').length,
          developing: indicators.filter(i => i.status === 'D').length,
          notAssessed: indicators.filter(i => i.status === 'not-assessed').length,
          total: indicators.length,
          masteryRate: indicators.length > 0 
            ? Math.round((indicators.filter(i => i.status === 'M' || i.status === 'P').length / indicators.length) * 100)
            : 0
        };

        return {
          studentId: student.id,
          studentName: student.name,
          indicators,
          summary
        };
      });

      setStudentResults(results);
      generateRecommendations(results);
    } catch (error) {
      console.error('Error loading assessment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = (results: StudentIndicatorResult[]) => {
    const recs: Recommendation[] = [];
    
    if (viewMode === 'class') {
      // Class-wide recommendations
      const indicatorStats = new Map<string, { total: number; mastered: number; developing: number }>();
      
      results.forEach(student => {
        student.indicators.forEach(ind => {
          if (!indicatorStats.has(ind.code)) {
            indicatorStats.set(ind.code, { total: 0, mastered: 0, developing: 0 });
          }
          const stats = indicatorStats.get(ind.code)!;
          stats.total++;
          if (ind.status === 'M' || ind.status === 'P') stats.mastered++;
          if (ind.status === 'D') stats.developing++;
        });
      });

      // Find indicators where most students are struggling
      const weakIndicators: { code: string; rate: number }[] = [];
      const strongIndicators: { code: string; rate: number }[] = [];
      
      indicatorStats.forEach((stats, code) => {
        const masteryRate = (stats.mastered / stats.total) * 100;
        if (masteryRate < 50) {
          weakIndicators.push({ code, rate: masteryRate });
        } else if (masteryRate >= 80) {
          strongIndicators.push({ code, rate: masteryRate });
        }
      });

      // Sort by rate
      weakIndicators.sort((a, b) => a.rate - b.rate);
      strongIndicators.sort((a, b) => b.rate - a.rate);

      // Add weak indicator recommendations
      weakIndicators.slice(0, 5).forEach(weak => {
        const indicator = allIndicators.find(i => i.code === weak.code);
        if (indicator) {
          recs.push({
            type: 'improvement',
            indicator: weak.code,
            indicatorText: indicator.text,
            title: `Focus Area: ${indicator.strand}`,
            description: `Only ${Math.round(weak.rate)}% of students have mastered "${indicator.text}". Consider re-teaching this concept with different approaches.`,
            priority: weak.rate < 30 ? 'high' : 'medium'
          });
        }
      });

      // Add strong indicator recognition
      strongIndicators.slice(0, 3).forEach(strong => {
        const indicator = allIndicators.find(i => i.code === strong.code);
        if (indicator) {
          recs.push({
            type: 'strength',
            indicator: strong.code,
            indicatorText: indicator.text,
            title: `Class Strength: ${indicator.strand}`,
            description: `${Math.round(strong.rate)}% of students have mastered "${indicator.text}". This is excellent progress!`,
            priority: 'low'
          });
        }
      });

      // Add action items
      const studentsNeedingSupport = results.filter(r => r.summary.masteryRate < 50);
      if (studentsNeedingSupport.length > 0) {
        recs.push({
          type: 'action',
          title: 'Students Needing Support',
          description: `${studentsNeedingSupport.length} student(s) have less than 50% mastery rate. Consider providing additional support or remediation.`,
          priority: 'high'
        });
      }

    } else if (selectedStudentId) {
      // Individual student recommendations
      const studentResult = results.find(r => r.studentId === selectedStudentId);
      if (studentResult) {
        // Find weak indicators for this student
        const weakIndicators = studentResult.indicators.filter(i => i.status === 'D' || i.status === 'AP');
        const strongIndicators = studentResult.indicators.filter(i => i.status === 'M');
        const improvingIndicators = studentResult.indicators.filter(i => i.trend === 'up');
        const decliningIndicators = studentResult.indicators.filter(i => i.trend === 'down');

        // Add recommendations for weak areas
        weakIndicators.slice(0, 5).forEach(weak => {
          const indicator = allIndicators.find(i => i.code === weak.code);
          if (indicator) {
            recs.push({
              type: 'improvement',
              indicator: weak.code,
              indicatorText: indicator.text,
              title: `Needs Practice: ${indicator.strand}`,
              description: `Student scored ${weak.score}% on "${indicator.text}". Recommend additional practice and review.`,
              priority: weak.status === 'D' ? 'high' : 'medium',
              forStudent: studentResult.studentName
            });
          }
        });

        // Recognize strengths
        if (strongIndicators.length > 0) {
          recs.push({
            type: 'strength',
            title: 'Areas of Mastery',
            description: `Student has mastered ${strongIndicators.length} indicator(s). Consider providing enrichment activities in these areas.`,
            priority: 'low',
            forStudent: studentResult.studentName
          });
        }

        // Note improvements
        if (improvingIndicators.length > 0) {
          recs.push({
            type: 'goal',
            title: 'Positive Progress',
            description: `Student has improved in ${improvingIndicators.length} indicator(s) since last term. Keep up the good work!`,
            priority: 'low',
            forStudent: studentResult.studentName
          });
        }

        // Flag declining areas
        if (decliningIndicators.length > 0) {
          recs.push({
            type: 'action',
            title: 'Attention Needed',
            description: `Student's performance has declined in ${decliningIndicators.length} indicator(s). Investigate potential causes.`,
            priority: 'high',
            forStudent: studentResult.studentName
          });
        }
      }
    }

    setRecommendations(recs);
  };

  // Recalculate recommendations when view mode or selected student changes
  useEffect(() => {
    if (studentResults.length > 0) {
      generateRecommendations(studentResults);
    }
  }, [viewMode, selectedStudentId]);

  const selectedStudentResult = useMemo(() => {
    return studentResults.find(r => r.studentId === selectedStudentId);
  }, [studentResults, selectedStudentId]);

  // Group indicators by strand
  const groupedIndicators = useMemo(() => {
    const groups: Record<string, IndicatorData[]> = {};
    allIndicators.forEach(ind => {
      if (!groups[ind.strand]) groups[ind.strand] = [];
      groups[ind.strand].push(ind);
    });
    return groups;
  }, [allIndicators]);

  // Class-wide statistics
  const classStats = useMemo(() => {
    if (studentResults.length === 0) return null;
    
    const totalMastered = studentResults.reduce((sum, r) => sum + r.summary.mastered, 0);
    const totalProficient = studentResults.reduce((sum, r) => sum + r.summary.proficient, 0);
    const totalAP = studentResults.reduce((sum, r) => sum + r.summary.approachingProficiency, 0);
    const totalDeveloping = studentResults.reduce((sum, r) => sum + r.summary.developing, 0);
    const totalAssessed = totalMastered + totalProficient + totalAP + totalDeveloping;
    const avgMasteryRate = studentResults.length > 0 
      ? Math.round(studentResults.reduce((sum, r) => sum + r.summary.masteryRate, 0) / studentResults.length)
      : 0;

    return {
      totalStudents: studentResults.length,
      totalIndicators: allIndicators.length,
      totalAssessments: totalAssessed,
      mastered: totalMastered,
      proficient: totalProficient,
      approachingProficiency: totalAP,
      developing: totalDeveloping,
      avgMasteryRate
    };
  }, [studentResults, allIndicators]);

  const toggleStrand = (strand: string) => {
    setExpandedStrands(prev => 
      prev.includes(strand) ? prev.filter(s => s !== strand) : [...prev, strand]
    );
  };

  const getTrendIcon = (trend?: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />;
    if (trend === 'same') return <Minus className="w-4 h-4 text-gray-400" />;
    return null;
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'strength': return <Award className="w-5 h-5 text-green-600" />;
      case 'improvement': return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'action': return <CheckCircle2 className="w-5 h-5 text-blue-600" />;
      case 'goal': return <Lightbulb className="w-5 h-5 text-purple-600" />;
      default: return <Target className="w-5 h-5 text-gray-600" />;
    }
  };

  const handlePrint = () => {
    const printContent = reportRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const primaryColor = branding?.primary_color || '#7c3aed';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Curriculum Indicator Progress Report</title>
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
            font-size: 11px;
            line-height: 1.4;
          }
          .header { 
            text-align: center; 
            padding: 15px; 
            border-bottom: 3px solid ${primaryColor};
            margin-bottom: 15px;
          }
          .header img { max-height: 50px; margin-bottom: 8px; }
          .header h1 { color: ${primaryColor}; font-size: 18px; margin-bottom: 3px; }
          .header h2 { font-size: 14px; color: #666; font-weight: normal; }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            background: #f8f9fa;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 15px;
          }
          .info-grid div { font-size: 10px; }
          .info-grid strong { color: ${primaryColor}; }
          .section { margin-bottom: 15px; }
          .section-title { 
            color: ${primaryColor}; 
            font-size: 13px; 
            font-weight: bold;
            border-bottom: 2px solid ${primaryColor};
            padding-bottom: 4px;
            margin-bottom: 8px;
          }
          table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 10px; }
          th, td { border: 1px solid #ddd; padding: 6px; text-align: center; }
          th { background: ${primaryColor}; color: white; }
          .grade-M { background: #d1fae5; color: #065f46; font-weight: bold; }
          .grade-P { background: #dbeafe; color: #1e40af; font-weight: bold; }
          .grade-AP { background: #fef3c7; color: #92400e; font-weight: bold; }
          .grade-D { background: #fee2e2; color: #991b1b; font-weight: bold; }
          .grade-na { background: #f3f4f6; color: #6b7280; }
          .summary-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 15px; }
          .summary-item { text-align: center; padding: 10px; border-radius: 6px; }
          .recommendation { 
            padding: 8px; 
            margin-bottom: 6px; 
            border-radius: 4px;
            border-left: 3px solid ${primaryColor};
            background: #f8f9fa;
            font-size: 10px;
          }
          .recommendation.strength { border-left-color: #10b981; }
          .recommendation.improvement { border-left-color: #f59e0b; }
          .recommendation.action { border-left-color: #3b82f6; }
          .recommendation.goal { border-left-color: #8b5cf6; }
          .trend-up { color: #10b981; }
          .trend-down { color: #ef4444; }
          .strand-section { margin-bottom: 10px; }
          .strand-title { font-weight: bold; background: #f3f4f6; padding: 6px; margin-bottom: 4px; }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-bold">Curriculum Indicator Progress Report</h2>
              <p className="text-sm text-purple-200">{className} - {subject}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* View Mode Toggle */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'class' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('class')}
                className={viewMode === 'class' ? 'bg-purple-600 hover:bg-purple-700' : ''}
              >
                <Users className="w-4 h-4 mr-2" />
                Whole Class
              </Button>
              <Button
                variant={viewMode === 'individual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('individual')}
                className={viewMode === 'individual' ? 'bg-purple-600 hover:bg-purple-700' : ''}
              >
                <User className="w-4 h-4 mr-2" />
                Individual Student
              </Button>
            </div>

            {viewMode === 'individual' && (
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <span className="ml-3 text-gray-600">Loading assessment data...</span>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="indicators">Indicators</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="preview">Print Preview</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                {viewMode === 'class' && classStats && (
                  <>
                    {/* Class Summary Cards */}
                    <div className="grid grid-cols-5 gap-3">
                      <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-purple-600" />
                          <span className="text-xs text-purple-700 font-medium">Students</span>
                        </div>
                        <div className="text-2xl font-bold text-purple-800">{classStats.totalStudents}</div>
                      </Card>
                      <Card className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs text-emerald-700 font-medium">Mastered</span>
                        </div>
                        <div className="text-2xl font-bold text-emerald-800">{classStats.mastered}</div>
                      </Card>
                      <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-blue-600" />
                          <span className="text-xs text-blue-700 font-medium">Proficient</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-800">{classStats.proficient}</div>
                      </Card>
                      <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span className="text-xs text-amber-700 font-medium">Approaching</span>
                        </div>
                        <div className="text-2xl font-bold text-amber-800">{classStats.approachingProficiency}</div>
                      </Card>
                      <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-4 h-4 text-red-600" />
                          <span className="text-xs text-red-700 font-medium">Developing</span>
                        </div>
                        <div className="text-2xl font-bold text-red-800">{classStats.developing}</div>
                      </Card>
                    </div>

                    {/* Class Average Mastery Rate */}
                    <Card className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                        Class Average Mastery Rate
                      </h3>
                      <div className="flex items-center gap-4">
                        <Progress value={classStats.avgMasteryRate} className="flex-1 h-4" />
                        <span className="text-xl font-bold text-purple-700">{classStats.avgMasteryRate}%</span>
                      </div>
                    </Card>

                    {/* Student Rankings */}
                    <Card className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-3">Student Performance Summary</h3>
                      <div className="max-h-64 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100 sticky top-0">
                            <tr>
                              <th className="p-2 text-left">Student</th>
                              <th className="p-2 text-center">M</th>
                              <th className="p-2 text-center">P</th>
                              <th className="p-2 text-center">AP</th>
                              <th className="p-2 text-center">D</th>
                              <th className="p-2 text-center">Not Assessed</th>
                              <th className="p-2 text-center">Mastery Rate</th>
                            </tr>
                          </thead>
                          <tbody>
                            {studentResults
                              .sort((a, b) => b.summary.masteryRate - a.summary.masteryRate)
                              .map((result, idx) => (
                                <tr key={result.studentId} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  <td className="p-2 font-medium">{result.studentName}</td>
                                  <td className="p-2 text-center">
                                    <Badge className="bg-emerald-100 text-emerald-800">{result.summary.mastered}</Badge>
                                  </td>
                                  <td className="p-2 text-center">
                                    <Badge className="bg-blue-100 text-blue-800">{result.summary.proficient}</Badge>
                                  </td>
                                  <td className="p-2 text-center">
                                    <Badge className="bg-amber-100 text-amber-800">{result.summary.approachingProficiency}</Badge>
                                  </td>
                                  <td className="p-2 text-center">
                                    <Badge className="bg-red-100 text-red-800">{result.summary.developing}</Badge>
                                  </td>
                                  <td className="p-2 text-center">
                                    <Badge variant="outline">{result.summary.notAssessed}</Badge>
                                  </td>
                                  <td className="p-2 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                      <Progress value={result.summary.masteryRate} className="w-16 h-2" />
                                      <span className="font-bold text-purple-700">{result.summary.masteryRate}%</span>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  </>
                )}

                {viewMode === 'individual' && selectedStudentResult && (
                  <>
                    {/* Individual Student Summary */}
                    <Card className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-purple-800">{selectedStudentResult.studentName}</h3>
                          <p className="text-sm text-purple-600">{className} - {subject}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-purple-700">{selectedStudentResult.summary.masteryRate}%</div>
                          <div className="text-sm text-purple-600">Mastery Rate</div>
                        </div>
                      </div>
                    </Card>

                    {/* Individual Summary Cards */}
                    <div className="grid grid-cols-5 gap-3">
                      <Card className="p-3 text-center bg-emerald-50 border-emerald-200">
                        <div className="text-2xl font-bold text-emerald-700">{selectedStudentResult.summary.mastered}</div>
                        <div className="text-xs text-emerald-600">Mastered</div>
                      </Card>
                      <Card className="p-3 text-center bg-blue-50 border-blue-200">
                        <div className="text-2xl font-bold text-blue-700">{selectedStudentResult.summary.proficient}</div>
                        <div className="text-xs text-blue-600">Proficient</div>
                      </Card>
                      <Card className="p-3 text-center bg-amber-50 border-amber-200">
                        <div className="text-2xl font-bold text-amber-700">{selectedStudentResult.summary.approachingProficiency}</div>
                        <div className="text-xs text-amber-600">Approaching</div>
                      </Card>
                      <Card className="p-3 text-center bg-red-50 border-red-200">
                        <div className="text-2xl font-bold text-red-700">{selectedStudentResult.summary.developing}</div>
                        <div className="text-xs text-red-600">Developing</div>
                      </Card>
                      <Card className="p-3 text-center bg-gray-50 border-gray-200">
                        <div className="text-2xl font-bold text-gray-700">{selectedStudentResult.summary.notAssessed}</div>
                        <div className="text-xs text-gray-600">Not Assessed</div>
                      </Card>
                    </div>

                    {/* Trend Summary */}
                    {includeTrends && (
                      <Card className="p-4">
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          Performance Trends (vs Previous Term)
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                            <div>
                              <div className="text-xl font-bold text-green-700">
                                {selectedStudentResult.indicators.filter(i => i.trend === 'up').length}
                              </div>
                              <div className="text-xs text-green-600">Improved</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Minus className="w-6 h-6 text-gray-500" />
                            <div>
                              <div className="text-xl font-bold text-gray-700">
                                {selectedStudentResult.indicators.filter(i => i.trend === 'same').length}
                              </div>
                              <div className="text-xs text-gray-600">Maintained</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                            <TrendingDown className="w-6 h-6 text-red-600" />
                            <div>
                              <div className="text-xl font-bold text-red-700">
                                {selectedStudentResult.indicators.filter(i => i.trend === 'down').length}
                              </div>
                              <div className="text-xs text-red-600">Declined</div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}
                  </>
                )}

                {viewMode === 'individual' && !selectedStudentId && (
                  <Card className="p-8 text-center">
                    <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Select a student to view their progress report</p>
                  </Card>
                )}
              </TabsContent>

              {/* Indicators Tab */}
              <TabsContent value="indicators" className="space-y-4">
                {viewMode === 'class' ? (
                  // Class-wide indicator view
                  <div className="space-y-3">
                    {Object.entries(groupedIndicators).map(([strand, indicators]) => (
                      <Card key={strand} className="overflow-hidden">
                        <div 
                          className="flex items-center justify-between p-3 bg-gray-100 cursor-pointer hover:bg-gray-200"
                          onClick={() => toggleStrand(strand)}
                        >
                          <div className="flex items-center gap-2">
                            {expandedStrands.includes(strand) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                            <span className="font-semibold">{strand}</span>
                            <Badge variant="outline">{indicators.length} indicators</Badge>
                          </div>
                        </div>
                        
                        {expandedStrands.includes(strand) && (
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead className="bg-purple-600 text-white">
                                <tr>
                                  <th className="p-2 text-left sticky left-0 bg-purple-600 min-w-[200px]">Indicator</th>
                                  {students.map(s => (
                                    <th key={s.id} className="p-2 text-center min-w-[60px]">
                                      {s.name.split(' ')[0]}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {indicators.map((ind, idx) => (
                                  <tr key={ind.code} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="p-2 sticky left-0 bg-inherit border-r">
                                      <div className="font-mono text-xs text-purple-600">{ind.code}</div>
                                      <div className="text-xs text-gray-600 truncate max-w-[180px]" title={ind.text}>
                                        {ind.text}
                                      </div>
                                    </td>
                                    {studentResults.map(result => {
                                      const indResult = result.indicators.find(i => i.code === ind.code);
                                      return (
                                        <td key={result.studentId} className="p-2 text-center">
                                          {indResult && indResult.status !== 'not-assessed' ? (
                                            <Badge className={getGradeColor(indResult.status)}>
                                              {indResult.status}
                                            </Badge>
                                          ) : (
                                            <span className="text-gray-400">-</span>
                                          )}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : selectedStudentResult ? (
                  // Individual student indicator view
                  <div className="space-y-3">
                    {Object.entries(groupedIndicators).map(([strand, indicators]) => (
                      <Card key={strand} className="overflow-hidden">
                        <div 
                          className="flex items-center justify-between p-3 bg-gray-100 cursor-pointer hover:bg-gray-200"
                          onClick={() => toggleStrand(strand)}
                        >
                          <div className="flex items-center gap-2">
                            {expandedStrands.includes(strand) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                            <span className="font-semibold">{strand}</span>
                            <Badge variant="outline">{indicators.length} indicators</Badge>
                          </div>
                        </div>
                        
                        {expandedStrands.includes(strand) && (
                          <div className="p-3 space-y-2">
                            {indicators.map(ind => {
                              const result = selectedStudentResult.indicators.find(i => i.code === ind.code);
                              return (
                                <div 
                                  key={ind.code} 
                                  className={`p-3 rounded-lg border ${
                                    result?.status === 'M' ? 'bg-emerald-50 border-emerald-200' :
                                    result?.status === 'P' ? 'bg-blue-50 border-blue-200' :
                                    result?.status === 'AP' ? 'bg-amber-50 border-amber-200' :
                                    result?.status === 'D' ? 'bg-red-50 border-red-200' :
                                    'bg-gray-50 border-gray-200'
                                  }`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className="font-mono text-xs">{ind.code}</Badge>
                                        <span className="text-xs text-gray-500">{ind.subStrand}</span>
                                      </div>
                                      <p className="text-sm text-gray-700">{ind.text}</p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                      {result && result.status !== 'not-assessed' ? (
                                        <>
                                          <div className="text-right">
                                            <Badge className={getGradeColor(result.status)}>
                                              {result.status} ({result.score}%)
                                            </Badge>
                                            {result.assessmentDate && (
                                              <div className="text-xs text-gray-500 mt-1">
                                                {new Date(result.assessmentDate).toLocaleDateString()}
                                              </div>
                                            )}
                                          </div>
                                          {includeTrends && result.trend && result.trend !== 'new' && (
                                            <div className="flex items-center gap-1">
                                              {getTrendIcon(result.trend)}
                                              {result.previousScore !== undefined && (
                                                <span className="text-xs text-gray-500">
                                                  ({result.previousScore}%)
                                                </span>
                                              )}
                                            </div>
                                          )}
                                        </>
                                      ) : (
                                        <Badge variant="outline" className="text-gray-500">Not Assessed</Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Select a student to view their indicator progress</p>
                  </Card>
                )}
              </TabsContent>

              {/* Recommendations Tab */}
              <TabsContent value="recommendations" className="space-y-4">
                {recommendations.length > 0 ? (
                  <>
                    {/* High Priority */}
                    {recommendations.filter(r => r.priority === 'high').length > 0 && (
                      <div>
                        <h3 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          High Priority
                        </h3>
                        <div className="space-y-2">
                          {recommendations.filter(r => r.priority === 'high').map((rec, idx) => (
                            <Card key={idx} className="p-4 border-l-4 border-red-500 bg-red-50">
                              <div className="flex items-start gap-3">
                                {getRecommendationIcon(rec.type)}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold">{rec.title}</span>
                                    {rec.indicator && (
                                      <Badge variant="outline" className="text-xs font-mono">{rec.indicator}</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600">{rec.description}</p>
                                  {rec.indicatorText && (
                                    <p className="text-xs text-gray-500 mt-1 italic">"{rec.indicatorText}"</p>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Medium Priority */}
                    {recommendations.filter(r => r.priority === 'medium').length > 0 && (
                      <div>
                        <h3 className="font-semibold text-amber-700 mb-2 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Medium Priority
                        </h3>
                        <div className="space-y-2">
                          {recommendations.filter(r => r.priority === 'medium').map((rec, idx) => (
                            <Card key={idx} className="p-4 border-l-4 border-amber-500 bg-amber-50">
                              <div className="flex items-start gap-3">
                                {getRecommendationIcon(rec.type)}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold">{rec.title}</span>
                                    {rec.indicator && (
                                      <Badge variant="outline" className="text-xs font-mono">{rec.indicator}</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600">{rec.description}</p>
                                  {rec.indicatorText && (
                                    <p className="text-xs text-gray-500 mt-1 italic">"{rec.indicatorText}"</p>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Low Priority / Strengths */}
                    {recommendations.filter(r => r.priority === 'low').length > 0 && (
                      <div>
                        <h3 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                          <Award className="w-4 h-4" />
                          Strengths & Achievements
                        </h3>
                        <div className="space-y-2">
                          {recommendations.filter(r => r.priority === 'low').map((rec, idx) => (
                            <Card key={idx} className="p-4 border-l-4 border-green-500 bg-green-50">
                              <div className="flex items-start gap-3">
                                {getRecommendationIcon(rec.type)}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold">{rec.title}</span>
                                    {rec.indicator && (
                                      <Badge variant="outline" className="text-xs font-mono">{rec.indicator}</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600">{rec.description}</p>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Card className="p-8 text-center">
                    <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No recommendations available yet</p>
                    <p className="text-sm text-gray-400 mt-1">Recommendations will appear once assessment data is loaded</p>
                  </Card>
                )}
              </TabsContent>

              {/* Print Preview Tab */}
              <TabsContent value="preview" className="space-y-4">
                {/* Report Options */}
                <Card className="p-4 bg-gray-50">
                  <h4 className="font-medium text-sm mb-3">Report Options</h4>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox checked={includeCharts} onCheckedChange={(c) => setIncludeCharts(!!c)} />
                      Include Charts
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox checked={includeTrends} onCheckedChange={(c) => setIncludeTrends(!!c)} />
                      Include Trends
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox checked={includeRecommendations} onCheckedChange={(c) => setIncludeRecommendations(!!c)} />
                      Include Recommendations
                    </label>
                  </div>
                </Card>

                {/* Print Preview */}
                <div ref={reportRef} className="bg-white border rounded-lg p-6">
                  {/* Header */}
                  <div className="header text-center pb-4 border-b-2 border-purple-600 mb-4">
                    {branding?.logo_url && (
                      <img src={branding.logo_url} alt="School Logo" className="h-12 mx-auto mb-2" />
                    )}
                    <h1 className="text-xl font-bold text-purple-700">{branding?.school_name || 'School Name'}</h1>
                    <h2 className="text-lg text-gray-600">Curriculum Indicator Progress Report</h2>
                    <p className="text-sm text-gray-500">{currentTerm?.name} - {currentTerm?.academicYear}</p>
                  </div>

                  {/* Report Info */}
                  <div className="info-grid grid grid-cols-4 gap-3 bg-gray-50 p-3 rounded-lg mb-4 text-sm">
                    <div><strong className="text-purple-700">Class:</strong> {className}</div>
                    <div><strong className="text-purple-700">Subject:</strong> {subject}</div>
                    <div><strong className="text-purple-700">Report Type:</strong> {viewMode === 'class' ? 'Class Report' : 'Individual Report'}</div>
                    <div><strong className="text-purple-700">Date:</strong> {new Date().toLocaleDateString()}</div>
                    {viewMode === 'individual' && selectedStudentResult && (
                      <div className="col-span-4"><strong className="text-purple-700">Student:</strong> {selectedStudentResult.studentName}</div>
                    )}
                  </div>

                  {/* Summary Section */}
                  <div className="section mb-4">
                    <h3 className="section-title text-purple-700 font-bold border-b-2 border-purple-600 pb-1 mb-3">
                      Performance Summary
                    </h3>
                    
                    {viewMode === 'class' && classStats ? (
                      <div className="summary-grid grid grid-cols-5 gap-3 mb-4">
                        <div className="summary-item bg-purple-50 p-3 rounded text-center">
                          <div className="text-xs text-gray-500">Total Students</div>
                          <div className="text-xl font-bold text-purple-700">{classStats.totalStudents}</div>
                        </div>
                        <div className="summary-item bg-emerald-50 p-3 rounded text-center">
                          <div className="text-xs text-gray-500">Mastered (M)</div>
                          <div className="text-xl font-bold text-emerald-700">{classStats.mastered}</div>
                        </div>
                        <div className="summary-item bg-blue-50 p-3 rounded text-center">
                          <div className="text-xs text-gray-500">Proficient (P)</div>
                          <div className="text-xl font-bold text-blue-700">{classStats.proficient}</div>
                        </div>
                        <div className="summary-item bg-amber-50 p-3 rounded text-center">
                          <div className="text-xs text-gray-500">Approaching (AP)</div>
                          <div className="text-xl font-bold text-amber-700">{classStats.approachingProficiency}</div>
                        </div>
                        <div className="summary-item bg-red-50 p-3 rounded text-center">
                          <div className="text-xs text-gray-500">Developing (D)</div>
                          <div className="text-xl font-bold text-red-700">{classStats.developing}</div>
                        </div>
                      </div>
                    ) : selectedStudentResult && (
                      <div className="summary-grid grid grid-cols-5 gap-3 mb-4">
                        <div className="summary-item bg-purple-50 p-3 rounded text-center">
                          <div className="text-xs text-gray-500">Mastery Rate</div>
                          <div className="text-xl font-bold text-purple-700">{selectedStudentResult.summary.masteryRate}%</div>
                        </div>
                        <div className="summary-item bg-emerald-50 p-3 rounded text-center">
                          <div className="text-xs text-gray-500">Mastered (M)</div>
                          <div className="text-xl font-bold text-emerald-700">{selectedStudentResult.summary.mastered}</div>
                        </div>
                        <div className="summary-item bg-blue-50 p-3 rounded text-center">
                          <div className="text-xs text-gray-500">Proficient (P)</div>
                          <div className="text-xl font-bold text-blue-700">{selectedStudentResult.summary.proficient}</div>
                        </div>
                        <div className="summary-item bg-amber-50 p-3 rounded text-center">
                          <div className="text-xs text-gray-500">Approaching (AP)</div>
                          <div className="text-xl font-bold text-amber-700">{selectedStudentResult.summary.approachingProficiency}</div>
                        </div>
                        <div className="summary-item bg-red-50 p-3 rounded text-center">
                          <div className="text-xs text-gray-500">Developing (D)</div>
                          <div className="text-xl font-bold text-red-700">{selectedStudentResult.summary.developing}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Indicator Details */}
                  <div className="section mb-4">
                    <h3 className="section-title text-purple-700 font-bold border-b-2 border-purple-600 pb-1 mb-3">
                      Indicator Performance Details
                    </h3>
                    
                    {viewMode === 'individual' && selectedStudentResult ? (
                      // Individual student indicator table
                      Object.entries(groupedIndicators).map(([strand, indicators]) => (
                        <div key={strand} className="strand-section mb-3">
                          <div className="strand-title bg-gray-100 p-2 font-semibold text-sm">{strand}</div>
                          <table className="w-full text-xs border-collapse">
                            <thead>
                              <tr className="bg-purple-600 text-white">
                                <th className="p-2 text-left">Code</th>
                                <th className="p-2 text-left">Indicator</th>
                                <th className="p-2 text-center">Score</th>
                                <th className="p-2 text-center">Grade</th>
                                {includeTrends && <th className="p-2 text-center">Trend</th>}
                              </tr>
                            </thead>
                            <tbody>
                              {indicators.map((ind, idx) => {
                                const result = selectedStudentResult.indicators.find(i => i.code === ind.code);
                                return (
                                  <tr key={ind.code} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="p-2 font-mono">{ind.code}</td>
                                    <td className="p-2">{ind.text}</td>
                                    <td className="p-2 text-center">{result?.score || '-'}%</td>
                                    <td className={`p-2 text-center grade-${result?.status || 'na'}`}>
                                      {result?.status !== 'not-assessed' ? result?.status : '-'}
                                    </td>
                                    {includeTrends && (
                                      <td className={`p-2 text-center ${result?.trend === 'up' ? 'trend-up' : result?.trend === 'down' ? 'trend-down' : ''}`}>
                                        {result?.trend === 'up' ? '↑' : result?.trend === 'down' ? '↓' : result?.trend === 'same' ? '→' : '-'}
                                        {result?.previousScore !== undefined && ` (${result.previousScore}%)`}
                                      </td>
                                    )}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ))
                    ) : (
                      // Class summary table
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-purple-600 text-white">
                            <th className="p-2 text-left">Student</th>
                            <th className="p-2 text-center">M</th>
                            <th className="p-2 text-center">P</th>
                            <th className="p-2 text-center">AP</th>
                            <th className="p-2 text-center">D</th>
                            <th className="p-2 text-center">Not Assessed</th>
                            <th className="p-2 text-center">Mastery Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentResults.sort((a, b) => b.summary.masteryRate - a.summary.masteryRate).map((result, idx) => (
                            <tr key={result.studentId} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="p-2 font-medium">{result.studentName}</td>
                              <td className="p-2 text-center grade-M">{result.summary.mastered}</td>
                              <td className="p-2 text-center grade-P">{result.summary.proficient}</td>
                              <td className="p-2 text-center grade-AP">{result.summary.approachingProficiency}</td>
                              <td className="p-2 text-center grade-D">{result.summary.developing}</td>
                              <td className="p-2 text-center">{result.summary.notAssessed}</td>
                              <td className="p-2 text-center font-bold">{result.summary.masteryRate}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Recommendations */}
                  {includeRecommendations && recommendations.length > 0 && (
                    <div className="section mb-4">
                      <h3 className="section-title text-purple-700 font-bold border-b-2 border-purple-600 pb-1 mb-3">
                        Recommendations
                      </h3>
                      <div className="space-y-2">
                        {recommendations.slice(0, 8).map((rec, idx) => (
                          <div key={idx} className={`recommendation p-2 rounded border-l-3 ${rec.type}`}>
                            <div className="font-medium text-sm">{rec.title}</div>
                            <div className="text-xs text-gray-600">{rec.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Grade Legend */}
                  <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
                    <strong>Grade Key:</strong>
                    <span className="ml-3 px-2 py-1 rounded grade-M">M = Mastery (80%+)</span>
                    <span className="ml-2 px-2 py-1 rounded grade-P">P = Proficiency (66-79%)</span>
                    <span className="ml-2 px-2 py-1 rounded grade-AP">AP = Approaching (50-65%)</span>
                    <span className="ml-2 px-2 py-1 rounded grade-D">D = Developing (&lt;50%)</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50 rounded-b-xl">
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Close
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print Report
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={handlePrint}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
