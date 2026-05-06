import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, ChevronUp, BookOpen, Users, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DEFAULT_SUBJECTS, getSubjectsForClass, DEFAULT_CLASSES } from '@/lib/curriculum-defaults';

export interface ClassSubjectMapping {
  [className: string]: string[];
}

interface Props {
  selectedClasses: string[];
  selectedSubjects: string[];
  mapping: ClassSubjectMapping;
  onMappingChange: (mapping: ClassSubjectMapping) => void;
  readOnly?: boolean;
}

export const ClassSubjectMappingEditor: React.FC<Props> = ({
  selectedClasses,
  selectedSubjects,
  mapping,
  onMappingChange,
  readOnly = false
}) => {
  const [expandedClasses, setExpandedClasses] = useState<string[]>(selectedClasses);

  // Initialize mapping when classes/subjects change
  useEffect(() => {
    const newMapping: ClassSubjectMapping = {};
    selectedClasses.forEach(className => {
      // Keep existing mapping or default to all selected subjects
      newMapping[className] = mapping[className] 
        ? mapping[className].filter(s => selectedSubjects.includes(s))
        : [...selectedSubjects];
    });
    
    // Only update if there's an actual change
    const hasChanges = selectedClasses.some(c => 
      !mapping[c] || 
      mapping[c].length !== newMapping[c].length ||
      mapping[c].some(s => !newMapping[c].includes(s))
    ) || Object.keys(mapping).some(c => !selectedClasses.includes(c));
    
    if (hasChanges) {
      onMappingChange(newMapping);
    }
  }, [selectedClasses, selectedSubjects]);

  const toggleClassExpanded = (className: string) => {
    setExpandedClasses(prev => 
      prev.includes(className) 
        ? prev.filter(c => c !== className)
        : [...prev, className]
    );
  };

  const toggleSubjectForClass = (className: string, subject: string) => {
    if (readOnly) return;
    
    const currentSubjects = mapping[className] || [];
    const newSubjects = currentSubjects.includes(subject)
      ? currentSubjects.filter(s => s !== subject)
      : [...currentSubjects, subject];
    
    onMappingChange({
      ...mapping,
      [className]: newSubjects
    });
  };

  const selectAllSubjectsForClass = (className: string) => {
    if (readOnly) return;
    onMappingChange({
      ...mapping,
      [className]: [...selectedSubjects]
    });
  };

  const clearAllSubjectsForClass = (className: string) => {
    if (readOnly) return;
    onMappingChange({
      ...mapping,
      [className]: []
    });
  };

  const applyToAllClasses = (subjects: string[]) => {
    if (readOnly) return;
    const newMapping: ClassSubjectMapping = {};
    selectedClasses.forEach(className => {
      newMapping[className] = [...subjects];
    });
    onMappingChange(newMapping);
  };

  const getClassGradeLevel = (className: string) => {
    const classInfo = DEFAULT_CLASSES.find(c => c.name === className);
    return classInfo?.grade_level || '';
  };

  const getAvailableSubjectsForClass = (className: string) => {
    const gradeLevel = getClassGradeLevel(className);
    if (!gradeLevel) return selectedSubjects;
    
    const classSubjects = getSubjectsForClass(gradeLevel).map(s => s.name);
    return selectedSubjects.filter(s => classSubjects.includes(s));
  };

  const getTotalMappings = () => {
    return Object.values(mapping).reduce((total, subjects) => total + subjects.length, 0);
  };

  const getClassesWithNoSubjects = () => {
    return selectedClasses.filter(c => !mapping[c] || mapping[c].length === 0);
  };

  const classesWithNoSubjects = getClassesWithNoSubjects();

  if (selectedClasses.length === 0 || selectedSubjects.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600 text-sm">
          Please select at least one class and one subject to configure the mapping.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-emerald-800">Class-Subject Mapping</h3>
          </div>
          <span className="text-sm text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
            {getTotalMappings()} total assignments
          </span>
        </div>
        <p className="text-sm text-emerald-700">
          Specify exactly which subjects you teach in each class. This allows for precise lesson planning and gradebook filtering.
        </p>
      </div>

      {/* Warning for classes without subjects */}
      {classesWithNoSubjects.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              {classesWithNoSubjects.length} class{classesWithNoSubjects.length > 1 ? 'es have' : ' has'} no subjects assigned
            </p>
            <p className="text-xs text-amber-700 mt-1">
              {classesWithNoSubjects.join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Quick actions */}
      {!readOnly && (
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => applyToAllClasses(selectedSubjects)}
            className="text-xs"
          >
            <Check className="w-3 h-3 mr-1" />
            All Subjects to All Classes
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => applyToAllClasses([])}
            className="text-xs text-gray-600"
          >
            Clear All Mappings
          </Button>
        </div>
      )}

      {/* Class-by-class mapping */}
      <div className="space-y-2">
        {selectedClasses.map(className => {
          const isExpanded = expandedClasses.includes(className);
          const classSubjects = mapping[className] || [];
          const availableSubjects = getAvailableSubjectsForClass(className);
          const hasAllSubjects = availableSubjects.every(s => classSubjects.includes(s));
          
          return (
            <div 
              key={className}
              className={`border rounded-lg overflow-hidden transition-all ${
                classSubjects.length === 0 
                  ? 'border-amber-300 bg-amber-50/50' 
                  : 'border-gray-200 bg-white'
              }`}
            >
              {/* Class header */}
              <div 
                className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 ${
                  classSubjects.length === 0 ? 'hover:bg-amber-100/50' : ''
                }`}
                onClick={() => toggleClassExpanded(className)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    classSubjects.length > 0 ? 'bg-blue-100' : 'bg-amber-100'
                  }`}>
                    <Users className={`w-4 h-4 ${
                      classSubjects.length > 0 ? 'text-blue-600' : 'text-amber-600'
                    }`} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{className}</div>
                    <div className="text-xs text-gray-500">
                      {classSubjects.length} of {availableSubjects.length} subjects
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {classSubjects.length > 0 && (
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {classSubjects.slice(0, 3).map(s => (
                        <span 
                          key={s} 
                          className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded"
                        >
                          {s.length > 10 ? s.substring(0, 10) + '...' : s}
                        </span>
                      ))}
                      {classSubjects.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{classSubjects.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded subject selection */}
              {isExpanded && (
                <div className="border-t p-3 bg-gray-50">
                  {!readOnly && (
                    <div className="flex gap-2 mb-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectAllSubjectsForClass(className);
                        }}
                        disabled={hasAllSubjects}
                        className="text-xs"
                      >
                        Select All
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearAllSubjectsForClass(className);
                        }}
                        disabled={classSubjects.length === 0}
                        className="text-xs"
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableSubjects.map(subject => {
                      const isSelected = classSubjects.includes(subject);
                      const isAvailable = selectedSubjects.includes(subject);
                      
                      return (
                        <button
                          key={subject}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSubjectForClass(className, subject);
                          }}
                          disabled={readOnly || !isAvailable}
                          className={`flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-all ${
                            isSelected
                              ? 'bg-purple-600 text-white shadow-sm'
                              : isAvailable
                                ? 'bg-white border border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                            isSelected 
                              ? 'bg-white border-white' 
                              : 'border-gray-300'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-purple-600" />}
                          </div>
                          <span className="truncate">{subject}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Show unavailable subjects notice */}
                  {selectedSubjects.some(s => !availableSubjects.includes(s)) && (
                    <p className="text-xs text-gray-500 mt-2 italic">
                      Some subjects are not available for this grade level.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-purple-600" />
          Assignment Summary
        </h4>
        <div className="space-y-2">
          {selectedClasses.map(className => {
            const classSubjects = mapping[className] || [];
            if (classSubjects.length === 0) return null;
            
            return (
              <div key={className} className="flex items-start gap-2 text-sm">
                <span className="font-medium text-gray-700 min-w-[80px]">{className}:</span>
                <div className="flex flex-wrap gap-1">
                  {classSubjects.map(s => (
                    <span 
                      key={s} 
                      className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
          {getTotalMappings() === 0 && (
            <p className="text-sm text-gray-500 italic">No subjects assigned yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassSubjectMappingEditor;
