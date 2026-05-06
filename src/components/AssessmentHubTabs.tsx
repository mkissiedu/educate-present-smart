import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Student } from '../types/student';
import { CLASS_LEVELS } from '@/types/user';
import { 
  BookOpen, Users, GraduationCap, ClipboardCheck, Target, ChevronRight, 
  Map, Award, BarChart3, FileCheck, FileText, Database, TrendingUp,
  Calendar, CheckCircle2
} from 'lucide-react';

interface AssessOverviewProps {
  students: Student[];
  classCounts: Record<string, number>;
  activeClasses: string[];
  testPaperCount?: number;
  onNavigateToGradebook?: () => void;
  onNavigateToTestPaper?: () => void;
  onNavigateToCurriculum?: () => void;
}

export const AssessOverviewTab: React.FC<AssessOverviewProps> = ({ 
  students, 
  classCounts, 
  activeClasses,
  testPaperCount = 0,
  onNavigateToGradebook,
  onNavigateToTestPaper,
  onNavigateToCurriculum
}) => (
  <div className="space-y-4">
    {/* Stats Cards */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card className="p-4 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
        <ClipboardCheck className="w-8 h-8 mb-2" />
        <p className="text-3xl font-bold">{students.length}</p>
        <p className="text-sm opacity-80">Students to Assess</p>
      </Card>
      <Card className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
        <GraduationCap className="w-8 h-8 mb-2" />
        <p className="text-3xl font-bold">{activeClasses.length}</p>
        <p className="text-sm opacity-80">Active Classes</p>
      </Card>
      <Card className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
        <FileText className="w-8 h-8 mb-2" />
        <p className="text-3xl font-bold">{testPaperCount}</p>
        <p className="text-sm opacity-80">Test Papers</p>
      </Card>
      <Card className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <Award className="w-8 h-8 mb-2" />
        <p className="text-3xl font-bold">--</p>
        <p className="text-sm opacity-80">Avg Score</p>
      </Card>
    </div>
    
    {/* Quick Actions */}
    <div className="grid md:grid-cols-3 gap-4">
      <Card 
        className="p-4 bg-white hover:bg-blue-50 cursor-pointer transition-all border-2 border-transparent hover:border-blue-200"
        onClick={onNavigateToGradebook}
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-xl">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-800">Gradebook</h3>
            <p className="text-sm text-gray-500">Score entry, standards map & reports</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </Card>

      <Card 
        className="p-4 bg-white hover:bg-purple-50 cursor-pointer transition-all border-2 border-transparent hover:border-purple-200"
        onClick={onNavigateToTestPaper}
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-xl">
            <FileText className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-800">Test Paper</h3>
            <p className="text-sm text-gray-500">Create tests & OMR scanning</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </Card>

      <Card 
        className="p-4 bg-white hover:bg-emerald-50 cursor-pointer transition-all border-2 border-transparent hover:border-emerald-200"
        onClick={onNavigateToCurriculum}
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 rounded-xl">
            <Target className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-800">Curriculum</h3>
            <p className="text-sm text-gray-500">Curriculum map & question bank</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </Card>
    </div>

    {/* Assessment by Class */}
    <div>
      <h3 className="text-white font-bold mb-2 mt-2">Students by Class</h3>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {CLASS_LEVELS.slice(0, 12).map(level => (
          <Card key={level} className={`p-2 text-center ${classCounts[level] ? 'bg-white' : 'bg-white/50'}`}>
            <p className="text-lg font-bold text-gray-800">{classCounts[level] || 0}</p>
            <p className="text-xs text-gray-600">{level}</p>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

interface AssessCurriculumProps {
  onNavigate?: () => void;
  onSelectCurriculum?: (system: string) => void;
  onNavigateToQuestionBank?: () => void;
}

export const AssessCurriculumTab: React.FC<AssessCurriculumProps> = ({ 
  onNavigate, 
  onSelectCurriculum, 
  onNavigateToQuestionBank 
}) => (
  <div className="space-y-4">
    {/* Curriculum Systems */}
    <div className="space-y-3">
      <h3 className="text-white font-semibold">Curriculum Standards</h3>
      
      <Card className="p-4 bg-white hover:bg-gray-50 cursor-pointer transition-all" onClick={() => onSelectCurriculum?.('NaCCA')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Target className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">NaCCA Standards</h3>
              <p className="text-sm text-gray-500">Ghana National Curriculum Standards</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </Card>
      
      <Card className="p-4 bg-white hover:bg-gray-50 cursor-pointer transition-all" onClick={() => onSelectCurriculum?.('CKLA')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Ananse's Phonics</h3>
              <p className="text-sm text-gray-500">Skills & Knowledge strand assessments</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </Card>
    </div>

    {/* Question Bank */}
    <div className="space-y-3">
      <h3 className="text-white font-semibold">Question Bank</h3>
      
      <Card 
        className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 cursor-pointer transition-all" 
        onClick={onNavigateToQuestionBank}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold">Question Bank</h3>
              <p className="text-sm opacity-80">Create and manage curriculum-aligned questions</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 opacity-80" />
        </div>
      </Card>
    </div>

    {/* View Full Curriculum Map */}
    <Button onClick={onNavigate} className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-teal-500">
      <Map className="w-4 h-4 mr-2" /> View Full Curriculum Map
    </Button>

    {/* Info Cards */}
    <div className="grid md:grid-cols-2 gap-3 mt-4">
      <Card className="p-4 bg-white/90">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">Standards Tracking</h4>
            <p className="text-sm text-gray-600">
              Track student progress against NaCCA curriculum indicators and content standards.
            </p>
          </div>
        </div>
      </Card>
      
      <Card className="p-4 bg-white/90">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">Aligned Assessments</h4>
            <p className="text-sm text-gray-600">
              Create tests linked to specific curriculum indicators for targeted assessment.
            </p>
          </div>
        </div>
      </Card>
    </div>
  </div>
);
