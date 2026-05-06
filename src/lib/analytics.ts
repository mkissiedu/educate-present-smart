import { supabase } from './supabase';
import { Student, StudentProgress, Skill } from '../types/student';

export interface ClassMetrics {
  totalStudents: number;
  averageMastery: number;
  skillsAssessed: number;
  studentsAtRisk: number;
}

export interface SkillMasteryData {
  skillId: string;
  skillName: string;
  masteryCount: number;
  totalAssessed: number;
  masteryRate: number;
}

export interface StudentRiskData {
  studentId: string;
  studentName: string;
  masteryRate: number;
  skillsAssessed: number;
  skillsMastered: number;
  riskLevel: 'high' | 'medium' | 'low';
}

export interface TrendData {
  date: string;
  masteryRate: number;
  assessmentCount: number;
}

export async function fetchClassMetrics(classId: string): Promise<ClassMetrics> {
  const { data: students } = await supabase
    .from('students')
    .select('id')
    .eq('class_id', classId);

  const studentIds = students?.map(s => s.id) || [];

  const { data: progress } = await supabase
    .from('student_progress')
    .select('*')
    .in('student_id', studentIds);

  const totalStudents = students?.length || 0;
  const masteredCount = progress?.filter(p => p.mastery_status === 'yes').length || 0;
  const totalAssessments = progress?.length || 0;
  const averageMastery = totalAssessments > 0 ? (masteredCount / totalAssessments) * 100 : 0;
  
  const uniqueSkills = new Set(progress?.map(p => p.skill_id)).size;
  
  const studentsAtRisk = await calculateStudentsAtRisk(studentIds);

  return {
    totalStudents,
    averageMastery: Math.round(averageMastery),
    skillsAssessed: uniqueSkills,
    studentsAtRisk
  };
}

async function calculateStudentsAtRisk(studentIds: string[]): Promise<number> {
  let atRiskCount = 0;
  
  for (const studentId of studentIds) {
    const { data } = await supabase
      .from('student_progress')
      .select('mastery_status')
      .eq('student_id', studentId);
    
    if (data && data.length > 0) {
      const masteryRate = (data.filter(p => p.mastery_status === 'yes').length / data.length) * 100;
      if (masteryRate < 60) atRiskCount++;
    }
  }
  
  return atRiskCount;
}

export async function fetchSkillMasteryData(classId: string): Promise<SkillMasteryData[]> {
  const { data: students } = await supabase
    .from('students')
    .select('id')
    .eq('class_id', classId);

  const studentIds = students?.map(s => s.id) || [];

  const { data: progress } = await supabase
    .from('student_progress')
    .select('skill_id, mastery_status')
    .in('student_id', studentIds);

  const { data: skills } = await supabase
    .from('skills')
    .select('id, name');

  const skillMap = new Map(skills?.map(s => [s.id, s.name]));
  const skillStats = new Map<string, { mastered: number; total: number }>();

  progress?.forEach(p => {
    const current = skillStats.get(p.skill_id) || { mastered: 0, total: 0 };
    current.total++;
    if (p.mastery_status === 'yes') current.mastered++;
    skillStats.set(p.skill_id, current);
  });

  return Array.from(skillStats.entries())
    .map(([skillId, stats]) => ({
      skillId,
      skillName: skillMap.get(skillId) || 'Unknown Skill',
      masteryCount: stats.mastered,
      totalAssessed: stats.total,
      masteryRate: Math.round((stats.mastered / stats.total) * 100)
    }))
    .sort((a, b) => b.masteryRate - a.masteryRate);
}

export async function fetchStudentRiskData(classId: string): Promise<StudentRiskData[]> {
  const { data: students } = await supabase
    .from('students')
    .select('id, first_name, last_name')
    .eq('class_id', classId);

  const riskData: StudentRiskData[] = [];

  for (const student of students || []) {
    const { data: progress } = await supabase
      .from('student_progress')
      .select('mastery_status')
      .eq('student_id', student.id);

    if (progress && progress.length > 0) {
      const skillsMastered = progress.filter(p => p.mastery_status === 'yes').length;
      const masteryRate = (skillsMastered / progress.length) * 100;
      
      let riskLevel: 'high' | 'medium' | 'low' = 'low';
      if (masteryRate < 50) riskLevel = 'high';
      else if (masteryRate < 70) riskLevel = 'medium';

      riskData.push({
        studentId: student.id,
        studentName: `${student.first_name} ${student.last_name}`,
        masteryRate: Math.round(masteryRate),
        skillsAssessed: progress.length,
        skillsMastered,
        riskLevel
      });
    }
  }

  return riskData.sort((a, b) => a.masteryRate - b.masteryRate);
}

export async function fetchTrendData(classId: string, days: number = 30): Promise<TrendData[]> {
  const { data: students } = await supabase
    .from('students')
    .select('id')
    .eq('class_id', classId);

  const studentIds = students?.map(s => s.id) || [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: progress } = await supabase
    .from('student_progress')
    .select('assessed_at, mastery_status')
    .in('student_id', studentIds)
    .gte('assessed_at', startDate.toISOString());

  const dailyStats = new Map<string, { mastered: number; total: number }>();

  progress?.forEach(p => {
    const date = new Date(p.assessed_at).toISOString().split('T')[0];
    const current = dailyStats.get(date) || { mastered: 0, total: 0 };
    current.total++;
    if (p.mastery_status === 'yes') current.mastered++;
    dailyStats.set(date, current);
  });

  return Array.from(dailyStats.entries())
    .map(([date, stats]) => ({
      date,
      masteryRate: Math.round((stats.mastered / stats.total) * 100),
      assessmentCount: stats.total
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export interface PredictiveInsight {
  type: 'warning' | 'success' | 'info';
  title: string;
  description: string;
  actionItems: string[];
  studentsAffected?: number;
}

export async function generatePredictiveInsights(classId: string): Promise<PredictiveInsight[]> {
  const insights: PredictiveInsight[] = [];
  
  const [riskData, skillData, trendData] = await Promise.all([
    fetchStudentRiskData(classId),
    fetchSkillMasteryData(classId),
    fetchTrendData(classId, 14)
  ]);

  const highRiskStudents = riskData.filter(s => s.riskLevel === 'high');
  if (highRiskStudents.length > 0) {
    insights.push({
      type: 'warning',
      title: 'Immediate Intervention Needed',
      description: `${highRiskStudents.length} student(s) showing mastery rates below 50%`,
      actionItems: [
        'Schedule one-on-one tutoring sessions',
        'Review foundational skills assessment',
        'Consider small group intervention'
      ],
      studentsAffected: highRiskStudents.length
    });
  }

  const strugglingSkills = skillData.filter(s => s.masteryRate < 40);
  if (strugglingSkills.length > 0) {
    insights.push({
      type: 'warning',
      title: 'Skills Requiring Re-teaching',
      description: `${strugglingSkills.length} skill(s) with class mastery below 40%`,
      actionItems: [
        'Plan targeted mini-lessons for these skills',
        'Use alternative teaching strategies',
        'Increase practice opportunities'
      ],
      studentsAffected: skillData[0]?.totalAssessed || 0
    });
  }

  if (trendData.length >= 7) {
    const recentAvg = trendData.slice(-3).reduce((sum, d) => sum + d.masteryRate, 0) / 3;
    const olderAvg = trendData.slice(0, 3).reduce((sum, d) => sum + d.masteryRate, 0) / 3;
    
    if (recentAvg > olderAvg + 10) {
      insights.push({
        type: 'success',
        title: 'Positive Progress Trend',
        description: 'Class mastery rate has improved significantly over the past week',
        actionItems: [
          'Continue current teaching strategies',
          'Celebrate student progress',
          'Document successful approaches'
        ]
      });
    }
  }

  const excellentSkills = skillData.filter(s => s.masteryRate >= 85);
  if (excellentSkills.length > 5) {
    insights.push({
      type: 'success',
      title: 'Strong Skill Mastery',
      description: `${excellentSkills.length} skills mastered by 85%+ of students`,
      actionItems: [
        'Move to advanced applications',
        'Introduce extension activities',
        'Use peer tutoring for struggling students'
      ]
    });
  }

  return insights;
}
