import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Student } from '@/types/student';
import { 
  StudentStandardsStatus, 
  IndicatorStatus,
  getGradeColor, 
  getGradeBgColor,
  getGradeRemark,
  GRADE_THRESHOLDS
} from '@/types/scores';
import { 
  getStudentStandardsStatus, 
  saveIndicatorAssessment,
  getClassIndicatorAssessments,
  IndicatorAssessment
} from '@/lib/supabase-indicator-assessments';
import { useSchool } from '@/contexts/SchoolContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Target,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  Users,
  BookOpen,
  Loader2,
  Save,
  ChevronDown,
  ChevronRight,
  Filter,
  Download,
  BarChart3
} from 'lucide-react';

interface Props {
  students: Student[];
  className: string;
  subject: string;
  termId: string;
  curriculumIndicators: { code: string; text: string; strand: string; subStrand: string }[];
}

export function StudentStandardsMap({ 
  students, 
  className, 
  subject, 
  termId, 
  curriculumIndicators 
}: Props) {
  const { currentSchool } = useSchool();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [studentStatuses, setStudentStatuses] = useState<StudentStandardsStatus[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [expandedStrands, setExpandedStrands] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadData();
  }, [students, className, subject, termId]);

  const loadData = async () => {
    if (!students.length || !termId) return;
    setLoading(true);

    try {
      const statuses = await Promise.all(
        students.map(student => 
          getStudentStandardsStatus(
            student.id,
            student.name || `${student.first_name} ${student.last_name}`,
            className,
            subject,
            termId,
            curriculumIndicators
          )
        )
      );
      setStudentStatuses(statuses);
    } catch (error) {
      console.error('Error loading standards status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = async (
    studentId: string,
    indicator: { code: string; text: string; strand: string; subStrand: string },
    score: number
  ) => {
    if (!currentSchool?.id || !user?.id) return;
    
    setSaving(`${studentId}-${indicator.code}`);
    
    try {
      await saveIndicatorAssessment({
        student_id: studentId,
        indicator_code: indicator.code,
        indicator_text: indicator.text,
        strand: indicator.strand,
        sub_strand: indicator.subStrand,
        subject,
        class_name: className,
        term_id: termId,
        school_id: currentSchool.id,
        teacher_id: user.id,
        score,
        status: 'not-assessed',
        assessment_date: new Date().toISOString()
      });
      
      // Reload data
      await loadData();
    } catch (error) {
      console.error('Error saving assessment:', error);
    } finally {
      setSaving(null);
    }
  };

  const toggleStrand = (strand: string) => {
    setExpandedStrands(prev => {
      const next = new Set(prev);
      if (next.has(strand)) {
        next.delete(strand);
      } else {
        next.add(strand);
      }
      return next;
    });
  };

  // Group indicators by strand
  const indicatorsByStrand = curriculumIndicators.reduce((acc, ind) => {
    if (!acc[ind.strand]) acc[ind.strand] = [];
    acc[ind.strand].push(ind);
    return acc;
  }, {} as Record<string, typeof curriculumIndicators>);

  // Calculate class-wide statistics
  const classStats = {
    totalStudents: students.length,
    totalIndicators: curriculumIndicators.length,
    avgMastery: studentStatuses.length > 0 
      ? Math.round(studentStatuses.reduce((sum, s) => sum + (s.summary.mastered / s.summary.totalIndicators) * 100, 0) / studentStatuses.length)
      : 0,
    avgProficiency: studentStatuses.length > 0
      ? Math.round(studentStatuses.reduce((sum, s) => sum + ((s.summary.mastered + s.summary.proficient) / s.summary.totalIndicators) * 100, 0) / studentStatuses.length)
      : 0
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'M': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'P': return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'AP': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'D': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Target className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'M': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'P': 'bg-blue-100 text-blue-800 border-blue-200',
      'AP': 'bg-amber-100 text-amber-800 border-amber-200',
      'D': 'bg-red-100 text-red-800 border-red-200',
      'not-assessed': 'bg-gray-100 text-gray-600 border-gray-200'
    };
    const labels: Record<string, string> = {
      'M': 'Mastery',
      'P': 'Proficient',
      'AP': 'Approaching',
      'D': 'Developing',
      'not-assessed': 'Not Assessed'
    };
    return (
      <Badge variant="outline" className={`text-xs ${colors[status] || colors['not-assessed']}`}>
        {labels[status] || 'N/A'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="bg-white">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <span className="ml-3 text-gray-600">Loading standards map...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-600">Students</p>
                <p className="text-2xl font-bold text-purple-800">{classStats.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-600">Indicators</p>
                <p className="text-2xl font-bold text-blue-800">{classStats.totalIndicators}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-emerald-600">Avg Mastery</p>
                <p className="text-2xl font-bold text-emerald-800">{classStats.avgMastery}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 rounded-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-amber-600">Proficiency+</p>
                <p className="text-2xl font-bold text-amber-800">{classStats.avgProficiency}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grade Legend */}
      <Card className="bg-white">
        <CardContent className="p-4">
          <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Grade Scale
          </h4>
          <div className="flex flex-wrap gap-3">
            {GRADE_THRESHOLDS.map(g => (
              <div key={g.grade} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full bg-${g.color}-500`} />
                <span className="font-bold text-gray-800">{g.grade}</span>
                <span className="text-gray-600 text-sm">= {g.label}</span>
                <span className="text-gray-400 text-xs">({g.min}-{g.max}%)</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="bg-white">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                {students.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name || `${s.first_name} ${s.last_name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="M">Mastery</SelectItem>
                <SelectItem value="P">Proficient</SelectItem>
                <SelectItem value="AP">Approaching</SelectItem>
                <SelectItem value="D">Developing</SelectItem>
                <SelectItem value="not-assessed">Not Assessed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Standards Map */}
      <Tabs defaultValue="by-student" className="space-y-4">
        <TabsList className="bg-gray-100">
          <TabsTrigger value="by-student">By Student</TabsTrigger>
          <TabsTrigger value="by-indicator">By Indicator</TabsTrigger>
        </TabsList>

        {/* By Student View */}
        <TabsContent value="by-student" className="space-y-4">
          {studentStatuses
            .filter(s => selectedStudent === 'all' || s.studentId === selectedStudent)
            .map(studentStatus => (
              <Card key={studentStatus.studentId} className="bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{studentStatus.studentName}</CardTitle>
                      <p className="text-sm text-gray-500">{studentStatus.className} • {studentStatus.subject}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Progress</p>
                        <p className="text-lg font-bold text-purple-600">
                          {Math.round(((studentStatus.summary.mastered + studentStatus.summary.proficient) / studentStatus.summary.totalIndicators) * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Summary badges */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge className="bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {studentStatus.summary.mastered} Mastered
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {studentStatus.summary.proficient} Proficient
                    </Badge>
                    <Badge className="bg-amber-100 text-amber-800">
                      <Clock className="w-3 h-3 mr-1" />
                      {studentStatus.summary.approachingProficiency} Approaching
                    </Badge>
                    <Badge className="bg-red-100 text-red-800">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {studentStatus.summary.developing} Developing
                    </Badge>
                    <Badge className="bg-gray-100 text-gray-600">
                      <Target className="w-3 h-3 mr-1" />
                      {studentStatus.summary.notAssessed} Not Assessed
                    </Badge>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
                      <div 
                        className="bg-emerald-500 transition-all" 
                        style={{ width: `${(studentStatus.summary.mastered / studentStatus.summary.totalIndicators) * 100}%` }} 
                      />
                      <div 
                        className="bg-blue-500 transition-all" 
                        style={{ width: `${(studentStatus.summary.proficient / studentStatus.summary.totalIndicators) * 100}%` }} 
                      />
                      <div 
                        className="bg-amber-500 transition-all" 
                        style={{ width: `${(studentStatus.summary.approachingProficiency / studentStatus.summary.totalIndicators) * 100}%` }} 
                      />
                      <div 
                        className="bg-red-500 transition-all" 
                        style={{ width: `${(studentStatus.summary.developing / studentStatus.summary.totalIndicators) * 100}%` }} 
                      />
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Indicators by strand */}
                  <div className="space-y-3">
                    {Object.entries(indicatorsByStrand).map(([strand, indicators]) => {
                      const strandIndicators = studentStatus.indicators.filter(i => i.strand === strand);
                      const strandMastered = strandIndicators.filter(i => i.status === 'M' || i.status === 'P').length;
                      const isExpanded = expandedStrands.has(`${studentStatus.studentId}-${strand}`);

                      return (
                        <div key={strand} className="border rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleStrand(`${studentStatus.studentId}-${strand}`)}
                            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-500" />
                              )}
                              <span className="font-medium text-gray-800">{strand}</span>
                              <Badge variant="outline" className="text-xs">
                                {indicators.length} indicators
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">
                                {strandMastered}/{strandIndicators.length} proficient+
                              </span>
                              <Progress 
                                value={(strandMastered / strandIndicators.length) * 100} 
                                className="w-20 h-2"
                              />
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="p-3 space-y-2 bg-white">
                              {strandIndicators
                                .filter(i => filterStatus === 'all' || i.status === filterStatus)
                                .map(indicator => (
                                  <div 
                                    key={indicator.indicatorCode}
                                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                                  >
                                    <div className="flex items-center gap-3 flex-1">
                                      {getStatusIcon(indicator.status)}
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800">
                                          {indicator.indicatorCode}
                                        </p>
                                        <p className="text-xs text-gray-500 line-clamp-1">
                                          {indicator.indicatorText}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <Input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={indicator.percentage || ''}
                                        onChange={(e) => {
                                          const ind = indicators.find(i => i.code === indicator.indicatorCode);
                                          if (ind) {
                                            handleScoreChange(
                                              studentStatus.studentId,
                                              ind,
                                              Math.min(100, Math.max(0, Number(e.target.value)))
                                            );
                                          }
                                        }}
                                        className="w-16 h-8 text-center text-sm"
                                        placeholder="%"
                                      />
                                      {getStatusBadge(indicator.status)}
                                      {saving === `${studentStatus.studentId}-${indicator.indicatorCode}` && (
                                        <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                                      )}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        {/* By Indicator View */}
        <TabsContent value="by-indicator" className="space-y-4">
          {Object.entries(indicatorsByStrand).map(([strand, indicators]) => (
            <Card key={strand} className="bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  {strand}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium text-gray-600">Indicator</th>
                        {studentStatuses.map(s => (
                          <th key={s.studentId} className="text-center p-2 font-medium text-gray-600 min-w-[80px]">
                            {s.studentName.split(' ')[0]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {indicators
                        .filter(ind => {
                          if (filterStatus === 'all') return true;
                          return studentStatuses.some(s => {
                            const status = s.indicators.find(i => i.indicatorCode === ind.code);
                            return status?.status === filterStatus;
                          });
                        })
                        .map(indicator => (
                          <tr key={indicator.code} className="border-b hover:bg-gray-50">
                            <td className="p-2">
                              <p className="font-medium text-gray-800">{indicator.code}</p>
                              <p className="text-xs text-gray-500 line-clamp-2">{indicator.text}</p>
                            </td>
                            {studentStatuses.map(studentStatus => {
                              const status = studentStatus.indicators.find(i => i.indicatorCode === indicator.code);
                              return (
                                <td key={studentStatus.studentId} className="text-center p-2">
                                  <div className="flex flex-col items-center gap-1">
                                    {getStatusIcon(status?.status || 'not-assessed')}
                                    <span className="text-xs font-medium">
                                      {status?.percentage ? `${status.percentage}%` : '-'}
                                    </span>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default StudentStandardsMap;
