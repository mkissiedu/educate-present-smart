import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useLessonContext } from '@/contexts/LessonContext';
import { Lesson, Slide, GameData } from '@/types/lesson';
import { Button } from '@/components/ui/button';
import { SlideEditor } from '@/components/SlideEditor';
import { LessonResourceManager } from '@/components/LessonResourceManager';
import { AILessonAssistant } from '@/components/AILessonAssistant';
import { LessonPDFExport } from '@/components/LessonPDFExport';
import { LessonInfoSlideEditor } from '@/components/LessonInfoSlideEditor';
import { GenerateAllPhasesButton } from '@/components/GenerateAllPhasesButton';
import { SaveAsTemplateModal } from '@/components/SaveAsTemplateModal';
import { ContentReviewWorkflow } from '@/components/ContentReviewWorkflow';
import { VersionHistoryPanel } from '@/components/VersionHistoryPanel';
import { useAuth } from '@/contexts/AuthContext';
import { ClassLevel } from '@/types/user';
import { Crown, AlertTriangle, Sparkles, Gamepad2, FolderOpen, FileDown, BookOpen, Package, Key, PlayCircle, Lightbulb, PenTool, CheckCircle, Wrench, Library, GitBranch, ClipboardCheck } from 'lucide-react';
import { ANANSE_IMAGE } from '@/components/AnanseMascot';
import { createLessonTemplateSlides } from '@/lib/lesson-template';

export default function LessonEditor() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getLessonById, saveLesson } = useLessonContext();
  const { canCreate, canEdit } = useAuth();
  
  const createEmptyLesson = (): Lesson => ({
    id: Date.now().toString(), title: 'New Lesson',
    subject: searchParams.get('subject') || 'Language & Literacy',
    class: (searchParams.get('class') || 'KG 1') as ClassLevel,
    week: parseInt(searchParams.get('week') || '1'), lessonNumber: parseInt(searchParams.get('lesson') || '1'),
    duration: '45 min', thumbnailUrl: '', slides: createLessonTemplateSlides(), resources: [], isFavorite: false
  });

  const [lesson, setLesson] = useState<Lesson>(() => id && id !== 'new' ? getLessonById(id) || createEmptyLesson() : createEmptyLesson());
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [showPDFExport, setShowPDFExport] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const { user } = useAuth();
  const isSuperTeacher = user?.role === 'super_teacher' || user?.role === 'platform_admin';

  const isNewLesson = id === 'new';
  const hasPermission = isNewLesson ? canCreate : canEdit;
  const firstSlide = lesson.slides[0];

  useEffect(() => { if (isNewLesson) setLesson(createEmptyLesson()); }, [searchParams]);
  
  const updateSlide = (index: number, slide: Slide) => { const newSlides = [...lesson.slides]; newSlides[index] = slide; setLesson({ ...lesson, slides: newSlides }); };
  const addSlide = (type: Slide['type'] = 'text') => setLesson({ ...lesson, slides: [...lesson.slides, { id: Date.now().toString(), title: `Slide ${lesson.slides.length + 1}`, content: '', type, gameData: type === 'game' ? { gameType: 'sound-match', title: '', difficulty: 'medium' } : undefined }] });
  const deleteSlide = (index: number) => { if (!lesson.slides[index].templateSlideId) setLesson({ ...lesson, slides: lesson.slides.filter((_, i) => i !== index) }); };
  const handleSave = () => { saveLesson(lesson); navigate('/dashboard'); };

  if (!hasPermission) return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-pink-200 to-purple-300 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 shadow-2xl text-center max-w-md">
        <AlertTriangle className="w-14 h-14 text-orange-500 mx-auto mb-4" />
        <h2 className="text-xl font-black text-purple-600 mb-3">Access Restricted</h2>
        <Button onClick={() => navigate('/dashboard')} className="bg-purple-500 hover:bg-purple-600">Back</Button>
      </div>
    </div>
  );

  const slideIcons: Record<string, any> = { 'resources': Package, 'key-words': Key, 'phase-starter': PlayCircle, 'phase-development': Lightbulb, 'phase-skill': Wrench, 'phase-practice': PenTool, 'phase-wrapup': CheckCircle };
  const slideColors: Record<string, string> = { 'resources': 'border-blue-300 bg-blue-50', 'key-words': 'border-purple-300 bg-purple-50', 'phase-starter': 'border-green-300 bg-green-50', 'phase-development': 'border-blue-300 bg-blue-50', 'phase-skill': 'border-teal-300 bg-teal-50', 'phase-practice': 'border-purple-300 bg-purple-50', 'phase-wrapup': 'border-orange-300 bg-orange-50' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-pink-200 to-purple-300 p-2 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl p-3 md:p-5 shadow-xl mb-3">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2"><Crown className="w-5 h-5 text-yellow-500" /><span className="text-purple-600 font-bold text-sm">{isNewLesson ? 'Create' : 'Edit'} Lesson</span></div>
            <div className="flex gap-2 flex-wrap">
              {isSuperTeacher && !isNewLesson && <Button size="sm" onClick={() => setShowReview(!showReview)} variant={showReview ? 'default' : 'outline'} className="border-blue-300 text-blue-600"><ClipboardCheck className="w-4 h-4 mr-1" /> Review</Button>}
              {isSuperTeacher && !isNewLesson && <Button size="sm" onClick={() => setShowVersions(!showVersions)} variant={showVersions ? 'default' : 'outline'} className="border-amber-300 text-amber-600"><GitBranch className="w-4 h-4 mr-1" /> Versions</Button>}
              <Button size="sm" onClick={() => setShowSaveTemplate(true)} variant="outline" className="border-purple-300 text-purple-600"><Library className="w-4 h-4 mr-1" /> Template</Button>
              <Button size="sm" onClick={() => setShowPDFExport(true)} variant="outline" className="border-green-300 text-green-600"><FileDown className="w-4 h-4 mr-1" /> Export</Button>
              <Button size="sm" onClick={() => setShowResources(!showResources)} variant={showResources ? 'default' : 'outline'}><FolderOpen className="w-4 h-4 mr-1" /> Resources</Button>
              <Button size="sm" onClick={() => setAiAssistantOpen(true)} className="bg-gradient-to-r from-purple-600 to-pink-500"><img src={ANANSE_IMAGE} alt="" className="w-4 h-4 mr-1" /><Sparkles className="w-4 h-4" /></Button>
            </div>

          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-3"><BookOpen className="w-5 h-5 text-purple-600" /><span className="font-bold text-purple-700">Slide 1: Lesson Information</span></div>
            <LessonInfoSlideEditor lessonTitle={lesson.title} subject={lesson.subject} classLevel={lesson.class} week={lesson.week || 1} lessonNumber={lesson.lessonNumber || 1} imageUrl={firstSlide?.imageUrl} curriculumValues={firstSlide?.curriculumInfo || {}}
              onTitleChange={(title) => setLesson({ ...lesson, title, slides: lesson.slides.map((s, i) => i === 0 ? { ...s, title } : s) })}
              onSubjectChange={(subject) => setLesson({ ...lesson, subject })} onClassChange={(classLevel) => setLesson({ ...lesson, class: classLevel })}
              onWeekChange={(week) => setLesson({ ...lesson, week })} onLessonNumberChange={(lessonNumber) => setLesson({ ...lesson, lessonNumber })}
              onImageChange={(url) => updateSlide(0, { ...firstSlide, imageUrl: url })}
              onCurriculumChange={(values) => { updateSlide(0, { ...firstSlide, curriculumInfo: values }); setLesson(prev => ({ ...prev, curriculumInfo: values })); }} />
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSave} className="bg-green-500 hover:bg-green-600 flex-1 md:flex-none">Save Lesson</Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="flex-1 md:flex-none">Cancel</Button>
          </div>
        </div>
        {isSuperTeacher && showReview && <div className="bg-white rounded-xl p-3 shadow-xl mb-3"><ContentReviewWorkflow lesson={lesson} /></div>}
        {isSuperTeacher && showVersions && <div className="bg-white rounded-xl p-3 shadow-xl mb-3"><VersionHistoryPanel lesson={lesson} onRestoreVersion={(content) => setLesson(content)} /></div>}
        {showResources && <div className="bg-white rounded-xl p-3 shadow-xl mb-3"><LessonResourceManager resources={lesson.resources || []} onChange={(resources) => setLesson({ ...lesson, resources })} /></div>}
        <div className="bg-white rounded-xl p-3 shadow-xl mb-3">


          <GenerateAllPhasesButton lessonTitle={lesson.title} subject={lesson.subject} classLevel={lesson.class || 'Primary'} curriculumInfo={lesson.curriculumInfo || firstSlide?.curriculumInfo}
            onGeneratePhase={(phaseType, bullets) => { const phaseMap: Record<string, number> = { starter: 3, development: 4, skill: 5, practice: 6, wrapup: 7 }; const idx = phaseMap[phaseType]; if (idx !== undefined) { const slide = lesson.slides[idx]; updateSlide(idx, { ...slide, phaseData: { bullets: [...(slide.phaseData?.bullets || []), ...bullets] } }); } }}
            disabled={!lesson.title || lesson.title === 'New Lesson'} />
        </div>
        <div className="space-y-3">
          {lesson.slides.slice(1, 8).map((slide, index) => { const Icon = slideIcons[slide.templateSlideId || ''] || BookOpen; const colorClass = slideColors[slide.templateSlideId || ''] || '';
            return (<div key={slide.id} className={`bg-white p-3 rounded-xl shadow-lg border-2 ${colorClass}`}><div className="flex items-center gap-2 mb-2"><Icon className="w-5 h-5" /><span className="font-bold text-gray-700 text-sm">Slide {index + 2}: {slide.title}</span></div>
              <SlideEditor slide={slide} onChange={(s) => updateSlide(index + 1, s)} subject={lesson.subject} lessonTitle={lesson.title} classLevel={lesson.class} curriculumInfo={lesson.curriculumInfo || firstSlide?.curriculumInfo} /></div>);
          })}
        </div>
        {lesson.slides.length > 8 && <div className="space-y-3 mt-3"><h3 className="font-bold text-purple-700 text-sm">Additional Slides</h3>
          {lesson.slides.slice(8).map((slide, index) => (<div key={slide.id} className="bg-white p-3 rounded-xl shadow-lg"><div className="flex justify-between mb-2"><span className="font-bold text-purple-600 text-sm">Slide {index + 9}</span><Button size="sm" variant="destructive" onClick={() => deleteSlide(index + 8)}>Del</Button></div><SlideEditor slide={slide} onChange={(s) => updateSlide(index + 8, s)} subject={lesson.subject} /></div>))}
        </div>}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Button onClick={() => addSlide('text')} className="bg-blue-500 hover:bg-blue-600 py-4 text-sm rounded-xl">+ Text</Button>
          <Button onClick={() => addSlide('game')} className="bg-gradient-to-r from-purple-500 to-pink-500 py-4 text-sm rounded-xl"><Gamepad2 className="w-4 h-4 mr-1" /> Game</Button>
          <Button onClick={() => addSlide('quiz')} className="bg-orange-500 hover:bg-orange-600 py-4 text-sm rounded-xl">+ Quiz</Button>
        </div>
      </div>
      {showPDFExport && <LessonPDFExport lesson={lesson} onClose={() => setShowPDFExport(false)} />}
      {aiAssistantOpen && <AILessonAssistant lessonTitle={lesson.title} lessonSubject={lesson.subject} onGenerateGame={(g) => setLesson({ ...lesson, slides: [...lesson.slides, { id: Date.now().toString(), title: g.title || 'AI Game', content: '', type: 'game', gameData: g }] })} onGenerateQuiz={(q) => setLesson({ ...lesson, slides: [...lesson.slides, { id: Date.now().toString(), title: 'AI Quiz', content: '', type: 'quiz', quizData: q }] })} onGenerateContent={(c) => setLesson({ ...lesson, slides: [...lesson.slides, { id: Date.now().toString(), title: 'AI Content', content: c, type: 'text' }] })} onClose={() => setAiAssistantOpen(false)} />}
      {showSaveTemplate && <SaveAsTemplateModal lesson={lesson} isOpen={showSaveTemplate} onClose={() => setShowSaveTemplate(false)} />}
    </div>
  );
}
