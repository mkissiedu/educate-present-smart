import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Database, FileText, ArrowLeft, Crown, AlertCircle, QrCode, Scan, BarChart3, FileStack } from 'lucide-react';
import { Question } from '@/types/question-bank';
import { QuestionBankMain } from '@/components/QuestionBankMain';
import { TestPaperBuilder } from '@/components/TestPaperBuilder';
import { getTestPapers, getTestPaperWithQuestions } from '@/lib/supabase-questions';
import { fetchStudentsByClass } from '@/lib/supabase-students';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import { useTerm } from '@/contexts/TermContext';
import { getTeacherAssignment } from '@/lib/supabase-teacher-assignments';
import { PORTAL_THEMES } from '@/lib/design-system';
import { CATALYST_LOGO } from '@/components/CatalystMascot';
import { OMRScanner } from '@/components/OMRScanner';
import { OMRResultsViewer } from '@/components/OMRResultsViewer';
import { BulkOMRImporter } from '@/components/BulkOMRImporter';
import { BulkOMRSummaryReport } from '@/components/BulkOMRSummaryReport';
import { generateOMRConfig } from '@/components/OMRAnswerSheet';
import { OMRSheetConfig, OMRScanResult } from '@/types/omr-scanner';


export default function QuestionBank() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isSuperTeacher, isPlatformAdmin, isSuperAdmin } = useAuth();
  const { currentSchool } = useSchool();
  const { currentTerm } = useTerm();
  const [activeTab, setActiveTab] = useState<'questions' | 'papers'>('questions');
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [testPapers, setTestPapers] = useState<any[]>([]);
  const [assignedSubjects, setAssignedSubjects] = useState<string[]>([]);
  const [assignedClasses, setAssignedClasses] = useState<string[]>([]);
  const [loadingAssignment, setLoadingAssignment] = useState(true);
  const [students, setStudents] = useState<{ id: string; name: string; index?: string }[]>([]);
  
  // OMR states
  const [showOMRScanner, setShowOMRScanner] = useState(false);
  const [showOMRResults, setShowOMRResults] = useState(false);
  const [showBulkImporter, setShowBulkImporter] = useState(false);
  const [showBulkReport, setShowBulkReport] = useState(false);
  const [bulkResults, setBulkResults] = useState<OMRScanResult[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<any>(null);
  const [omrConfig, setOmrConfig] = useState<OMRSheetConfig | null>(null);

  const theme = isSuperTeacher || isPlatformAdmin ? PORTAL_THEMES.super_teacher : PORTAL_THEMES.teacher;

  useEffect(() => { 
    loadTestPapers(); 
    loadAssignment();
  }, [user]);

  useEffect(() => {
    if (assignedClasses.length > 0) {
      loadStudents();
    }
  }, [assignedClasses, currentSchool]);

  const loadStudents = async () => {
    if (assignedClasses.length === 0) return;
    
    // Load students from first assigned class
    const classStudents = await fetchStudentsByClass(
      assignedClasses[0], 
      currentSchool?.id || user?.school_id
    );
    
    setStudents(classStudents.map(s => ({
      id: s.id,
      name: s.name || `${s.first_name} ${s.last_name}`,
      index: s.student_id
    })));
  };

  const loadAssignment = async () => {
    // First check URL params (passed from dashboard)
    const subjectsParam = searchParams.get('subjects');
    const classesParam = searchParams.get('classes');
    
    if (subjectsParam && classesParam) {
      setAssignedSubjects(subjectsParam.split(',').filter(Boolean));
      setAssignedClasses(classesParam.split(',').filter(Boolean));
      setLoadingAssignment(false);
      return;
    }

    // Otherwise load from database
    if (user?.id && user?.school_id) {
      setLoadingAssignment(true);
      const assignment = await getTeacherAssignment(user.id, user.school_id);
      if (assignment) {
        setAssignedSubjects(assignment.assigned_subjects);
        setAssignedClasses(assignment.assigned_classes);
      }
      setLoadingAssignment(false);
    } else {
      setLoadingAssignment(false);
    }
  };

  const loadTestPapers = async () => {
    const papers = await getTestPapers();
    // Filter test papers by assigned subjects/classes
    const filteredPapers = assignedSubjects.length > 0 
      ? papers.filter(p => assignedSubjects.includes(p.subject) && assignedClasses.includes(p.grade_level))
      : papers;
    setTestPapers(filteredPapers);
  };

  const handleCreateTestPaper = (questions: Question[]) => {
    setSelectedQuestions(questions);
    setShowBuilder(true);
  };

  const handleBack = () => {
    if (isSuperTeacher || isPlatformAdmin) navigate('/super-teacher');
    else navigate('/dashboard');
  };

  const handleOpenScanner = async (paper: any) => {
    // Load full paper with questions
    const fullPaper = await getTestPaperWithQuestions(paper.id);
    if (fullPaper && fullPaper.questions) {
      const config = generateOMRConfig(
        paper.id,
        paper.title,
        paper.subject,
        paper.grade_level,
        paper.grade_level,
        paper.term || 'Term 1',
        paper.academic_year || '2024/2025',
        paper.school_name || '',
        paper.school_logo_url,
        fullPaper.questions.map((q: any) => ({
          id: q.id,
          question_text: q.question_text,
          options: q.options,
          indicator_code: q.indicator_code,
          indicator_text: q.indicator_text,
          strand: q.strand,
          sub_strand: q.sub_strand,
          marks: q.marks
        }))
      );
      setOmrConfig(config);
      setSelectedPaper(paper);
      setShowOMRScanner(true);
    }
  };

  const handleOpenBulkImporter = async (paper: any) => {
    const fullPaper = await getTestPaperWithQuestions(paper.id);
    if (fullPaper && fullPaper.questions) {
      const config = generateOMRConfig(
        paper.id,
        paper.title,
        paper.subject,
        paper.grade_level,
        paper.grade_level,
        paper.term || 'Term 1',
        paper.academic_year || '2024/2025',
        paper.school_name || '',
        paper.school_logo_url,
        fullPaper.questions.map((q: any) => ({
          id: q.id,
          question_text: q.question_text,
          options: q.options,
          indicator_code: q.indicator_code,
          indicator_text: q.indicator_text,
          strand: q.strand,
          sub_strand: q.sub_strand,
          marks: q.marks
        }))
      );
      setOmrConfig(config);
      setSelectedPaper(paper);
      setShowBulkImporter(true);
    }
  };

  const handleBulkImportComplete = (results: OMRScanResult[]) => {
    setBulkResults(results);
    setShowBulkImporter(false);
    if (results.length > 0) {
      setShowBulkReport(true);
    }
  };

  const handleViewResults = (paper: any) => {
    setSelectedPaper(paper);
    setShowOMRResults(true);
  };


  // Show message if no assignments
  if (!loadingAssignment && !isSuperTeacher && !isPlatformAdmin && !isSuperAdmin && assignedSubjects.length === 0) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.gradient}`}>
        <header className={`bg-gradient-to-r ${theme.headerGradient} shadow-lg`}>
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={CATALYST_LOGO} alt="Catalyst" className="h-10 object-contain bg-white rounded-lg px-2 py-1" />
                <div>
                  <h1 className="text-xl font-black text-white flex items-center gap-2">
                    <Database className="w-5 h-5" /> Question Bank
                  </h1>
                </div>
              </div>
              <Button onClick={handleBack} variant="ghost" className="text-white hover:bg-white/20">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-white rounded-xl shadow-xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">No Subjects Assigned</h2>
            <p className="text-slate-600 mb-4">
              You need to have classes and subjects assigned to access the Question Bank.
            </p>
            <p className="text-sm text-slate-500">
              Please contact your administrator to get your teaching assignments set up.
            </p>
            <Button onClick={handleBack} className="mt-6">
              <ArrowLeft className="w-4 h-4 mr-2" /> Return to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // OMR Scanner Modal
  if (showOMRScanner && omrConfig && selectedPaper) {
    return (
      <OMRScanner 
        config={omrConfig}
        students={students}
        termId={currentTerm?.id || ''}
        schoolId={currentSchool?.id || user?.school_id || ''}
        teacherId={user?.id || ''}
        onClose={() => { setShowOMRScanner(false); setSelectedPaper(null); }}
        onScanComplete={loadTestPapers}
      />
    );
  }

  // OMR Results Viewer
  if (showOMRResults && selectedPaper) {
    return (
      <OMRResultsViewer
        testPaperId={selectedPaper.id}
        testPaperTitle={selectedPaper.title}
        className={selectedPaper.grade_level}
        subject={selectedPaper.subject}
        termId={currentTerm?.id || ''}
        schoolId={currentSchool?.id || user?.school_id || ''}
        onClose={() => { setShowOMRResults(false); setSelectedPaper(null); }}
      />
    );
  }


  // Bulk OMR Importer
  if (showBulkImporter && omrConfig && selectedPaper) {
    return (
      <BulkOMRImporter
        config={omrConfig}
        students={students}
        termId={currentTerm?.id || ''}
        schoolId={currentSchool?.id || user?.school_id || ''}
        teacherId={user?.id || ''}
        onClose={() => { setShowBulkImporter(false); setSelectedPaper(null); }}
        onComplete={handleBulkImportComplete}
      />
    );
  }

  // Bulk OMR Summary Report
  if (showBulkReport && bulkResults.length > 0 && selectedPaper) {
    return (
      <BulkOMRSummaryReport
        results={bulkResults}
        testPaperTitle={selectedPaper.title}
        className={selectedPaper.grade_level}
        subject={selectedPaper.subject}
        gradeLevel={selectedPaper.grade_level}
        totalStudentsInClass={students.length}
        onClose={() => { setShowBulkReport(false); setBulkResults([]); }}
      />
    );
  }



  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.gradient}`}>
      {/* Header */}
      <header className={`bg-gradient-to-r ${theme.headerGradient} shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={CATALYST_LOGO} alt="Catalyst" className="h-10 object-contain bg-white rounded-lg px-2 py-1" />

              <div>
                <h1 className="text-xl font-black text-white flex items-center gap-2">
                  <Database className="w-5 h-5" /> Question Bank
                </h1>
                <p className="text-white/70 text-xs">
                  {assignedSubjects.length > 0 
                    ? `Filtered: ${assignedSubjects.join(', ')}`
                    : 'Create and manage assessment questions'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(isSuperTeacher || isPlatformAdmin) && (
                <div className="hidden md:flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                  <Crown className="w-4 h-4 text-yellow-300" />
                  <span className="text-white text-sm">Super Teacher</span>
                </div>
              )}
              <Button onClick={handleBack} variant="ghost" className="text-white hover:bg-white/20">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button onClick={() => navigate('/')} variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Home className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all ${
              activeTab === 'questions' ? theme.tabActive : theme.tabInactive
            }`}
          >
            <Database className="w-4 h-4" /> Questions
          </button>
          <button
            onClick={() => setActiveTab('papers')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all ${
              activeTab === 'papers' ? theme.tabActive : theme.tabInactive
            }`}
          >
            <FileText className="w-4 h-4" /> Test Papers
            {testPapers.length > 0 && (
              <span className="bg-white/30 text-white text-xs px-2 py-0.5 rounded-full">{testPapers.length}</span>
            )}
          </button>
        </div>

        {activeTab === 'questions' && (
          <div className="bg-white rounded-xl shadow-xl">
            <QuestionBankMain 
              onCreateTestPaper={handleCreateTestPaper} 
              assignedSubjects={isSuperTeacher || isPlatformAdmin || isSuperAdmin ? undefined : assignedSubjects}
              assignedClasses={isSuperTeacher || isPlatformAdmin || isSuperAdmin ? undefined : assignedClasses}
            />
          </div>
        )}

        {activeTab === 'papers' && (
          <div className="bg-white rounded-xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">Saved Test Papers</h2>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <QrCode className="w-4 h-4" />
                <span>OMR scanning available for multiple choice tests</span>
              </div>
            </div>
            
            {testPapers.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-lg border">
                <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500">No test papers created yet</p>
                <p className="text-sm text-slate-400">Select questions and create your first test paper</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {testPapers.map(paper => (
                  <div key={paper.id} className="bg-slate-50 p-4 rounded-lg border hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-800">{paper.title}</h3>
                        <p className="text-sm text-slate-500">{paper.subject} - {paper.grade_level}</p>
                        <p className="text-xs text-slate-400">{paper.term} {paper.academic_year} | {paper.total_marks} marks</p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenScanner(paper)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Scan className="w-4 h-4 mr-1" />
                          Scan
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenBulkImporter(paper)}
                          className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                        >
                          <FileStack className="w-4 h-4 mr-1" />
                          Bulk
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewResults(paper)}
                          className="text-purple-600 border-purple-200 hover:bg-purple-50"
                        >
                          <BarChart3 className="w-4 h-4 mr-1" />
                          Results
                        </Button>
                      </div>
                    </div>
                  </div>

                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {showBuilder && (
        <TestPaperBuilder 
          questions={selectedQuestions} 
          onClose={() => setShowBuilder(false)}
          onSaved={loadTestPapers}
          students={students}
          termId={currentTerm?.id || ''}
          schoolId={currentSchool?.id || user?.school_id || ''}
          teacherId={user?.id || ''}
        />
      )}
    </div>
  );
}
