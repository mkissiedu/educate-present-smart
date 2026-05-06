import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { 
  X, Download, Printer, BarChart3, Users, TrendingUp, 
  AlertTriangle, Award, CheckCircle2, XCircle, FileText,
  PieChart, Target
} from 'lucide-react';
import { 
  OMRScanResult, IndicatorResult, BulkOMRSummaryReport as SummaryReportType,
  OMR_GRADE_THRESHOLDS, getOMRGrade 
} from '@/types/omr-scanner';
import { cn } from '@/lib/utils';

interface Props {
  results: OMRScanResult[];
  testPaperTitle: string;
  className: string;
  subject: string;
  gradeLevel: string;
  totalStudentsInClass: number;
  onClose: () => void;
}

export function BulkOMRSummaryReport({ 
  results, 
  testPaperTitle, 
  className, 
  subject, 
  gradeLevel,
  totalStudentsInClass,
  onClose 
}: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'indicators' | 'students'>('overview');

  // Calculate comprehensive statistics
  const report = useMemo((): SummaryReportType => {
    const scores = results.map(r => r.percentage).sort((a, b) => a - b);
    const totalScanned = results.length;
    
    // Basic statistics
    const classAverage = totalScanned > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / totalScanned) 
      : 0;
    const highestScore = scores[scores.length - 1] || 0;
    const lowestScore = scores[0] || 0;
    const medianScore = totalScanned > 0 
      ? scores[Math.floor(scores.length / 2)] 
      : 0;
    
    // Standard deviation
    const variance = totalScanned > 0 
      ? scores.reduce((sum, s) => sum + Math.pow(s - classAverage, 2), 0) / totalScanned 
      : 0;
    const standardDeviation = Math.round(Math.sqrt(variance) * 10) / 10;

    // Grade distribution
    const gradeDistribution = {
      M: { count: 0, percentage: 0, students: [] as string[] },
      P: { count: 0, percentage: 0, students: [] as string[] },
      AP: { count: 0, percentage: 0, students: [] as string[] },
      D: { count: 0, percentage: 0, students: [] as string[] }
    };

    results.forEach(r => {
      gradeDistribution[r.grade].count++;
      gradeDistribution[r.grade].students.push(r.student_name);
    });

    Object.keys(gradeDistribution).forEach(grade => {
      const g = grade as keyof typeof gradeDistribution;
      gradeDistribution[g].percentage = totalScanned > 0 
        ? Math.round((gradeDistribution[g].count / totalScanned) * 100) 
        : 0;
    });

    // Indicator summary
    const indicatorMap = new Map<string, {
      code: string;
      text: string;
      strand: string;
      sub_strand: string;
      totalStudents: number;
      studentsMet: number;
      totalPercentage: number;
    }>();

    results.forEach(result => {
      (result.indicator_results as IndicatorResult[]).forEach(ir => {
        const existing = indicatorMap.get(ir.indicator_code);
        if (existing) {
          existing.totalStudents++;
          if (ir.is_met) existing.studentsMet++;
          existing.totalPercentage += ir.percentage;
        } else {
          indicatorMap.set(ir.indicator_code, {
            code: ir.indicator_code,
            text: ir.indicator_text,
            strand: ir.strand,
            sub_strand: ir.sub_strand,
            totalStudents: 1,
            studentsMet: ir.is_met ? 1 : 0,
            totalPercentage: ir.percentage
          });
        }
      });
    });

    const indicatorSummary = Array.from(indicatorMap.values()).map(i => {
      const classPercentage = Math.round(i.totalPercentage / i.totalStudents);
      return {
        indicator_code: i.code,
        indicator_text: i.text,
        strand: i.strand,
        sub_strand: i.sub_strand,
        total_students: i.totalStudents,
        students_met: i.studentsMet,
        students_not_met: i.totalStudents - i.studentsMet,
        class_percentage: classPercentage,
        status: getOMRGrade(classPercentage),
        needs_intervention: classPercentage < 50
      };
    }).sort((a, b) => a.class_percentage - b.class_percentage);

    // Students needing support (D grade or multiple weak indicators)
    const studentsNeedingSupport = results
      .filter(r => r.grade === 'D' || r.grade === 'AP')
      .map(r => {
        const weakIndicators = (r.indicator_results as IndicatorResult[])
          .filter(ir => !ir.is_met)
          .map(ir => ir.indicator_code);
        return {
          student_id: r.student_id,
          student_name: r.student_name,
          percentage: r.percentage,
          grade: r.grade,
          weak_indicators: weakIndicators
        };
      })
      .sort((a, b) => a.percentage - b.percentage);

    // Top performers
    const topPerformers = results
      .filter(r => r.grade === 'M' || r.grade === 'P')
      .map(r => ({
        student_id: r.student_id,
        student_name: r.student_name,
        percentage: r.percentage,
        grade: r.grade,
        indicators_mastered: (r.indicator_results as IndicatorResult[])
          .filter(ir => ir.percentage >= 80).length
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 10);

    return {
      job_id: '',
      test_paper_title: testPaperTitle,
      class_name: className,
      subject,
      grade_level: gradeLevel,
      scan_date: new Date().toISOString(),
      total_students_scanned: totalScanned,
      total_students_in_class: totalStudentsInClass,
      scan_coverage_percentage: totalStudentsInClass > 0 
        ? Math.round((totalScanned / totalStudentsInClass) * 100) 
        : 0,
      class_average: classAverage,
      highest_score: highestScore,
      lowest_score: lowestScore,
      median_score: medianScore,
      standard_deviation: standardDeviation,
      grade_distribution: gradeDistribution,
      indicator_summary: indicatorSummary,
      students_needing_support: studentsNeedingSupport,
      top_performers: topPerformers
    };
  }, [results, testPaperTitle, className, subject, gradeLevel, totalStudentsInClass]);

  const handlePrint = () => {
    window.print();
  };

  const exportCSV = () => {
    // Student results
    const studentHeaders = ['Student Name', 'Score', 'Percentage', 'Grade', 'Correct', 'Wrong', 'Indicators Met'];
    const studentRows = results.map(r => {
      const indicatorsMet = (r.indicator_results as IndicatorResult[]).filter(i => i.is_met).length;
      const totalIndicators = (r.indicator_results as IndicatorResult[]).length;
      return [
        r.student_name,
        `${r.marks_obtained}/${r.total_marks}`,
        `${r.percentage}%`,
        r.grade,
        r.correct_answers,
        r.wrong_answers,
        `${indicatorsMet}/${totalIndicators}`
      ];
    });

    // Indicator summary
    const indicatorHeaders = ['Indicator Code', 'Indicator Text', 'Strand', 'Class %', 'Students Met', 'Status'];
    const indicatorRows = report.indicator_summary.map(i => [
      i.indicator_code,
      i.indicator_text,
      i.strand,
      `${i.class_percentage}%`,
      `${i.students_met}/${i.total_students}`,
      i.needs_intervention ? 'Needs Intervention' : 'On Track'
    ]);

    const csv = [
      '=== BULK OMR SCAN SUMMARY REPORT ===',
      `Test: ${testPaperTitle}`,
      `Class: ${className}`,
      `Subject: ${subject}`,
      `Date: ${new Date().toLocaleDateString()}`,
      '',
      '=== CLASS STATISTICS ===',
      `Students Scanned: ${report.total_students_scanned}`,
      `Class Average: ${report.class_average}%`,
      `Highest Score: ${report.highest_score}%`,
      `Lowest Score: ${report.lowest_score}%`,
      '',
      '=== GRADE DISTRIBUTION ===',
      `Mastery (M): ${report.grade_distribution.M.count} (${report.grade_distribution.M.percentage}%)`,
      `Proficiency (P): ${report.grade_distribution.P.count} (${report.grade_distribution.P.percentage}%)`,
      `Approaching (AP): ${report.grade_distribution.AP.count} (${report.grade_distribution.AP.percentage}%)`,
      `Developing (D): ${report.grade_distribution.D.count} (${report.grade_distribution.D.percentage}%)`,
      '',
      '=== STUDENT RESULTS ===',
      studentHeaders.join(','),
      ...studentRows.map(r => r.join(',')),
      '',
      '=== INDICATOR ANALYSIS ===',
      indicatorHeaders.join(','),
      ...indicatorRows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OMR_Summary_${className}_${subject}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col print:max-w-none print:max-h-none print:overflow-visible">
        {/* Header */}
        <div className="border-b px-6 py-4 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white print:bg-white print:text-black print:border-b-2">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Bulk OMR Summary Report
            </h2>
            <p className="text-sm opacity-90 print:text-gray-600">
              {testPaperTitle} | {className} | {subject}
            </p>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <Button variant="ghost" size="sm" onClick={exportCSV} className="text-white hover:bg-white/20">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="ghost" size="sm" onClick={handlePrint} className="text-white hover:bg-white/20">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b px-6 py-2 flex gap-2 print:hidden">
          <Button 
            variant={activeTab === 'overview' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('overview')}
          >
            <PieChart className="w-4 h-4 mr-2" />
            Overview
          </Button>
          <Button 
            variant={activeTab === 'indicators' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('indicators')}
          >
            <Target className="w-4 h-4 mr-2" />
            Indicator Analysis
          </Button>
          <Button 
            variant={activeTab === 'students' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('students')}
          >
            <Users className="w-4 h-4 mr-2" />
            Student Results
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 print:overflow-visible">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6 print:space-y-4">
              {/* Key Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-blue-600">{report.total_students_scanned}</p>
                  <p className="text-sm text-gray-600">Students Scanned</p>
                  <p className="text-xs text-gray-400">{report.scan_coverage_percentage}% coverage</p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-indigo-600">{report.class_average}%</p>
                  <p className="text-sm text-gray-600">Class Average</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">{report.highest_score}%</p>
                  <p className="text-sm text-gray-600">Highest Score</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-red-500">{report.lowest_score}%</p>
                  <p className="text-sm text-gray-600">Lowest Score</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-purple-600">{report.standard_deviation}</p>
                  <p className="text-sm text-gray-600">Std. Deviation</p>
                </div>
              </div>

              {/* Grade Distribution */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-indigo-600" />
                  Grade Distribution
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  {(['M', 'P', 'AP', 'D'] as const).map(grade => {
                    const data = report.grade_distribution[grade];
                    const colors = {
                      M: 'bg-green-500',
                      P: 'bg-blue-500',
                      AP: 'bg-yellow-500',
                      D: 'bg-red-500'
                    };
                    return (
                      <div key={grade} className="text-center">
                        <div className="relative w-20 h-20 mx-auto mb-2">
                          <div className={cn(
                            "absolute inset-0 rounded-full flex items-center justify-center text-white font-bold text-xl",
                            colors[grade]
                          )}>
                            {data.count}
                          </div>
                        </div>
                        <p className="font-semibold">{OMR_GRADE_THRESHOLDS[grade].label}</p>
                        <p className="text-sm text-gray-500">{data.percentage}%</p>
                      </div>
                    );
                  })}
                </div>
                
                {/* Visual Bar */}
                <div className="mt-4 h-8 rounded-full overflow-hidden flex">
                  {(['M', 'P', 'AP', 'D'] as const).map(grade => {
                    const data = report.grade_distribution[grade];
                    const colors = {
                      M: 'bg-green-500',
                      P: 'bg-blue-500',
                      AP: 'bg-yellow-500',
                      D: 'bg-red-500'
                    };
                    return data.percentage > 0 ? (
                      <div 
                        key={grade}
                        className={cn("flex items-center justify-center text-white text-sm font-medium", colors[grade])}
                        style={{ width: `${data.percentage}%` }}
                      >
                        {data.percentage > 10 && `${grade}`}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              {/* Indicators Needing Intervention */}
              {report.indicator_summary.filter(i => i.needs_intervention).length > 0 && (
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-700">
                    <AlertTriangle className="w-5 h-5" />
                    Indicators Needing Intervention ({report.indicator_summary.filter(i => i.needs_intervention).length})
                  </h3>
                  <div className="space-y-2">
                    {report.indicator_summary.filter(i => i.needs_intervention).slice(0, 5).map(ind => (
                      <div key={ind.indicator_code} className="flex items-center justify-between bg-white rounded p-2">
                        <div>
                          <span className="font-mono text-sm font-semibold text-red-600">{ind.indicator_code}</span>
                          <p className="text-sm text-gray-600">{ind.indicator_text}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600">{ind.class_percentage}%</p>
                          <p className="text-xs text-gray-500">{ind.students_met}/{ind.total_students} met</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Performers & Students Needing Support */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Top Performers */}
                <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-700">
                    <Award className="w-5 h-5" />
                    Top Performers
                  </h3>
                  <div className="space-y-2">
                    {report.top_performers.slice(0, 5).map((student, i) => (
                      <div key={student.student_id} className="flex items-center justify-between bg-white rounded p-2">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                            i === 0 && "bg-yellow-400 text-yellow-900",
                            i === 1 && "bg-gray-300 text-gray-700",
                            i === 2 && "bg-orange-300 text-orange-800",
                            i > 2 && "bg-gray-100 text-gray-600"
                          )}>
                            {i + 1}
                          </span>
                          <span className="font-medium">{student.student_name}</span>
                        </div>
                        <span className="font-bold text-green-600">{student.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Students Needing Support */}
                <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-orange-700">
                    <Users className="w-5 h-5" />
                    Students Needing Support
                  </h3>
                  <div className="space-y-2">
                    {report.students_needing_support.slice(0, 5).map(student => (
                      <div key={student.student_id} className="bg-white rounded p-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{student.student_name}</span>
                          <span className={cn(
                            "px-2 py-0.5 rounded text-xs font-semibold",
                            student.grade === 'D' ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                          )}>
                            {student.percentage}% ({student.grade})
                          </span>
                        </div>
                        {student.weak_indicators.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Weak: {student.weak_indicators.slice(0, 3).join(', ')}
                            {student.weak_indicators.length > 3 && ` +${student.weak_indicators.length - 3} more`}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Indicators Tab */}
          {activeTab === 'indicators' && (
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                NaCCA Curriculum Indicator Achievement ({report.indicator_summary.length} indicators)
              </h3>
              
              <div className="space-y-3">
                {report.indicator_summary.map(ind => (
                  <div key={ind.indicator_code} className={cn(
                    "border rounded-lg p-4",
                    ind.needs_intervention && "border-red-300 bg-red-50"
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-blue-600">{ind.indicator_code}</span>
                          {ind.needs_intervention && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                              Needs Intervention
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{ind.indicator_text}</p>
                        <p className="text-xs text-gray-400">{ind.strand} &gt; {ind.sub_strand}</p>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-2xl font-bold",
                          ind.class_percentage >= 80 && "text-green-600",
                          ind.class_percentage >= 66 && ind.class_percentage < 80 && "text-blue-600",
                          ind.class_percentage >= 50 && ind.class_percentage < 66 && "text-yellow-600",
                          ind.class_percentage < 50 && "text-red-500"
                        )}>
                          {ind.class_percentage}%
                        </p>
                        <p className="text-sm text-gray-500">
                          {ind.students_met}/{ind.total_students} students met
                        </p>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all",
                          ind.class_percentage >= 80 && "bg-green-500",
                          ind.class_percentage >= 66 && ind.class_percentage < 80 && "bg-blue-500",
                          ind.class_percentage >= 50 && ind.class_percentage < 66 && "bg-yellow-500",
                          ind.class_percentage < 50 && "bg-red-500"
                        )}
                        style={{ width: `${ind.class_percentage}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        {ind.students_met} met standard
                      </span>
                      <span className="flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-red-500" />
                        {ind.students_not_met} need support
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <div>
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
                      <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {results
                      .sort((a, b) => b.percentage - a.percentage)
                      .map((r, idx) => {
                        const indicatorsMet = (r.indicator_results as IndicatorResult[]).filter(i => i.is_met).length;
                        const totalIndicators = (r.indicator_results as IndicatorResult[]).length;
                        
                        return (
                          <tr key={r.id} className={cn(
                            "hover:bg-gray-50",
                            r.grade === 'D' && "bg-red-50"
                          )}>
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
                              {r.grade === 'M' || r.grade === 'P' ? (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                  On Track
                                </span>
                              ) : (
                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                  Needs Support
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-3 bg-gray-50 flex items-center justify-between print:hidden">
          <div className="text-sm text-gray-500">
            Generated on {new Date().toLocaleString()}
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
