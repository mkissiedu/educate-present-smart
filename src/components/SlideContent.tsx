import React, { useState } from 'react';
import { Slide, Lesson } from '../types/lesson';
import { QuizSlide } from './QuizSlide';
import { TimerWidget } from './TimerWidget';
import { LessonInfoSlide } from './LessonInfoSlide';
import { Music, ExternalLink, Gamepad2, Play, Volume2, Package, PlayCircle, Lightbulb, PenTool, CheckCircle, Wrench } from 'lucide-react';
import { Button } from './ui/button';
import { ANANSE_IMAGE } from './AnanseMascot';

interface SlideContentProps {
  slide: Slide;
  lesson?: Lesson;
  onGameComplete?: (score: number) => void;
}

const InlineGame: React.FC<{ gameData: any; onComplete?: (score: number) => void }> = ({ gameData, onComplete }) => {
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const items = gameData.customItems || [];
  const handleAnswer = (answer: string, correct: string) => {
    if (answer === correct) { setScore(s => s + 1); setFeedback('Correct!'); }
    else { setFeedback(`Answer: ${correct}`); }
    setTimeout(() => { setFeedback(null); if (currentIndex < items.length - 1) setCurrentIndex(i => i + 1); else onComplete?.(score + (answer === correct ? 1 : 0)); }, 1500);
  };
  if (!started) return (<div className="text-center p-8"><img src={ANANSE_IMAGE} alt="Ananse" className="w-32 h-32 mx-auto mb-4 animate-bounce" /><h3 className="text-3xl font-black text-purple-700 mb-2">{gameData.title || 'Phonics Game'}</h3><Button onClick={() => setStarted(true)} className="bg-gradient-to-r from-purple-500 to-pink-500 text-xl px-8 py-4"><Play className="w-6 h-6 mr-2" /> Start</Button></div>);
  if (items.length === 0) return <div className="text-center p-8 text-gray-500">No game items</div>;
  const current = items[currentIndex];
  if (currentIndex >= items.length) return (<div className="text-center p-8"><h3 className="text-3xl font-black text-green-600 mb-2">Complete!</h3><p className="text-2xl text-purple-700">Score: {score}/{items.length}</p></div>);
  return (<div className="p-6 text-center"><div className="flex justify-between mb-6"><span className="text-lg font-bold text-purple-600">Q{currentIndex + 1}/{items.length}</span><span className="text-lg font-bold text-green-600">Score: {score}</span></div><h3 className="text-4xl font-black text-purple-700 mb-8">{current.prompt}</h3>{feedback && <div className={`text-2xl font-bold mb-4 ${feedback.includes('Correct') ? 'text-green-600' : 'text-orange-500'}`}>{feedback}</div>}<div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">{(current.options || [current.answer]).map((opt: string, i: number) => (<Button key={i} onClick={() => handleAnswer(opt, current.answer)} disabled={!!feedback} className="text-xl py-6 bg-gradient-to-r from-blue-400 to-purple-400">{opt}</Button>))}</div></div>);
};

const KeyWordsDisplay: React.FC<{ keyWordsData: any }> = ({ keyWordsData }) => {
  const playAudio = (url: string) => new Audio(url).play().catch(console.error);
  if (!keyWordsData?.keywords?.length) return <p className="text-gray-500 text-center py-8">No key words added.</p>;
  return (<div className="space-y-4">{keyWordsData.keywords.map((kw: any, i: number) => (<div key={kw.id} className="p-5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-200"><div className="flex items-center gap-4 mb-2"><span className="w-10 h-10 flex items-center justify-center bg-purple-600 text-white rounded-full text-lg font-black">{i + 1}</span><div className="flex-1"><span className="text-2xl font-bold text-purple-900">{kw.word}</span>{kw.pronunciation && <span className="ml-3 text-lg text-purple-600 italic">/{kw.pronunciation}/</span>}</div>{kw.audioUrl && <Button onClick={() => playAudio(kw.audioUrl)} size="sm" className="bg-purple-600"><Volume2 className="w-5 h-5 mr-1" /> Play</Button>}</div>{kw.meaning && <div className="ml-14 mt-2 p-3 bg-white rounded-xl border border-purple-100"><p className="text-lg text-gray-700">{kw.meaning}</p></div>}</div>))}</div>);
};

const ResourcesDisplay: React.FC<{ resourcesData: any }> = ({ resourcesData }) => {
  if (!resourcesData?.resources?.length) return <p className="text-gray-500 text-center py-8">No resources listed.</p>;
  return (<div className="space-y-3">{resourcesData.resources.map((r: any, i: number) => (<div key={r.id} className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200"><span className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full text-lg font-bold">{i + 1}</span><span className="text-xl font-semibold text-blue-900 flex-1">{r.name}</span>{r.quantity && <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full font-medium">{r.quantity}</span>}</div>))}</div>);
};

const PhaseDisplay: React.FC<{ phaseData: any; phaseType: string }> = ({ phaseData, phaseType }) => {
  const config: Record<string, any> = { starter: { icon: PlayCircle, color: 'green' }, development: { icon: Lightbulb, color: 'blue' }, skill: { icon: Wrench, color: 'teal' }, practice: { icon: PenTool, color: 'purple' }, wrapup: { icon: CheckCircle, color: 'orange' } };
  const c = config[phaseType] || config.starter;
  const colors: Record<string, string> = { green: 'bg-green-50 border-green-200 text-green-600', blue: 'bg-blue-50 border-blue-200 text-blue-600', teal: 'bg-teal-50 border-teal-200 text-teal-600', purple: 'bg-purple-50 border-purple-200 text-purple-600', orange: 'bg-orange-50 border-orange-200 text-orange-600' };
  const badgeColors: Record<string, string> = { green: 'bg-green-600', blue: 'bg-blue-600', teal: 'bg-teal-600', purple: 'bg-purple-600', orange: 'bg-orange-600' };
  if (!phaseData?.bullets?.length) return <p className="text-gray-500 text-center py-8">No content added.</p>;
  return (<div className="space-y-3">{phaseData.bullets.map((b: string, i: number) => (<div key={i} className={`flex items-start gap-4 p-4 rounded-xl border-2 ${colors[c.color]}`}><span className={`w-10 h-10 flex items-center justify-center ${badgeColors[c.color]} text-white rounded-full text-lg font-bold flex-shrink-0`}>{i + 1}</span><p className="text-lg text-gray-800 leading-relaxed flex-1">{b}</p></div>))}</div>);
};

export const SlideContent: React.FC<SlideContentProps> = ({ slide, lesson, onGameComplete }) => {
  if (slide.type === 'lesson-info') return <LessonInfoSlide slide={slide} lesson={lesson} />;
  if (slide.type === 'quiz' && slide.quizData) return <QuizSlide questions={[{ question: slide.quizData.question, options: slide.quizData.options.map(o => o.text), correctAnswer: slide.quizData.options.findIndex(o => o.isCorrect) }]} />;
  if (slide.type === 'game' && slide.gameData) return (<div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-6 border-4 border-purple-300"><div className="flex items-center gap-3 mb-4"><Gamepad2 className="w-8 h-8 text-purple-600" /><span className="text-2xl font-black text-purple-700">Interactive Game</span></div><InlineGame gameData={slide.gameData} onComplete={onGameComplete} /></div>);
  if (slide.type === 'key-words' && slide.keyWordsData) return <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-6"><KeyWordsDisplay keyWordsData={slide.keyWordsData} /></div>;
  if (slide.type === 'resources' && slide.resourcesData) return <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-6"><div className="flex items-center gap-3 mb-6"><Package className="w-8 h-8 text-blue-600" /><span className="text-2xl font-bold text-blue-800">Teaching & Learning Resources</span></div><ResourcesDisplay resourcesData={slide.resourcesData} /></div>;
  if (slide.type === 'phase-starter' && slide.phaseData) return <PhaseDisplay phaseData={slide.phaseData} phaseType="starter" />;
  if (slide.type === 'phase-development' && slide.phaseData) return <PhaseDisplay phaseData={slide.phaseData} phaseType="development" />;
  if (slide.type === 'phase-skill' && slide.phaseData) return <PhaseDisplay phaseData={slide.phaseData} phaseType="skill" />;
  if (slide.type === 'phase-practice' && slide.phaseData) return <PhaseDisplay phaseData={slide.phaseData} phaseType="practice" />;
  if (slide.type === 'phase-wrapup' && slide.phaseData) return <PhaseDisplay phaseData={slide.phaseData} phaseType="wrapup" />;
  if (slide.type === 'video' && slide.videoUrl) { const videoId = slide.videoUrl.includes('youtube.com') ? new URL(slide.videoUrl).searchParams.get('v') : slide.videoUrl.split('/').pop(); return (<div className="space-y-6"><div className="text-2xl text-gray-700 font-medium" dangerouslySetInnerHTML={{ __html: slide.content }} /><div className="aspect-video w-full max-w-4xl mx-auto"><iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${videoId}`} title={slide.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="rounded-2xl shadow-xl border-4 border-purple-300" /></div></div>); }
  if (slide.type === 'timer' && slide.timerData) return (<div className="space-y-8"><div className="text-2xl text-gray-700 font-medium" dangerouslySetInnerHTML={{ __html: slide.content }} /><TimerWidget initialDuration={slide.timerData.duration} embedded /></div>);
  return (<div className="space-y-6"><div className="bg-white rounded-xl p-6 border-2 border-purple-200 shadow-sm"><div className="text-xl text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: slide.content }} /></div>{slide.imageUrl && <img src={slide.imageUrl} alt={slide.title} className="max-w-2xl max-h-[400px] rounded-2xl shadow-xl border-4 border-purple-300 mx-auto" />}{slide.audioUrl && (<div className="bg-purple-50 p-5 rounded-xl border-2 border-purple-200 max-w-xl mx-auto"><div className="flex items-center gap-2 mb-3"><Music className="w-5 h-5 text-purple-600" /><span className="font-bold text-purple-700">Audio</span></div><audio controls className="w-full"><source src={slide.audioUrl} /></audio></div>)}{slide.links && slide.links.length > 0 && (<div className="space-y-2 max-w-xl mx-auto"><div className="flex items-center gap-2 mb-3"><ExternalLink className="w-5 h-5 text-blue-600" /><span className="font-bold text-blue-700">Resources</span></div>{slide.links.map((link, i) => (<a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200"><ExternalLink className="w-4 h-4 text-blue-600" /><span className="font-medium text-blue-900">{link.title || link.url}</span></a>))}</div>)}</div>);
};
