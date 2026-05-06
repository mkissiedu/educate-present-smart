import { useMemo } from 'react';
import { Card } from './ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Users, 
  Award,
  Target,
  Percent,
  GraduationCap
} from 'lucide-react';
import { calculateGrade, getGradeColor } from '@/types/scores';

interface StudentScoreData {
  studentId: string;
  studentName: string;
  total: number;
  grade: string;
}

interface Props {
  rows: StudentScoreData[];
  subject: string;
  termNumber: number;
}

interface GradeDistribution {
  grade: string;
  count: number;
  percentage: number;
}

export function ClassAverageSummary({ rows, subject, termNumber }: Props) {
  const stats = useMemo(() => {
    // Filter out students with no scores (total = 0)
    const studentsWithScores = rows.filter(r => r.total > 0);
    
    if (studentsWithScores.length === 0) {
      return null;
    }

    const totals = studentsWithScores.map(r => r.total);
    const sum = totals.reduce((a, b) => a + b, 0);
    const average = sum / studentsWithScores.length;
    const highest = Math.max(...totals);
    const lowest = Math.min(...totals);
    
    // Find top performer
    const topPerformer = studentsWithScores.find(r => r.total === highest);
    
    // Calculate pass rate (50% and above is a pass)
    const passCount = studentsWithScores.filter(r => r.total >= 50).length;
    const passRate = (passCount / studentsWithScores.length) * 100;
    
    // Grade distribution
    const gradeCount: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
    studentsWithScores.forEach(r => {
      const grade = calculateGrade(r.total);
      gradeCount[grade] = (gradeCount[grade] || 0) + 1;
    });
    
    const gradeDistribution: GradeDistribution[] = Object.entries(gradeCount).map(([grade, count]) => ({
      grade,
      count,
      percentage: (count / studentsWithScores.length) * 100
    }));

    return {
      totalStudents: rows.length,
      studentsWithScores: studentsWithScores.length,
      average: average.toFixed(1),
      averageGrade: calculateGrade(average),
      highest,
      lowest,
      topPerformer: topPerformer?.studentName || '-',
      passRate: passRate.toFixed(1),
      passCount,
      gradeDistribution
    };
  }, [rows]);

  if (!stats) {
    return (
      <Card className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 mb-4">
        <div className="flex items-center gap-3 text-gray-500">
          <BarChart3 className="w-5 h-5" />
          <span className="text-sm">No scores entered yet for {subject}. Enter scores to see class statistics.</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4 mb-4">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Class Average */}
        <Card className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs font-medium opacity-90">Class Average</span>
          </div>
          <p className="text-2xl font-bold">{stats.average}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${getGradeColor(stats.averageGrade)}`}>
              {stats.averageGrade}
            </span>
            <span className="text-xs opacity-80">/ 100</span>
          </div>
        </Card>

        {/* Highest Score */}
        <Card className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium opacity-90">Highest Score</span>
          </div>
          <p className="text-2xl font-bold">{stats.highest}</p>
          <p className="text-xs opacity-80 truncate mt-1" title={stats.topPerformer}>
            {stats.topPerformer}
          </p>
        </Card>

        {/* Lowest Score */}
        <Card className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4" />
            <span className="text-xs font-medium opacity-90">Lowest Score</span>
          </div>
          <p className="text-2xl font-bold">{stats.lowest}</p>
          <p className="text-xs opacity-80 mt-1">/ 100</p>
        </Card>

        {/* Pass Rate */}
        <Card className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4" />
            <span className="text-xs font-medium opacity-90">Pass Rate</span>
          </div>
          <p className="text-2xl font-bold">{stats.passRate}%</p>
          <p className="text-xs opacity-80 mt-1">{stats.passCount} of {stats.studentsWithScores} passed</p>
        </Card>

        {/* Students Scored */}
        <Card className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs font-medium opacity-90">Scored</span>
          </div>
          <p className="text-2xl font-bold">{stats.studentsWithScores}</p>
          <p className="text-xs opacity-80 mt-1">of {stats.totalStudents} students</p>
        </Card>

        {/* Top Grade Count */}
        <Card className="p-3 bg-gradient-to-br from-rose-500 to-rose-600 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4" />
            <span className="text-xs font-medium opacity-90">A Grades</span>
          </div>
          <p className="text-2xl font-bold">{stats.gradeDistribution.find(g => g.grade === 'A')?.count || 0}</p>
          <p className="text-xs opacity-80 mt-1">
            {((stats.gradeDistribution.find(g => g.grade === 'A')?.percentage || 0)).toFixed(0)}% of class
          </p>
        </Card>
      </div>

      {/* Grade Distribution Bar */}
      <Card className="p-4 bg-white">
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-semibold text-gray-700">Grade Distribution - {subject} (Term {termNumber})</span>
        </div>
        
        {/* Visual Bar */}
        <div className="flex h-8 rounded-lg overflow-hidden mb-3">
          {stats.gradeDistribution.map((item) => (
            item.count > 0 && (
              <div
                key={item.grade}
                className={`flex items-center justify-center text-xs font-bold transition-all ${
                  item.grade === 'A' ? 'bg-green-500 text-white' :
                  item.grade === 'B' ? 'bg-blue-500 text-white' :
                  item.grade === 'C' ? 'bg-yellow-500 text-white' :
                  item.grade === 'D' ? 'bg-orange-500 text-white' :
                  item.grade === 'E' ? 'bg-amber-600 text-white' :
                  'bg-red-500 text-white'
                }`}
                style={{ width: `${item.percentage}%`, minWidth: item.count > 0 ? '30px' : '0' }}
                title={`${item.grade}: ${item.count} students (${item.percentage.toFixed(1)}%)`}
              >
                {item.percentage >= 8 && item.grade}
              </div>
            )
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-xs">
          {stats.gradeDistribution.map((item) => (
            <div key={item.grade} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded ${
                item.grade === 'A' ? 'bg-green-500' :
                item.grade === 'B' ? 'bg-blue-500' :
                item.grade === 'C' ? 'bg-yellow-500' :
                item.grade === 'D' ? 'bg-orange-500' :
                item.grade === 'E' ? 'bg-amber-600' :
                'bg-red-500'
              }`}></span>
              <span className="text-gray-600">
                <span className="font-semibold">{item.grade}</span>: {item.count} ({item.percentage.toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
