import React, { useMemo } from 'react';
import { Slide, Lesson } from '../types/lesson';
import { BookOpen, Calendar, Hash, Sparkles, Target, Layers, GraduationCap, Users, ListChecks, Star, ChevronRight, CalendarDays } from 'lucide-react';
import { getIndicatorPaths } from '@/lib/curriculum-utils';
import { WEEKS_PER_TERM } from '@/types/term';
import { useBranding } from '@/contexts/BrandingContext';
import { useSchool } from '@/contexts/SchoolContext';

interface LessonInfoSlideProps {
  slide: Slide;
  lesson?: Lesson;
}

export const LessonInfoSlide: React.FC<LessonInfoSlideProps> = ({ slide, lesson }) => {
  const { branding } = useBranding();
  const { currentSchool } = useSchool();
  const subject = lesson?.subject || 'Subject';
  const classLevel = lesson?.class || 'Class';
  const week = lesson?.week || 1;
  const lessonNum = lesson?.lessonNumber;
  const curriculum = slide.curriculumInfo || lesson?.curriculumInfo;
  const kgIndicatorPaths = getIndicatorPaths(curriculum?.kgIndicatorIds || []);

  const termInfo = useMemo(() => {
    const termNumber = Math.ceil(week / WEEKS_PER_TERM);
    const weekInTerm = ((week - 1) % WEEKS_PER_TERM) + 1;
    return { termNumber: Math.min(termNumber, 3), weekInTerm };
  }, [week]);

  // Use school branding colors for the slide background
  const gradientStyle = branding.header_gradient_from !== '#1E3A8A' || branding.logo_url
    ? { background: `linear-gradient(to bottom right, ${branding.header_gradient_from}, ${branding.primary_color}, ${branding.header_gradient_to})` }
    : undefined;

  return (
    <div 
      className={`min-h-[70vh] rounded-3xl p-5 text-white relative overflow-hidden ${!gradientStyle ? 'bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600' : ''}`}
      style={gradientStyle}
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      <Sparkles className="absolute top-16 left-16 w-6 h-6 text-yellow-300/40 animate-pulse" />
      
      <div className="relative z-10">
        {/* School Logo and Name */}
        {(branding.logo_url || currentSchool?.name) && (
          <div className="flex items-center justify-center gap-3 mb-4">
            {branding.logo_url && <img src={branding.logo_url} alt="School Logo" className="h-12 object-contain bg-white/90 rounded-lg px-2 py-1" />}
            {currentSchool?.name && <span className="text-white/90 font-bold text-lg">{currentSchool.name}</span>}
          </div>
        )}

        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-sm font-bold mb-2" style={{ backgroundColor: `${branding.accent_color}cc` }}>
            <CalendarDays className="w-4 h-4" />
            Term {termInfo.termNumber} • Week {termInfo.weekInTerm}
          </div>
          <h1 className="text-base md:text-lg font-bold mb-2 drop-shadow-lg">{slide.title || lesson?.title}</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <Users className="w-6 h-6 mx-auto mb-1 text-yellow-300" />
            <p className="text-sm text-white/80 font-medium">Class</p>
            <p className="font-bold text-lg break-words">{classLevel}</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <BookOpen className="w-6 h-6 mx-auto mb-1 text-green-300" />
            <p className="text-sm text-white/80 font-medium">Subject</p>
            <p className="font-bold text-lg break-words">{subject}</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <Calendar className="w-6 h-6 mx-auto mb-1 text-blue-300" />
            <p className="text-sm text-white/80 font-medium">Week</p>
            <p className="font-bold text-lg">Week {week}</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <Hash className="w-6 h-6 mx-auto mb-1 text-pink-300" />
            <p className="text-sm text-white/80 font-medium">Lesson</p>
            <p className="font-bold text-lg">Lesson {lessonNum}</p>
          </div>
        </div>

        {kgIndicatorPaths.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-emerald-300" />
              <span className="font-bold text-base">NaCCA KG Curriculum Alignment</span>
            </div>
            <div className="space-y-2">
              {kgIndicatorPaths.map(({ indicator, path }) => (
                <div key={indicator.id} className="bg-white/10 rounded-lg p-2">
                  <div className="flex items-center gap-1 text-xs text-white/70 mb-1 flex-wrap">
                    <span className="bg-emerald-500/30 px-1.5 py-0.5 rounded">{path.level}</span>
                    <ChevronRight className="w-3 h-3" />
                    <span>{path.strand.name}</span>
                    <ChevronRight className="w-3 h-3" />
                    <span>{path.subStrand.name}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="px-2 py-0.5 rounded font-semibold text-sm shrink-0" style={{ backgroundColor: `${branding.primary_color}50` }}>{indicator.code}</span>
                    <span className="text-sm break-words">{indicator.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!kgIndicatorPaths.length && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="w-5 h-5 text-yellow-300" />
                  <span className="font-bold text-base">Strand</span>
                </div>
                <p className="text-white/90 text-base break-words">{curriculum?.strandName || curriculum?.strand || 'Not Set'}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="w-5 h-5 text-orange-300" />
                  <span className="font-bold text-base">Sub-Strand</span>
                </div>
                <p className="text-white/90 text-base break-words">{curriculum?.subStrandName || curriculum?.subStrand || 'Not Set'}</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-3">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-5 h-5 text-green-300" />
                <span className="font-bold text-base">Content Standard</span>
              </div>
              <div className="text-white/90 text-base">
                {curriculum?.contentStandardCode && <span className="px-2 py-0.5 rounded font-semibold mr-2 text-sm" style={{ backgroundColor: `${branding.accent_color}50` }}>{curriculum.contentStandardCode}</span>}
                <span className="break-words">{curriculum?.contentStandardDesc || 'Not Set'}</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <ListChecks className="w-5 h-5 text-blue-300" />
                <span className="font-bold text-base">Indicators</span>
              </div>
              {curriculum?.indicatorDetails?.length ? (
                <ul className="space-y-1.5">
                  {curriculum.indicatorDetails.map((ind, i) => (
                    <li key={i} className="text-white/90 text-base flex items-start gap-2">
                      <span className="px-2 py-0.5 rounded font-semibold text-sm shrink-0" style={{ backgroundColor: `${branding.primary_color}50` }}>{ind.code}</span>
                      <span className="break-words">{ind.description}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-white/60 text-base italic">No indicators selected</p>}
            </div>
          </>
        )}

        <div className="backdrop-blur-sm rounded-xl p-3 border" style={{ backgroundColor: `${branding.secondary_color}20`, borderColor: `${branding.secondary_color}40` }}>
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-pink-300" />
            <span className="font-bold text-base">Core Competences</span>
          </div>
          {curriculum?.coreCompetences?.length ? (
            <div className="flex flex-wrap gap-2">
              {curriculum.coreCompetences.map((comp, i) => (
                <span key={i} className="px-3 py-1 rounded-full font-medium text-sm border" style={{ backgroundColor: `${branding.secondary_color}40`, borderColor: `${branding.secondary_color}60` }}>{comp}</span>
              ))}
            </div>
          ) : <p className="text-white/60 text-base italic">No core competences selected</p>}
        </div>
      </div>
    </div>
  );
};
