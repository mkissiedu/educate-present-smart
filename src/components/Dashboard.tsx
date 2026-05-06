import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLessonContext } from '../contexts/LessonContext';
import { LessonCard } from './LessonCard';
import { PresentationMode } from './PresentationMode';
import { Lesson } from '../types/lesson';
import { Button } from './ui/button';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { lessons } = useLessonContext();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [filterSubject, setFilterSubject] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const subjects = ['All', 'Skills Strand', 'Knowledge Strand'];

  const filteredLessons = lessons.filter((lesson) => {
    // Map filter subjects to lesson subjects
    let subjectMatch = filterSubject === 'All';
    if (filterSubject === 'Skills Strand') subjectMatch = lesson.subject === 'Skills';
    if (filterSubject === 'Knowledge Strand') subjectMatch = lesson.subject === 'Knowledge';
    
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase());
    return subjectMatch && matchesSearch;
  });

  const recentLessons = lessons.filter((l) => l.lastPresented).slice(0, 3);
  const favoriteLessons = lessons.filter((l) => l.isFavorite);


  if (selectedLesson) {
    return <PresentationMode lesson={selectedLesson} onExit={() => setSelectedLesson(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2332] via-[#2a3f5f] to-[#1a2332]">
      {/* Hero Header */}
      <div className="relative h-80 overflow-hidden">
        <img
          src="https://d64gsuwffb70l.cloudfront.net/69292778b5e860d8b45503e2_1764304863230_74f9bd7a.webp"
          alt="Dashboard"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-8">
          <h1 className="text-7xl font-bold text-white mb-4">Lesson Plan Dashboard</h1>
          <p className="text-3xl text-gray-200">Interactive Teaching Command Center</p>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-12 py-12">
        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-5xl font-bold text-[#00d4aa] mb-2">{lessons.length}</div>
            <div className="text-xl text-gray-600">Total Lessons</div>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-5xl font-bold text-[#ff6b6b] mb-2">{favoriteLessons.length}</div>
            <div className="text-xl text-gray-600">Favorites</div>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-5xl font-bold text-[#4dabf7] mb-2">{recentLessons.length}</div>
            <div className="text-xl text-gray-600">Recent</div>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-5xl font-bold text-[#51cf66] mb-2">{subjects.length - 1}</div>
            <div className="text-xl text-gray-600">Subjects</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-12">
          <div className="flex gap-6 items-center">
            <input
              type="text"
              placeholder="Search lessons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-6 py-4 text-2xl border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#00d4aa]"
            />
            <div className="flex gap-3">
              {subjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => setFilterSubject(subject)}
                  className={`px-6 py-4 rounded-xl text-xl font-semibold transition-all ${
                    filterSubject === subject
                      ? 'bg-[#00d4aa] text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
        </div>
        </div>

        {/* Create New Lesson Button */}
        <div className="mb-8">
          <Button 
            onClick={() => navigate('/editor/new')}
            className="bg-[#00d4aa] hover:bg-[#00b894] text-white text-2xl px-12 py-8 h-auto rounded-xl"
          >
            Create New Lesson
          </Button>
        </div>

        {/* Lessons Grid */}
        <div>
          <h2 className="text-5xl font-bold text-white mb-8">
            {filterSubject === 'All' ? 'All Lessons' : filterSubject}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredLessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onClick={() => setSelectedLesson(lesson)}
                onEdit={() => navigate(`/editor/${lesson.id}`)}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
