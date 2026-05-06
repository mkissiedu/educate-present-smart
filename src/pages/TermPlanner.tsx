import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTermContext } from '@/contexts/TermContext';
import { useLessonContext } from '@/contexts/LessonContext';
import { TermPlannerHeader } from '@/components/TermPlannerHeader';
import { TermWeekGrid } from '@/components/TermWeekGrid';
import { TermProgressPanel } from '@/components/TermProgressPanel';
import { TermReportModal } from '@/components/TermReportModal';
import { TermCalendarView } from '@/components/TermCalendarView';
import { PresentationMode } from '@/components/PresentationMode';
import { AttendanceTracker } from '@/components/AttendanceTracker';
import { Lesson } from '@/types/lesson';
import { Button } from '@/components/ui/button';
import { Home, FileText, BookOpen, Filter, CalendarDays, LayoutGrid, Cloud, Users } from 'lucide-react';
import { CLASS_SUBJECTS_MAP, ClassLevel, Subject } from '@/types/user';

const TermPlanner: React.FC = () => {
  const navigate = useNavigate();
  const { selectedTerm, getTermProgress, isSyncing } = useTermContext();
  const { lessons } = useLessonContext();
  const [classLevel, setClassLevel] = useState<ClassLevel>('KG 1');
  const [subjectFilter, setSubjectFilter] = useState<string>('All');
  const [showReport, setShowReport] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar' | 'attendance'>('grid');

  const availableSubjects = useMemo(() => {
    const subjects = CLASS_SUBJECTS_MAP[classLevel] || [];
    return ['All', ...subjects];
  }, [classLevel]);

  const handleClassChange = (newClass: string) => {
    setClassLevel(newClass as ClassLevel);
    const newSubjects = CLASS_SUBJECTS_MAP[newClass as ClassLevel] || [];
    if (subjectFilter !== 'All' && !newSubjects.includes(subjectFilter as Subject)) {
      setSubjectFilter('All');
    }
  };

  const progress = useMemo(() => {
    if (!selectedTerm) return null;
    return getTermProgress(selectedTerm, classLevel);
  }, [selectedTerm, classLevel, getTermProgress, lessons]);

  const filteredLessons = useMemo(() => {
    return lessons.filter(l => {
      if (classLevel !== 'All' && l.class !== classLevel) return false;
      if (subjectFilter !== 'All' && l.subject !== subjectFilter) return false;
      return true;
    });
  }, [lessons, classLevel, subjectFilter]);

  if (selectedLesson) {
    return <PresentationMode lesson={selectedLesson} onExit={() => setSelectedLesson(null)} />;
  }

  const getSubjectShortName = (subject: string) => {
    const shortNames: Record<string, string> = {
      'Language & Literacy': 'Lang', 'Numeracy': 'Math', 'Our World Our People': 'OWOP',
      'Creative Arts': 'Arts', "Ananse's Phonics": 'Phonics', 'English Language': 'English',
      'Mathematics': 'Math', 'Science': 'Science', 'Social Studies': 'Social',
      'Computing': 'ICT', 'French': 'French', 'Ghanaian Language': 'GhLang',
      'Religious & Moral Education': 'RME', 'Career Technology': 'CarTech', 'Physical Education': 'PE',
    };
    return shortNames[subject] || subject.split(' ')[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="max-w-[1800px] mx-auto px-3 md:px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate('/dashboard')} variant="ghost" className="text-white hover:bg-white/10">
              <Home className="w-4 h-4 mr-2" /> Dashboard
            </Button>
            <Button onClick={() => navigate('/curriculum')} variant="ghost" className="text-white hover:bg-white/10">
              <BookOpen className="w-4 h-4 mr-2" /> Curriculum Map
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {isSyncing ? (
              <span className="text-xs text-blue-400 flex items-center gap-1"><Cloud className="w-3 h-3 animate-pulse" /> Syncing...</span>
            ) : (
              <span className="text-xs text-green-400 flex items-center gap-1"><Cloud className="w-3 h-3" /> Synced</span>
            )}
          </div>
        </div>

        <TermPlannerHeader classLevel={classLevel} onClassChange={handleClassChange} />
        {progress && viewMode !== 'attendance' && <TermProgressPanel progress={progress} />}

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {viewMode !== 'attendance' && (
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-300">Filter:</span>
                <div className="flex flex-wrap gap-1">
                  {availableSubjects.map(subject => (
                    <button key={subject} onClick={() => setSubjectFilter(subject)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${subjectFilter === subject ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}>
                      {subject === 'All' ? 'All' : getSubjectShortName(subject)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {viewMode === 'attendance' && <div />}
            <div className="flex items-center gap-2">
              <div className="flex bg-white/10 rounded-lg p-1">
                <button onClick={() => setViewMode('grid')} className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-slate-300 hover:bg-white/10'}`}>
                  <LayoutGrid className="w-3 h-3" /> Grid
                </button>
                <button onClick={() => setViewMode('calendar')} className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 ${viewMode === 'calendar' ? 'bg-blue-500 text-white' : 'text-slate-300 hover:bg-white/10'}`}>
                  <CalendarDays className="w-3 h-3" /> Calendar
                </button>
                <button onClick={() => setViewMode('attendance')} className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 ${viewMode === 'attendance' ? 'bg-green-500 text-white' : 'text-slate-300 hover:bg-white/10'}`}>
                  <Users className="w-3 h-3" /> Attendance
                </button>
              </div>
              {viewMode !== 'attendance' && (
                <Button onClick={() => setShowReport(true)} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  <FileText className="w-4 h-4 mr-2" /> Report
                </Button>
              )}
            </div>
          </div>
        </div>

        {viewMode === 'grid' && progress && selectedTerm && (
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              Weekly Schedule - {selectedTerm.name} ({classLevel})
            </h3>
            <TermWeekGrid weekStatuses={progress.weekStatuses} lessons={filteredLessons} subject={subjectFilter} classLevel={classLevel} onSelectLesson={setSelectedLesson} />
          </div>
        )}

        {viewMode === 'calendar' && (
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-400" />
              Calendar View {selectedTerm && `- ${selectedTerm.name} (${classLevel})`}
            </h3>
            <TermCalendarView classLevel={classLevel} subjectFilter={subjectFilter} onSelectLesson={setSelectedLesson} />
          </div>
        )}

        {viewMode === 'attendance' && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-4">
            <AttendanceTracker classLevel={classLevel} />
          </div>
        )}

        {!selectedTerm && viewMode !== 'attendance' && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center">
            <p className="text-slate-300">No term selected. Please configure term dates in settings.</p>
          </div>
        )}
      </div>

      {showReport && progress && (
        <TermReportModal isOpen={showReport} onClose={() => setShowReport(false)} progress={progress} classLevel={classLevel} />
      )}
    </div>
  );
};

export default TermPlanner;
