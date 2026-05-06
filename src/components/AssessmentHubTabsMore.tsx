import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Student } from '../types/student';
import { CLASS_LEVELS, ClassLevel } from '@/types/user';
import { Users, GraduationCap, ChevronRight, User, UserCog, BarChart3, PenLine, FileText, BookOpen, AlertCircle } from 'lucide-react';

interface AssessClassesProps {
  classCounts: Record<string, number>;
  activeClasses: string[];
  onSelectClass: (c: string) => void;
}

export const AssessClassesTab: React.FC<AssessClassesProps> = ({ classCounts, activeClasses, onSelectClass }) => (
  <div className="space-y-2">
    {activeClasses.length === 0 ? (
      <Card className="p-6 text-center bg-white/80">
        <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">No classes with students yet</p>
        <p className="text-sm text-gray-400">Add students to assess classes</p>
      </Card>
    ) : (
      activeClasses.map(level => (
        <Card key={level} className="p-4 bg-white hover:bg-gray-50 cursor-pointer transition-all" onClick={() => onSelectClass(level)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">{level.split(' ')[0]}</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{level}</h3>
                <p className="text-sm text-gray-500">{classCounts[level]} student{classCounts[level] !== 1 ? 's' : ''} to assess</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Card>
      ))
    )}
  </div>
);

interface AssessStudentsProps {
  students: Student[];
  selectedClass: string;
  onClassChange: (c: string) => void;
  onSelectStudent: (s: Student) => void;
  onEnterScores?: (s: Student) => void;
  onGenerateReport?: (s: Student) => void;
  availableClasses?: ClassLevel[];
}

export const AssessStudentsTab: React.FC<AssessStudentsProps> = ({ 
  students, selectedClass, onClassChange, onSelectStudent, onEnterScores, onGenerateReport, availableClasses 
}) => {
  const classOptions = availableClasses && availableClasses.length > 0 ? availableClasses : CLASS_LEVELS;
  
  return (
    <div>
      <select value={selectedClass} onChange={(e) => onClassChange(e.target.value)} 
        className="w-full mb-3 p-2 rounded-lg bg-white/20 text-white border-0">
        <option value="All" className="text-gray-900">All Classes</option>
        {classOptions.map(c => <option key={c} value={c} className="text-gray-900">{c}</option>)}
      </select>
      
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {students.map(s => (
          <Card key={s.id} className="p-3 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full flex items-center justify-center cursor-pointer" onClick={() => onSelectStudent(s)}>
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 cursor-pointer" onClick={() => onSelectStudent(s)}>
                <p className="font-semibold text-gray-800">{s.first_name} {s.last_name}</p>
                <p className="text-xs text-gray-500">{s.class_level}</p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => onEnterScores?.(s)} title="Enter Scores">
                  <PenLine className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => onGenerateReport?.(s)} title="Report Card">
                  <FileText className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {students.length === 0 && (
          <Card className="p-6 text-center bg-white/80">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No students in your assigned classes</p>
          </Card>
        )}
      </div>
    </div>
  );
};

interface Teacher { 
  id: string; 
  name: string; 
  role: string; 
  classes: string[];
  subjects?: string[];
  assignmentMode?: 'multi-class' | 'multi-subject' | 'multi-both';
}

interface AssessTeachersProps {
  teachers: Teacher[];
  onSelectTeacher?: (t: Teacher) => void;
  currentUserClasses?: string[];
  currentUserSubjects?: string[];
  showOnlyOverlapping?: boolean;
}

export const AssessTeachersTab: React.FC<AssessTeachersProps> = ({ 
  teachers, 
  onSelectTeacher,
  currentUserClasses = [],
  currentUserSubjects = [],
  showOnlyOverlapping = true
}) => {
  // Filter teachers to only show those with overlapping classes or subjects
  const filteredTeachers = showOnlyOverlapping && (currentUserClasses.length > 0 || currentUserSubjects.length > 0)
    ? teachers.filter(t => {
        // Check for class overlap
        const hasClassOverlap = t.classes.some(c => currentUserClasses.includes(c));
        // Check for subject overlap (if subjects are available)
        const hasSubjectOverlap = t.subjects?.some(s => currentUserSubjects.includes(s));
        return hasClassOverlap || hasSubjectOverlap;
      })
    : teachers;

  const getModeLabel = (mode?: string) => {
    switch (mode) {
      case 'multi-class': return 'Subject Teacher';
      case 'multi-subject': return 'Class Teacher';
      case 'multi-both': return 'Flexible';
      default: return '';
    }
  };

  const getModeColor = (mode?: string) => {
    switch (mode) {
      case 'multi-class': return 'bg-blue-100 text-blue-700';
      case 'multi-subject': return 'bg-purple-100 text-purple-700';
      case 'multi-both': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-3">
      {showOnlyOverlapping && (currentUserClasses.length > 0 || currentUserSubjects.length > 0) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
            <div>
              <p className="text-blue-800 font-medium">Showing teachers with overlapping assignments</p>
              <p className="text-blue-600 text-xs mt-1">
                Only teachers who share your classes or subjects are displayed.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {filteredTeachers.length === 0 ? (
        <Card className="p-6 text-center bg-white/80">
          <UserCog className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">
            {showOnlyOverlapping 
              ? 'No teachers with overlapping assignments' 
              : 'No teachers available'
            }
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {showOnlyOverlapping 
              ? 'Teachers who share your classes or subjects will appear here'
              : 'Teachers will appear once they are assigned'
            }
          </p>
        </Card>
      ) : (
        filteredTeachers.map(t => (
          <Card key={t.id} className="p-4 bg-white hover:bg-gray-50 cursor-pointer transition-all" onClick={() => onSelectTeacher?.(t)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                <UserCog className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-800">{t.name}</p>
                  {t.assignmentMode && (
                    <Badge variant="outline" className={`text-xs ${getModeColor(t.assignmentMode)}`}>
                      {getModeLabel(t.assignmentMode)}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    {t.classes.length} class{t.classes.length !== 1 ? 'es' : ''}
                  </p>
                  {t.subjects && t.subjects.length > 0 && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {t.subjects.length} subject{t.subjects.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                {/* Show overlapping classes/subjects */}
                {(currentUserClasses.length > 0 || currentUserSubjects.length > 0) && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {t.classes.filter(c => currentUserClasses.includes(c)).map(c => (
                      <span key={c} className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                        {c}
                      </span>
                    ))}
                    {t.subjects?.filter(s => currentUserSubjects.includes(s)).map(s => (
                      <span key={s} className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <BarChart3 className="w-4 h-4 text-gray-400" />
            </div>
          </Card>
        ))
      )}
    </div>
  );
};
