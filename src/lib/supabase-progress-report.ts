import { supabase } from './supabase';
import { 
  TermScoreData, 
  SubjectScore, 
  AttendanceData, 
  StandardsAchievement,
  StandardsSummary,
  TermComparison 
} from '@/types/progress-report';
import { calculateGrade } from '@/types/scores';

// Get all scores for a student across multiple terms
export async function getStudentMultiTermScores(
  studentId: string,
  termIds: string[]
): Promise<Map<string, SubjectScore[]>> {
  const termScoresMap = new Map<string, SubjectScore[]>();
  
  for (const termId of termIds) {
    const { data, error } = await supabase
      .from('student_scores')
      .select('*')
      .eq('student_id', studentId)
      .eq('term_id', termId);
    
    if (!error && data) {
      const scores: SubjectScore[] = data.map(s => ({
        subject: s.subject,
        cat1: s.cat_1 || 0,
        cat2: s.cat_2 || 0,
        cat3: s.cat_3 || 0,
        cat4: s.cat_4 || 0,
        ete: s.ete || 0,
        total: s.total || 0,
        grade: s.grade || calculateGrade(s.total || 0),
        trend: 'stable' as const
      }));
      termScoresMap.set(termId, scores);
    }
  }
  
  return termScoresMap;
}

// Get attendance data for a student within a date range
export async function getStudentAttendanceForTerm(
  studentId: string,
  startDate: string,
  endDate: string
): Promise<AttendanceData> {
  const { data, error } = await supabase
    .from('attendance')
    .select('status')
    .eq('student_id', studentId)
    .gte('date', startDate)
    .lte('date', endDate);
  
  if (error || !data) {
    return { totalDays: 0, present: 0, absent: 0, late: 0, excused: 0, percentage: 0 };
  }
  
  const records = data;
  const totalDays = records.length;
  const present = records.filter(r => r.status === 'present').length;
  const absent = records.filter(r => r.status === 'absent').length;
  const late = records.filter(r => r.status === 'late').length;
  const excused = records.filter(r => r.status === 'excused').length;
  
  return {
    totalDays,
    present,
    absent,
    late,
    excused,
    percentage: totalDays > 0 ? Math.round((present / totalDays) * 100) : 0
  };
}

// Get all indicator assessments for a student
export async function getStudentStandardsAchievement(
  studentId: string,
  termId: string
): Promise<StandardsAchievement[]> {
  const { data, error } = await supabase
    .from('indicator_assessments')
    .select('*')
    .eq('student_id', studentId)
    .eq('term_id', termId)
    .order('subject')
    .order('strand')
    .order('indicator_code');
  
  if (error || !data) return [];
  
  return data.map(d => ({
    subject: d.subject,
    strand: d.strand,
    indicatorCode: d.indicator_code,
    indicatorText: d.indicator_text,
    status: d.status,
    percentage: d.score,
    assessmentDate: d.assessment_date
  }));
}

// Calculate standards summary by subject
export function calculateStandardsSummary(
  achievements: StandardsAchievement[]
): StandardsSummary[] {
  const subjectMap = new Map<string, StandardsAchievement[]>();
  
  achievements.forEach(a => {
    const existing = subjectMap.get(a.subject) || [];
    existing.push(a);
    subjectMap.set(a.subject, existing);
  });
  
  const summaries: StandardsSummary[] = [];
  
  subjectMap.forEach((indicators, subject) => {
    const mastered = indicators.filter(i => i.status === 'M').length;
    const proficient = indicators.filter(i => i.status === 'P').length;
    const approachingProficiency = indicators.filter(i => i.status === 'AP').length;
    const developing = indicators.filter(i => i.status === 'D').length;
    const notAssessed = indicators.filter(i => i.status === 'not-assessed').length;
    const totalIndicators = indicators.length;
    
    summaries.push({
      subject,
      totalIndicators,
      mastered,
      proficient,
      approachingProficiency,
      developing,
      notAssessed,
      masteryPercentage: totalIndicators > 0 
        ? Math.round(((mastered + proficient) / totalIndicators) * 100) 
        : 0
    });
  });
  
  return summaries;
}

// Calculate term-over-term comparison
export function calculateTermComparison(
  currentScores: SubjectScore[],
  previousScores: SubjectScore[]
): SubjectScore[] {
  return currentScores.map(current => {
    const previous = previousScores.find(p => p.subject === current.subject);
    const previousTotal = previous?.total || 0;
    const change = current.total - previousTotal;
    
    return {
      ...current,
      previousTermTotal: previousTotal,
      trend: change > 5 ? 'up' : change < -5 ? 'down' : 'stable'
    };
  });
}

// Get term comparison data for charts
export function getTermComparisonData(
  termScoresMap: Map<string, SubjectScore[]>,
  termOrder: { id: string; name: string; number: number }[]
): TermComparison[] {
  const subjects = new Set<string>();
  termScoresMap.forEach(scores => {
    scores.forEach(s => subjects.add(s.subject));
  });
  
  const comparisons: TermComparison[] = [];
  
  subjects.forEach(subject => {
    const comparison: TermComparison = {
      subject,
      change: 0,
      trend: 'stable'
    };
    
    termOrder.forEach((term, index) => {
      const scores = termScoresMap.get(term.id);
      const subjectScore = scores?.find(s => s.subject === subject);
      
      if (term.number === 1) comparison.term1 = subjectScore?.total;
      if (term.number === 2) comparison.term2 = subjectScore?.total;
      if (term.number === 3) comparison.term3 = subjectScore?.total;
    });
    
    // Calculate overall change
    const values = [comparison.term1, comparison.term2, comparison.term3].filter(v => v !== undefined) as number[];
    if (values.length >= 2) {
      comparison.change = values[values.length - 1] - values[0];
      comparison.trend = comparison.change > 5 ? 'improving' : comparison.change < -5 ? 'declining' : 'stable';
    }
    
    comparisons.push(comparison);
  });
  
  return comparisons;
}

// Get all terms for an academic year
export async function getTermsForAcademicYear(academicYear: string) {
  const { data, error } = await supabase
    .from('term_settings')
    .select('*')
    .eq('academic_year', academicYear)
    .order('term_number', { ascending: true });
  
  if (error || !data) return [];
  
  return data.map(t => ({
    id: t.id,
    name: t.term_name,
    number: t.term_number,
    startDate: t.start_date,
    endDate: t.end_date,
    academicYear: t.academic_year
  }));
}

// Save progress report to database
export async function saveProgressReport(
  studentId: string,
  termId: string,
  reportData: {
    teacherComments: string;
    headTeacherComments: string;
    conduct: string;
    promotionStatus: string;
    recommendations: string;
  }
): Promise<boolean> {
  const { error } = await supabase
    .from('progress_reports')
    .upsert({
      student_id: studentId,
      term_id: termId,
      teacher_comments: reportData.teacherComments,
      head_teacher_comments: reportData.headTeacherComments,
      conduct: reportData.conduct,
      promotion_status: reportData.promotionStatus,
      ai_recommendations: reportData.recommendations,
      generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'student_id,term_id'
    });
  
  return !error;
}

// Get saved progress report
export async function getSavedProgressReport(studentId: string, termId: string) {
  const { data, error } = await supabase
    .from('progress_reports')
    .select('*')
    .eq('student_id', studentId)
    .eq('term_id', termId)
    .single();
  
  if (error) return null;
  return data;
}
