import { useState, useMemo, useEffect } from 'react';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Student } from '@/types/student';
import { CLASS_LEVELS } from '@/types/user';
import { useSchool } from '@/contexts/SchoolContext';
import { GradebookScoreGrid } from './GradebookScoreGrid';
import { GradebookReportList } from './GradebookReportList';
import { TeacherGradebookSetup } from './TeacherGradebookSetup';
import { StudentStandardsMap } from './StudentStandardsMap';
import { MyAssignmentsFilter, ClassSubjectPair } from './MyAssignmentsFilter';
import { ClassSubjectMapping } from './ClassSubjectMappingEditor';
import { getTeacherAssignment, TeacherAssignmentRecord, getTeacherClassSubjectCombinations } from '@/lib/supabase-teacher-assignments';
import { BookOpen, FileText, Users, GraduationCap, BarChart3, TrendingUp, School, Settings, Loader2, Grid3X3, ChevronRight, Target } from 'lucide-react';


interface Props {
  students: Student[];
  termId: string;
  termNumber: number;
  academicYear: string;
  onViewReport: (student: Student) => void;
  onGenerateReport: (student: Student) => void;
  teacherId?: string;
  teacherName?: string;
}

export function GradebookTab({ students, termId, termNumber, academicYear, onViewReport, onGenerateReport, teacherId, teacherName }: Props) {
  const { currentSchool } = useSchool();
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [activeView, setActiveView] = useState('scores');
  const [teacherAssignment, setTeacherAssignment] = useState<TeacherAssignmentRecord | null>(null);
  const [loadingAssignment, setLoadingAssignment] = useState(true);
  const [showSetup, setShowSetup] = useState(false);

  // Load teacher assignment on mount
  useEffect(() => {
    const loadAssignment = async () => {
      if (teacherId && currentSchool?.id) {
        setLoadingAssignment(true);
        const assignment = await getTeacherAssignment(teacherId, currentSchool.id);
        setTeacherAssignment(assignment);
        setLoadingAssignment(false);
        
        // If no assignment exists, show setup
        if (!assignment) {
          setShowSetup(true);
        } else {
          // Set initial subject selection
          if (assignment.assigned_subjects.length > 0) {
            setSelectedSubject(assignment.assigned_subjects[0]);
          }
        }
      } else {
        setLoadingAssignment(false);
      }
    };
    loadAssignment();
  }, [teacherId, currentSchool?.id]);

  const handleSetupComplete = async () => {
    if (teacherId && currentSchool?.id) {
      const assignment = await getTeacherAssignment(teacherId, currentSchool.id);
      setTeacherAssignment(assignment);
      setShowSetup(false);
      if (assignment?.assigned_subjects.length) {
        setSelectedSubject(assignment.assigned_subjects[0]);
      }
    }
  };

  // Get class-subject combinations for multi-both mode
  const classSubjectCombinations = useMemo<ClassSubjectPair[]>(() => {
    if (!teacherAssignment) return [];
    
    if (teacherAssignment.assignment_mode === 'multi-both' && teacherAssignment.class_subject_mapping) {
      const combinations: ClassSubjectPair[] = [];
      Object.entries(teacherAssignment.class_subject_mapping).forEach(([className, subjects]) => {
        subjects.forEach(subject => {
          combinations.push({
            className,
            subject,
            label: `${className} - ${subject}`
          });
        });
      });
      return combinations.sort((a, b) => a.label.localeCompare(b.label));
    }
    
    // For other modes, generate all combinations
    const combinations: ClassSubjectPair[] = [];
    teacherAssignment.assigned_classes.forEach(className => {
      teacherAssignment.assigned_subjects.forEach(subject => {
        combinations.push({
          className,
          subject,
          label: `${className} - ${subject}`
        });
      });
    });
    return combinations;
  }, [teacherAssignment]);

  // Get subjects available for the selected class
  const subjectsForSelectedClass = useMemo(() => {
    if (!teacherAssignment) return [];
    
    if (selectedClass === 'All') {
      return teacherAssignment.assigned_subjects;
    }
    
    if (teacherAssignment.assignment_mode === 'multi-both' && teacherAssignment.class_subject_mapping) {
      return teacherAssignment.class_subject_mapping[selectedClass] || [];
    }
    
    return teacherAssignment.assigned_subjects;
  }, [teacherAssignment, selectedClass]);

  // Filter students based on teacher's assigned classes
  const assignedStudents = useMemo(() => {
    if (!teacherAssignment) return students;
    return students.filter(s => teacherAssignment.assigned_classes.includes(s.class_level));
  }, [students, teacherAssignment]);

  const classCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    assignedStudents.forEach(s => { counts[s.class_level] = (counts[s.class_level] || 0) + 1; });
    return counts;
  }, [assignedStudents]);

  // Only show classes that the teacher is assigned to
  const activeClasses = useMemo(() => {
    if (!teacherAssignment) {
      return CLASS_LEVELS.filter(c => classCounts[c] > 0);
    }
    return teacherAssignment.assigned_classes.filter(c => classCounts[c] > 0);
  }, [teacherAssignment, classCounts]);

  const filteredStudents = selectedClass === 'All' 
    ? assignedStudents 
    : assignedStudents.filter(s => s.class_level === selectedClass);

  const stats = useMemo(() => ({
    totalStudents: assignedStudents.length,
    classesWithStudents: activeClasses.length,
    avgClassSize: activeClasses.length > 0 ? Math.round(assignedStudents.length / activeClasses.length) : 0
  }), [assignedStudents, activeClasses]);

  // Handle class change with subject auto-adjustment
  const handleClassChange = (newClass: string) => {
    setSelectedClass(newClass);
    
    // If in multi-both mode, check if current subject is valid for new class
    if (teacherAssignment?.assignment_mode === 'multi-both' && teacherAssignment.class_subject_mapping && newClass !== 'All') {
      const validSubjects = teacherAssignment.class_subject_mapping[newClass] || [];
      if (!validSubjects.includes(selectedSubject) && validSubjects.length > 0) {
        setSelectedSubject(validSubjects[0]);
      }
    }
  };

  // Handle pair selection from My Assignments dropdown
  const handlePairChange = (className: string, subject: string) => {
    setSelectedClass(className);
    setSelectedSubject(subject);
  };

  // Show loading state
  if (loadingAssignment) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
          <p className="text-white/80">Loading your gradebook...</p>
        </div>
      </div>
    );
  }

  // Show setup wizard if needed
  if (showSetup && teacherId && currentSchool?.id) {
    return (
      <TeacherGradebookSetup
        teacherId={teacherId}
        schoolId={currentSchool.id}
        teacherName={teacherName || 'Teacher'}
        onSetupComplete={handleSetupComplete}
      />
    );
  }

  return (
    <div className="space-y-4">
      {currentSchool && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <School className="w-4 h-4" />
            <span>{currentSchool.name}</span>
          </div>
          {teacherAssignment && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSetup(true)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Settings className="w-4 h-4 mr-2" />
              Edit Assignments
            </Button>
          )}
        </div>
      )}

      {/* Show assigned info with mode badge */}
      {teacherAssignment && (
        <Card className="p-3 bg-white/10 border-white/20">
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
            <Badge 
              variant="outline" 
              className={`${
                teacherAssignment.assignment_mode === 'multi-both' 
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/50' 
                  : teacherAssignment.assignment_mode === 'multi-subject'
                    ? 'bg-purple-500/20 text-purple-200 border-purple-400/50'
                    : 'bg-blue-500/20 text-blue-200 border-blue-400/50'
              }`}
            >
              {teacherAssignment.assignment_mode === 'multi-both' && <Grid3X3 className="w-3 h-3 mr-1" />}
              {teacherAssignment.assignment_mode === 'multi-subject' && <BookOpen className="w-3 h-3 mr-1" />}
              {teacherAssignment.assignment_mode === 'multi-class' && <GraduationCap className="w-3 h-3 mr-1" />}
              {teacherAssignment.assignment_mode === 'multi-both' ? 'Flexible Teaching' : 
               teacherAssignment.assignment_mode === 'multi-subject' ? 'Class Teacher' : 'Subject Teacher'}
            </Badge>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              <span>
                <strong>Classes:</strong> {teacherAssignment.assigned_classes.join(', ')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>
                <strong>Subjects:</strong> {teacherAssignment.assigned_subjects.length} assigned
              </span>
            </div>
            {teacherAssignment.assignment_mode === 'multi-both' && (
              <div className="flex items-center gap-2 text-emerald-300">
                <span>
                  <strong>{classSubjectCombinations.length}</strong> class-subject combinations
                </span>
              </div>
            )}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <Users className="w-6 h-6 mb-1" />
          <p className="text-2xl font-bold">{stats.totalStudents}</p>
          <p className="text-xs opacity-80">Total Students</p>
        </Card>
        <Card className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <GraduationCap className="w-6 h-6 mb-1" />
          <p className="text-2xl font-bold">{stats.classesWithStudents}</p>
          <p className="text-xs opacity-80">Active Classes</p>
        </Card>
        <Card className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <BarChart3 className="w-6 h-6 mb-1" />
          <p className="text-2xl font-bold">Term {termNumber}</p>
          <p className="text-xs opacity-80">{academicYear}</p>
        </Card>
        <Card className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <TrendingUp className="w-6 h-6 mb-1" />
          <p className="text-2xl font-bold">{stats.avgClassSize}</p>
          <p className="text-xs opacity-80">Avg Class Size</p>
        </Card>
      </div>

      {/* Class and Subject Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* My Assignments dropdown for multi-both mode */}
        {teacherAssignment?.assignment_mode === 'multi-both' && teacherAssignment.class_subject_mapping && (
          <div className="flex-1 min-w-[280px]">
            <label className="block text-xs font-medium text-white/70 mb-1">My Assignments</label>
            <Select 
              value={selectedClass !== 'All' ? `${selectedClass} - ${selectedSubject}` : ''} 
              onValueChange={(value) => {
                const pair = classSubjectCombinations.find(p => p.label === value);
                if (pair) handlePairChange(pair.className, pair.subject);
              }}
            >
              <SelectTrigger className="w-full bg-white">
                <div className="flex items-center gap-2">
                  <Grid3X3 className="w-4 h-4 text-emerald-600" />
                  <SelectValue placeholder="Select class-subject pair" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {classSubjectCombinations.map(pair => (
                  <SelectItem key={pair.label} value={pair.label}>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">{pair.className}</span>
                      <ChevronRight className="w-3 h-3 text-gray-400" />
                      <BookOpen className="w-4 h-4 text-purple-500" />
                      <span>{pair.subject}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Standard class dropdown */}
        <div>
          <label className="block text-xs font-medium text-white/70 mb-1">Class</label>
          <Select value={selectedClass} onValueChange={handleClassChange}>
            <SelectTrigger className="w-48 bg-white">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Classes ({assignedStudents.length})</SelectItem>
              {activeClasses.map(c => (
                <SelectItem key={c} value={c}>
                  {c} ({classCounts[c] || 0})
                  {teacherAssignment?.assignment_mode === 'multi-both' && teacherAssignment.class_subject_mapping && (
                    <span className="text-gray-400 ml-2">
                      • {teacherAssignment.class_subject_mapping[c]?.length || 0} subjects
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subject dropdown - filtered based on selected class for multi-both mode */}
        {selectedClass !== 'All' && (
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Subject</label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-48 bg-white">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjectsForSelectedClass.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-end">
          <span className="text-sm text-white/80 pb-2">{filteredStudents.length} students selected</span>
        </div>
      </div>

      {/* Show current selection summary for multi-both mode */}
      {teacherAssignment?.assignment_mode === 'multi-both' && selectedClass !== 'All' && selectedSubject && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-emerald-200 text-sm">
            <Grid3X3 className="w-4 h-4" />
            <span>
              Viewing scores for <strong>{selectedSubject}</strong> in <strong>{selectedClass}</strong>
            </span>
          </div>
        </div>
      )}

      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="bg-white/20">
          <TabsTrigger value="scores" className="text-white data-[state=active]:bg-white/30">
            <BookOpen className="w-4 h-4 mr-2" />Score Entry
          </TabsTrigger>
          <TabsTrigger value="standards" className="text-white data-[state=active]:bg-white/30">
            <Target className="w-4 h-4 mr-2" />Standards Map
          </TabsTrigger>
          <TabsTrigger value="reports" className="text-white data-[state=active]:bg-white/30">
            <FileText className="w-4 h-4 mr-2" />Report Cards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scores" className="mt-4">
          {filteredStudents.length > 0 ? (
            <GradebookScoreGrid 
              students={filteredStudents} 
              termId={termId} 
              termNumber={termNumber}
              assignedSubjects={subjectsForSelectedClass.length > 0 ? subjectsForSelectedClass : teacherAssignment?.assigned_subjects}
              selectedClass={selectedClass}
              selectedSubject={selectedSubject}
              assignmentMode={teacherAssignment?.assignment_mode}
              classSubjectMapping={teacherAssignment?.class_subject_mapping as ClassSubjectMapping | undefined}
            />
          ) : (
            <Card className="p-8 text-center bg-white">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No students in selected class</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="standards" className="mt-4">
          {filteredStudents.length > 0 && selectedClass !== 'All' && selectedSubject ? (
            <StudentStandardsMap
              students={filteredStudents}
              className={selectedClass}
              subject={selectedSubject}
              termId={termId}
              curriculumIndicators={[]} // Will be populated from curriculum data
            />
          ) : (
            <Card className="p-8 text-center bg-white">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">
                {selectedClass === 'All' 
                  ? 'Please select a specific class to view standards map'
                  : !selectedSubject 
                    ? 'Please select a subject to view standards map'
                    : 'No students in selected class'}
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <GradebookReportList students={filteredStudents} termId={termId} termNumber={termNumber} academicYear={academicYear} onViewReport={onViewReport} onGenerateReport={onGenerateReport} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

