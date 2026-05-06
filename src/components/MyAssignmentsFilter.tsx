import React, { useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BookOpen, GraduationCap, Grid3X3, ChevronRight } from 'lucide-react';
import { ClassSubjectMapping } from './ClassSubjectMappingEditor';

export interface ClassSubjectPair {
  className: string;
  subject: string;
  label: string;
}

interface Props {
  assignmentMode: 'multi-class' | 'multi-subject' | 'multi-both';
  assignedClasses: string[];
  assignedSubjects: string[];
  classSubjectMapping?: ClassSubjectMapping;
  selectedClass: string;
  selectedSubject: string;
  onClassChange: (className: string) => void;
  onSubjectChange: (subject: string) => void;
  onPairChange?: (className: string, subject: string) => void;
  showPairSelector?: boolean;
  compact?: boolean;
}

export const MyAssignmentsFilter: React.FC<Props> = ({
  assignmentMode,
  assignedClasses,
  assignedSubjects,
  classSubjectMapping,
  selectedClass,
  selectedSubject,
  onClassChange,
  onSubjectChange,
  onPairChange,
  showPairSelector = true,
  compact = false
}) => {
  // Generate all valid class-subject pairs
  const classSubjectPairs = useMemo<ClassSubjectPair[]>(() => {
    const pairs: ClassSubjectPair[] = [];
    
    if (assignmentMode === 'multi-both' && classSubjectMapping) {
      // Use the detailed mapping
      Object.entries(classSubjectMapping).forEach(([className, subjects]) => {
        subjects.forEach(subject => {
          pairs.push({
            className,
            subject,
            label: `${className} - ${subject}`
          });
        });
      });
    } else {
      // Generate all combinations for other modes
      assignedClasses.forEach(className => {
        assignedSubjects.forEach(subject => {
          pairs.push({
            className,
            subject,
            label: `${className} - ${subject}`
          });
        });
      });
    }
    
    return pairs.sort((a, b) => a.label.localeCompare(b.label));
  }, [assignmentMode, assignedClasses, assignedSubjects, classSubjectMapping]);

  // Get subjects available for the selected class
  const subjectsForSelectedClass = useMemo(() => {
    if (assignmentMode === 'multi-both' && classSubjectMapping) {
      return classSubjectMapping[selectedClass] || [];
    }
    return assignedSubjects;
  }, [assignmentMode, classSubjectMapping, selectedClass, assignedSubjects]);

  // Get classes available for the selected subject
  const classesForSelectedSubject = useMemo(() => {
    if (assignmentMode === 'multi-both' && classSubjectMapping) {
      return assignedClasses.filter(className => 
        classSubjectMapping[className]?.includes(selectedSubject)
      );
    }
    return assignedClasses;
  }, [assignmentMode, classSubjectMapping, selectedSubject, assignedClasses]);

  // Handle class change - also update subject if needed
  const handleClassChange = (newClass: string) => {
    onClassChange(newClass);
    
    // If in multi-both mode, check if current subject is valid for new class
    if (assignmentMode === 'multi-both' && classSubjectMapping) {
      const validSubjects = classSubjectMapping[newClass] || [];
      if (!validSubjects.includes(selectedSubject) && validSubjects.length > 0) {
        onSubjectChange(validSubjects[0]);
      }
    }
  };

  // Handle pair selection from dropdown
  const handlePairSelect = (pairLabel: string) => {
    const pair = classSubjectPairs.find(p => p.label === pairLabel);
    if (pair && onPairChange) {
      onPairChange(pair.className, pair.subject);
    } else if (pair) {
      onClassChange(pair.className);
      onSubjectChange(pair.subject);
    }
  };

  const selectedPairLabel = `${selectedClass} - ${selectedSubject}`;
  const isValidPair = classSubjectPairs.some(p => p.label === selectedPairLabel);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {showPairSelector && assignmentMode === 'multi-both' && classSubjectPairs.length > 0 ? (
          <Select value={selectedPairLabel} onValueChange={handlePairSelect}>
            <SelectTrigger className="w-64 bg-white/20 text-white border-white/30">
              <div className="flex items-center gap-2">
                <Grid3X3 className="w-4 h-4" />
                <SelectValue placeholder="Select assignment" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {classSubjectPairs.map(pair => (
                <SelectItem key={pair.label} value={pair.label}>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-3 h-3 text-blue-500" />
                    <span>{pair.className}</span>
                    <ChevronRight className="w-3 h-3 text-gray-400" />
                    <BookOpen className="w-3 h-3 text-purple-500" />
                    <span>{pair.subject}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <>
            <Select value={selectedClass} onValueChange={handleClassChange}>
              <SelectTrigger className="w-32 bg-white/20 text-white border-white/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(assignmentMode === 'multi-class' ? assignedClasses : classesForSelectedSubject).map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedSubject} onValueChange={onSubjectChange}>
              <SelectTrigger className="w-40 bg-white/20 text-white border-white/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {subjectsForSelectedClass.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Assignment Mode Badge */}
      <div className="flex items-center gap-2">
        <Badge 
          variant="outline" 
          className={`${
            assignmentMode === 'multi-both' 
              ? 'bg-emerald-100 text-emerald-700 border-emerald-300' 
              : assignmentMode === 'multi-subject'
                ? 'bg-purple-100 text-purple-700 border-purple-300'
                : 'bg-blue-100 text-blue-700 border-blue-300'
          }`}
        >
          {assignmentMode === 'multi-both' && <Grid3X3 className="w-3 h-3 mr-1" />}
          {assignmentMode === 'multi-subject' && <BookOpen className="w-3 h-3 mr-1" />}
          {assignmentMode === 'multi-class' && <GraduationCap className="w-3 h-3 mr-1" />}
          {assignmentMode === 'multi-both' ? 'Flexible Teaching' : 
           assignmentMode === 'multi-subject' ? 'Class Teacher' : 'Subject Teacher'}
        </Badge>
        <span className="text-sm text-gray-500">
          {classSubjectPairs.length} assignment{classSubjectPairs.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Pair Selector for multi-both mode */}
      {showPairSelector && assignmentMode === 'multi-both' && classSubjectPairs.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            My Assignments
          </label>
          <Select value={selectedPairLabel} onValueChange={handlePairSelect}>
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <Grid3X3 className="w-4 h-4 text-emerald-600" />
                <SelectValue placeholder="Select class-subject pair" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {classSubjectPairs.map(pair => (
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
          {!isValidPair && selectedClass && selectedSubject && (
            <p className="text-xs text-amber-600 mt-1">
              Note: {selectedSubject} is not assigned to {selectedClass}
            </p>
          )}
        </div>
      )}

      {/* Separate Class and Subject selectors for other modes */}
      {(!showPairSelector || assignmentMode !== 'multi-both') && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <Select value={selectedClass} onValueChange={handleClassChange}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-500" />
                  <SelectValue placeholder="Select class" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {(assignmentMode === 'multi-class' ? assignedClasses : classesForSelectedSubject).map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <Select value={selectedSubject} onValueChange={onSubjectChange}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-500" />
                  <SelectValue placeholder="Select subject" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {subjectsForSelectedClass.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {assignmentMode === 'multi-both' && classSubjectMapping && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {assignedClasses.map(className => {
            const subjectCount = classSubjectMapping[className]?.length || 0;
            return (
              <Badge 
                key={className} 
                variant="outline" 
                className={`text-xs ${
                  className === selectedClass 
                    ? 'bg-blue-100 border-blue-300 text-blue-700' 
                    : 'bg-gray-50'
                }`}
              >
                {className}: {subjectCount} subject{subjectCount !== 1 ? 's' : ''}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyAssignmentsFilter;
