import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { CLASS_LEVELS, ClassLevel } from '@/types/user';
import { SUBJECTS } from '@/types/scores';
import { saveTeacherAssignment } from '@/lib/supabase-teacher-assignments';
import { ClassSubjectMappingEditor, ClassSubjectMapping } from './ClassSubjectMappingEditor';
import { 
  GraduationCap, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  School,
  Sparkles,
  Grid3X3,
  Settings2
} from 'lucide-react';

interface Props {
  teacherId: string;
  schoolId: string;
  teacherName: string;
  onSetupComplete: () => void;
}

type SetupStep = 'welcome' | 'mode' | 'classes' | 'subjects' | 'mapping' | 'confirm';

export function TeacherGradebookSetup({ teacherId, schoolId, teacherName, onSetupComplete }: Props) {
  const [step, setStep] = useState<SetupStep>('welcome');
  const [assignmentMode, setAssignmentMode] = useState<'multi-class' | 'multi-subject' | 'multi-both'>('multi-class');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [classSubjectMapping, setClassSubjectMapping] = useState<ClassSubjectMapping>({});
  const [saving, setSaving] = useState(false);

  // Limits for multi-both mode
  const MAX_CLASSES_MULTI_BOTH = 3;
  const MAX_SUBJECTS_MULTI_BOTH = 3;

  const toggleClass = (classLevel: string) => {
    setSelectedClasses(prev => {
      if (prev.includes(classLevel)) {
        return prev.filter(c => c !== classLevel);
      }
      // Enforce limit for multi-both mode
      if (assignmentMode === 'multi-both' && prev.length >= MAX_CLASSES_MULTI_BOTH) {
        return prev;
      }
      return [...prev, classLevel];
    });
  };

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev => {
      if (prev.includes(subject)) {
        return prev.filter(s => s !== subject);
      }
      // Enforce limit for multi-both mode
      if (assignmentMode === 'multi-both' && prev.length >= MAX_SUBJECTS_MULTI_BOTH) {
        return prev;
      }
      return [...prev, subject];
    });
  };


  const handleSave = async () => {
    setSaving(true);
    const mappingToSave = assignmentMode === 'multi-both' ? classSubjectMapping : undefined;
    const success = await saveTeacherAssignment(
      teacherId,
      schoolId,
      selectedClasses,
      selectedSubjects,
      assignmentMode,
      teacherId,
      undefined,
      mappingToSave
    );
    setSaving(false);
    if (success) {
      onSetupComplete();
    }
  };

  const canProceed = () => {
    if (step === 'classes') return selectedClasses.length > 0;
    if (step === 'subjects') return selectedSubjects.length > 0;
    if (step === 'mapping') {
      // Check that at least one class has at least one subject
      return Object.values(classSubjectMapping).some(subjects => subjects.length > 0);
    }
    return true;
  };

  const getSteps = (): SetupStep[] => {
    if (assignmentMode === 'multi-both') {
      return ['welcome', 'mode', 'classes', 'subjects', 'mapping', 'confirm'];
    }
    return ['welcome', 'mode', 'classes', 'subjects', 'confirm'];
  };

  const nextStep = () => {
    const steps = getSteps();
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps = getSteps();
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const classGroups = [
    { label: 'Pre-School', classes: ['PreK 1/Nursery 1', 'PreK 2/Nursery 2'] },
    { label: 'Kindergarten', classes: ['KG 1', 'KG 2'] },
    { label: 'Lower Primary', classes: ['Class 1', 'Class 2', 'Class 3'] },
    { label: 'Upper Primary', classes: ['Class 4', 'Class 5', 'Class 6'] },
    { label: 'Junior High School', classes: ['JHS 1', 'JHS 2', 'JHS 3'] },
  ];

  const subjectGroups = [
    { label: 'Core Subjects', subjects: ['English Language', 'Mathematics', 'Science', 'Social Studies'] },
    { label: 'Languages', subjects: ['French', 'Ghanaian Language', 'Language & Literacy'] },
    { label: 'Foundation', subjects: ['Numeracy', 'Our World Our People', "Ananse's Phonics"] },
    { label: 'Other Subjects', subjects: ['Religious & Moral Education', 'Creative Arts', 'Computing', 'Physical Education'] },
  ];

  const getModeLabel = () => {
    switch (assignmentMode) {
      case 'multi-class':
        return 'Class Teacher (Multiple Subjects)';
      case 'multi-subject':
        return 'Subject Teacher (Multiple Classes)';
      case 'multi-both':
        return 'Flexible Teaching (Custom Class-Subject Mapping)';
      default:
        return '';
    }
  };

  const getTotalMappings = () => {
    return Object.values(classSubjectMapping).reduce((total, subjects) => total + subjects.length, 0);
  };

  const steps = getSteps();
  const currentStepIndex = steps.indexOf(step);

  return (
    <div className="min-h-[500px] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white shadow-xl overflow-hidden">
        {/* Progress indicator */}
        <div className={`p-4 ${assignmentMode === 'multi-both' ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : 'bg-gradient-to-r from-purple-600 to-indigo-600'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-white">
              <School className="w-5 h-5" />
              <span className="font-medium">Gradebook Setup</span>
            </div>
            <span className="text-white/80 text-sm">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
          </div>
          <div className="flex gap-1">
            {steps.map((s, i) => (
              <div 
                key={s} 
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  currentStepIndex >= i 
                    ? 'bg-white' 
                    : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Welcome Step */}
          {step === 'welcome' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome, {teacherName.split(' ')[0]}!
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Let's set up your gradebook by selecting the classes and subjects you teach. 
                This only takes a minute and you can change it anytime.
              </p>
              <Button 
                onClick={nextStep}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Assignment Mode Step */}
          {step === 'mode' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">How do you teach?</h2>
              <p className="text-gray-600 mb-6">
                Select the option that best describes your teaching arrangement.
              </p>
              
              <RadioGroup 
                value={assignmentMode} 
                onValueChange={(v) => setAssignmentMode(v as 'multi-class' | 'multi-subject' | 'multi-both')}
                className="space-y-4"
              >
                <div 
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    assignmentMode === 'multi-class' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setAssignmentMode('multi-class')}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="multi-class" id="multi-class" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="multi-class" className="text-base font-semibold cursor-pointer">
                        Class Teacher (Multiple Subjects)
                      </Label>
                      <p className="text-sm text-gray-500 mt-1">
                        I teach all or most subjects to one or more classes (e.g., KG 1 class teacher)
                      </p>
                    </div>
                    <GraduationCap className={`w-8 h-8 ${assignmentMode === 'multi-class' ? 'text-purple-600' : 'text-gray-400'}`} />
                  </div>
                </div>

                <div 
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    assignmentMode === 'multi-subject' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setAssignmentMode('multi-subject')}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="multi-subject" id="multi-subject" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="multi-subject" className="text-base font-semibold cursor-pointer">
                        Subject Teacher (Multiple Classes)
                      </Label>
                      <p className="text-sm text-gray-500 mt-1">
                        I teach specific subjects across multiple classes (e.g., French teacher for all classes)
                      </p>
                    </div>
                    <BookOpen className={`w-8 h-8 ${assignmentMode === 'multi-subject' ? 'text-purple-600' : 'text-gray-400'}`} />
                  </div>
                </div>

                <div 
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    assignmentMode === 'multi-both' 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setAssignmentMode('multi-both')}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="multi-both" id="multi-both" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="multi-both" className="text-base font-semibold cursor-pointer">
                        Flexible Teaching (Custom Mapping)
                      </Label>
                      <p className="text-sm text-gray-500 mt-1">
                        I teach different subjects in different classes (e.g., Math in Class 3, English in Class 4)
                      </p>
                    </div>
                    <Grid3X3 className={`w-8 h-8 ${assignmentMode === 'multi-both' ? 'text-emerald-600' : 'text-gray-400'}`} />
                  </div>
                </div>
              </RadioGroup>

              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button 
                  onClick={nextStep}
                  className={`${
                    assignmentMode === 'multi-both'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600'
                  }`}
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Classes Selection Step */}
          {step === 'classes' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                <GraduationCap className={`w-6 h-6 inline mr-2 ${assignmentMode === 'multi-both' ? 'text-emerald-600' : 'text-purple-600'}`} />
                Select Your Classes
              </h2>
              <p className="text-gray-600 mb-2">
                Choose all the classes you teach.
                {assignmentMode === 'multi-both' && (
                  <span className="text-amber-600 font-medium"> (Maximum {MAX_CLASSES_MULTI_BOTH} classes for Flexible Teaching mode)</span>
                )}
              </p>
              {assignmentMode === 'multi-both' && (
                <div className="mb-4 p-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                  Selected: {selectedClasses.length}/{MAX_CLASSES_MULTI_BOTH} classes
                </div>
              )}

              
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                {classGroups.map(group => (
                  <div key={group.label}>
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">{group.label}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {group.classes.map(classLevel => (
                        <div
                          key={classLevel}
                          className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedClasses.includes(classLevel)
                              ? assignmentMode === 'multi-both' 
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => toggleClass(classLevel)}
                        >
                          <Checkbox 
                            checked={selectedClasses.includes(classLevel)}
                            onCheckedChange={() => toggleClass(classLevel)}
                          />
                          <span className="text-sm font-medium">{classLevel}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {selectedClasses.length > 0 && (
                <div className={`mt-4 p-3 rounded-lg ${assignmentMode === 'multi-both' ? 'bg-emerald-50' : 'bg-purple-50'}`}>
                  <p className={`text-sm ${assignmentMode === 'multi-both' ? 'text-emerald-700' : 'text-purple-700'}`}>
                    <CheckCircle2 className="w-4 h-4 inline mr-1" />
                    Selected: {selectedClasses.join(', ')}
                  </p>
                </div>
              )}

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button 
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className={`${
                    assignmentMode === 'multi-both'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600'
                  }`}
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Subjects Selection Step */}
          {step === 'subjects' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                <BookOpen className={`w-6 h-6 inline mr-2 ${assignmentMode === 'multi-both' ? 'text-emerald-600' : 'text-purple-600'}`} />
                Select Your Subjects
              </h2>
              <p className="text-gray-600 mb-2">
                Choose all the subjects you teach.
                {assignmentMode === 'multi-both' && (
                  <span className="text-amber-600 font-medium"> (Maximum {MAX_SUBJECTS_MULTI_BOTH} subjects for Flexible Teaching mode)</span>
                )}
              </p>
              {assignmentMode === 'multi-both' && (
                <div className="mb-4 p-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                  Selected: {selectedSubjects.length}/{MAX_SUBJECTS_MULTI_BOTH} subjects
                </div>
              )}

              
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                {subjectGroups.map(group => (
                  <div key={group.label}>
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">{group.label}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {group.subjects.map(subject => (
                        <div
                          key={subject}
                          className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedSubjects.includes(subject)
                              ? assignmentMode === 'multi-both'
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => toggleSubject(subject)}
                        >
                          <Checkbox 
                            checked={selectedSubjects.includes(subject)}
                            onCheckedChange={() => toggleSubject(subject)}
                          />
                          <span className="text-sm font-medium">{subject}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {selectedSubjects.length > 0 && (
                <div className={`mt-4 p-3 rounded-lg ${assignmentMode === 'multi-both' ? 'bg-emerald-50' : 'bg-purple-50'}`}>
                  <p className={`text-sm ${assignmentMode === 'multi-both' ? 'text-emerald-700' : 'text-purple-700'}`}>
                    <CheckCircle2 className="w-4 h-4 inline mr-1" />
                    Selected: {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button 
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className={`${
                    assignmentMode === 'multi-both'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600'
                  }`}
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Class-Subject Mapping Step (only for multi-both mode) */}
          {step === 'mapping' && assignmentMode === 'multi-both' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                <Settings2 className="w-6 h-6 inline mr-2 text-emerald-600" />
                Customize Your Mapping
              </h2>
              <p className="text-gray-600 mb-6">
                Specify exactly which subjects you teach in each class. This gives you precise control over your lesson planning and gradebook.
              </p>
              
              <div className="max-h-[400px] overflow-y-auto pr-2">
                <ClassSubjectMappingEditor
                  selectedClasses={selectedClasses}
                  selectedSubjects={selectedSubjects}
                  mapping={classSubjectMapping}
                  onMappingChange={setClassSubjectMapping}
                />
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button 
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Confirmation Step */}
          {step === 'confirm' && (
            <div>
              <div className="text-center mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  assignmentMode === 'multi-both' ? 'bg-emerald-100' : 'bg-green-100'
                }`}>
                  <CheckCircle2 className={`w-8 h-8 ${assignmentMode === 'multi-both' ? 'text-emerald-600' : 'text-green-600'}`} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Review Your Setup</h2>
                <p className="text-gray-600">
                  Please confirm your teaching assignments below.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    {assignmentMode === 'multi-both' ? (
                      <Grid3X3 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <GraduationCap className="w-5 h-5 text-purple-600" />
                    )}
                    <h3 className="font-semibold text-gray-900">Teaching Mode</h3>
                  </div>
                  <p className="text-gray-700">{getModeLabel()}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className={`w-5 h-5 ${assignmentMode === 'multi-both' ? 'text-emerald-600' : 'text-purple-600'}`} />
                    <h3 className="font-semibold text-gray-900">Classes ({selectedClasses.length})</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedClasses.map(c => (
                      <span key={c} className={`px-3 py-1 rounded-full text-sm ${
                        assignmentMode === 'multi-both' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className={`w-5 h-5 ${assignmentMode === 'multi-both' ? 'text-emerald-600' : 'text-purple-600'}`} />
                    <h3 className="font-semibold text-gray-900">Subjects ({selectedSubjects.length})</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedSubjects.map(s => (
                      <span key={s} className={`px-3 py-1 rounded-full text-sm ${
                        assignmentMode === 'multi-both'
                          ? 'bg-teal-100 text-teal-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Detailed mapping summary for multi-both mode */}
                {assignmentMode === 'multi-both' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Settings2 className="w-5 h-5 text-emerald-600" />
                      <h3 className="font-semibold text-emerald-800">Class-Subject Mapping</h3>
                      <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full ml-auto">
                        {getTotalMappings()} combinations
                      </span>
                    </div>
                    <div className="space-y-2">
                      {selectedClasses.map(className => {
                        const subjects = classSubjectMapping[className] || [];
                        if (subjects.length === 0) return null;
                        return (
                          <div key={className} className="flex items-start gap-2 text-sm">
                            <span className="font-medium text-emerald-800 min-w-[100px]">{className}:</span>
                            <div className="flex flex-wrap gap-1">
                              {subjects.map(s => (
                                <span key={s} className="bg-white text-emerald-700 px-2 py-0.5 rounded text-xs border border-emerald-200">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-500 text-center mt-4">
                You can change these settings anytime from the gradebook menu.
              </p>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Complete Setup
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
