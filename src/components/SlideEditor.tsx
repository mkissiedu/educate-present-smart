import React, { useState } from 'react';
import { Slide } from '@/types/lesson';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from './RichTextEditor';
import { QuizBuilder } from './QuizBuilder';
import { MediaLinksEditor } from './MediaLinksEditor';
import { GameSlideEditor } from './GameSlideEditor';
import { KeyWordsSlideEditor } from './KeyWordsSlideEditor';
import { ResourcesSlideEditor } from './ResourcesSlideEditor';
import { PhaseSlideEditor } from './PhaseSlideEditor';
import { DifferentiationSlideEditor } from './DifferentiationSlideEditor';
import { Timer, Gamepad2, ChevronDown, ChevronUp, FileText, Image, Video, HelpCircle, Key, Package, PlayCircle, Lightbulb, PenTool, CheckCircle, Layers } from 'lucide-react';

interface SlideEditorProps {
  slide: Slide;
  onChange: (slide: Slide) => void;
  subject?: string;
  lessonTitle?: string;
  classLevel?: string;
  curriculumInfo?: any;
}

export const SlideEditor: React.FC<SlideEditorProps> = ({ 
  slide, onChange, subject = 'Language & Literacy', lessonTitle, classLevel, curriculumInfo 
}) => {
  const [expandedSection, setExpandedSection] = useState<string>('content');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onChange({ ...slide, imageUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const toggleSection = (section: string) => setExpandedSection(expandedSection === section ? '' : section);
  const typeIcons: Record<string, any> = { text: FileText, image: Image, video: Video, quiz: HelpCircle, timer: Timer, game: Gamepad2, 'key-words': Key, resources: Package, differentiation: Layers, 'phase-starter': PlayCircle, 'phase-development': Lightbulb, 'phase-practice': PenTool, 'phase-wrapup': CheckCircle };
  const TypeIcon = typeIcons[slide.type] || FileText;

  if (slide.templateSlideId === 'key-words') {
    return (
      <div className="space-y-4">
        <Input placeholder="Slide Title" value={slide.title} onChange={(e) => onChange({ ...slide, title: e.target.value })} className="text-base font-bold" />
        <KeyWordsSlideEditor keyWordsData={slide.keyWordsData || { keywords: [] }} onChange={(keyWordsData) => onChange({ ...slide, keyWordsData })} />
      </div>
    );
  }

  if (slide.templateSlideId === 'resources') {
    return (
      <div className="space-y-4">
        <Input placeholder="Slide Title" value={slide.title} onChange={(e) => onChange({ ...slide, title: e.target.value })} className="text-base font-bold" />
        <ResourcesSlideEditor resourcesData={slide.resourcesData || { resources: [] }} onChange={(resourcesData) => onChange({ ...slide, resourcesData })} />
      </div>
    );
  }

  if (slide.templateSlideId === 'differentiation') {
    return (
      <div className="space-y-4">
        <Input placeholder="Slide Title" value={slide.title} onChange={(e) => onChange({ ...slide, title: e.target.value })} className="text-base font-bold" />
        <DifferentiationSlideEditor differentiationData={slide.differentiationData || { extending: [], consolidating: [], beginning: [] }} onChange={(differentiationData) => onChange({ ...slide, differentiationData })} />
      </div>
    );
  }

  if (slide.templateSlideId?.startsWith('phase-')) {
    const phaseType = slide.templateSlideId.replace('phase-', '') as 'starter' | 'development' | 'skill' | 'practice' | 'wrapup';
    return (
      <div className="space-y-4">
        <Input placeholder="Slide Title" value={slide.title} onChange={(e) => onChange({ ...slide, title: e.target.value })} className="text-base font-bold" />
        <PhaseSlideEditor phaseType={phaseType} phaseData={slide.phaseData || { bullets: [] }} onChange={(phaseData) => onChange({ ...slide, phaseData })} lessonTitle={lessonTitle} subject={subject} classLevel={classLevel} curriculumInfo={curriculumInfo} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input placeholder="Slide Title" value={slide.title} onChange={(e) => onChange({ ...slide, title: e.target.value })} className="text-base font-bold flex-1" />
        <Select value={slide.type} onValueChange={(type: any) => onChange({ ...slide, type })}>
          <SelectTrigger className="w-full sm:w-36"><TypeIcon className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="text"><span className="flex items-center gap-2"><FileText className="w-4 h-4" /> Text</span></SelectItem>
            <SelectItem value="image"><span className="flex items-center gap-2"><Image className="w-4 h-4" /> Image</span></SelectItem>
            <SelectItem value="video"><span className="flex items-center gap-2"><Video className="w-4 h-4" /> Video</span></SelectItem>
            <SelectItem value="quiz"><span className="flex items-center gap-2"><HelpCircle className="w-4 h-4" /> Quiz</span></SelectItem>
            <SelectItem value="game"><span className="flex items-center gap-2"><Gamepad2 className="w-4 h-4" /> Game</span></SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="border-2 border-blue-200 rounded-lg overflow-hidden">
        <button onClick={() => toggleSection('content')} className="w-full p-3 bg-blue-50 flex items-center justify-between">
          <span className="font-semibold text-blue-900 flex items-center gap-2"><TypeIcon className="w-4 h-4" /> Slide Content</span>
          {expandedSection === 'content' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {expandedSection === 'content' && (
          <div className="p-3 bg-blue-50/50">
            {slide.type === 'text' && <RichTextEditor value={slide.content} onChange={(content) => onChange({ ...slide, content })} />}
            {slide.type === 'image' && (
              <div className="space-y-2">
                <Input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" />
                {slide.imageUrl && <img src={slide.imageUrl} alt="Preview" className="max-h-32 rounded" />}
              </div>
            )}
            {slide.type === 'video' && <Input placeholder="YouTube/Vimeo URL" value={slide.videoUrl || ''} onChange={(e) => onChange({ ...slide, videoUrl: e.target.value })} />}
            {slide.type === 'quiz' && <QuizBuilder quizData={slide.quizData || { question: '', options: [] }} onChange={(quizData) => onChange({ ...slide, quizData })} />}
            {slide.type === 'game' && <GameSlideEditor gameData={slide.gameData || { gameType: 'sound-match', title: '', difficulty: 'medium' }} onChange={(gameData) => onChange({ ...slide, gameData })} />}
          </div>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 border-2 border-green-200 rounded-lg p-2 bg-green-50">
          <div className="flex items-center gap-2 mb-1"><Timer className="w-4 h-4 text-green-700" /><span className="text-xs font-semibold text-green-800">Timer</span></div>
          <div className="flex gap-1">
            {[60, 120, 300].map(d => (
              <Button key={d} size="sm" variant={slide.timerData?.duration === d ? 'default' : 'outline'} className="flex-1 text-xs py-1"
                onClick={() => onChange({ ...slide, timerData: slide.timerData?.duration === d ? undefined : { duration: d, autoStart: false } })}>
                {d >= 60 ? `${d/60}m` : `${d}s`}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex-1 border-2 border-purple-200 rounded-lg overflow-hidden">
          <button onClick={() => toggleSection('media')} className="w-full p-2 bg-purple-50 flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-800">Audio & Links</span>
            {expandedSection === 'media' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {expandedSection === 'media' && <div className="p-2"><MediaLinksEditor slide={slide} onChange={onChange} /></div>}
        </div>
      </div>
    </div>
  );
};
