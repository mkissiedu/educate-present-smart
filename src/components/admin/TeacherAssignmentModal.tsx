import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DEFAULT_CLASSES, DEFAULT_SUBJECTS, getSubjectsForClass } from '@/lib/curriculum-defaults';
import { saveTeacherAssignment, getTeacherAssignment } from '@/lib/supabase-teacher-assignments';
import { Check, Users, BookOpen, Loader2, Grid3X3, Settings2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types/user';
import { ClassSubjectMappingEditor, ClassSubjectMapping } from '@/components/ClassSubjectMappingEditor';

interface Props {
  teacher: User;
  schoolId: string;
  adminId: string;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const TeacherAssignmentModal: React.FC<Props> = ({ teacher, schoolId, adminId, open, onClose, onSaved }) => {
  const { toast } = useToast();
  const [mode, setMode] = useState<'multi-class' | 'multi-subject' | 'multi-both'>('multi-class');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [classSubjectMapping, setClassSubjectMapping] = useState<ClassSubjectMapping>({});
  const [showDetailedMapping, setShowDetailedMapping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Set limits based on mode
  const getMaxClasses = () => {
    switch (mode) {
      case 'multi-class': return 9;
      case 'multi-subject': return 1;
      case 'multi-both': return 9;
      default: return 9;
    }
  };

  const getMaxSubjects = () => {
    switch (mode) {
      case 'multi-class': return 1;
      case 'multi-subject': return 9;
      case 'multi-both': return 9;
      default: return 1;
    }
  };

  const maxClasses = getMaxClasses();
  const maxSubjects = getMaxSubjects();

  useEffect(() => {
    if (open) loadExisting();
  }, [open, teacher.id]);

  const loadExisting = async () => {
    setLoading(true);
    const existing = await getTeacherAssignment(teacher.id, schoolId);
    if (existing) {
      setMode(existing.assignment_mode);
      setSelectedClasses(existing.assigned_classes);
      setSelectedSubjects(existing.assigned_subjects);
      setClassSubjectMapping(existing.class_subject_mapping || {});
      setShowDetailedMapping(!!existing.class_subject_mapping && Object.keys(existing.class_subject_mapping).length > 0);
    } else {
      setMode('multi-class');
      setSelectedClasses([]);
      setSelectedSubjects([]);
      setClassSubjectMapping({});
      setShowDetailedMapping(false);
    }
    setLoading(false);
  };

  const availableSubjects = React.useMemo(() => {
    if (selectedClasses.length === 0) return DEFAULT_SUBJECTS.map(s => s.name);
    const gradeLevels = selectedClasses.map(c => DEFAULT_CLASSES.find(dc => dc.name === c)?.grade_level).filter(Boolean) as string[];
    const subjectSet = new Set<string>();
    gradeLevels.forEach(gl => getSubjectsForClass(gl).forEach(s => subjectSet.add(s.name)));
    return Array.from(subjectSet);
  }, [selectedClasses]);

  const toggleClass = (c: string) => {
    if (selectedClasses.includes(c)) setSelectedClasses(selectedClasses.filter(x => x !== c));
    else if (selectedClasses.length < maxClasses) setSelectedClasses([...selectedClasses, c]);
  };

  const toggleSubject = (s: string) => {
    if (selectedSubjects.includes(s)) setSelectedSubjects(selectedSubjects.filter(x => x !== s));
    else if (selectedSubjects.length < maxSubjects) setSelectedSubjects([...selectedSubjects, s]);
  };

  useEffect(() => {
    // Adjust selections when mode changes
    if (mode === 'multi-class') {
      if (selectedClasses.length > 9) setSelectedClasses(selectedClasses.slice(0, 9));
      if (selectedSubjects.length > 1) setSelectedSubjects(selectedSubjects.slice(0, 1));
    } else if (mode === 'multi-subject') {
      if (selectedSubjects.length > 9) setSelectedSubjects(selectedSubjects.slice(0, 9));
      if (selectedClasses.length > 1) setSelectedClasses(selectedClasses.slice(0, 1));
    } else if (mode === 'multi-both') {
      if (selectedClasses.length > 9) setSelectedClasses(selectedClasses.slice(0, 9));
      if (selectedSubjects.length > 9) setSelectedSubjects(selectedSubjects.slice(0, 9));
    }
  }, [mode]);

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

  const handleSave = async () => {
    setSaving(true);
    const mappingToSave = mode === 'multi-both' ? classSubjectMapping : undefined;
    const success = await saveTeacherAssignment(
      teacher.id, 
      schoolId, 
      selectedClasses, 
      selectedSubjects, 
      mode, 
      adminId,
      undefined,
      mappingToSave
    );
    setSaving(false);
    if (success) {
      const mappingCount = mappingToSave 
        ? Object.values(mappingToSave).reduce((sum, arr) => sum + arr.length, 0)
        : selectedClasses.length * selectedSubjects.length;
      toast({ 
        title: 'Assignment saved!', 
        description: `${teacher.name} has been assigned ${mappingCount} class-subject combination${mappingCount !== 1 ? 's' : ''}`
      });
      onSaved();
      onClose();
    } else {
      toast({ title: 'Error saving assignment', variant: 'destructive' });
    }
  };

  const categories = [...new Set(DEFAULT_CLASSES.map(c => c.category))];
  const canSave = selectedClasses.length > 0 && selectedSubjects.length > 0;

  const getModeDescription = () => {
    switch (mode) {
      case 'multi-class':
        return 'Teaching one subject across multiple classes (e.g., Math teacher)';
      case 'multi-subject':
        return 'Teaching multiple subjects to one class (e.g., Class teacher)';
      case 'multi-both':
        return 'Teaching multiple subjects across multiple classes with custom mapping';
      default:
        return '';
    }
  };

  const getTotalMappings = () => {
    return Object.values(classSubjectMapping).reduce((total, subjects) => total + subjects.length, 0);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Assign Classes & Subjects to {teacher.name}</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button 
                onClick={() => setMode('multi-class')} 
                className={`p-3 rounded-xl border-2 text-left transition-all ${mode === 'multi-class' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <Users className="w-5 h-5 mb-1 text-blue-600" />
                <div className="font-bold text-gray-900 text-sm">Multiple Classes</div>
                <div className="text-xs text-gray-600">Up to 9 classes, 1 subject</div>
              </button>
              <button 
                onClick={() => setMode('multi-subject')} 
                className={`p-3 rounded-xl border-2 text-left transition-all ${mode === 'multi-subject' ? 'border-purple-500 bg-purple-50 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <BookOpen className="w-5 h-5 mb-1 text-purple-600" />
                <div className="font-bold text-gray-900 text-sm">Multiple Subjects</div>
                <div className="text-xs text-gray-600">Up to 9 subjects, 1 class</div>
              </button>
              <button 
                onClick={() => setMode('multi-both')} 
                className={`p-3 rounded-xl border-2 text-left transition-all ${mode === 'multi-both' ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <Grid3X3 className="w-5 h-5 mb-1 text-emerald-600" />
                <div className="font-bold text-gray-900 text-sm">Multiple Both</div>
                <div className="text-xs text-gray-600">Custom class-subject mapping</div>
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-2 text-xs text-gray-600">
              {getModeDescription()}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900 text-sm">Classes ({selectedClasses.length}/{maxClasses})</h3>
                {selectedClasses.length >= maxClasses && (
                  <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Max reached</span>
                )}
              </div>
              {categories.map(cat => (
                <div key={cat} className="mb-2">
                  <div className="text-xs font-semibold text-gray-500 mb-1">{cat}</div>
                  <div className="flex flex-wrap gap-1">
                    {DEFAULT_CLASSES.filter(c => c.category === cat).map(c => (
                      <button 
                        key={c.name} 
                        onClick={() => toggleClass(c.name)} 
                        disabled={!selectedClasses.includes(c.name) && selectedClasses.length >= maxClasses}
                        className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                          selectedClasses.includes(c.name) 
                            ? 'bg-blue-600 text-white' 
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
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900 text-sm">Subjects ({selectedSubjects.length}/{maxSubjects})</h3>
                {selectedSubjects.length >= maxSubjects && (
                  <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Max reached</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {availableSubjects.map(s => (
                  <button 
                    key={s} 
                    onClick={() => toggleSubject(s)} 
                    disabled={!selectedSubjects.includes(s) && selectedSubjects.length >= maxSubjects}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      selectedSubjects.includes(s) 
                        ? 'bg-purple-600 text-white' 
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
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-gray-900 text-sm">Detailed Class-Subject Mapping</h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDetailedMapping(!showDetailedMapping)}
                    className="text-xs text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                  >
                    {showDetailedMapping ? 'Hide Details' : 'Customize Mapping'}
                  </Button>
                </div>

                {!showDetailedMapping ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <h4 className="font-semibold text-emerald-800 text-sm mb-1">Assignment Summary</h4>
                    <div className="text-xs text-emerald-700">
                      <p>{teacher.name} will teach <span className="font-bold">{selectedSubjects.length} subject{selectedSubjects.length > 1 ? 's' : ''}</span> across <span className="font-bold">{selectedClasses.length} class{selectedClasses.length > 1 ? 'es' : ''}</span>.</p>
                      <p className="mt-1 text-emerald-600">
                        <Settings2 className="w-3 h-3 inline mr-1" />
                        Click "Customize Mapping" to specify exactly which subjects are taught in each class.
                      </p>
                      {getTotalMappings() > 0 && (
                        <p className="mt-1 font-medium">
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
                  />
                )}
              </div>
            )}

            {/* Simple summary for non-multi-both modes */}
            {mode !== 'multi-both' && selectedClasses.length > 0 && selectedSubjects.length > 0 && (
              <div className={`rounded-lg p-3 ${mode === 'multi-class' ? 'bg-blue-50 border border-blue-200' : 'bg-purple-50 border border-purple-200'}`}>
                <h4 className={`font-semibold text-sm mb-1 ${mode === 'multi-class' ? 'text-blue-800' : 'text-purple-800'}`}>Assignment Summary</h4>
                <div className={`text-xs ${mode === 'multi-class' ? 'text-blue-700' : 'text-purple-700'}`}>
                  <p>{teacher.name} will teach <span className="font-bold">{selectedSubjects.join(', ')}</span> to <span className="font-bold">{selectedClasses.join(', ')}</span>.</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button 
                onClick={handleSave} 
                disabled={!canSave || saving} 
                className={`${
                  mode === 'multi-both' 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : mode === 'multi-subject' 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Save Assignment
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
