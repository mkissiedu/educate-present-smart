import { supabase } from './supabase';
import { OMRScanResult, IndicatorResult, getOMRGrade, isIndicatorMet } from '@/types/omr-scanner';
import { saveIndicatorAssessmentsBatch } from './supabase-indicator-assessments';

// Save OMR scan result
export async function saveOMRScanResult(result: Omit<OMRScanResult, 'id'>): Promise<OMRScanResult | null> {
  const { data, error } = await supabase
    .from('omr_scan_results')
    .insert(result)
    .select()
    .single();

  if (error) {
    console.error('Error saving OMR scan result:', error);
    return null;
  }
  return data;
}

// Get OMR scan results for a test paper
export async function getTestPaperOMRResults(testPaperId: string): Promise<OMRScanResult[]> {
  const { data, error } = await supabase
    .from('omr_scan_results')
    .select('*')
    .eq('test_paper_id', testPaperId)
    .order('student_name');

  if (error) {
    console.error('Error getting OMR results:', error);
    return [];
  }
  return data || [];
}

// Get OMR scan results for a student
export async function getStudentOMRResults(studentId: string, termId?: string): Promise<OMRScanResult[]> {
  let query = supabase
    .from('omr_scan_results')
    .select('*')
    .eq('student_id', studentId);

  if (termId) {
    query = query.eq('term_id', termId);
  }

  const { data, error } = await query.order('scanned_at', { ascending: false });

  if (error) {
    console.error('Error getting student OMR results:', error);
    return [];
  }
  return data || [];
}

// Get class OMR results summary
export async function getClassOMRSummary(
  className: string,
  subject: string,
  termId: string,
  schoolId: string
): Promise<{
  totalStudents: number;
  averageScore: number;
  gradeDistribution: { M: number; P: number; AP: number; D: number };
  indicatorSummary: { code: string; text: string; metCount: number; totalCount: number; percentage: number }[];
}> {
  const { data, error } = await supabase
    .from('omr_scan_results')
    .select('*')
    .eq('class_name', className)
    .eq('subject', subject)
    .eq('term_id', termId)
    .eq('school_id', schoolId);

  if (error || !data || data.length === 0) {
    return {
      totalStudents: 0,
      averageScore: 0,
      gradeDistribution: { M: 0, P: 0, AP: 0, D: 0 },
      indicatorSummary: []
    };
  }

  const totalStudents = data.length;
  const averageScore = data.reduce((sum, r) => sum + r.percentage, 0) / totalStudents;
  
  const gradeDistribution = { M: 0, P: 0, AP: 0, D: 0 };
  data.forEach(r => {
    gradeDistribution[r.grade as keyof typeof gradeDistribution]++;
  });

  // Aggregate indicator results
  const indicatorMap = new Map<string, { code: string; text: string; metCount: number; totalCount: number }>();
  
  data.forEach(result => {
    (result.indicator_results as IndicatorResult[]).forEach(ir => {
      const existing = indicatorMap.get(ir.indicator_code);
      if (existing) {
        existing.totalCount++;
        if (ir.is_met) existing.metCount++;
      } else {
        indicatorMap.set(ir.indicator_code, {
          code: ir.indicator_code,
          text: ir.indicator_text,
          metCount: ir.is_met ? 1 : 0,
          totalCount: 1
        });
      }
    });
  });

  const indicatorSummary = Array.from(indicatorMap.values()).map(i => ({
    ...i,
    percentage: Math.round((i.metCount / i.totalCount) * 100)
  }));

  return { totalStudents, averageScore, gradeDistribution, indicatorSummary };
}

// Process and save scanned answers - links to curriculum indicators
export async function processOMRScan(
  studentId: string,
  studentName: string,
  testPaperId: string,
  className: string,
  subject: string,
  gradeLevel: string,
  termId: string,
  schoolId: string,
  teacherId: string,
  answers: { questionNumber: number; questionId: string; selectedOption: string | null; correctOption: string; indicatorCode?: string; indicatorText?: string; strand?: string; subStrand?: string; marks: number }[],
  imageUrl?: string
): Promise<OMRScanResult | null> {
  // Calculate results
  let correctAnswers = 0;
  let wrongAnswers = 0;
  let unanswered = 0;
  let totalMarks = 0;
  let marksObtained = 0;

  const processedAnswers = answers.map(a => {
    const isCorrect = a.selectedOption === a.correctOption;
    if (a.selectedOption === null) {
      unanswered++;
    } else if (isCorrect) {
      correctAnswers++;
      marksObtained += a.marks;
    } else {
      wrongAnswers++;
    }
    totalMarks += a.marks;

    return {
      ...a,
      isCorrect,
      marksEarned: isCorrect ? a.marks : 0
    };
  });

  const percentage = totalMarks > 0 ? Math.round((marksObtained / totalMarks) * 100) : 0;
  const grade = getOMRGrade(percentage);

  // Group by indicator and calculate indicator results
  const indicatorGroups = new Map<string, { 
    code: string; 
    text: string; 
    strand: string; 
    subStrand: string; 
    correct: number; 
    total: number 
  }>();

  processedAnswers.forEach(a => {
    if (a.indicatorCode) {
      const existing = indicatorGroups.get(a.indicatorCode);
      if (existing) {
        existing.total++;
        if (a.isCorrect) existing.correct++;
      } else {
        indicatorGroups.set(a.indicatorCode, {
          code: a.indicatorCode,
          text: a.indicatorText || '',
          strand: a.strand || '',
          subStrand: a.subStrand || '',
          correct: a.isCorrect ? 1 : 0,
          total: 1
        });
      }
    }
  });

  const indicatorResults: IndicatorResult[] = Array.from(indicatorGroups.values()).map(g => {
    const pct = Math.round((g.correct / g.total) * 100);
    return {
      indicator_code: g.code,
      indicator_text: g.text,
      strand: g.strand,
      sub_strand: g.subStrand,
      questions_count: g.total,
      correct_count: g.correct,
      percentage: pct,
      status: getOMRGrade(pct),
      is_met: isIndicatorMet(pct)
    };
  });

  // Save the scan result
  const scanResult = await saveOMRScanResult({
    answer_sheet_id: `${testPaperId}-${studentId}`,
    student_id: studentId,
    student_name: studentName,
    test_paper_id: testPaperId,
    class_name: className,
    subject,
    grade_level: gradeLevel,
    term_id: termId,
    school_id: schoolId,
    total_questions: answers.length,
    correct_answers: correctAnswers,
    wrong_answers: wrongAnswers,
    unanswered,
    total_marks: totalMarks,
    marks_obtained: marksObtained,
    percentage,
    grade,
    indicator_results: indicatorResults,
    scanned_at: new Date().toISOString(),
    scanned_by: teacherId,
    image_url: imageUrl
  });

  // Also update indicator assessments for curriculum tracking
  if (scanResult && indicatorResults.length > 0) {
    const indicatorAssessments = indicatorResults.map(ir => ({
      student_id: studentId,
      indicator_code: ir.indicator_code,
      indicator_text: ir.indicator_text,
      strand: ir.strand,
      sub_strand: ir.sub_strand,
      subject,
      class_name: className,
      term_id: termId,
      school_id: schoolId,
      teacher_id: teacherId,
      score: ir.percentage,
      status: ir.status,
      assessment_date: new Date().toISOString().split('T')[0],
      notes: `OMR Scan - ${ir.correct_count}/${ir.questions_count} correct`
    }));

    await saveIndicatorAssessmentsBatch(indicatorAssessments);
  }

  return scanResult;
}

// Delete OMR scan result
export async function deleteOMRScanResult(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('omr_scan_results')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting OMR scan result:', error);
    return false;
  }
  return true;
}

// Get indicator achievement report for a student from OMR scans
export async function getStudentIndicatorReport(
  studentId: string,
  termId: string,
  subject?: string
): Promise<{
  student_id: string;
  indicators: {
    code: string;
    text: string;
    strand: string;
    status: 'M' | 'P' | 'AP' | 'D' | 'not-assessed';
    percentage: number;
    is_met: boolean;
    assessment_count: number;
  }[];
  summary: {
    total: number;
    met: number;
    not_met: number;
    not_assessed: number;
    mastery_rate: number;
  };
}> {
  let query = supabase
    .from('omr_scan_results')
    .select('indicator_results')
    .eq('student_id', studentId)
    .eq('term_id', termId);

  if (subject) {
    query = query.eq('subject', subject);
  }

  const { data, error } = await query;

  if (error || !data) {
    return {
      student_id: studentId,
      indicators: [],
      summary: { total: 0, met: 0, not_met: 0, not_assessed: 0, mastery_rate: 0 }
    };
  }

  // Aggregate all indicator results
  const indicatorMap = new Map<string, {
    code: string;
    text: string;
    strand: string;
    totalPercentage: number;
    count: number;
  }>();

  data.forEach(result => {
    (result.indicator_results as IndicatorResult[]).forEach(ir => {
      const existing = indicatorMap.get(ir.indicator_code);
      if (existing) {
        existing.totalPercentage += ir.percentage;
        existing.count++;
      } else {
        indicatorMap.set(ir.indicator_code, {
          code: ir.indicator_code,
          text: ir.indicator_text,
          strand: ir.strand,
          totalPercentage: ir.percentage,
          count: 1
        });
      }
    });
  });

  const indicators = Array.from(indicatorMap.values()).map(i => {
    const avgPercentage = Math.round(i.totalPercentage / i.count);
    return {
      code: i.code,
      text: i.text,
      strand: i.strand,
      status: getOMRGrade(avgPercentage),
      percentage: avgPercentage,
      is_met: isIndicatorMet(avgPercentage),
      assessment_count: i.count
    };
  });

  const met = indicators.filter(i => i.is_met).length;
  const notMet = indicators.filter(i => !i.is_met).length;

  return {
    student_id: studentId,
    indicators,
    summary: {
      total: indicators.length,
      met,
      not_met: notMet,
      not_assessed: 0,
      mastery_rate: indicators.length > 0 ? Math.round((met / indicators.length) * 100) : 0
    }
  };
}


// Batch save OMR scan results
export async function batchSaveOMRResults(
  results: Omit<OMRScanResult, 'id'>[]
): Promise<OMRScanResult[]> {
  if (results.length === 0) return [];

  const { data, error } = await supabase
    .from('omr_scan_results')
    .insert(results)
    .select();

  if (error) {
    console.error('Error batch saving OMR results:', error);
    return [];
  }
  return data || [];
}

// Get bulk import summary for a class
export async function getBulkOMRSummary(
  testPaperId: string,
  className: string,
  termId: string,
  schoolId: string
): Promise<{
  totalScanned: number;
  classAverage: number;
  gradeDistribution: { M: number; P: number; AP: number; D: number };
  indicatorSummary: {
    code: string;
    text: string;
    strand: string;
    subStrand: string;
    classPercentage: number;
    studentsMet: number;
    totalStudents: number;
    needsIntervention: boolean;
  }[];
  topPerformers: { studentId: string; studentName: string; percentage: number; grade: string }[];
  studentsNeedingSupport: { studentId: string; studentName: string; percentage: number; grade: string; weakIndicators: string[] }[];
}> {
  const { data, error } = await supabase
    .from('omr_scan_results')
    .select('*')
    .eq('test_paper_id', testPaperId)
    .eq('class_name', className)
    .eq('term_id', termId)
    .eq('school_id', schoolId);

  if (error || !data || data.length === 0) {
    return {
      totalScanned: 0,
      classAverage: 0,
      gradeDistribution: { M: 0, P: 0, AP: 0, D: 0 },
      indicatorSummary: [],
      topPerformers: [],
      studentsNeedingSupport: []
    };
  }

  const totalScanned = data.length;
  const classAverage = Math.round(data.reduce((sum, r) => sum + r.percentage, 0) / totalScanned);

  // Grade distribution
  const gradeDistribution = { M: 0, P: 0, AP: 0, D: 0 };
  data.forEach(r => {
    gradeDistribution[r.grade as keyof typeof gradeDistribution]++;
  });

  // Indicator summary
  const indicatorMap = new Map<string, {
    code: string;
    text: string;
    strand: string;
    subStrand: string;
    totalPercentage: number;
    studentsMet: number;
    totalStudents: number;
  }>();

  data.forEach(result => {
    (result.indicator_results as IndicatorResult[]).forEach(ir => {
      const existing = indicatorMap.get(ir.indicator_code);
      if (existing) {
        existing.totalStudents++;
        existing.totalPercentage += ir.percentage;
        if (ir.is_met) existing.studentsMet++;
      } else {
        indicatorMap.set(ir.indicator_code, {
          code: ir.indicator_code,
          text: ir.indicator_text,
          strand: ir.strand,
          subStrand: ir.sub_strand,
          totalPercentage: ir.percentage,
          studentsMet: ir.is_met ? 1 : 0,
          totalStudents: 1
        });
      }
    });
  });

  const indicatorSummary = Array.from(indicatorMap.values()).map(i => ({
    code: i.code,
    text: i.text,
    strand: i.strand,
    subStrand: i.subStrand,
    classPercentage: Math.round(i.totalPercentage / i.totalStudents),
    studentsMet: i.studentsMet,
    totalStudents: i.totalStudents,
    needsIntervention: (i.studentsMet / i.totalStudents) < 0.5
  })).sort((a, b) => a.classPercentage - b.classPercentage);

  // Top performers
  const topPerformers = data
    .filter(r => r.grade === 'M' || r.grade === 'P')
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 10)
    .map(r => ({
      studentId: r.student_id,
      studentName: r.student_name,
      percentage: r.percentage,
      grade: r.grade
    }));

  // Students needing support
  const studentsNeedingSupport = data
    .filter(r => r.grade === 'D' || r.grade === 'AP')
    .sort((a, b) => a.percentage - b.percentage)
    .map(r => ({
      studentId: r.student_id,
      studentName: r.student_name,
      percentage: r.percentage,
      grade: r.grade,
      weakIndicators: (r.indicator_results as IndicatorResult[])
        .filter(ir => !ir.is_met)
        .map(ir => ir.indicator_code)
    }));

  return {
    totalScanned,
    classAverage,
    gradeDistribution,
    indicatorSummary,
    topPerformers,
    studentsNeedingSupport
  };
}

// Match students by index number from filename
export function matchStudentsByIndex(
  filenames: string[],
  students: { id: string; name: string; index?: string }[]
): Map<string, { studentId: string; studentName: string; matchMethod: 'index' | 'name' | 'none' }> {
  const matches = new Map<string, { studentId: string; studentName: string; matchMethod: 'index' | 'name' | 'none' }>();

  filenames.forEach(filename => {
    const baseName = filename.replace(/\.[^/.]+$/, ''); // Remove extension
    
    // Try to match by index number (look for 4+ digit numbers)
    const indexMatch = baseName.match(/(\d{4,})/);
    if (indexMatch) {
      const detectedIndex = indexMatch[1];
      const student = students.find(s => s.index === detectedIndex);
      if (student) {
        matches.set(filename, {
          studentId: student.id,
          studentName: student.name,
          matchMethod: 'index'
        });
        return;
      }
    }

    // Try to match by name
    const normalizedFilename = baseName.toLowerCase().replace(/[_-]/g, ' ');
    const studentByName = students.find(s => 
      normalizedFilename.includes(s.name.toLowerCase()) ||
      s.name.toLowerCase().split(' ').some(part => normalizedFilename.includes(part))
    );
    
    if (studentByName) {
      matches.set(filename, {
        studentId: studentByName.id,
        studentName: studentByName.name,
        matchMethod: 'name'
      });
      return;
    }

    // No match found
    matches.set(filename, {
      studentId: '',
      studentName: '',
      matchMethod: 'none'
    });
  });

  return matches;
}

// Get all OMR results for export
export async function exportOMRResultsForClass(
  className: string,
  subject: string,
  termId: string,
  schoolId: string
): Promise<{
  results: OMRScanResult[];
  summary: {
    totalStudents: number;
    averageScore: number;
    passRate: number;
    indicatorAchievement: { code: string; text: string; percentage: number }[];
  };
}> {
  const { data, error } = await supabase
    .from('omr_scan_results')
    .select('*')
    .eq('class_name', className)
    .eq('subject', subject)
    .eq('term_id', termId)
    .eq('school_id', schoolId)
    .order('student_name');

  if (error || !data) {
    return {
      results: [],
      summary: {
        totalStudents: 0,
        averageScore: 0,
        passRate: 0,
        indicatorAchievement: []
      }
    };
  }

  const totalStudents = data.length;
  const averageScore = totalStudents > 0 
    ? Math.round(data.reduce((sum, r) => sum + r.percentage, 0) / totalStudents) 
    : 0;
  const passRate = totalStudents > 0 
    ? Math.round((data.filter(r => r.grade === 'M' || r.grade === 'P').length / totalStudents) * 100) 
    : 0;

  // Aggregate indicator achievement
  const indicatorMap = new Map<string, { code: string; text: string; totalPct: number; count: number }>();
  data.forEach(result => {
    (result.indicator_results as IndicatorResult[]).forEach(ir => {
      const existing = indicatorMap.get(ir.indicator_code);
      if (existing) {
        existing.totalPct += ir.percentage;
        existing.count++;
      } else {
        indicatorMap.set(ir.indicator_code, {
          code: ir.indicator_code,
          text: ir.indicator_text,
          totalPct: ir.percentage,
          count: 1
        });
      }
    });
  });

  const indicatorAchievement = Array.from(indicatorMap.values()).map(i => ({
    code: i.code,
    text: i.text,
    percentage: Math.round(i.totalPct / i.count)
  }));

  return {
    results: data,
    summary: {
      totalStudents,
      averageScore,
      passRate,
      indicatorAchievement
    }
  };
}
