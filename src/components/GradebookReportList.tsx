import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Student } from '@/types/student';
import { getStudentScores, getReportCard } from '@/lib/supabase-scores';
import { FileText, Send, Eye, CheckCircle, Clock, User, Loader2, BarChart3, TrendingUp } from 'lucide-react';

interface Props {
  students: Student[];
  termId: string;
  termNumber: number;
  academicYear: string;
  onViewReport: (student: Student) => void;
  onGenerateReport: (student: Student) => void;
}

interface StudentReportStatus {
  student: Student;
  hasScores: boolean;
  scoreCount: number;
  avgScore: number;
  grade: string;
  reportGenerated: boolean;
  whatsappSent: boolean;
}

// Calculate grade based on the new grading scale
const calculateGrade = (score: number): string => {
  if (score >= 80) return 'M';
  if (score >= 66) return 'P';
  if (score >= 50) return 'AP';
  return 'D';
};

const getGradeColor = (grade: string): string => {
  switch (grade) {
    case 'M': return 'bg-emerald-100 text-emerald-800';
    case 'P': return 'bg-blue-100 text-blue-800';
    case 'AP': return 'bg-amber-100 text-amber-800';
    case 'D': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getGradeLabel = (grade: string): string => {
  switch (grade) {
    case 'M': return 'Mastery';
    case 'P': return 'Proficiency';
    case 'AP': return 'Approaching';
    case 'D': return 'Developing';
    default: return '';
  }
};

export function GradebookReportList({ students, termId, termNumber, academicYear, onViewReport, onGenerateReport }: Props) {
  const [statuses, setStatuses] = useState<StudentReportStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatuses();
  }, [students, termId]);

  const loadStatuses = async () => {
    if (!termId || students.length === 0) {
      setStatuses([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const results: StudentReportStatus[] = [];
    for (const s of students) {
      const scores = await getStudentScores(s.id, termId);
      const report = await getReportCard(s.id, termId);
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, sc) => a + sc.total, 0) / scores.length) : 0;
      results.push({
        student: s, 
        hasScores: scores.length > 0, 
        scoreCount: scores.length,
        avgScore: avg, 
        grade: calculateGrade(avg),
        reportGenerated: !!report, 
        whatsappSent: report?.sent_via_whatsapp || false
      });
    }
    setStatuses(results);
    setLoading(false);
  };

  const getStatusBadge = (status: StudentReportStatus) => {
    if (status.whatsappSent) return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" />Sent</span>;
    if (status.reportGenerated) return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center gap-1"><FileText className="w-3 h-3" />Ready</span>;
    if (status.hasScores) return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs flex items-center gap-1"><Clock className="w-3 h-3" />Pending</span>;
    return <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">No Scores</span>;
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-white" /></div>;

  const sentCount = statuses.filter(s => s.whatsappSent).length;
  const readyCount = statuses.filter(s => s.reportGenerated && !s.whatsappSent).length;
  const pendingCount = statuses.filter(s => s.hasScores && !s.reportGenerated).length;

  // Calculate class statistics
  const studentsWithScores = statuses.filter(s => s.hasScores);
  const classAverage = studentsWithScores.length > 0 
    ? Math.round(studentsWithScores.reduce((sum, s) => sum + s.avgScore, 0) / studentsWithScores.length)
    : 0;
  const masteryCount = statuses.filter(s => s.grade === 'M').length;
  const proficiencyCount = statuses.filter(s => s.grade === 'P').length;

  return (
    <Card className="p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          Progress Reports - Term {termNumber} ({academicYear})
        </h3>
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-green-500 rounded-full" /> Sent ({sentCount})</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-500 rounded-full" /> Ready ({readyCount})</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-yellow-500 rounded-full" /> Pending ({pendingCount})</span>
        </div>
      </div>

      {/* Class Statistics */}
      {studentsWithScores.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-700">{classAverage}%</div>
            <div className="text-xs text-gray-600">Class Average</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{masteryCount}</div>
            <div className="text-xs text-gray-600">At Mastery</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{proficiencyCount}</div>
            <div className="text-xs text-gray-600">Proficient</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{studentsWithScores.length}</div>
            <div className="text-xs text-gray-600">With Scores</div>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {statuses.map(status => (
          <div key={status.student.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{status.student.name || `${status.student.first_name} ${status.student.last_name}`}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{status.student.class_level}</span>
                  <span>•</span>
                  <span>{status.scoreCount} subjects</span>
                  {status.hasScores && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {status.avgScore}%
                      </span>
                    </>
                  )}
                </div>
              </div>
              {status.hasScores && (
                <Badge className={`${getGradeColor(status.grade)} text-xs`}>
                  {status.grade} - {getGradeLabel(status.grade)}
                </Badge>
              )}
              {getStatusBadge(status)}
              <div className="flex gap-1 flex-shrink-0">
                <Button size="sm" variant="outline" onClick={() => onViewReport(status.student)} disabled={!status.hasScores} title="Quick View">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => onGenerateReport(status.student)} 
                  disabled={!status.hasScores}
                  className="bg-purple-600 hover:bg-purple-700" 
                  title="Generate Progress Report"
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Report
                </Button>
              </div>
            </div>
          </div>
        ))}
        {statuses.length === 0 && (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No students in this class</p>
            <p className="text-sm text-gray-400">Add students to generate progress reports</p>
          </div>
        )}
      </div>

      {/* Grade Legend */}
      <div className="mt-4 pt-3 border-t">
        <div className="flex flex-wrap gap-3 text-xs">
          <span className="font-medium text-gray-600">Grading Scale:</span>
          <Badge className="bg-emerald-100 text-emerald-800">M - Mastery (80%+)</Badge>
          <Badge className="bg-blue-100 text-blue-800">P - Proficiency (66-79%)</Badge>
          <Badge className="bg-amber-100 text-amber-800">AP - Approaching (50-65%)</Badge>
          <Badge className="bg-red-100 text-red-800">D - Developing (&lt;50%)</Badge>
        </div>
      </div>
    </Card>
  );
}
