import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Plus, Edit, Trash2, BookOpen, Video, FileText, Link as LinkIcon,
  GripVertical, Eye, EyeOff, Users, School, Globe, Loader2, Save,
  ChevronUp, ChevronDown, Clock, HelpCircle, Settings
} from 'lucide-react';
import { PDCourse, PDCourseModule, PD_CATEGORIES } from '@/types/professional-development';
import {
  getCourses, createCourse, updateCourse, deleteCourse,
  getCourseModules, createCourseModule, updateCourseModule, deleteCourseModule,
  getCourseEnrollments
} from '@/lib/supabase-pd';
import { getSchools } from '@/lib/supabase-schools';
import { getQuizQuestions } from '@/lib/supabase-quiz';
import PDQuizBuilder from './PDQuizBuilder';

interface PDCourseManagerProps {
  creatorType: 'super_teacher' | 'admin';
  schoolId?: string;
}

export const PDCourseManager: React.FC<PDCourseManagerProps> = ({ creatorType, schoolId }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<PDCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<PDCourse | null>(null);
  const [editingModule, setEditingModule] = useState<PDCourseModule | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<PDCourse | null>(null);
  const [modules, setModules] = useState<PDCourseModule[]>([]);
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [quizQuestionCounts, setQuizQuestionCounts] = useState<Record<string, number>>({});
  
  // Quiz builder state
  const [showQuizBuilder, setShowQuizBuilder] = useState(false);
  const [quizBuilderModule, setQuizBuilderModule] = useState<PDCourseModule | null>(null);

  // Course form state
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    thumbnail_url: '',
    category: '',
    duration_hours: '',
    target_type: 'all' as 'all' | 'selected_schools' | 'selected_teachers' | 'school_teachers',
    target_school_ids: [] as string[],
    is_mandatory: false,
    due_date: ''
  });

  // Module form state
  const [moduleForm, setModuleForm] = useState({
    title: '',
    content_type: 'video' as 'video' | 'document' | 'quiz' | 'text' | 'link',
    content_url: '',
    content_text: '',
    duration_minutes: '',
    is_required: true
  });

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [coursesData, schoolsData] = await Promise.all([
        getCourses({ creatorId: user.id, creatorType }),
        creatorType === 'super_teacher' ? getSchools() : Promise.resolve([])
      ]);
      setCourses(coursesData);
      setSchools(schoolsData);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadModules = async (courseId: string) => {
    try {
      const modulesData = await getCourseModules(courseId);
      setModules(modulesData);
      
      // Load quiz question counts for quiz modules
      const quizModules = modulesData.filter(m => m.content_type === 'quiz');
      const counts: Record<string, number> = {};
      for (const module of quizModules) {
        const questions = await getQuizQuestions(module.id);
        counts[module.id] = questions.length;
      }
      setQuizQuestionCounts(counts);
    } catch (error) {
      console.error('Error loading modules:', error);
    }
  };

  const handleCreateCourse = () => {
    setEditingCourse(null);
    setCourseForm({
      title: '',
      description: '',
      thumbnail_url: '',
      category: '',
      duration_hours: '',
      target_type: creatorType === 'admin' ? 'school_teachers' : 'all',
      target_school_ids: [],
      is_mandatory: false,
      due_date: ''
    });
    setShowCourseModal(true);
  };

  const handleEditCourse = (course: PDCourse) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description || '',
      thumbnail_url: course.thumbnail_url || '',
      category: course.category || '',
      duration_hours: course.duration_hours?.toString() || '',
      target_type: course.target_type,
      target_school_ids: course.target_school_ids || [],
      is_mandatory: course.is_mandatory,
      due_date: course.due_date?.split('T')[0] || ''
    });
    setShowCourseModal(true);
  };

  const handleSaveCourse = async () => {
    if (!user?.id || !courseForm.title) return;
    setSaving(true);
    try {
      const courseData = {
        title: courseForm.title,
        description: courseForm.description || undefined,
        thumbnail_url: courseForm.thumbnail_url || undefined,
        category: courseForm.category || undefined,
        duration_hours: courseForm.duration_hours ? parseFloat(courseForm.duration_hours) : undefined,
        target_type: courseForm.target_type,
        target_school_ids: courseForm.target_school_ids,
        target_teacher_ids: [],
        is_mandatory: courseForm.is_mandatory,
        due_date: courseForm.due_date ? new Date(courseForm.due_date).toISOString() : undefined,
        created_by: user.id,
        creator_type: creatorType,
        school_id: schoolId,
        is_published: editingCourse?.is_published || false
      };

      if (editingCourse) {
        await updateCourse(editingCourse.id, courseData);
      } else {
        await createCourse(courseData as any);
      }
      await loadData();
      setShowCourseModal(false);
    } catch (error) {
      console.error('Error saving course:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await deleteCourse(courseId);
      await loadData();
      if (selectedCourse?.id === courseId) {
        setSelectedCourse(null);
        setModules([]);
      }
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const handleTogglePublish = async (course: PDCourse) => {
    try {
      await updateCourse(course.id, { is_published: !course.is_published });
      await loadData();
    } catch (error) {
      console.error('Error toggling publish:', error);
    }
  };

  const handleSelectCourse = async (course: PDCourse) => {
    setSelectedCourse(course);
    await loadModules(course.id);
  };

  // Module handlers
  const handleCreateModule = () => {
    setEditingModule(null);
    setModuleForm({
      title: '',
      content_type: 'video',
      content_url: '',
      content_text: '',
      duration_minutes: '',
      is_required: true
    });
    setShowModuleModal(true);
  };

  const handleEditModule = (module: PDCourseModule) => {
    setEditingModule(module);
    setModuleForm({
      title: module.title,
      content_type: module.content_type,
      content_url: module.content_url || '',
      content_text: module.content_text || '',
      duration_minutes: module.duration_minutes?.toString() || '',
      is_required: module.is_required
    });
    setShowModuleModal(true);
  };

  const handleSaveModule = async () => {
    if (!selectedCourse || !moduleForm.title) return;
    setSaving(true);
    try {
      const moduleData = {
        course_id: selectedCourse.id,
        title: moduleForm.title,
        content_type: moduleForm.content_type,
        content_url: moduleForm.content_url || undefined,
        content_text: moduleForm.content_text || undefined,
        duration_minutes: moduleForm.duration_minutes ? parseInt(moduleForm.duration_minutes) : undefined,
        is_required: moduleForm.is_required,
        order_index: editingModule?.order_index ?? modules.length
      };

      if (editingModule) {
        await updateCourseModule(editingModule.id, moduleData);
      } else {
        await createCourseModule(moduleData as any);
      }
      await loadModules(selectedCourse.id);
      setShowModuleModal(false);
    } catch (error) {
      console.error('Error saving module:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module?')) return;
    try {
      await deleteCourseModule(moduleId);
      if (selectedCourse) {
        await loadModules(selectedCourse.id);
      }
    } catch (error) {
      console.error('Error deleting module:', error);
    }
  };

  const handleMoveModule = async (moduleId: string, direction: 'up' | 'down') => {
    const index = modules.findIndex(m => m.id === moduleId);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= modules.length) return;

    try {
      await updateCourseModule(modules[index].id, { order_index: newIndex });
      await updateCourseModule(modules[newIndex].id, { order_index: index });
      if (selectedCourse) {
        await loadModules(selectedCourse.id);
      }
    } catch (error) {
      console.error('Error reordering modules:', error);
    }
  };

  const handleOpenQuizBuilder = (module: PDCourseModule) => {
    setQuizBuilderModule(module);
    setShowQuizBuilder(true);
  };

  const handleCloseQuizBuilder = async () => {
    setShowQuizBuilder(false);
    setQuizBuilderModule(null);
    // Reload modules to update question counts
    if (selectedCourse) {
      await loadModules(selectedCourse.id);
    }
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'document': return FileText;
      case 'link': return LinkIcon;
      case 'quiz': return HelpCircle;
      default: return BookOpen;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Show Quiz Builder
  if (showQuizBuilder && quizBuilderModule) {
    return (
      <PDQuizBuilder
        moduleId={quizBuilderModule.id}
        moduleName={quizBuilderModule.title}
        onClose={handleCloseQuizBuilder}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Course Management</h2>
          <p className="text-sm text-gray-500">Create and manage professional development courses</p>
        </div>
        <Button onClick={handleCreateCourse}>
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="font-medium text-sm text-gray-500 uppercase">Your Courses</h3>
          {courses.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No courses created yet</p>
              </CardContent>
            </Card>
          ) : (
            courses.map(course => (
              <Card
                key={course.id}
                className={`cursor-pointer transition-all ${
                  selectedCourse?.id === course.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                }`}
                onClick={() => handleSelectCourse(course)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {course.is_published ? (
                          <Badge className="bg-green-500 text-xs">Published</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Draft</Badge>
                        )}
                        {course.is_mandatory && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                      </div>
                      <h4 className="font-medium truncate">{course.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {course.target_type === 'all' ? 'All Teachers' : 
                         course.target_type === 'school_teachers' ? 'School Teachers' :
                         `${course.target_school_ids?.length || 0} Schools`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => { e.stopPropagation(); handleTogglePublish(course); }}
                      >
                        {course.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => { e.stopPropagation(); handleEditCourse(course); }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600"
                        onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course.id); }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Module Editor */}
        <div className="lg:col-span-2">
          {selectedCourse ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedCourse.title}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{modules.length} modules</p>
                  </div>
                  <Button onClick={handleCreateModule}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Module
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {modules.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No modules yet. Add your first module to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {modules.map((module, index) => {
                      const Icon = getModuleIcon(module.content_type);
                      const isQuiz = module.content_type === 'quiz';
                      const questionCount = quizQuestionCounts[module.id] || 0;
                      
                      return (
                        <div
                          key={module.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex flex-col gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleMoveModule(module.id, 'up')}
                              disabled={index === 0}
                            >
                              <ChevronUp className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleMoveModule(module.id, 'down')}
                              disabled={index === modules.length - 1}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isQuiz ? 'bg-purple-100' : 'bg-white'
                          }`}>
                            <Icon className={`w-5 h-5 ${isQuiz ? 'text-purple-600' : 'text-gray-600'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{module.title}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="capitalize">{module.content_type}</span>
                              {module.duration_minutes && (
                                <>
                                  <span>•</span>
                                  <span>{module.duration_minutes} min</span>
                                </>
                              )}
                              {!module.is_required && (
                                <>
                                  <span>•</span>
                                  <span>Optional</span>
                                </>
                              )}
                              {isQuiz && (
                                <>
                                  <span>•</span>
                                  <span className={questionCount > 0 ? 'text-green-600' : 'text-orange-500'}>
                                    {questionCount} question{questionCount !== 1 ? 's' : ''}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          {isQuiz && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenQuizBuilder(module)}
                              className="text-purple-600 border-purple-300 hover:bg-purple-50"
                            >
                              <Settings className="w-4 h-4 mr-1" />
                              Build Quiz
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditModule(module)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500"
                            onClick={() => handleDeleteModule(module.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Select a course to manage its modules</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Course Modal */}
      <Dialog open={showCourseModal} onOpenChange={setShowCourseModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCourse ? 'Edit Course' : 'Create Course'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                placeholder="Course title"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                placeholder="Course description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <select
                  value={courseForm.category}
                  onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select category</option>
                  {PD_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Duration (hours)</Label>
                <Input
                  type="number"
                  value={courseForm.duration_hours}
                  onChange={(e) => setCourseForm({ ...courseForm, duration_hours: e.target.value })}
                  placeholder="e.g., 2.5"
                />
              </div>
            </div>
            <div>
              <Label>Thumbnail URL</Label>
              <Input
                value={courseForm.thumbnail_url}
                onChange={(e) => setCourseForm({ ...courseForm, thumbnail_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            {creatorType === 'super_teacher' && (
              <div>
                <Label>Target Audience</Label>
                <select
                  value={courseForm.target_type}
                  onChange={(e) => setCourseForm({ ...courseForm, target_type: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="all">All Teachers</option>
                  <option value="selected_schools">Selected Schools</option>
                </select>
              </div>
            )}
            {courseForm.target_type === 'selected_schools' && schools.length > 0 && (
              <div>
                <Label>Select Schools</Label>
                <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
                  {schools.map(school => (
                    <label key={school.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={courseForm.target_school_ids.includes(school.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCourseForm({ ...courseForm, target_school_ids: [...courseForm.target_school_ids, school.id] });
                          } else {
                            setCourseForm({ ...courseForm, target_school_ids: courseForm.target_school_ids.filter(id => id !== school.id) });
                          }
                        }}
                      />
                      {school.name}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={courseForm.is_mandatory}
                  onCheckedChange={(checked) => setCourseForm({ ...courseForm, is_mandatory: checked })}
                />
                <Label>Mandatory Course</Label>
              </div>
              {courseForm.is_mandatory && (
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={courseForm.due_date}
                    onChange={(e) => setCourseForm({ ...courseForm, due_date: e.target.value })}
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCourseModal(false)}>Cancel</Button>
            <Button onClick={handleSaveCourse} disabled={saving || !courseForm.title}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Module Modal */}
      <Dialog open={showModuleModal} onOpenChange={setShowModuleModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingModule ? 'Edit Module' : 'Add Module'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={moduleForm.title}
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                placeholder="Module title"
              />
            </div>
            <div>
              <Label>Content Type</Label>
              <select
                value={moduleForm.content_type}
                onChange={(e) => setModuleForm({ ...moduleForm, content_type: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="video">Video</option>
                <option value="document">Document</option>
                <option value="link">External Link</option>
                <option value="text">Text Content</option>
                <option value="quiz">Quiz</option>
              </select>
              {moduleForm.content_type === 'quiz' && (
                <p className="text-xs text-purple-600 mt-1">
                  After saving, click "Build Quiz" to add questions and configure settings.
                </p>
              )}
            </div>
            {(moduleForm.content_type === 'video' || moduleForm.content_type === 'document' || moduleForm.content_type === 'link') && (
              <div>
                <Label>Content URL</Label>
                <Input
                  value={moduleForm.content_url}
                  onChange={(e) => setModuleForm({ ...moduleForm, content_url: e.target.value })}
                  placeholder={moduleForm.content_type === 'video' ? 'YouTube, Vimeo, or direct video URL' : 'https://...'}
                />
              </div>
            )}
            {moduleForm.content_type === 'text' && (
              <div>
                <Label>Content</Label>
                <Textarea
                  value={moduleForm.content_text}
                  onChange={(e) => setModuleForm({ ...moduleForm, content_text: e.target.value })}
                  placeholder="Enter text content (HTML supported)"
                  rows={6}
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={moduleForm.duration_minutes}
                  onChange={(e) => setModuleForm({ ...moduleForm, duration_minutes: e.target.value })}
                  placeholder="e.g., 15"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  checked={moduleForm.is_required}
                  onCheckedChange={(checked) => setModuleForm({ ...moduleForm, is_required: checked })}
                />
                <Label>Required</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModuleModal(false)}>Cancel</Button>
            <Button onClick={handleSaveModule} disabled={saving || !moduleForm.title}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PDCourseManager;
