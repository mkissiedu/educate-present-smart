import React, { useState, useMemo } from 'react';
import { LessonCardWithPlanning } from './LessonCardWithPlanning';
import { WeeklyLessonView } from './WeeklyLessonView';
import { StudentRoll } from './StudentRoll';
import { AttendanceTracker } from './AttendanceTracker';
import { AssessmentHub } from './AssessmentHub';
import { TeacherScheduleView } from './schedule/TeacherScheduleView';
import { TeacherPunchClock } from './TeacherPunchClock';
import TeacherLeaveRequest from './TeacherLeaveRequest';
import { TeacherLearnPortal } from './pd/TeacherLearnPortal';
import { MyAssignmentsFilter } from './MyAssignmentsFilter';
import { ClassSubjectMapping } from './ClassSubjectMappingEditor';
import { Lesson } from '@/types/lesson';
import { Student } from '@/types/student';
import { usePlanningStatus } from '@/hooks/usePlanningStatus';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Sparkles, Users, ClipboardCheck, LayoutGrid, Calendar, Upload, BookOpen, CalendarDays, UserCheck, Database, Clock, Fingerprint, CalendarOff, GraduationCap, Grid3X3 } from 'lucide-react';
import { Badge } from './ui/badge';

interface Props {
  canCreate: boolean; canEdit: boolean; navigate: (path: string) => void;
  togglePanel: (panel: string) => void; activePanel: string | null;
  assignedClasses: string[]; assignedSubjects: string[];
  attendanceClass: string; setAttendanceClass: (c: string) => void;
  assessmentClass: string; setAssessmentClass: (c: string) => void;
  setShowQuickAssess: (show: boolean) => void; setSelectedStudent: (s: Student | null) => void;
  searchQuery: string; setSearchQuery: (q: string) => void;
  filterSubject: string; setFilterSubject: (s: string) => void;
  filterClass: string; setFilterClass: (c: string) => void;
  viewMode: 'grid' | 'weekly'; setViewMode: (m: 'grid' | 'weekly') => void;
  filteredLessons: Lesson[]; setSelectedLesson: (l: Lesson) => void;
  handleEditLesson: (l: Lesson) => void; handleCreateLesson: (w: number, n: number) => void;
  setShowBulkImport: (show: boolean) => void;
  assignmentMode?: 'multi-class' | 'multi-subject' | 'multi-both';
  classSubjectMapping?: ClassSubjectMapping;
  onPairChange?: (className: string, subject: string) => void;
}

export const DashboardContent: React.FC<Props> = (props) => {
  const { canCreate, canEdit, navigate, togglePanel, activePanel, assignedClasses, assignedSubjects,
    attendanceClass, setAttendanceClass, assessmentClass, setAssessmentClass, setShowQuickAssess,
    setSelectedStudent, searchQuery, setSearchQuery, filterSubject, setFilterSubject, filterClass,
    setFilterClass, viewMode, setViewMode, filteredLessons, setSelectedLesson, handleEditLesson,
    handleCreateLesson, setShowBulkImport, assignmentMode = 'multi-class', classSubjectMapping, onPairChange } = props;

  const { user } = useAuth();
  const { getPlanningSessionForLesson } = usePlanningStatus(user?.id);
  const [showPunchClock, setShowPunchClock] = useState(false);

  // Count planned vs unplanned lessons
  const plannedCount = filteredLessons.filter(l => getPlanningSessionForLesson(l.id)?.status === 'completed').length;
  const unplannedCount = filteredLessons.length - plannedCount;

  // Get subjects available for the currently selected class (for multi-both mode)
  const subjectsForSelectedClass = useMemo(() => {
    if (assignmentMode === 'multi-both' && classSubjectMapping) {
      return classSubjectMapping[filterClass] || [];
    }
    return assignedSubjects;
  }, [assignmentMode, classSubjectMapping, filterClass, assignedSubjects]);

  // Get classes available for the currently selected subject (for multi-both mode)
  const classesForSelectedSubject = useMemo(() => {
    if (assignmentMode === 'multi-both' && classSubjectMapping) {
      return assignedClasses.filter(className => 
        classSubjectMapping[className]?.includes(filterSubject)
      );
    }
    return assignedClasses;
  }, [assignmentMode, classSubjectMapping, filterSubject, assignedClasses]);

  // Handle class change with auto-adjustment of subject
  const handleClassChange = (newClass: string) => {
    setFilterClass(newClass);
    
    // If in multi-both mode, check if current subject is valid for new class
    if (assignmentMode === 'multi-both' && classSubjectMapping) {
      const validSubjects = classSubjectMapping[newClass] || [];
      if (!validSubjects.includes(filterSubject) && validSubjects.length > 0) {
        setFilterSubject(validSubjects[0]);
      }
    }
  };

  // Handle pair selection
  const handlePairSelect = (className: string, subject: string) => {
    if (onPairChange) {
      onPairChange(className, subject);
    } else {
      setFilterClass(className);
      setFilterSubject(subject);
    }
  };

  // Get subjects for a specific class based on assignment mode
  const getSubjectsForClass = (className: string): string[] => {
    if (assignmentMode === 'multi-both' && classSubjectMapping) {
      return classSubjectMapping[className] || [];
    }
    return assignedSubjects;
  };

  return (
    <div className="max-w-[1800px] mx-auto px-3 md:px-6 pb-4">
      {canCreate && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3 mb-4">
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl p-3 md:p-4 shadow-xl cursor-pointer hover:scale-105 transition-all" onClick={() => navigate('/editor/new')}>
            <Plus className="w-6 h-6 md:w-8 md:h-8 text-white mb-1" />
            <div className="text-orange-200 font-bold text-xs md:text-sm">Create New</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl p-3 md:p-4 shadow-xl cursor-pointer hover:scale-105 transition-all" onClick={() => navigate(`/curriculum?subjects=${encodeURIComponent(assignedSubjects.join(','))}`)}>
            <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-white mb-1" />
            <div className="text-emerald-200 font-bold text-xs md:text-sm">Curriculum</div>
          </div>
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-xl p-3 md:p-4 shadow-xl cursor-pointer hover:scale-105 transition-all" onClick={() => navigate('/term-planner')}>
            <CalendarDays className="w-6 h-6 md:w-8 md:h-8 text-white mb-1" />
            <div className="text-cyan-200 font-bold text-xs md:text-sm">Term Planner</div>
          </div>
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl p-3 md:p-4 shadow-xl cursor-pointer hover:scale-105 transition-all" onClick={() => navigate(`/question-bank?subjects=${encodeURIComponent(assignedSubjects.join(','))}&classes=${encodeURIComponent(assignedClasses.join(','))}`)}>
            <Database className="w-6 h-6 md:w-8 md:h-8 text-white mb-1" />
            <div className="text-indigo-200 font-bold text-xs md:text-sm">Question Bank</div>
          </div>
          <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl p-3 md:p-4 shadow-xl cursor-pointer hover:scale-105 transition-all" onClick={() => setShowBulkImport(true)}>
            <Upload className="w-6 h-6 md:w-8 md:h-8 text-white mb-1" />
            <div className="text-teal-200 font-bold text-xs md:text-sm">Bulk Import</div>
          </div>
        </div>
      )}

      {/* Planning Status Summary */}
      {!canCreate && filteredLessons.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 mb-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-white font-medium">{plannedCount} Ready to Teach</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-white font-medium">{unplannedCount} Need Planning</span>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {[
          { id: 'punchclock', icon: Fingerprint, label: 'Punch Clock', color: 'from-rose-500 to-rose-700' },
          { id: 'leave', icon: CalendarOff, label: 'Leave', color: 'from-amber-500 to-amber-700' },
          { id: 'learn', icon: GraduationCap, label: 'Learn', color: 'from-violet-500 to-violet-700' },
          { id: 'students', icon: Users, label: 'Students', color: 'from-purple-500 to-purple-700' },
          { id: 'schedule', icon: Clock, label: 'Schedule', color: 'from-blue-500 to-blue-700' },
          { id: 'attendance', icon: UserCheck, label: 'Attendance', color: 'from-green-500 to-green-700' },
          { id: 'assess', icon: ClipboardCheck, label: 'Assess', color: 'from-cyan-500 to-cyan-700' },
        ].map(item => (
          <div key={item.id} onClick={() => togglePanel(item.id)} className={`bg-gradient-to-br ${item.color} rounded-xl p-2 md:p-3 shadow-lg cursor-pointer hover:scale-105 transition-all ${activePanel === item.id ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''}`}>
            <item.icon className="w-5 h-5 md:w-6 md:h-6 text-white mx-auto mb-1" />
            <div className="text-[10px] md:text-xs text-white/80 font-bold text-center">{item.label}</div>
          </div>
        ))}
      </div>


      {activePanel === 'punchclock' && (
        <div className="mb-4">
          <TeacherPunchClock compact />
        </div>
      )}
      {activePanel === 'leave' && (
        <div className="mb-4 bg-white/10 backdrop-blur-md rounded-xl p-4">
          <TeacherLeaveRequest />
        </div>
      )}
      {activePanel === 'learn' && (
        <div className="mb-4 bg-white rounded-xl shadow-xl">
          <TeacherLearnPortal />
        </div>
      )}
      {activePanel === 'students' && (
        <div className="mb-4 bg-white/10 backdrop-blur-md rounded-xl">
          <StudentRoll 
            assignedClasses={assignedClasses} 
          />
        </div>
      )}
      {activePanel === 'schedule' && <div className="mb-4 bg-white/10 backdrop-blur-md rounded-xl"><TeacherScheduleView assignedClasses={assignedClasses} /></div>}
      {activePanel === 'attendance' && (
        <div className="mb-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 mb-3">
            <div className="flex items-center gap-3">
              <select value={attendanceClass} onChange={(e) => setAttendanceClass(e.target.value)} className="flex-1 bg-white/20 text-white rounded-lg px-3 py-2 text-sm">
                {assignedClasses.map((c) => <option key={c} value={c} className="text-gray-900">{c}</option>)}
              </select>
              {assignmentMode === 'multi-both' && classSubjectMapping && (
                <span className="text-xs text-white/60">
                  {getSubjectsForClass(attendanceClass).length} subjects assigned
                </span>
              )}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
            <AttendanceTracker classLevel={attendanceClass} />
          </div>
        </div>
      )}
      {activePanel === 'assess' && (
        <div className="mb-4 bg-white/10 backdrop-blur-md rounded-xl">
          <AssessmentHub 
            onNavigateToCurriculum={() => navigate(`/curriculum?subjects=${encodeURIComponent(assignedSubjects.join(','))}`)}
            onStartAssessment={(cl) => { setAssessmentClass(cl); setShowQuickAssess(true); }}
            onAssessStudent={(s) => { setSelectedStudent(s); setAssessmentClass(s.class_level); setShowQuickAssess(true); }}
            assignedClasses={assignedClasses} 
            assignedSubjects={assignedSubjects}
          />
        </div>
      )}


      <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 mb-4">
        <div className="flex gap-2 items-center flex-wrap">
          <input type="text" placeholder="Search lessons..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[120px] px-3 py-2 bg-white/20 text-white placeholder-white/50 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm" />
          
          {/* Show My Assignments dropdown for multi-both mode */}
          {assignmentMode === 'multi-both' && classSubjectMapping ? (
            <MyAssignmentsFilter
              assignmentMode={assignmentMode}
              assignedClasses={assignedClasses}
              assignedSubjects={assignedSubjects}
              classSubjectMapping={classSubjectMapping}
              selectedClass={filterClass}
              selectedSubject={filterSubject}
              onClassChange={handleClassChange}
              onSubjectChange={setFilterSubject}
              onPairChange={handlePairSelect}
              showPairSelector={true}
              compact={true}
            />
          ) : (
            <>
              <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} className="px-3 py-2 rounded-full bg-white/20 text-white text-sm">
                {assignedSubjects.map((s) => <option key={s} value={s} className="text-gray-900">{s}</option>)}
              </select>
              <select value={filterClass} onChange={(e) => handleClassChange(e.target.value)} className="px-3 py-2 rounded-full bg-white/20 text-white text-sm">
                {assignedClasses.map((c) => <option key={c} value={c} className="text-gray-900">{c}</option>)}
              </select>
            </>
          )}
          
          <div className="flex bg-white/20 rounded-full p-1">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-full ${viewMode === 'grid' ? 'bg-white/30' : ''}`}><LayoutGrid className="w-4 h-4 text-white" /></button>
            <button onClick={() => setViewMode('weekly')} className={`p-2 rounded-full ${viewMode === 'weekly' ? 'bg-white/30' : ''}`}><Calendar className="w-4 h-4 text-white" /></button>
          </div>
        </div>
        
        {/* Assignment Mode Indicator */}
        {assignmentMode === 'multi-both' && (
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline" className="bg-emerald-500/20 text-emerald-200 border-emerald-400/50">
              <Grid3X3 className="w-3 h-3 mr-1" />
              Flexible Teaching Mode
            </Badge>
            <span className="text-xs text-white/60">
              Showing {filterSubject} for {filterClass}
            </span>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
          <h2 className="text-lg md:text-2xl font-black text-white">My Lessons - {filterSubject}</h2>
          <Badge variant="outline" className="ml-2 text-white/70 border-white/30">{filterClass}</Badge>
        </div>
        {viewMode === 'weekly' ? (
          <WeeklyLessonView lessons={filteredLessons} subject={filterSubject} classLevel={filterClass}
            onSelectLesson={setSelectedLesson} onEditLesson={canEdit ? handleEditLesson : undefined}
            onCreateLesson={canCreate ? handleCreateLesson : undefined} canEdit={canEdit} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {filteredLessons.map((lesson) => (
              <LessonCardWithPlanning 
                key={lesson.id} 
                lesson={lesson} 
                planningSession={getPlanningSessionForLesson(lesson.id)}
                onClick={() => setSelectedLesson(lesson)}
                onPlan={() => setSelectedLesson(lesson)}
                onEdit={canEdit ? () => handleEditLesson(lesson) : undefined} 
                canEdit={canEdit} 
              />
            ))}
            {filteredLessons.length === 0 && (
              <div className="col-span-full text-center py-12 text-white/60">
                <p>No lessons found for {filterSubject} - {filterClass}</p>
                {assignmentMode === 'multi-both' && (
                  <p className="text-sm mt-2">
                    Try selecting a different class-subject combination from the dropdown above.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
