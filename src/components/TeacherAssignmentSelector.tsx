import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DEFAULT_CLASSES, DEFAULT_SUBJECTS, getSubjectsForClass } from '@/lib/curriculum-defaults';
import { Check, X, BookOpen, Users, Grid3X3, Settings2 } from 'lucide-react';
import { ClassSubjectMappingEditor, ClassSubjectMapping } from './ClassSubjectMappingEditor';

export interface TeacherAssignment {
  mode: 'multi-class' | 'multi-subject' | 'multi-both';
  classes: string[];
  subjects: string[];
  classSubjectMapping?: ClassSubjectMapping;
}

interface Props {
  assignment: TeacherAssignment | null;
  onSave: (assignment: TeacherAssignment) => void;
  onClose: () => void;
  readOnly?: boolean;
}

export const TeacherAssignmentSelector: React.FC<Props> = ({ assignment, onSave, onClose, readOnly }) => {
  const [mode, setMode] = useState<'multi-class' | 'multi-subject' | 'multi-both'>(assignment?.mode || 'multi-class');
  const [selectedClasses, setSelectedClasses] = useState<string[]>(assignment?.classes || []);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(assignment?.subjects || []);
  const [classSubjectMapping, setClassSubjectMapping] = useState<ClassSubjectMapping>(assignment?.classSubjectMapping || {});
  const [showDetailedMapping, setShowDetailedMapping] = useState(false);

  // Set limits based on mode
  const getMaxClasses = () => {
    switch (mode) {
      case 'multi-class': return 9;
      case 'multi-subject': return 1;
      case 'multi-both': return 3; // Limited to 3 classes for multi-both
      default: return 9;
    }
  };

  const getMaxSubjects = () => {
    switch (mode) {
      case 'multi-class': return 1;
      case 'multi-subject': return 9;
      case 'multi-both': return 3; // Limited to 3 subjects for multi-both
      default: return 1;
    }
  };

  const maxClasses = getMaxClasses();
  const maxSubjects = getMaxSubjects();


  const availableSubjects = React.useMemo(() => {
    if (selectedClasses.length === 0) return DEFAULT_SUBJECTS.map(s => s.name);
    const gradeLevels = selectedClasses.map(c => DEFAULT_CLASSES.find(dc => dc.name === c)?.grade_level).filter(Boolean) as string[];
    const subjectSet = new Set<string>();
    gradeLevels.forEach(gl => getSubjectsForClass(gl).forEach(s => subjectSet.add(s.name)));
    return Array.from(subjectSet);
  }, [selectedClasses]);

  const toggleClass = (c: string) => {
    if (readOnly) return;
    if (selectedClasses.includes(c)) setSelectedClasses(selectedClasses.filter(x => x !== c));
    else if (selectedClasses.length < maxClasses) setSelectedClasses([...selectedClasses, c]);
  };

  const toggleSubject = (s: string) => {
    if (readOnly) return;
    if (selectedSubjects.includes(s)) setSelectedSubjects(selectedSubjects.filter(x => x !== s));
    else if (selectedSubjects.length < maxSubjects) setSelectedSubjects([...selectedSubjects, s]);
  };

  useEffect(() => {
    if (readOnly) return;
    // Adjust selections when mode changes
    if (mode === 'multi-class') {
      if (selectedClasses.length > 9) setSelectedClasses(selectedClasses.slice(0, 9));
      if (selectedSubjects.length > 1) setSelectedSubjects(selectedSubjects.slice(0, 1));
    } else if (mode === 'multi-subject') {
      if (selectedSubjects.length > 9) setSelectedSubjects(selectedSubjects.slice(0, 9));
      if (selectedClasses.length > 1) setSelectedClasses(selectedClasses.slice(0, 1));
    } else if (mode === 'multi-both') {
      // Limit to 3 classes and 3 subjects for multi-both mode
      if (selectedClasses.length > 3) setSelectedClasses(selectedClasses.slice(0, 3));
      if (selectedSubjects.length > 3) setSelectedSubjects(selectedSubjects.slice(0, 3));
    }
  }, [mode, readOnly]);


  // Initialize mapping when switching to multi-both mode
  useEffect(() => {
    if (mode === 'multi-both' && selectedClasses.length > 0 && selectedSubjects.length > 0) {
      const newMapping: ClassSubjectMapping = {};
      selectedClasses.forEach(c => {
        newMapping[c] = classSubjectMapping[c] 
          ? classSubjectMapping[c].filter(s => selectedSubjects.includes(s))
          : [...selectedSubjects];
      });
      setClassSubjectMapping(newMapping);
    }
  }, [mode, selectedClasses, selectedSubjects]);

  const canSave = selectedClasses.length > 0 && selectedSubjects.length > 0;
  const categories = [...new Set(DEFAULT_CLASSES.map(c => c.category))];

  const getModeDescription = () => {
    switch (mode) {
      case 'multi-class':
        return 'Select one subject to teach across multiple classes';
      case 'multi-subject':
        return 'Select one class to teach multiple subjects';
      case 'multi-both':
        return 'Select multiple classes and multiple subjects, then customize which subjects you teach in each class';
      default:
        return '';
    }
  };

  const handleSave = () => {
    const assignmentData: TeacherAssignment = {
      mode,
      classes: selectedClasses,
      subjects: selectedSubjects
    };
    
    // Include mapping only for multi-both mode
    if (mode === 'multi-both') {
      assignmentData.classSubjectMapping = classSubjectMapping;
    }
    
    onSave(assignmentData);
  };

  const getTotalMappings = () => {
    return Object.values(classSubjectMapping).reduce((total, subjects) => total + subjects.length, 0);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">{readOnly ? 'My Assigned Classes' : 'My Classes & Subjects'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        
        <div className="p-6 space-y-6">
          {!readOnly && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button 
                  onClick={() => setMode('multi-class')} 
                  className={`p-4 rounded-xl border-2 text-left transition-all ${mode === 'multi-class' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <Users className="w-6 h-6 mb-2 text-blue-600" />
                  <div className="font-bold text-gray-900">Multiple Classes</div>
                  <div className="text-sm text-gray-600">Up to 9 classes, 1 subject</div>
                  <div className="text-xs text-gray-500 mt-1">e.g., Math teacher</div>
                </button>
                <button 
                  onClick={() => setMode('multi-subject')} 
                  className={`p-4 rounded-xl border-2 text-left transition-all ${mode === 'multi-subject' ? 'border-purple-500 bg-purple-50 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <BookOpen className="w-6 h-6 mb-2 text-purple-600" />
                  <div className="font-bold text-gray-900">Multiple Subjects</div>
                  <div className="text-sm text-gray-600">Up to 9 subjects, 1 class</div>
                  <div className="text-xs text-gray-500 mt-1">e.g., Class teacher</div>
                </button>
                <button 
                  onClick={() => setMode('multi-both')} 
                  className={`p-4 rounded-xl border-2 text-left transition-all ${mode === 'multi-both' ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <Grid3X3 className="w-6 h-6 mb-2 text-emerald-600" />
                  <div className="font-bold text-gray-900">Multiple Both</div>
                  <div className="text-sm text-gray-600">Up to 3 classes & 3 subjects</div>
                  <div className="text-xs text-gray-500 mt-1">e.g., Flexible teaching</div>
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                <span className="font-medium">Selected mode:</span> {getModeDescription()}
              </div>
            </>
          )}


          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900">Classes ({selectedClasses.length}/{maxClasses})</h3>
              {selectedClasses.length >= maxClasses && (
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Maximum reached</span>
              )}
            </div>
            {categories.map(cat => (
              <div key={cat} className="mb-3">
                <div className="text-xs font-semibold text-gray-500 mb-2">{cat}</div>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_CLASSES.filter(c => c.category === cat).map(c => (
                    <button 
                      key={c.name} 
                      onClick={() => toggleClass(c.name)} 
                      disabled={readOnly || (!selectedClasses.includes(c.name) && selectedClasses.length >= maxClasses)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedClasses.includes(c.name) 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      {selectedClasses.includes(c.name) && <Check className="w-3 h-3 inline mr-1" />}{c.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900">Subjects ({selectedSubjects.length}/{maxSubjects})</h3>
              {selectedSubjects.length >= maxSubjects && (
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Maximum reached</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {(readOnly ? selectedSubjects : availableSubjects).map(s => (
                <button 
                  key={s} 
                  onClick={() => toggleSubject(s)} 
                  disabled={readOnly || (!selectedSubjects.includes(s) && selectedSubjects.length >= maxSubjects)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedSubjects.includes(s) 
                      ? 'bg-purple-600 text-white shadow-sm' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {selectedSubjects.includes(s) && <Check className="w-3 h-3 inline mr-1" />}{s}
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Class-Subject Mapping for multi-both mode */}
          {mode === 'multi-both' && selectedClasses.length > 0 && selectedSubjects.length > 0 && (
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-gray-900">Detailed Class-Subject Mapping</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetailedMapping(!showDetailedMapping)}
                  className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                >
                  {showDetailedMapping ? 'Hide Details' : 'Customize Mapping'}
                </Button>
              </div>

              {!showDetailedMapping ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <h4 className="font-semibold text-emerald-800 mb-2">Your Teaching Assignment</h4>
                  <div className="text-sm text-emerald-700">
                    <p>You will be teaching <span className="font-bold">{selectedSubjects.length} subject{selectedSubjects.length > 1 ? 's' : ''}</span> across <span className="font-bold">{selectedClasses.length} class{selectedClasses.length > 1 ? 'es' : ''}</span>.</p>
                    <p className="mt-2 text-emerald-600">
                      <Settings2 className="w-4 h-4 inline mr-1" />
                      Click "Customize Mapping" to specify exactly which subjects you teach in each class.
                    </p>
                    {getTotalMappings() > 0 && (
                      <p className="mt-2 font-medium">
                        Current: {getTotalMappings()} class-subject combinations configured
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <ClassSubjectMappingEditor
                  selectedClasses={selectedClasses}
                  selectedSubjects={selectedSubjects}
                  mapping={classSubjectMapping}
                  onMappingChange={setClassSubjectMapping}
                  readOnly={readOnly}
                />
              )}
            </div>
          )}

          {/* Simple summary for non-multi-both modes */}
          {mode !== 'multi-both' && selectedClasses.length > 0 && selectedSubjects.length > 0 && (
            <div className={`rounded-lg p-4 ${mode === 'multi-class' ? 'bg-blue-50 border border-blue-200' : 'bg-purple-50 border border-purple-200'}`}>
              <h4 className={`font-semibold mb-2 ${mode === 'multi-class' ? 'text-blue-800' : 'text-purple-800'}`}>Your Teaching Assignment</h4>
              <div className={`text-sm ${mode === 'multi-class' ? 'text-blue-700' : 'text-purple-700'}`}>
                <p>
                  Teaching <span className="font-bold">{selectedSubjects.join(', ')}</span> to{' '}
                  <span className="font-bold">{selectedClasses.join(', ')}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>{readOnly ? 'Close' : 'Cancel'}</Button>
          {!readOnly && (
            <Button 
              onClick={handleSave} 
              disabled={!canSave} 
              className={`${
                mode === 'multi-both' 
                  ? 'bg-emerald-600 hover:bg-emerald-700' 
                  : mode === 'multi-subject' 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Save Assignment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
