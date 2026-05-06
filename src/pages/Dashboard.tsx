import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLessonContext } from '../contexts/LessonContext';
import { PresentationMode } from '../components/PresentationMode';
import { LessonPlanningMode } from '../components/LessonPlanningMode';
import { LessonActionModal } from '../components/LessonActionModal';
import { CatalystMascot, CATALYST_LOGO } from '../components/CatalystMascot';
import { BulkImportModal } from '../components/BulkImportModal';
import { TeacherAssignmentSelector, TeacherAssignment } from '../components/TeacherAssignmentSelector';
import { QuickAssessmentPanel } from '../components/QuickAssessmentPanel';
import { DashboardHeader } from '../components/DashboardHeader';
import { DashboardContent } from '../components/DashboardContent';
import { getTeacherAssignment, TeacherAssignmentRecord, canTeachClassSubject } from '@/lib/supabase-teacher-assignments';
import { usePlanningStatus } from '@/hooks/usePlanningStatus';
import { useBranding } from '@/contexts/BrandingContext';
import { Lesson } from '../types/lesson';
import { Student } from '../types/student';
import { Button } from '@/components/ui/button';
import { Settings, Loader2, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ClassSubjectMapping } from '@/components/ClassSubjectMappingEditor';


const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { lessons, bulkImportLessons } = useLessonContext();
  const { user, logout, canCreate, canEdit, isAuthenticated, isSuperTeacher } = useAuth();
  const { branding } = useBranding();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showPlanningMode, setShowPlanningMode] = useState(false);
  const [showPresentationMode, setShowPresentationMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [assessmentClass, setAssessmentClass] = useState<string>('');
  const [attendanceClass, setAttendanceClass] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'weekly'>('weekly');
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showQuickAssess, setShowQuickAssess] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAssignment, setShowAssignment] = useState(false);
  const [adminAssigned, setAdminAssigned] = useState(false);
  const [loadingAssignment, setLoadingAssignment] = useState(true);
  const [assignment, setAssignment] = useState<TeacherAssignment | null>(null);
  const [dbAssignment, setDbAssignment] = useState<TeacherAssignmentRecord | null>(null);

  const { getPlanningSessionForLesson, refreshSingleLesson, loading: loadingPlanning } = usePlanningStatus(user?.id);

  // Create gradient style from branding
  const dashboardGradientStyle = branding.header_gradient_from !== '#1E3A8A' || branding.logo_url
    ? { background: `linear-gradient(to bottom right, ${branding.header_gradient_from}ee, ${branding.primary_color}cc, ${branding.header_gradient_to}dd)` }
    : undefined;

  useEffect(() => {
    if (user?.id && user?.school_id) loadAssignment();
    else setLoadingAssignment(false);
  }, [user?.id, user?.school_id]);

  const loadAssignment = async () => {
    setLoadingAssignment(true);
    const adminAssign = await getTeacherAssignment(user!.id, user!.school_id!);
    if (adminAssign && adminAssign.assigned_classes.length > 0) {
      setAssignment({ 
        mode: adminAssign.assignment_mode, 
        classes: adminAssign.assigned_classes, 
        subjects: adminAssign.assigned_subjects,
        classSubjectMapping: adminAssign.class_subject_mapping as ClassSubjectMapping | undefined
      });
      setDbAssignment(adminAssign);
      setAdminAssigned(true);
    } else {
      const saved = localStorage.getItem(`teacher_assignment_${user?.id}`);
      if (saved) setAssignment(JSON.parse(saved));
      setAdminAssigned(false);
      setDbAssignment(null);
    }
    setLoadingAssignment(false);
  };

  const assignedClasses = assignment?.classes || [];
  const assignedSubjects = assignment?.subjects || [];
  const classSubjectMapping = assignment?.classSubjectMapping;
  const assignmentMode = assignment?.mode || 'multi-class';
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('');

  // Get subjects available for the currently selected class (for multi-both mode)
  const getSubjectsForClass = (className: string): string[] => {
    if (assignmentMode === 'multi-both' && classSubjectMapping) {
      return classSubjectMapping[className] || [];
    }
    return assignedSubjects;
  };

  // Get classes available for the currently selected subject (for multi-both mode)
  const getClassesForSubject = (subject: string): string[] => {
    if (assignmentMode === 'multi-both' && classSubjectMapping) {
      return assignedClasses.filter(className => 
        classSubjectMapping[className]?.includes(subject)
      );
    }
    return assignedClasses;
  };

  // Check if a class-subject pair is valid
  const isValidClassSubjectPair = (className: string, subject: string): boolean => {
    if (assignmentMode === 'multi-both' && classSubjectMapping) {
      return classSubjectMapping[className]?.includes(subject) || false;
    }
    return assignedClasses.includes(className) && assignedSubjects.includes(subject);
  };

  useEffect(() => {
    if (assignedSubjects.length > 0 && !filterSubject) setFilterSubject(assignedSubjects[0]);
    if (assignedClasses.length > 0 && !filterClass) setFilterClass(assignedClasses[0]);
    if (assignedClasses.length > 0 && !attendanceClass) setAttendanceClass(assignedClasses[0]);
  }, [assignment]);

  // Auto-adjust subject when class changes in multi-both mode
  useEffect(() => {
    if (assignmentMode === 'multi-both' && classSubjectMapping && filterClass) {
      const validSubjects = classSubjectMapping[filterClass] || [];
      if (validSubjects.length > 0 && !validSubjects.includes(filterSubject)) {
        setFilterSubject(validSubjects[0]);
      }
    }
  }, [filterClass, assignmentMode, classSubjectMapping]);

  const togglePanel = (panel: string) => setActivePanel(activePanel === panel ? null : panel);

  const handleSaveAssignment = (newAssignment: TeacherAssignment) => {
    setAssignment(newAssignment);
    localStorage.setItem(`teacher_assignment_${user?.id}`, JSON.stringify(newAssignment));
    setShowAssignment(false);
    if (newAssignment.classes.length > 0) {
      setAttendanceClass(newAssignment.classes[0]);
      setAssessmentClass(newAssignment.classes[0]);
      setFilterClass(newAssignment.classes[0]);
    }
    if (newAssignment.subjects.length > 0) setFilterSubject(newAssignment.subjects[0]);
  };

  // Handle class-subject pair selection
  const handlePairChange = (className: string, subject: string) => {
    setFilterClass(className);
    setFilterSubject(subject);
  };

  const filteredLessons = lessons.filter((lesson) => {
    if (!assignment) return false;
    
    // For multi-both mode, check against the mapping
    if (assignmentMode === 'multi-both' && classSubjectMapping) {
      const isValidPair = classSubjectMapping[lesson.class]?.includes(lesson.subject);
      if (!isValidPair) return false;
    } else {
      const matchesAssignedClass = assignedClasses.includes(lesson.class);
      const matchesAssignedSubject = assignedSubjects.includes(lesson.subject);
      if (!matchesAssignedClass || !matchesAssignedSubject) return false;
    }
    
    const matchesSubject = !filterSubject || lesson.subject === filterSubject;
    const matchesClass = !filterClass || lesson.class === filterClass;
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch && matchesClass;
  });


  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    if (isSuperTeacher || canCreate) {
      setShowPresentationMode(true);
    } else {
      setShowActionModal(true);
    }
  };

  const handleStartPlanning = () => {
    setShowActionModal(false);
    setShowPlanningMode(true);
  };

  const handleStartTeaching = () => {
    setShowActionModal(false);
    setShowPresentationMode(true);
  };

  const handlePlanningComplete = async () => {
    if (selectedLesson) await refreshSingleLesson(selectedLesson.id);
    setShowPlanningMode(false);
    setShowPresentationMode(true);
  };

  const handleEditLesson = (lesson: Lesson) => navigate(`/editor/${lesson.id}`);
  const handleCreateLesson = (week: number, lessonNumber: number) => {
    navigate(`/editor/new?week=${week}&lesson=${lessonNumber}&subject=${filterSubject}&class=${filterClass}`);
  };

  if (showPresentationMode && selectedLesson) {
    return <PresentationMode lesson={selectedLesson} onExit={() => { setShowPresentationMode(false); setSelectedLesson(null); }} />;
  }

  if (showPlanningMode && selectedLesson && user) {
    return (
      <LessonPlanningMode
        lesson={selectedLesson}
        teacherId={user.id}
        existingSession={getPlanningSessionForLesson(selectedLesson.id)}
        onComplete={handlePlanningComplete}
        onExit={() => { setShowPlanningMode(false); setSelectedLesson(null); }}
      />
    );
  }

  if (loadingAssignment) {
    return (
      <div 
        className={`min-h-screen flex items-center justify-center ${!dashboardGradientStyle ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900' : ''}`}
        style={dashboardGradientStyle}
      >
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (!assignment || assignedClasses.length === 0 || assignedSubjects.length === 0) {
    const logoToDisplay = branding.logo_url || CATALYST_LOGO;
    return (
      <div 
        className={`min-h-screen flex items-center justify-center p-4 ${!dashboardGradientStyle ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900' : ''}`}
        style={dashboardGradientStyle}
      >
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full text-center">
          <img src={logoToDisplay} alt="Logo" className="h-16 mx-auto mb-4 object-contain bg-white/90 rounded-lg px-3 py-2" />
          {adminAssigned ? (
            <>
              <Lock className="w-8 h-8 mx-auto text-amber-400 mb-2" />
              <p className="text-amber-400 mb-4">Your school admin has not assigned you to any classes yet.</p>
            </>
          ) : (
            <>
              <p className="text-white/70 mb-6">Please select your assigned classes and subjects to get started.</p>
              <Button onClick={() => setShowAssignment(true)} style={{ backgroundColor: branding.primary_color }} className="hover:opacity-90 w-full text-white">
                <Settings className="w-4 h-4 mr-2" /> Set Up My Classes
              </Button>
            </>
          )}
        </div>
        {showAssignment && !adminAssigned && <TeacherAssignmentSelector assignment={assignment} onSave={handleSaveAssignment} onClose={() => setShowAssignment(false)} />}
      </div>
    );
  }
  return (
    <div 
      className={`min-h-screen ${!dashboardGradientStyle ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900' : ''}`}
      style={dashboardGradientStyle}
    >
      <DashboardHeader user={user} navigate={navigate} isAuthenticated={isAuthenticated} logout={logout} setShowAssignment={setShowAssignment} adminAssigned={adminAssigned} />
      <DashboardContent
        canCreate={canCreate} canEdit={canEdit} navigate={navigate} togglePanel={togglePanel} activePanel={activePanel}
        assignedClasses={assignedClasses} assignedSubjects={assignedSubjects} attendanceClass={attendanceClass}
        setAttendanceClass={setAttendanceClass} assessmentClass={assessmentClass} setAssessmentClass={setAssessmentClass}
        setShowQuickAssess={setShowQuickAssess} setSelectedStudent={setSelectedStudent} searchQuery={searchQuery}
        setSearchQuery={setSearchQuery} filterSubject={filterSubject} setFilterSubject={setFilterSubject}
        filterClass={filterClass} setFilterClass={setFilterClass} viewMode={viewMode} setViewMode={setViewMode}
        filteredLessons={filteredLessons} setSelectedLesson={handleLessonClick} handleEditLesson={handleEditLesson}
        handleCreateLesson={handleCreateLesson} setShowBulkImport={setShowBulkImport}
        assignmentMode={assignmentMode}
        classSubjectMapping={classSubjectMapping}
        onPairChange={handlePairChange}
      />

      <CatalystMascot />
      {showBulkImport && <BulkImportModal onClose={() => setShowBulkImport(false)} onImport={(result) => bulkImportLessons(result)} />}
      {showQuickAssess && <QuickAssessmentPanel classLevel={assessmentClass} onClose={() => { setShowQuickAssess(false); setSelectedStudent(null); }} />}
      {showAssignment && !adminAssigned && <TeacherAssignmentSelector assignment={assignment} onSave={handleSaveAssignment} onClose={() => setShowAssignment(false)} />}
      {showActionModal && selectedLesson && (
        <LessonActionModal
          lesson={selectedLesson}
          planningSession={getPlanningSessionForLesson(selectedLesson.id)}
          onPlan={handleStartPlanning}
          onTeach={handleStartTeaching}
          onClose={() => { setShowActionModal(false); setSelectedLesson(null); }}
        />
      )}
    </div>
  );
};

export default Dashboard;
