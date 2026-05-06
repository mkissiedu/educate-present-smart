import { supabase } from './supabase';
import { StudentScore, ReportCard, calculateGrade } from '@/types/scores';

export async function saveStudentScore(score: Partial<StudentScore>): Promise<StudentScore | null> {
  const total = (score.cat_1 || 0) + (score.cat_2 || 0) + (score.cat_3 || 0) + (score.cat_4 || 0) + (score.ete || 0);
  const grade = calculateGrade(total);
  
  const { data, error } = await supabase
    .from('student_scores')
    .upsert({
      ...score,
      total,
      grade,
      updated_at: new Date().toISOString()
    }, { onConflict: 'student_id,term_id,subject' })
    .select()
    .single();
  
  if (error) { console.error('Error saving score:', error); return null; }
  return data;
}

export async function getStudentScores(studentId: string, termId: string): Promise<StudentScore[]> {
  const { data, error } = await supabase
    .from('student_scores')
    .select('*')
    .eq('student_id', studentId)
    .eq('term_id', termId);
  
  if (error) { console.error('Error fetching scores:', error); return []; }
  return data || [];
}

export async function getAllClassScores(termId: string, classLevel: string): Promise<StudentScore[]> {
  const { data, error } = await supabase
    .from('student_scores')
    .select('*, students!inner(class_level)')
    .eq('term_id', termId)
    .eq('students.class_level', classLevel);
  
  if (error) { console.error('Error fetching class scores:', error); return []; }
  return data || [];
}

export async function saveReportCard(report: Partial<ReportCard>): Promise<ReportCard | null> {
  const { data, error } = await supabase
    .from('report_cards')
    .upsert({ ...report, generated_at: new Date().toISOString() }, { onConflict: 'student_id,term_id' })
    .select()
    .single();
  
  if (error) { console.error('Error saving report:', error); return null; }
  return data;
}

export async function getReportCard(studentId: string, termId: string): Promise<ReportCard | null> {
  const { data, error } = await supabase
    .from('report_cards')
    .select('*')
    .eq('student_id', studentId)
    .eq('term_id', termId)
    .single();
  
  if (error) return null;
  return data;
}

export async function markReportSentViaWhatsApp(reportId: string): Promise<void> {
  await supabase.from('report_cards').update({
    sent_via_whatsapp: true,
    whatsapp_sent_at: new Date().toISOString()
  }).eq('id', reportId);
}

export async function getStudentAttendanceSummary(studentId: string, startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('attendance')
    .select('status')
    .eq('student_id', studentId)
    .gte('date', startDate)
    .lte('date', endDate);
  
  if (error) return { total: 0, present: 0, absent: 0, late: 0, excused: 0 };
  
  const records = data || [];
  return {
    total: records.length,
    present: records.filter(r => r.status === 'present').length,
    absent: records.filter(r => r.status === 'absent').length,
    late: records.filter(r => r.status === 'late').length,
    excused: records.filter(r => r.status === 'excused').length
  };
}

export async function getClassReportsSummary(termId: string, classLevel: string) {
  const { data, error } = await supabase
    .from('report_cards')
    .select('*, students!inner(class_level, first_name, last_name)')
    .eq('term_id', termId)
    .eq('students.class_level', classLevel);
  
  if (error) return [];
  return data || [];
}
