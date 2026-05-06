import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAuth } from '../../contexts/AuthContext';
import { useSchool } from '../../contexts/SchoolContext';
import { useTerm } from '@/contexts/TermContext';
import { fetchStudents } from '../../lib/supabase-students';
import { getTestPapers } from '@/lib/supabase-questions';
import { Student } from '../../types/student';
import { CLASS_LEVELS, ClassLevel, Subject } from '@/types/user';
import { AssessOverviewTab, AssessCurriculumTab } from '../AssessmentHubTabs';
import { GradebookTab } from '../GradebookTab';
import { AssessTestPaperTab } from '../AssessTestPaperTab';
import { ScoreEntryModal } from '../ScoreEntryModal';
import { ReportCardGenerator } from '../ReportCardGenerator';
import { ProgressReportGenerator } from '../ProgressReportGenerator';
import { LayoutDashboard, BookOpen, FileText, Target } from 'lucide-react';

interface SuperTeacherAssessmentHubProps {
  onNavigateToCurriculum?: () => void;
  assignedClasses?: ClassLevel[];
  assignedSubjects?: Subject[];
}

export const SuperTeacherAssessmentHub: React.FC<SuperTeacherAssessmentHubProps> = ({ 
  onNavigateToCurriculum, 
  assignedClasses, 
  assignedSubjects 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentSchool } = useSchool();
  const { currentTerm } = useTerm();
  const [students, setStudents] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [progressReportOpen, setProgressReportOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [testPaperCount, setTestPaperCount] = useState(0);

  // Super teachers have access to all classes and subjects
  const availableClasses = assignedClasses && assignedClasses.length > 0 ? assignedClasses : CLASS_LEVELS;
  const availableSubjects = assignedSubjects && assignedSubjects.length > 0 ? assignedSubjects : [];

  useEffect(() => { 
    if (user) {
      loadStudents();
      loadTestPaperCount();
    }
  }, [user, currentSchool, assignedClasses]);

  const loadStudents = async () => {
    if (!user) return;
    const data = await fetchStudents(currentSchool?.id || user.id);
    const filtered = assignedClasses && assignedClasses.length > 0
      ? data.filter(s => assignedClasses.includes(s.class_level as ClassLevel))
      : data;
    setStudents(filtered);
  };

  const loadTestPaperCount = async () => {
    try {
      const papers = await getTestPapers();
      setTestPaperCount(papers.length);
    } catch (error) {
      console.error('Error loading test papers:', error);
    }
  };

  const classCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach(s => { counts[s.class_level] = (counts[s.class_level] || 0) + 1; });
    return counts;
  }, [students]);

  const activeClasses = availableClasses.filter(c => classCounts[c] > 0);

  const handleGenerateReport = (s: Student) => { setSelectedStudent(s); setReportModalOpen(true); };
  const handleGenerateProgressReport = (s: Student) => { setSelectedStudent(s); setProgressReportOpen(true); };

  const termData = currentTerm ? { 
    id: currentTerm.id, 
    name: currentTerm.name, 
    number: currentTerm.termNumber, 
    academicYear: currentTerm.academicYear,
    startDate: currentTerm.startDate,
    endDate: currentTerm.endDate
  } : null;

  const studentData = selectedStudent ? { 
    id: selectedStudent.id, 
    name: selectedStudent.name || `${selectedStudent.first_name} ${selectedStudent.last_name}`, 
    class: selectedStudent.class_level, 
    parentPhone: selectedStudent.parent_phone || selectedStudent.guardian1_whatsapp,
    parentName: selectedStudent.guardian1_name,
    admissionNumber: selectedStudent.admission_number
  } : null;

  return (
    <div className="p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4 bg-white/20">
          <TabsTrigger 
            value="overview" 
            className="text-white data-[state=active]:bg-white/30 text-xs sm:text-sm flex items-center gap-1"
          >
            <LayoutDashboard className="w-4 h-4 hidden sm:block" />
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="gradebook" 
            className="text-white data-[state=active]:bg-white/30 text-xs sm:text-sm flex items-center gap-1"
          >
            <BookOpen className="w-4 h-4 hidden sm:block" />
            Gradebook
          </TabsTrigger>
          <TabsTrigger 
            value="testpaper" 
            className="text-white data-[state=active]:bg-white/30 text-xs sm:text-sm flex items-center gap-1"
          >
            <FileText className="w-4 h-4 hidden sm:block" />
            Test Paper
          </TabsTrigger>
          <TabsTrigger 
            value="curriculum" 
            className="text-white data-[state=active]:bg-white/30 text-xs sm:text-sm flex items-center gap-1"
          >
            <Target className="w-4 h-4 hidden sm:block" />
            Curriculum
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <AssessOverviewTab 
            students={students} 
            classCounts={classCounts} 
            activeClasses={activeClasses}
            testPaperCount={testPaperCount}
            onNavigateToGradebook={() => setActiveTab('gradebook')}
            onNavigateToTestPaper={() => setActiveTab('testpaper')}
            onNavigateToCurriculum={() => setActiveTab('curriculum')}
          />
        </TabsContent>

        {/* Gradebook Tab */}
        <TabsContent value="gradebook">
          <GradebookTab 
            students={students} 
            termId={currentTerm?.id || ''} 
            termNumber={currentTerm?.termNumber || 1} 
            academicYear={currentTerm?.academicYear || '2024/2025'} 
            onViewReport={handleGenerateReport} 
            onGenerateReport={handleGenerateProgressReport} 
            teacherId={user?.id} 
            teacherName={user?.name} 
          />
        </TabsContent>

        {/* Test Paper Tab */}
        <TabsContent value="testpaper">
          <AssessTestPaperTab 
            assignedClasses={availableClasses}
            assignedSubjects={availableSubjects}
          />
        </TabsContent>

        {/* Curriculum Tab */}
        <TabsContent value="curriculum">
          <AssessCurriculumTab 
            onNavigate={onNavigateToCurriculum} 
            onSelectCurriculum={() => onNavigateToCurriculum?.()} 
            onNavigateToQuestionBank={() => navigate('/question-bank')} 
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ScoreEntryModal 
        isOpen={scoreModalOpen} 
        onClose={() => setScoreModalOpen(false)} 
        student={studentData} 
        termId={currentTerm?.id || ''} 
        termNumber={currentTerm?.termNumber || 1} 
      />
      <ReportCardGenerator 
        isOpen={reportModalOpen} 
        onClose={() => setReportModalOpen(false)} 
        student={studentData} 
        term={termData} 
        schoolName={currentSchool?.name} 
      />
      <ProgressReportGenerator 
        isOpen={progressReportOpen} 
        onClose={() => setProgressReportOpen(false)} 
        student={studentData} 
        term={termData} 
        schoolId={currentSchool?.id}
      />
    </div>
  );
};

export default SuperTeacherAssessmentHub;
