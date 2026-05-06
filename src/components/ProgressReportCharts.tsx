import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  ResponsiveContainer, Tooltip, Legend, Cell, PieChart, Pie, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { SubjectScore, StandardsSummary, TermComparison } from '@/types/progress-report';

interface TermComparisonChartProps {
  data: TermComparison[];
  showTerm1?: boolean;
  showTerm2?: boolean;
  showTerm3?: boolean;
}

export function TermComparisonChart({ data, showTerm1 = true, showTerm2 = true, showTerm3 = true }: TermComparisonChartProps) {
  const chartData = data.map(d => ({
    subject: d.subject.length > 10 ? d.subject.substring(0, 10) + '...' : d.subject,
    fullSubject: d.subject,
    'Term 1': d.term1 || 0,
    'Term 2': d.term2 || 0,
    'Term 3': d.term3 || 0,
    trend: d.trend
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="subject" tick={{ fontSize: 10 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
          <Tooltip 
            formatter={(value: number, name: string) => [`${value}%`, name]}
            labelFormatter={(label) => chartData.find(d => d.subject === label)?.fullSubject || label}
          />
          <Legend />
          {showTerm1 && <Bar dataKey="Term 1" fill="#94a3b8" radius={[4, 4, 0, 0]} />}
          {showTerm2 && <Bar dataKey="Term 2" fill="#60a5fa" radius={[4, 4, 0, 0]} />}
          {showTerm3 && <Bar dataKey="Term 3" fill="#8b5cf6" radius={[4, 4, 0, 0]} />}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface PerformanceTrendChartProps {
  currentScores: SubjectScore[];
}

export function PerformanceTrendChart({ currentScores }: PerformanceTrendChartProps) {
  const chartData = currentScores.map(s => ({
    subject: s.subject.length > 8 ? s.subject.substring(0, 8) + '...' : s.subject,
    fullSubject: s.subject,
    current: s.total,
    previous: s.previousTermTotal || 0,
    change: s.total - (s.previousTermTotal || s.total)
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="subject" tick={{ fontSize: 10 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
          <Tooltip 
            formatter={(value: number, name: string) => [`${value}%`, name]}
            labelFormatter={(label) => chartData.find(d => d.subject === label)?.fullSubject || label}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="previous" 
            stroke="#94a3b8" 
            strokeWidth={2}
            name="Previous Term"
            dot={{ fill: '#94a3b8', r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="current" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            name="Current Term"
            dot={{ fill: '#8b5cf6', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface GradeDistributionChartProps {
  scores: SubjectScore[];
}

export function GradeDistributionChart({ scores }: GradeDistributionChartProps) {
  const gradeCount = {
    M: scores.filter(s => s.grade === 'M').length,
    P: scores.filter(s => s.grade === 'P').length,
    AP: scores.filter(s => s.grade === 'AP').length,
    D: scores.filter(s => s.grade === 'D').length
  };

  const data = [
    { name: 'Mastery (80%+)', value: gradeCount.M, color: '#10b981' },
    { name: 'Proficiency (66-79%)', value: gradeCount.P, color: '#3b82f6' },
    { name: 'Approaching (50-65%)', value: gradeCount.AP, color: '#f59e0b' },
    { name: 'Developing (<50%)', value: gradeCount.D, color: '#ef4444' }
  ].filter(d => d.value > 0);

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
            label={({ name, value }) => `${value}`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number, name: string) => [`${value} subjects`, name]} />
          <Legend 
            layout="vertical" 
            align="right" 
            verticalAlign="middle"
            wrapperStyle={{ fontSize: '10px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

interface StandardsMasteryChartProps {
  summaries: StandardsSummary[];
}

export function StandardsMasteryChart({ summaries }: StandardsMasteryChartProps) {
  const chartData = summaries.map(s => ({
    subject: s.subject.length > 10 ? s.subject.substring(0, 10) + '...' : s.subject,
    fullSubject: s.subject,
    mastery: s.masteryPercentage,
    mastered: s.mastered,
    proficient: s.proficient,
    approaching: s.approachingProficiency,
    developing: s.developing
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
          <YAxis type="category" dataKey="subject" tick={{ fontSize: 10 }} width={80} />
          <Tooltip 
            formatter={(value: number) => [`${value}%`, 'Mastery Rate']}
            labelFormatter={(label) => chartData.find(d => d.subject === label)?.fullSubject || label}
          />
          <Bar dataKey="mastery" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.mastery >= 80 ? '#10b981' : entry.mastery >= 60 ? '#3b82f6' : entry.mastery >= 40 ? '#f59e0b' : '#ef4444'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface SubjectRadarChartProps {
  scores: SubjectScore[];
}

export function SubjectRadarChart({ scores }: SubjectRadarChartProps) {
  const chartData = scores.slice(0, 8).map(s => ({
    subject: s.subject.length > 12 ? s.subject.substring(0, 12) + '...' : s.subject,
    score: s.total,
    fullMark: 100
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.5}
          />
          <Tooltip formatter={(value: number) => [`${value}%`, 'Score']} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface AttendanceChartProps {
  attendance: {
    present: number;
    absent: number;
    late: number;
    excused: number;
  };
}

export function AttendanceChart({ attendance }: AttendanceChartProps) {
  const data = [
    { name: 'Present', value: attendance.present, color: '#10b981' },
    { name: 'Absent', value: attendance.absent, color: '#ef4444' },
    { name: 'Late', value: attendance.late, color: '#f59e0b' },
    { name: 'Excused', value: attendance.excused, color: '#94a3b8' }
  ].filter(d => d.value > 0);

  const total = attendance.present + attendance.absent + attendance.late + attendance.excused;

  return (
    <div className="w-full h-40">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={30}
            outerRadius={55}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number, name: string) => [`${value} days (${Math.round((value/total)*100)}%)`, name]} />
          <Legend 
            layout="horizontal" 
            align="center" 
            verticalAlign="bottom"
            wrapperStyle={{ fontSize: '10px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
