import React, { useState, useEffect, useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { 
  FileText, GraduationCap, BookOpen, Target, Search, Plus, 
  ChevronRight, ChevronDown, QrCode, Scan, FileStack, BarChart3,
  Loader2, AlertCircle, CheckCircle2, Filter, X, Printer, Copy,
  TrendingUp, Users, Zap, Key
} from 'lucide-react';
import { Question, TestPaper } from '@/types/question-bank';
import { TestPaperBuilder } from './TestPaperBuilder';
import { OMRScanner } from './OMRScanner';
import { OMRResultsViewer } from './OMRResultsViewer';
import { BulkOMRImporter } from './BulkOMRImporter';
import { BulkOMRSummaryReport } from './BulkOMRSummaryReport';
import { BulkOMRSheetGenerator } from './BulkOMRSheetGenerator';
import { CurriculumIndicatorProgressReport } from './CurriculumIndicatorProgressReport';
import { AutomaticOMRGrader } from './AutomaticOMRGrader';
import { AnswerKeyEditor } from './AnswerKeyEditor';
import { OMRAnswerSheet, generateOMRConfig } from './OMRAnswerSheet';
import { OMRSheetConfig, OMRScanResult } from '@/types/omr-scanner';
import { getQuestions, getTestPapers, getTestPaperWithQuestions } from '@/lib/supabase-questions';
import { fetchStudentsByClass } from '@/lib/supabase-students';
import { getCurriculum, getSubjectsForLevel, GradeLevel } from '@/lib/curriculum-data';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import { useTerm } from '@/contexts/TermContext';
import { ClassLevel, Subject } from '@/types/user';

interface Props {
  assignedClasses?: ClassLevel[];
  assignedSubjects?: Subject[];
}

interface IndicatorSelection {
  code: string;
  text: string;
  strand: string;
  subStrand: string;
  selected: boolean;
}

export function AssessTestPaperTab({ assignedClasses = [], assignedSubjects = [] }: Props) {
  const { user } = useAuth();
  const { currentSchool } = useSchool();
  const { currentTerm } = useTerm();
  
  // Selection state
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [activeView, setActiveView] = useState<'select' | 'indicators' | 'questions' | 'papers'>('select');

  
  // Curriculum indicators
  const [indicators, setIndicators] = useState<IndicatorSelection[]>([]);
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);
  const [expandedStrands, setExpandedStrands] = useState<string[]>([]);
  const [indicatorSearch, setIndicatorSearch] = useState('');
  
  // Questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [questionSearch, setQuestionSearch] = useState('');
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  
  // Test Papers
  const [testPapers, setTestPapers] = useState<TestPaper[]>([]);
  const [loadingPapers, setLoadingPapers] = useState(false);
  
  // Students
  const [students, setStudents] = useState<{ id: string; name: string; index?: string }[]>([]);
  
  // Modals
  const [showBuilder, setShowBuilder] = useState(false);
  const [showOMRSheet, setShowOMRSheet] = useState(false);
  const [showOMRScanner, setShowOMRScanner] = useState(false);
  const [showOMRResults, setShowOMRResults] = useState(false);
  const [showBulkImporter, setShowBulkImporter] = useState(false);
  const [showBulkReport, setShowBulkReport] = useState(false);
  const [showBulkSheetGenerator, setShowBulkSheetGenerator] = useState(false);
  const [showProgressReport, setShowProgressReport] = useState(false);
  const [showAutoGrader, setShowAutoGrader] = useState(false);
  const [showAnswerKeyEditor, setShowAnswerKeyEditor] = useState(false);
  const [bulkResults, setBulkResults] = useState<OMRScanResult[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<any>(null);
  const [omrConfig, setOmrConfig] = useState<OMRSheetConfig | null>(null);
  const [answerKeyData, setAnswerKeyData] = useState<any[]>([]);



  // Load curriculum indicators when class/subject changes
  useEffect(() => {
    if (selectedClass && selectedSubject) {
      loadIndicators();
      loadQuestions();
      loadStudents();
      loadTestPapers();
    }
  }, [selectedClass, selectedSubject]);

  const loadIndicators = () => {

    const curriculum = getCurriculum(selectedClass as GradeLevel, selectedSubject);
    if (!curriculum?.strands) {
      setIndicators([]);
      return;
    }

    const allIndicators: IndicatorSelection[] = [];
    curriculum.strands.forEach((strand: any) => {
      strand.subStrands?.forEach((subStrand: any) => {
        subStrand.contentStandards?.forEach((standard: any) => {
          standard.indicators?.forEach((indicator: any) => {
            allIndicators.push({
              code: indicator.code,
              text: indicator.description || indicator.text,
              strand: strand.name,
              subStrand: subStrand.name,
              selected: false
            });
          });
        });
      });
    });
    setIndicators(allIndicators);
  };



  const loadQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const allQuestions = await getQuestions();
      // Filter by selected class and subject
      const filtered = allQuestions.filter(q => 
        q.grade_level === selectedClass && 
        q.subject === selectedSubject
      );
      setQuestions(filtered);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
    setLoadingQuestions(false);
  };

  const loadStudents = async () => {
    if (!selectedClass) return;
    try {
      const classStudents = await fetchStudentsByClass(
        selectedClass,
        currentSchool?.id || user?.school_id
      );
      setStudents(classStudents.map(s => ({
        id: s.id,
        name: s.name || `${s.first_name} ${s.last_name}`,
        index: s.student_id
      })));
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadTestPapers = async () => {
    setLoadingPapers(true);
    try {
      const papers = await getTestPapers();
      const filtered = papers.filter(p => 
        p.grade_level === selectedClass && 
        p.subject === selectedSubject
      );
      setTestPapers(filtered);
    } catch (error) {
      console.error('Error loading test papers:', error);
    }
    setLoadingPapers(false);
  };

  // Group indicators by strand
  const groupedIndicators = useMemo(() => {
    const filtered = indicators.filter(ind => 
      !indicatorSearch || 
      ind.code.toLowerCase().includes(indicatorSearch.toLowerCase()) ||
      ind.text.toLowerCase().includes(indicatorSearch.toLowerCase())
    );

    const groups: Record<string, IndicatorSelection[]> = {};
    filtered.forEach(ind => {
      if (!groups[ind.strand]) groups[ind.strand] = [];
      groups[ind.strand].push(ind);
    });
    return groups;
  }, [indicators, indicatorSearch]);

  // Filter questions by selected indicators
  const filteredQuestions = useMemo(() => {
    let filtered = questions;
    
    if (selectedIndicators.length > 0) {
      filtered = filtered.filter(q => 
        q.indicator_code && selectedIndicators.includes(q.indicator_code)
      );
    }
    
    if (questionSearch) {
      const search = questionSearch.toLowerCase();
      filtered = filtered.filter(q => 
        q.question_text.toLowerCase().includes(search) ||
        q.indicator_code?.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  }, [questions, selectedIndicators, questionSearch]);

  const toggleIndicator = (code: string) => {
    setSelectedIndicators(prev => 
      prev.includes(code) 
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  const toggleStrand = (strand: string) => {
    setExpandedStrands(prev => 
      prev.includes(strand)
        ? prev.filter(s => s !== strand)
        : [...prev, strand]
    );
  };

  const toggleQuestion = (question: Question) => {
    setSelectedQuestions(prev => 
      prev.find(q => q.id === question.id)
        ? prev.filter(q => q.id !== question.id)
        : [...prev, question]
    );
  };

  const selectAllIndicatorsInStrand = (strand: string) => {
    const strandIndicators = groupedIndicators[strand]?.map(i => i.code) || [];
    const allSelected = strandIndicators.every(code => selectedIndicators.includes(code));
    
    if (allSelected) {
      setSelectedIndicators(prev => prev.filter(c => !strandIndicators.includes(c)));
    } else {
      setSelectedIndicators(prev => [...new Set([...prev, ...strandIndicators])]);
    }
  };

  const handleCreateTestPaper = () => {
    if (selectedQuestions.length === 0) return;
    setShowBuilder(true);
  };

  const handleOpenScanner = async (paper: any) => {
    const fullPaper = await getTestPaperWithQuestions(paper.id);
    if (fullPaper && fullPaper.questions) {
      const config = generateOMRConfig(
        paper.id,
        paper.title,
        paper.subject,
        paper.grade_level,
        selectedClass,
        paper.term || currentTerm?.name || 'Term 1',
        paper.academic_year || currentTerm?.academicYear || '2024/2025',
        paper.school_name || currentSchool?.name || '',
        paper.school_logo_url,
        fullPaper.questions.map((q: any) => ({
          id: q.id,
          question_text: q.question_text,
          options: q.options,
          indicator_code: q.indicator_code,
          indicator_text: q.indicator_text,
          strand: q.strand,
          sub_strand: q.sub_strand,
          marks: q.marks
        }))
      );
      setOmrConfig(config);
      setSelectedPaper(paper);
      setShowOMRScanner(true);
    }
  };

  const handleOpenBulkImporter = async (paper: any) => {
    const fullPaper = await getTestPaperWithQuestions(paper.id);
    if (fullPaper && fullPaper.questions) {
      const config = generateOMRConfig(
        paper.id,
        paper.title,
        paper.subject,
        paper.grade_level,
        selectedClass,
        paper.term || currentTerm?.name || 'Term 1',
        paper.academic_year || currentTerm?.academicYear || '2024/2025',
        paper.school_name || currentSchool?.name || '',
        paper.school_logo_url,
        fullPaper.questions.map((q: any) => ({
          id: q.id,
          question_text: q.question_text,
          options: q.options,
          indicator_code: q.indicator_code,
          indicator_text: q.indicator_text,
          strand: q.strand,
          sub_strand: q.sub_strand,
          marks: q.marks
        }))
      );
      setOmrConfig(config);
      setSelectedPaper(paper);
      setShowBulkImporter(true);
    }
  };

  const handleBulkImportComplete = (results: OMRScanResult[]) => {
    setBulkResults(results);
    setShowBulkImporter(false);
    if (results.length > 0) {
      setShowBulkReport(true);
    }
  };

  const handleOpenBulkSheetGenerator = async (paper: any) => {
    const fullPaper = await getTestPaperWithQuestions(paper.id);
    if (fullPaper && fullPaper.questions) {
      const config = generateOMRConfig(
        paper.id,
        paper.title,
        paper.subject,
        paper.grade_level,
        selectedClass,
        paper.term || currentTerm?.name || 'Term 1',
        paper.academic_year || currentTerm?.academicYear || '2024/2025',
        paper.school_name || currentSchool?.name || '',
        paper.school_logo_url,
        fullPaper.questions.map((q: any) => ({
          id: q.id,
          question_text: q.question_text,
          options: q.options,
          indicator_code: q.indicator_code,
          indicator_text: q.indicator_text,
          strand: q.strand,
          sub_strand: q.sub_strand,
          marks: q.marks
        }))
      );
      setOmrConfig(config);
      setSelectedPaper(paper);
      setShowBulkSheetGenerator(true);
    }
  };

  const handleOpenAutoGrader = async (paper: any) => {
    const fullPaper = await getTestPaperWithQuestions(paper.id);
    if (fullPaper && fullPaper.questions) {
      const config = generateOMRConfig(
        paper.id,
        paper.title,
        paper.subject,
        paper.grade_level,
        selectedClass,
        paper.term || currentTerm?.name || 'Term 1',
        paper.academic_year || currentTerm?.academicYear || '2024/2025',
        paper.school_name || currentSchool?.name || '',
        paper.school_logo_url,
        fullPaper.questions.map((q: any) => ({
          id: q.id,
          question_text: q.question_text,
          options: q.options,
          indicator_code: q.indicator_code,
          indicator_text: q.indicator_text,
          strand: q.strand,
          sub_strand: q.sub_strand,
          marks: q.marks
        }))
      );
      setOmrConfig(config);
      setSelectedPaper(paper);
      setShowAutoGrader(true);
    }
  };

  // Handler for opening Answer Key Editor
  const handleOpenAnswerKeyEditor = async (paper: any) => {
    const fullPaper = await getTestPaperWithQuestions(paper.id);
    if (fullPaper && fullPaper.questions) {
      const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];
      const answerKeyItems = fullPaper.questions.map((q: any, idx: number) => {
        const correctIndex = q.options?.findIndex((opt: any) => opt.is_correct);
        return {
          questionNumber: idx + 1,
          questionId: q.id,
          questionText: q.question_text,
          correctAnswer: correctIndex >= 0 ? OPTION_LABELS[correctIndex] : null,
          options: q.options?.map((_: any, i: number) => OPTION_LABELS[i]) || OPTION_LABELS.slice(0, 4),
          marks: q.marks || 1,
          indicatorCode: q.indicator_code,
          indicatorText: q.indicator_text,
          isValid: correctIndex >= 0,
          hasMultipleCorrect: q.options?.filter((opt: any) => opt.is_correct).length > 1
        };
      });
      setAnswerKeyData(answerKeyItems);
      setSelectedPaper(paper);
      setShowAnswerKeyEditor(true);
    }
  };

  // Handler for saving answer key
  const handleSaveAnswerKey = async (answerKey: any[]) => {
    console.log('Saving answer key:', answerKey);
    // Here you would typically save to the database
    // For now, we'll just close the modal
    setShowAnswerKeyEditor(false);
    setSelectedPaper(null);
    loadTestPapers();
  };


  // OMR Scanner Modal
  if (showOMRScanner && omrConfig && selectedPaper) {
    return (
      <OMRScanner 
        config={omrConfig}
        students={students}
        termId={currentTerm?.id || ''}
        schoolId={currentSchool?.id || user?.school_id || ''}
        teacherId={user?.id || ''}
        onClose={() => { setShowOMRScanner(false); setSelectedPaper(null); }}
        onScanComplete={loadTestPapers}
      />
    );
  }

  // OMR Results Viewer
  if (showOMRResults && selectedPaper) {
    return (
      <OMRResultsViewer
        testPaperId={selectedPaper.id}
        testPaperTitle={selectedPaper.title}
        className={selectedClass}
        subject={selectedSubject}
        termId={currentTerm?.id || ''}
        schoolId={currentSchool?.id || user?.school_id || ''}
        onClose={() => { setShowOMRResults(false); setSelectedPaper(null); }}
      />
    );
  }

  // Bulk OMR Importer
  if (showBulkImporter && omrConfig && selectedPaper) {
    return (
      <BulkOMRImporter
        config={omrConfig}
        students={students}
        termId={currentTerm?.id || ''}
        schoolId={currentSchool?.id || user?.school_id || ''}
        teacherId={user?.id || ''}
        onClose={() => { setShowBulkImporter(false); setSelectedPaper(null); }}
        onComplete={handleBulkImportComplete}
      />
    );
  }

  // Bulk OMR Summary Report
  if (showBulkReport && bulkResults.length > 0 && selectedPaper) {
    return (
      <BulkOMRSummaryReport
        results={bulkResults}
        testPaperTitle={selectedPaper.title}
        className={selectedClass}
        subject={selectedSubject}
        gradeLevel={selectedClass}
        totalStudentsInClass={students.length}
        onClose={() => { setShowBulkReport(false); setBulkResults([]); }}
      />
    );
  }

  // Bulk OMR Sheet Generator
  if (showBulkSheetGenerator && omrConfig && selectedPaper) {
    return (
      <BulkOMRSheetGenerator
        config={omrConfig}
        students={students}
        onClose={() => { setShowBulkSheetGenerator(false); setSelectedPaper(null); }}
      />
    );
  }

  // Automatic OMR Grader
  if (showAutoGrader && omrConfig && selectedPaper) {
    return (
      <AutomaticOMRGrader
        config={omrConfig}
        students={students}
        termId={currentTerm?.id || ''}
        schoolId={currentSchool?.id || user?.school_id || ''}
        teacherId={user?.id || ''}
        onClose={() => { setShowAutoGrader(false); setSelectedPaper(null); }}
        onGradingComplete={loadTestPapers}
      />
    );
  }

  // Curriculum Indicator Progress Report
  if (showProgressReport && selectedClass && selectedSubject) {
    return (
      <CurriculumIndicatorProgressReport
        isOpen={showProgressReport}
        onClose={() => setShowProgressReport(false)}
        className={selectedClass}
        subject={selectedSubject}
        students={students}
        schoolId={currentSchool?.id || user?.school_id || ''}
        teacherId={user?.id || ''}
      />
    );
  }


  return (
    <div className="space-y-4">
      {/* Answer Key Editor Modal */}
      {showAnswerKeyEditor && selectedPaper && (
        <AnswerKeyEditor
          isOpen={showAnswerKeyEditor}
          onClose={() => { setShowAnswerKeyEditor(false); setSelectedPaper(null); }}
          testPaperId={selectedPaper.id}
          testPaperTitle={selectedPaper.title}
          initialAnswerKey={answerKeyData}
          totalQuestions={answerKeyData.length || 50}
          optionsPerQuestion={4}
          onSave={handleSaveAnswerKey}
          gradeLevel={selectedClass}
          subject={selectedSubject}
        />
      )}

      {/* Class and Subject Selection */}
      <Card className="p-4 bg-white">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          Select Class & Subject
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {assignedClasses.map(c => (
                  <SelectItem key={c} value={c}>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-blue-500" />
                      {c}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {assignedSubjects.map(s => (
                  <SelectItem key={s} value={s}>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-purple-500" />
                      {s}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Show content only when class and subject are selected */}
      {selectedClass && selectedSubject ? (
        <>
          {/* View Tabs */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={activeView === 'indicators' ? 'default' : 'outline'}
              onClick={() => setActiveView('indicators')}
              className={activeView === 'indicators' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            >
              <Target className="w-4 h-4 mr-2" />
              Curriculum Indicators
              {selectedIndicators.length > 0 && (
                <Badge className="ml-2 bg-white/20">{selectedIndicators.length}</Badge>
              )}
            </Button>
            <Button
              variant={activeView === 'questions' ? 'default' : 'outline'}
              onClick={() => setActiveView('questions')}
              className={activeView === 'questions' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              <FileText className="w-4 h-4 mr-2" />
              Question Bank
              {selectedQuestions.length > 0 && (
                <Badge className="ml-2 bg-white/20">{selectedQuestions.length}</Badge>
              )}
            </Button>
            <Button
              variant={activeView === 'papers' ? 'default' : 'outline'}
              onClick={() => setActiveView('papers')}
              className={activeView === 'papers' ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              <QrCode className="w-4 h-4 mr-2" />
              Test Papers
              {testPapers.length > 0 && (
                <Badge className="ml-2 bg-white/20">{testPapers.length}</Badge>
              )}
            </Button>
          </div>

          {/* Curriculum Indicators View */}
          {activeView === 'indicators' && (
            <Card className="p-4 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-600" />
                  NaCCA Curriculum Indicators
                </h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search indicators..."
                      value={indicatorSearch}
                      onChange={(e) => setIndicatorSearch(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  {selectedIndicators.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedIndicators([])}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear ({selectedIndicators.length})
                    </Button>
                  )}
                </div>
              </div>

              {indicators.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No curriculum indicators found for {selectedSubject} in {selectedClass}</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {Object.entries(groupedIndicators).map(([strand, strandIndicators]) => (
                    <div key={strand} className="border rounded-lg overflow-hidden">
                      <div 
                        className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                        onClick={() => toggleStrand(strand)}
                      >
                        <div className="flex items-center gap-2">
                          {expandedStrands.includes(strand) ? (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          )}
                          <span className="font-medium text-gray-800">{strand}</span>
                          <Badge variant="outline" className="text-xs">
                            {strandIndicators.length} indicators
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectAllIndicatorsInStrand(strand);
                          }}
                        >
                          {strandIndicators.every(i => selectedIndicators.includes(i.code)) 
                            ? 'Deselect All' 
                            : 'Select All'}
                        </Button>
                      </div>
                      
                      {expandedStrands.includes(strand) && (
                        <div className="p-2 space-y-1">
                          {strandIndicators.map(indicator => (
                            <div 
                              key={indicator.code}
                              className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                                selectedIndicators.includes(indicator.code)
                                  ? 'bg-emerald-50 border border-emerald-200'
                                  : 'hover:bg-gray-50'
                              }`}
                              onClick={() => toggleIndicator(indicator.code)}
                            >
                              <Checkbox 
                                checked={selectedIndicators.includes(indicator.code)}
                                onCheckedChange={() => toggleIndicator(indicator.code)}
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs font-mono">
                                    {indicator.code}
                                  </Badge>
                                  <span className="text-xs text-gray-500">{indicator.subStrand}</span>
                                </div>
                                <p className="text-sm text-gray-700 mt-1">{indicator.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {selectedIndicators.length > 0 && (
                <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-emerald-800">
                      <strong>{selectedIndicators.length}</strong> indicators selected
                    </p>
                    <Button 
                      size="sm"
                      onClick={() => setActiveView('questions')}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      View Questions for Selected Indicators
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Questions View */}
          {activeView === 'questions' && (
            <Card className="p-4 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Question Bank
                  {selectedIndicators.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      Filtered by {selectedIndicators.length} indicators
                    </Badge>
                  )}
                </h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search questions..."
                      value={questionSearch}
                      onChange={(e) => setQuestionSearch(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                </div>
              </div>

              {loadingQuestions ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-gray-500">Loading questions...</p>
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No questions found</p>
                  {selectedIndicators.length > 0 && (
                    <p className="text-sm mt-1">Try selecting different indicators or clearing the filter</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {filteredQuestions.map(question => (
                    <div 
                      key={question.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedQuestions.find(q => q.id === question.id)
                          ? 'bg-blue-50 border-blue-300'
                          : 'hover:bg-gray-50 border-gray-200'
                      }`}
                      onClick={() => toggleQuestion(question)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          checked={!!selectedQuestions.find(q => q.id === question.id)}
                          onCheckedChange={() => toggleQuestion(question)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {question.indicator_code && (
                              <Badge variant="outline" className="text-xs font-mono bg-emerald-50">
                                {question.indicator_code}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {question.marks} mark{question.marks !== 1 ? 's' : ''}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">
                              {question.question_type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-800">{question.question_text}</p>
                          {question.options && question.options.length > 0 && (
                            <div className="mt-2 pl-4 space-y-1">
                              {question.options.map((opt, idx) => (
                                <p key={idx} className={`text-xs ${opt.is_correct ? 'text-emerald-600 font-medium' : 'text-gray-500'}`}>
                                  {String.fromCharCode(65 + idx)}. {opt.option_text}
                                  {opt.is_correct && <CheckCircle2 className="w-3 h-3 inline ml-1" />}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedQuestions.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-800">
                        <strong>{selectedQuestions.length}</strong> questions selected
                      </p>
                      <p className="text-xs text-blue-600">
                        Total: {selectedQuestions.reduce((sum, q) => sum + q.marks, 0)} marks
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedQuestions([])}
                      >
                        Clear Selection
                      </Button>
                      <Button 
                        size="sm"
                        onClick={handleCreateTestPaper}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Create Test Paper
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Test Papers View */}
          {activeView === 'papers' && (
            <Card className="p-4 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-purple-600" />
                  Test Papers for {selectedClass} - {selectedSubject}
                </h3>
              </div>

              {loadingPapers ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
                  <p className="text-gray-500">Loading test papers...</p>
                </div>
              ) : testPapers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No test papers created yet</p>
                  <p className="text-sm mt-1">Select questions and create your first test paper</p>
                  <Button 
                    className="mt-4"
                    onClick={() => setActiveView('questions')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Test Paper
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {testPapers.map(paper => (
                    <div key={paper.id} className="p-4 rounded-lg border bg-gray-50 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-800">{paper.title}</h4>
                          <p className="text-sm text-gray-500">{paper.subject} - {paper.grade_level}</p>
                          <p className="text-xs text-gray-400">
                            {paper.term} {paper.academic_year} | {paper.total_marks} marks | {paper.duration_minutes} mins
                          </p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenAnswerKeyEditor(paper)}
                            className="text-amber-600 border-amber-200 hover:bg-amber-50"
                          >
                            <Key className="w-4 h-4 mr-1" />
                            Answer Key
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenBulkSheetGenerator(paper)}
                            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                          >
                            <Printer className="w-4 h-4 mr-1" />
                            Print Sheets
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenAutoGrader(paper)}
                            className="text-orange-600 border-orange-200 hover:bg-orange-50"
                          >
                            <Zap className="w-4 h-4 mr-1" />
                            AI Grade
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenScanner(paper)}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <Scan className="w-4 h-4 mr-1" />
                            Scan
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenBulkImporter(paper)}
                            className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                          >
                            <FileStack className="w-4 h-4 mr-1" />
                            Bulk Import
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedPaper(paper);
                              setShowOMRResults(true);
                            }}
                            className="text-purple-600 border-purple-200 hover:bg-purple-50"
                          >
                            <BarChart3 className="w-4 h-4 mr-1" />
                            Results
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* OMR Info */}
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start gap-2">
                  <QrCode className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">OMR Scanning Available</p>
                    <p className="text-xs text-green-700 mt-1">
                      Generate printable bubble sheets for multiple choice questions. 
                      Scan with your smartphone and automatically link results to NaCCA curriculum indicators.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </>
      ) : (
        <Card className="p-8 text-center bg-white">
          <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Select Class & Subject</h3>
          <p className="text-gray-500">
            Choose a class and subject above to view curriculum indicators, 
            select questions, and create test papers.
          </p>
        </Card>
      )}
    </div>
  );
}
