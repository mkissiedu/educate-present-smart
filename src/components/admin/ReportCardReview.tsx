import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Student } from '@/types/student';
import { CLASS_LEVELS } from '@/types/user';
import { fetchStudents } from '@/lib/supabase-students';
import { ReportCardGenerator } from '../ReportCardGenerator';
import { ProgressReportGenerator } from '../ProgressReportGenerator';
import { Search, FileText, Eye, Send, Loader2, CheckCircle, Clock, BarChart3, TrendingUp } from 'lucide-react';
import { useTermContext } from '@/contexts/TermContext';
import { useSchool } from '@/contexts/SchoolContext';

export const ReportCardReview: React.FC = () => {
  const { currentTerm, termSettings } = useTermContext();
  const { currentSchool } = useSchool();
  const academicYear = termSettings?.academicYear || currentSchool?.academic_year || '2024/2025';
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [showProgressReport, setShowProgressReport] = useState(false);

  useEffect(() => { loadStudents(); }, [currentSchool]);

  const loadStudents = async () => {
    setLoading(true);
    const data = await fetchStudents(currentSchool?.id);
    setStudents(data);
    setLoading(false);
  };

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchClass = filterClass === 'All' || s.class_level === filterClass;
    return matchSearch && matchClass;
  });

  const viewReport = (student: Student) => {
    setSelectedStudent(student);
    setShowReport(true);
  };

  const viewProgressReport = (student: Student) => {
    setSelectedStudent(student);
    setShowProgressReport(true);
  };

  const sendWhatsApp = (student: Student) => {
    if (!student.guardian1_whatsapp) return;
    const schoolName = currentSchool?.name || 'the school';
    const msg = `Dear Parent,\n\nYour child ${student.name}'s progress report for ${currentTerm?.name || 'this term'} at ${schoolName} is ready.\n\nPlease contact the school for details.\n\nThank you.`;
    window.open(`https://wa.me/${student.guardian1_whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const term = currentTerm ? { 
    id: currentTerm.id, 
    name: currentTerm.name, 
    number: currentTerm.termNumber, 
    academicYear,
    startDate: currentTerm.startDate,
    endDate: currentTerm.endDate
  } : null;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5" /> Progress Report Review
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white/10 text-white border-white/20">
            {currentTerm?.name || 'No term'}
          </Badge>
          <Badge variant="outline" className="bg-white/10 text-white border-white/20">
            {academicYear}
          </Badge>
        </div>
      </div>

      {/* Grade Legend */}
      <div className="flex flex-wrap gap-2 mb-4 p-2 bg-white/5 rounded-lg">
        <span className="text-xs text-white/70">Grading Scale:</span>
        <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs">M - Mastery (80%+)</Badge>
        <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30 text-xs">P - Proficiency (66-79%)</Badge>
        <Badge className="bg-amber-500/20 text-amber-200 border-amber-400/30 text-xs">AP - Approaching (50-65%)</Badge>
        <Badge className="bg-red-500/20 text-red-200 border-red-400/30 text-xs">D - Developing (&lt;50%)</Badge>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." className="pl-10 bg-white/10 border-white/20 text-white" />
        </div>
        <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20">
          <option value="All" className="text-gray-900">All Classes</option>
          {CLASS_LEVELS.map(c => <option key={c} value={c} className="text-gray-900">{c}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-blue-500/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">{students.length}</div>
          <div className="text-xs text-blue-200">Total Students</div>
        </div>
        <div className="bg-purple-500/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white flex items-center justify-center gap-1">
            <TrendingUp className="w-5 h-5" /> {filtered.length}
          </div>
          <div className="text-xs text-purple-200">Filtered</div>
        </div>
        <div className="bg-green-500/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white flex items-center justify-center gap-1"><CheckCircle className="w-5 h-5" /> 0</div>
          <div className="text-xs text-green-200">Reports Sent</div>
        </div>
        <div className="bg-yellow-500/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white flex items-center justify-center gap-1"><Clock className="w-5 h-5" /> {students.length}</div>
          <div className="text-xs text-yellow-200">Pending</div>
        </div>
      </div>

      {loading ? <Loader2 className="w-8 h-8 animate-spin text-white mx-auto" /> : (
        <div className="space-y-2 max-h-[350px] overflow-y-auto">
          {filtered.map(s => (
            <div key={s.id} className="bg-white/10 rounded-lg p-3 flex items-center justify-between hover:bg-white/15 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{s.name.charAt(0)}</span>
                </div>
                <div>
                  <div className="font-bold text-white">{s.name}</div>
                  <div className="text-xs text-gray-400">{s.class_level} • {s.admission_number || 'No ID'}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => viewReport(s)} className="bg-white/10 border-white/20 text-white hover:bg-white/20" title="Quick Report">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button size="sm" onClick={() => viewProgressReport(s)} className="bg-purple-600 hover:bg-purple-700" title="Full Progress Report">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Report
                </Button>
                <Button size="sm" onClick={() => sendWhatsApp(s)} disabled={!s.guardian1_whatsapp} className="bg-green-600 hover:bg-green-700" title="Send via WhatsApp">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-white/30 mx-auto mb-2" />
              <p className="text-white/60">No students found</p>
            </div>
          )}
        </div>
      )}

      {selectedStudent && (
        <>
          <ReportCardGenerator 
            isOpen={showReport} 
            onClose={() => setShowReport(false)} 
            student={{ 
              id: selectedStudent.id, 
              name: selectedStudent.name, 
              class: selectedStudent.class_level, 
              parentPhone: selectedStudent.guardian1_whatsapp 
            }} 
            term={term} 
            schoolName={currentSchool?.name} 
          />
          <ProgressReportGenerator
            isOpen={showProgressReport}
            onClose={() => setShowProgressReport(false)}
            student={{
              id: selectedStudent.id,
              name: selectedStudent.name,
              class: selectedStudent.class_level,
              parentPhone: selectedStudent.guardian1_whatsapp,
              parentName: selectedStudent.guardian1_name,
              admissionNumber: selectedStudent.admission_number
            }}
            term={term}
            schoolId={currentSchool?.id}
          />
        </>
      )}
    </div>
  );
};
