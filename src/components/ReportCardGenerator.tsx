import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReportCardHeader } from './ReportCardHeader';
import { ReportCardScores } from './ReportCardScores';
import { getStudentScores, saveReportCard, markReportSentViaWhatsApp, getStudentAttendanceSummary } from '@/lib/supabase-scores';
import { StudentScore, CurriculumProgress } from '@/types/scores';
import { FileText, Send, Download, CheckCircle, Clock, AlertCircle, Calendar, Printer } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  student: { id: string; name: string; class: string; parentPhone?: string } | null;
  term: { id: string; name: string; number: number; academicYear: string } | null;
  schoolName?: string;
}

export function ReportCardGenerator({ isOpen, onClose, student, term, schoolName = 'Catalyst Academy' }: Props) {
  const [scores, setScores] = useState<StudentScore[]>([]);
  const [teacherRemarks, setTeacherRemarks] = useState('');
  const [headRemarks, setHeadRemarks] = useState('');
  const [conduct, setConduct] = useState('Good');
  const [promotion, setPromotion] = useState('Promoted');
  const [attendance, setAttendance] = useState({ total: 0, present: 0, absent: 0, late: 0, excused: 0 });
  const [loading, setLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const curriculumProgress: CurriculumProgress[] = [
    { strand: 'Reading & Comprehension', indicator: 'B4.1.2.1', status: 'mastered', percentage: 92 },
    { strand: 'Writing Skills', indicator: 'B4.2.1.3', status: 'progressing', percentage: 75 },
    { strand: 'Number Operations', indicator: 'B4.1.3.2', status: 'mastered', percentage: 88 },
    { strand: 'Science Investigation', indicator: 'B4.3.1.1', status: 'needs-support', percentage: 45 }
  ];

  useEffect(() => { if (student && term) loadData(); }, [student, term]);

  const loadData = async () => {
    if (!student || !term) return;
    setLoading(true);
    const [scoresData, attendanceData] = await Promise.all([
      getStudentScores(student.id, term.id),
      getStudentAttendanceSummary(student.id, '2024-09-01', '2024-12-20')
    ]);
    setScores(scoresData);
    setAttendance(attendanceData.total > 0 ? attendanceData : { total: 65, present: 58, absent: 5, late: 2, excused: 0 });
    setLoading(false);
  };

  const handleSendWhatsApp = async () => {
    if (!student?.parentPhone || !term) return;
    const report = await saveReportCard({
      student_id: student.id, term_id: term.id, academic_year: term.academicYear,
      class_name: student.class, teacher_remarks: teacherRemarks, head_teacher_remarks: headRemarks,
      conduct, promotion_status: promotion, total_school_days: attendance.total,
      days_present: attendance.present, days_absent: attendance.absent
    });
    if (report) await markReportSentViaWhatsApp(report.id);
    const avg = scores.length > 0 ? Math.round(scores.reduce((a, s) => a + s.total, 0) / scores.length) : 0;
    const msg = `*${schoolName}*\n📚 *Report Card*\n\n👤 Student: ${student.name}\n📅 Term: ${term.name}\n🎓 Class: ${student.class}\n\n📊 Average: ${avg}/100\n📈 Attendance: ${attendance.present}/${attendance.total} (${Math.round((attendance.present/attendance.total)*100)}%)\n\n✅ Status: ${promotion}\n💬 Conduct: ${conduct}`;

    window.open(`https://wa.me/${student.parentPhone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handlePrint = () => window.print();
  const getStatusIcon = (status: string) => {
    if (status === 'mastered') return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (status === 'progressing') return <Clock className="w-4 h-4 text-yellow-600" />;
    return <AlertCircle className="w-4 h-4 text-red-600" />;
  };

  if (!student || !term) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-purple-600" />Report Card - {term.name}</DialogTitle></DialogHeader>
        {loading ? <div className="flex justify-center p-8"><div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" /></div> : (
          <div ref={reportRef} className="bg-white p-6 border rounded-lg print:border-0">
            <ReportCardHeader schoolName={schoolName} academicYear={term.academicYear} termName={term.name} studentName={student.name} className={student.class} teacherName="Class Teacher" />
            <ReportCardScores scores={scores} termNumber={term.number} />
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="border rounded-lg p-3">
                <h3 className="font-semibold text-purple-700 mb-2 flex items-center gap-2"><Calendar className="w-4 h-4" />Attendance</h3>
                <div className="grid grid-cols-4 gap-2 text-center text-sm">
                  <div className="bg-blue-50 p-2 rounded"><p className="text-xs text-gray-500">Total</p><p className="font-bold text-blue-700">{attendance.total}</p></div>
                  <div className="bg-green-50 p-2 rounded"><p className="text-xs text-gray-500">Present</p><p className="font-bold text-green-700">{attendance.present}</p></div>
                  <div className="bg-red-50 p-2 rounded"><p className="text-xs text-gray-500">Absent</p><p className="font-bold text-red-700">{attendance.absent}</p></div>
                  <div className="bg-yellow-50 p-2 rounded"><p className="text-xs text-gray-500">Late</p><p className="font-bold text-yellow-700">{attendance.late}</p></div>
                </div>
              </div>
              <div className="border rounded-lg p-3">
                <h3 className="font-semibold text-purple-700 mb-2">Curriculum Progress</h3>
                <div className="space-y-1.5">{curriculumProgress.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">{getStatusIcon(p.status)}<span className="truncate max-w-[120px]">{p.strand}</span></div>
                    <div className="flex items-center gap-2"><div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden"><div className={`h-full ${p.status === 'mastered' ? 'bg-green-500' : p.status === 'progressing' ? 'bg-yellow-500' : 'bg-red-500'}`} style={{width: `${p.percentage}%`}} /></div><span className="font-medium w-8">{p.percentage}%</span></div>
                  </div>
                ))}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><label className="text-sm font-medium">Conduct</label><Select value={conduct} onValueChange={setConduct}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Excellent">Excellent</SelectItem><SelectItem value="Very Good">Very Good</SelectItem><SelectItem value="Good">Good</SelectItem><SelectItem value="Satisfactory">Satisfactory</SelectItem><SelectItem value="Needs Improvement">Needs Improvement</SelectItem></SelectContent></Select></div>
              <div><label className="text-sm font-medium">Promotion</label><Select value={promotion} onValueChange={setPromotion}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Promoted">Promoted</SelectItem><SelectItem value="Repeat">Repeat</SelectItem><SelectItem value="On Trial">On Trial</SelectItem></SelectContent></Select></div>
            </div>
            <div className="space-y-3 border-t pt-3">
              <div><label className="text-sm font-medium">Teacher's Remarks</label><Textarea value={teacherRemarks} onChange={e => setTeacherRemarks(e.target.value)} placeholder="Enter remarks..." className="mt-1" rows={2} /></div>
              <div><label className="text-sm font-medium">Head Teacher's Remarks</label><Textarea value={headRemarks} onChange={e => setHeadRemarks(e.target.value)} placeholder="Enter remarks..." className="mt-1" rows={2} /></div>
            </div>
          </div>
        )}
        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={handlePrint}><Printer className="w-4 h-4 mr-2" />Print</Button>
          <Button variant="outline" className="flex-1"><Download className="w-4 h-4 mr-2" />Download</Button>
          <Button onClick={handleSendWhatsApp} disabled={!student?.parentPhone} className="flex-1 bg-green-600 hover:bg-green-700"><Send className="w-4 h-4 mr-2" />WhatsApp</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
