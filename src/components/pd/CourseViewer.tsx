import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowLeft, Play, CheckCircle, Circle, FileText, Video, Link as LinkIcon,
  BookOpen, Clock, ChevronRight, Award, Loader2, ExternalLink, AlertCircle,
  HelpCircle, Lock
} from 'lucide-react';
import { PDCourse, PDCourseModule } from '@/types/professional-development';
import { getCourseModules, getEnrollment, updateEnrollment } from '@/lib/supabase-pd';
import { getQuizSettings, getPassedAttempt, getQuizAttempts } from '@/lib/supabase-quiz';
import { QuizSettings, QuizAttempt } from '@/types/pd-quiz';
import PDQuizTaker from './PDQuizTaker';

interface CourseViewerProps {
  course: PDCourse;
  onClose: () => void;
}

interface ModuleQuizStatus {
  settings: QuizSettings | null;
  passedAttempt: QuizAttempt | null;
  attempts: QuizAttempt[];
}

export const CourseViewer: React.FC<CourseViewerProps> = ({ course, onClose }) => {
  const { user } = useAuth();
  const [modules, setModules] = useState<PDCourseModule[]>([]);
  const [activeModule, setActiveModule] = useState<PDCourseModule | null>(null);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStatuses, setQuizStatuses] = useState<Record<string, ModuleQuizStatus>>({});

  useEffect(() => {
    loadCourseData();
  }, [course.id]);

  const loadCourseData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [modulesData, enrollment] = await Promise.all([
        getCourseModules(course.id),
        getEnrollment(course.id, user.id)
      ]);
      setModules(modulesData);
      
      if (enrollment) {
        setCompletedModules(enrollment.completed_modules || []);
        setEnrollmentId(enrollment.id);
        // Update status to in_progress if just enrolled
        if (enrollment.status === 'enrolled') {
          await updateEnrollment(enrollment.id, {
            status: 'in_progress',
            started_at: new Date().toISOString()
          });
        }
      }
      
      // Load quiz statuses for quiz modules
      const quizModules = modulesData.filter(m => m.content_type === 'quiz');
      const statuses: Record<string, ModuleQuizStatus> = {};
      
      for (const module of quizModules) {
        const [settings, passedAttempt, attempts] = await Promise.all([
          getQuizSettings(module.id),
          getPassedAttempt(module.id, user.id),
          getQuizAttempts(module.id, user.id)
        ]);
        statuses[module.id] = { settings, passedAttempt, attempts };
      }
      setQuizStatuses(statuses);
      
      // Set first incomplete module as active
      const firstIncomplete = modulesData.find(m => !enrollment?.completed_modules?.includes(m.id));
      setActiveModule(firstIncomplete || modulesData[0] || null);
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteModule = async (moduleId: string) => {
    if (!enrollmentId || completedModules.includes(moduleId)) return;
    
    // For quiz modules, check if passed
    const module = modules.find(m => m.id === moduleId);
    if (module?.content_type === 'quiz') {
      const status = quizStatuses[moduleId];
      if (!status?.passedAttempt) {
        // Cannot complete quiz module without passing
        return;
      }
    }
    
    const newCompleted = [...completedModules, moduleId];
    setCompletedModules(newCompleted);
    
    const progressPercent = Math.round((newCompleted.length / modules.length) * 100);
    const isComplete = newCompleted.length === modules.length;
    
    try {
      await updateEnrollment(enrollmentId, {
        completed_modules: newCompleted,
        progress_percent: progressPercent,
        status: isComplete ? 'completed' : 'in_progress',
        completed_at: isComplete ? new Date().toISOString() : undefined
      });
      
      // Move to next module
      const currentIndex = modules.findIndex(m => m.id === moduleId);
      if (currentIndex < modules.length - 1) {
        setActiveModule(modules[currentIndex + 1]);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleQuizComplete = async (passed: boolean) => {
    if (!activeModule || !user?.id) return;
    
    // Reload quiz status
    const [settings, passedAttempt, attempts] = await Promise.all([
      getQuizSettings(activeModule.id),
      getPassedAttempt(activeModule.id, user.id),
      getQuizAttempts(activeModule.id, user.id)
    ]);
    
    setQuizStatuses(prev => ({
      ...prev,
      [activeModule.id]: { settings, passedAttempt, attempts }
    }));
    
    // If passed, mark module as complete
    if (passed && !completedModules.includes(activeModule.id)) {
      await handleCompleteModule(activeModule.id);
    }
    
    setShowQuiz(false);
  };

  const progressPercent = modules.length > 0 
    ? Math.round((completedModules.length / modules.length) * 100) 
    : 0;

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'document': return FileText;
      case 'link': return LinkIcon;
      case 'quiz': return HelpCircle;
      default: return FileText;
    }
  };

  const getQuizStatusBadge = (moduleId: string) => {
    const status = quizStatuses[moduleId];
    if (!status) return null;
    
    if (status.passedAttempt) {
      return (
        <Badge className="bg-green-500 text-xs">
          Passed ({status.passedAttempt.score_percent}%)
        </Badge>
      );
    }
    
    if (status.attempts.length > 0) {
      const lastAttempt = status.attempts[0];
      return (
        <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
          Last: {lastAttempt.score_percent}%
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="text-xs">
        Not attempted
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Show quiz taker
  if (showQuiz && activeModule) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <PDQuizTaker
            moduleId={activeModule.id}
            moduleName={activeModule.title}
            enrollmentId={enrollmentId || undefined}
            onComplete={handleQuizComplete}
            onClose={() => setShowQuiz(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="font-semibold">{course.title}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{completedModules.length} of {modules.length} modules completed</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32">
                <Progress value={progressPercent} className="h-2" />
              </div>
              <span className="text-sm font-medium">{progressPercent}%</span>
              {progressPercent === 100 && (
                <Badge className="bg-green-500">
                  <Award className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Module List Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Course Content</h3>
                <div className="space-y-2">
                  {modules.map((module, index) => {
                    const Icon = getModuleIcon(module.content_type);
                    const isCompleted = completedModules.includes(module.id);
                    const isActive = activeModule?.id === module.id;
                    const isQuiz = module.content_type === 'quiz';
                    
                    return (
                      <button
                        key={module.id}
                        onClick={() => setActiveModule(module)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                          isActive 
                            ? 'bg-blue-50 border border-blue-200' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted 
                            ? 'bg-green-100 text-green-600' 
                            : isActive 
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-400'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <span className="text-sm font-medium">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            isActive ? 'text-blue-700' : ''
                          }`}>
                            {module.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Icon className="w-3 h-3" />
                            <span className="capitalize">{module.content_type}</span>
                            {module.duration_minutes && (
                              <>
                                <span>•</span>
                                <span>{module.duration_minutes} min</span>
                              </>
                            )}
                          </div>
                          {isQuiz && getQuizStatusBadge(module.id)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {activeModule ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <Badge variant="outline" className="mb-2 capitalize">
                        {activeModule.content_type}
                      </Badge>
                      <h2 className="text-xl font-semibold">{activeModule.title}</h2>
                      {activeModule.duration_minutes && (
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <Clock className="w-4 h-4" />
                          {activeModule.duration_minutes} minutes
                        </p>
                      )}
                    </div>
                    {completedModules.includes(activeModule.id) && (
                      <Badge className="bg-green-500">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>

                  {/* Content Display */}
                  <div className="mb-6">
                    {activeModule.content_type === 'video' && activeModule.content_url && (
                      <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        {activeModule.content_url.includes('youtube') || activeModule.content_url.includes('youtu.be') ? (
                          <iframe
                            src={activeModule.content_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : activeModule.content_url.includes('vimeo') ? (
                          <iframe
                            src={activeModule.content_url.replace('vimeo.com/', 'player.vimeo.com/video/')}
                            className="w-full h-full"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <video
                            src={activeModule.content_url}
                            controls
                            className="w-full h-full"
                          />
                        )}
                      </div>
                    )}

                    {activeModule.content_type === 'document' && activeModule.content_url && (
                      <div className="border rounded-lg p-8 text-center bg-gray-50">
                        <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 mb-4">Document Resource</p>
                        <Button asChild>
                          <a href={activeModule.content_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open Document
                          </a>
                        </Button>
                      </div>
                    )}

                    {activeModule.content_type === 'link' && activeModule.content_url && (
                      <div className="border rounded-lg p-8 text-center bg-gray-50">
                        <LinkIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 mb-4">External Resource</p>
                        <Button asChild>
                          <a href={activeModule.content_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open Link
                          </a>
                        </Button>
                      </div>
                    )}

                    {activeModule.content_type === 'text' && activeModule.content_text && (
                      <div className="prose max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: activeModule.content_text }} />
                      </div>
                    )}

                    {activeModule.content_type === 'quiz' && (
                      <div className="border rounded-lg p-8 bg-gray-50">
                        <div className="text-center">
                          <HelpCircle className="w-16 h-16 mx-auto text-blue-500 mb-4" />
                          <h3 className="text-lg font-semibold mb-2">Quiz Module</h3>
                          
                          {/* Quiz Status */}
                          {quizStatuses[activeModule.id] && (
                            <div className="mb-6">
                              {quizStatuses[activeModule.id].passedAttempt ? (
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full">
                                  <CheckCircle className="w-5 h-5" />
                                  <span>Passed with {quizStatuses[activeModule.id].passedAttempt?.score_percent}%</span>
                                </div>
                              ) : quizStatuses[activeModule.id].attempts.length > 0 ? (
                                <div className="space-y-2">
                                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full">
                                    <AlertCircle className="w-5 h-5" />
                                    <span>
                                      Last attempt: {quizStatuses[activeModule.id].attempts[0].score_percent}% 
                                      (Need {quizStatuses[activeModule.id].settings?.passing_score || 70}% to pass)
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500">
                                    {quizStatuses[activeModule.id].settings?.max_attempts === 0 
                                      ? 'Unlimited attempts'
                                      : `${quizStatuses[activeModule.id].settings?.max_attempts! - quizStatuses[activeModule.id].attempts.filter(a => a.status === 'completed').length} attempts remaining`
                                    }
                                  </p>
                                </div>
                              ) : (
                                <p className="text-gray-500 mb-2">
                                  Complete this quiz to mark the module as done.
                                  <br />
                                  <span className="text-sm">
                                    Passing score: {quizStatuses[activeModule.id].settings?.passing_score || 70}%
                                  </span>
                                </p>
                              )}
                            </div>
                          )}
                          
                          <Button onClick={() => setShowQuiz(true)} size="lg">
                            <Play className="w-4 h-4 mr-2" />
                            {quizStatuses[activeModule.id]?.attempts.length > 0 ? 'Retake Quiz' : 'Start Quiz'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const currentIndex = modules.findIndex(m => m.id === activeModule.id);
                        if (currentIndex > 0) {
                          setActiveModule(modules[currentIndex - 1]);
                        }
                      }}
                      disabled={modules.findIndex(m => m.id === activeModule.id) === 0}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>

                    {activeModule.content_type === 'quiz' ? (
                      // For quiz modules, show different button based on status
                      quizStatuses[activeModule.id]?.passedAttempt ? (
                        <Button
                          onClick={() => {
                            const currentIndex = modules.findIndex(m => m.id === activeModule.id);
                            if (currentIndex < modules.length - 1) {
                              setActiveModule(modules[currentIndex + 1]);
                            }
                          }}
                          disabled={modules.findIndex(m => m.id === activeModule.id) === modules.length - 1}
                        >
                          Next Module
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      ) : (
                        <Button variant="secondary" disabled>
                          <Lock className="w-4 h-4 mr-2" />
                          Pass Quiz to Continue
                        </Button>
                      )
                    ) : !completedModules.includes(activeModule.id) ? (
                      <Button onClick={() => handleCompleteModule(activeModule.id)}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark as Complete
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          const currentIndex = modules.findIndex(m => m.id === activeModule.id);
                          if (currentIndex < modules.length - 1) {
                            setActiveModule(modules[currentIndex + 1]);
                          }
                        }}
                        disabled={modules.findIndex(m => m.id === activeModule.id) === modules.length - 1}
                      >
                        Next Module
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No modules in this course yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseViewer;
