import { supabase } from './supabase';
import { IndicatorStatus, StudentStandardsStatus, getGradeFromPercentage } from '@/types/scores';

export interface IndicatorAssessment {
  id: string;
  student_id: string;
  indicator_code: string;
  indicator_text: string;
  strand: string;
  sub_strand: string;
  subject: string;
  class_name: string;
  term_id: string;
  school_id: string;
  teacher_id: string;
  score: number;
  status: 'M' | 'P' | 'AP' | 'D' | 'not-assessed';
  assessment_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Save or update an indicator assessment
export async function saveIndicatorAssessment(
  assessment: Omit<IndicatorAssessment, 'id' | 'created_at' | 'updated_at'>
): Promise<IndicatorAssessment | null> {
  // Calculate status from score
  const status = assessment.score > 0 ? getGradeFromPercentage(assessment.score) : 'not-assessed';
  
  const { data, error } = await supabase
    .from('indicator_assessments')
    .upsert({
      ...assessment,
      status,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'student_id,indicator_code,term_id'
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving indicator assessment:', error);
    return null;
  }
  return data;
}

// Batch save indicator assessments
export async function saveIndicatorAssessmentsBatch(
  assessments: Omit<IndicatorAssessment, 'id' | 'created_at' | 'updated_at'>[]
): Promise<boolean> {
  const assessmentsWithStatus = assessments.map(a => ({
    ...a,
    status: a.score > 0 ? getGradeFromPercentage(a.score) : 'not-assessed',
    updated_at: new Date().toISOString()
  }));

  const { error } = await supabase
    .from('indicator_assessments')
    .upsert(assessmentsWithStatus, {
      onConflict: 'student_id,indicator_code,term_id'
    });

  if (error) {
    console.error('Error batch saving indicator assessments:', error);
    return false;
  }
  return true;
}

// Get all indicator assessments for a student in a term
export async function getStudentIndicatorAssessments(
  studentId: string,
  termId: string,
  subject?: string
): Promise<IndicatorAssessment[]> {
  let query = supabase
    .from('indicator_assessments')
    .select('*')
    .eq('student_id', studentId)
    .eq('term_id', termId);

  if (subject) {
    query = query.eq('subject', subject);
  }

  const { data, error } = await query.order('strand').order('indicator_code');

  if (error) {
    console.error('Error getting student indicator assessments:', error);
    return [];
  }
  return data || [];
}

// Get indicator assessments for a class
export async function getClassIndicatorAssessments(
  className: string,
  subject: string,
  termId: string,
  schoolId: string
): Promise<IndicatorAssessment[]> {
  const { data, error } = await supabase
    .from('indicator_assessments')
    .select('*')
    .eq('class_name', className)
    .eq('subject', subject)
    .eq('term_id', termId)
    .eq('school_id', schoolId)
    .order('student_id')
    .order('indicator_code');

  if (error) {
    console.error('Error getting class indicator assessments:', error);
    return [];
  }
  return data || [];
}

// Get student standards status summary
export async function getStudentStandardsStatus(
  studentId: string,
  studentName: string,
  className: string,
  subject: string,
  termId: string,
  allIndicators: { code: string; text: string; strand: string; subStrand: string }[]
): Promise<StudentStandardsStatus> {
  const assessments = await getStudentIndicatorAssessments(studentId, termId, subject);
  
  // Create a map of assessed indicators
  const assessmentMap = new Map<string, IndicatorAssessment>();
  assessments.forEach(a => assessmentMap.set(a.indicator_code, a));

  // Build indicator statuses
  const indicators: IndicatorStatus[] = allIndicators.map(ind => {
    const assessment = assessmentMap.get(ind.code);
    return {
      indicatorCode: ind.code,
      indicatorText: ind.text,
      strand: ind.strand,
      subStrand: ind.subStrand,
      status: assessment?.status || 'not-assessed',
      percentage: assessment?.score || 0,
      assessmentDate: assessment?.assessment_date
    };
  });

  // Calculate summary
  const summary = {
    totalIndicators: indicators.length,
    mastered: indicators.filter(i => i.status === 'M').length,
    proficient: indicators.filter(i => i.status === 'P').length,
    approachingProficiency: indicators.filter(i => i.status === 'AP').length,
    developing: indicators.filter(i => i.status === 'D').length,
    notAssessed: indicators.filter(i => i.status === 'not-assessed').length
  };

  return {
    studentId,
    studentName,
    className,
    subject,
    termId,
    indicators,
    summary
  };
}

// Delete indicator assessment
export async function deleteIndicatorAssessment(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('indicator_assessments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting indicator assessment:', error);
    return false;
  }
  return true;
}
