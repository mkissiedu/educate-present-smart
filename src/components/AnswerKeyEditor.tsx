import React, { useState, useEffect, useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Alert, AlertDescription } from './ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import {
  Key, FileText, Download, Upload, Save, Check, X, AlertTriangle,
  ChevronLeft, ChevronRight, Grid3X3, List, Eye, Printer, Copy,
  RefreshCw, Trash2, CheckCircle2, XCircle, HelpCircle, Loader2,
  FileUp, FileDown, Sparkles, Target, BookOpen
} from 'lucide-react';
import { TestPaper, Question } from '@/types/question-bank';
import { getTestPapers, getTestPaperWithQuestions } from '@/lib/supabase-questions';

interface AnswerKeyItem {
  questionNumber: number;
  questionId: string;
  questionText: string;
  correctAnswer: string | null;
  options: string[];
  marks: number;
  indicatorCode?: string;
  indicatorText?: string;
  isValid: boolean;
  hasMultipleCorrect?: boolean;
}

interface AnswerKeyEditorProps {
  isOpen: boolean;
  onClose: () => void;
  testPaperId?: string;
  testPaperTitle?: string;
  initialAnswerKey?: AnswerKeyItem[];
  totalQuestions?: number;
  optionsPerQuestion?: number;
  onSave: (answerKey: AnswerKeyItem[]) => void;
  gradeLevel?: string;
  subject?: string;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function AnswerKeyEditor({
  isOpen,
  onClose,
  testPaperId,
  testPaperTitle,
  initialAnswerKey,
  totalQuestions = 50,
  optionsPerQuestion = 4,
  onSave,
  gradeLevel,
  subject
}: AnswerKeyEditorProps) {
  const [answerKey, setAnswerKey] = useState<AnswerKeyItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'editor' | 'import' | 'preview'>('editor');
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Import state
  const [availableTestPapers, setAvailableTestPapers] = useState<TestPaper[]>([]);
  const [selectedImportPaper, setSelectedImportPaper] = useState<string>('');
  const [importLoading, setImportLoading] = useState(false);
  
  // Bulk edit state
  const [bulkStartQuestion, setBulkStartQuestion] = useState(1);
  const [bulkEndQuestion, setBulkEndQuestion] = useState(10);
  const [bulkAnswer, setBulkAnswer] = useState('');

  // Initialize answer key
  useEffect(() => {
    if (initialAnswerKey && initialAnswerKey.length > 0) {
      setAnswerKey(initialAnswerKey);
    } else {
      // Create empty answer key
      const emptyKey: AnswerKeyItem[] = Array.from({ length: totalQuestions }, (_, i) => ({
        questionNumber: i + 1,
        questionId: `q-${i + 1}`,
        questionText: `Question ${i + 1}`,
        correctAnswer: null,
        options: OPTION_LABELS.slice(0, optionsPerQuestion),
        marks: 1,
        isValid: false
      }));
      setAnswerKey(emptyKey);
    }
  }, [initialAnswerKey, totalQuestions, optionsPerQuestion]);

  // Load available test papers for import
  useEffect(() => {
    if (activeTab === 'import') {
      loadTestPapers();
    }
  }, [activeTab]);

  const loadTestPapers = async () => {
    setImportLoading(true);
    try {
      const papers = await getTestPapers();
      // Filter by grade level and subject if provided
      let filtered = papers;
      if (gradeLevel) {
        filtered = filtered.filter(p => p.grade_level === gradeLevel);
      }
      if (subject) {
        filtered = filtered.filter(p => p.subject === subject);
      }
      setAvailableTestPapers(filtered);
    } catch (error) {
      console.error('Error loading test papers:', error);
    }
    setImportLoading(false);
  };

  // Validation stats
  const validationStats = useMemo(() => {
    const answered = answerKey.filter(item => item.correctAnswer !== null).length;
    const unanswered = answerKey.filter(item => item.correctAnswer === null).length;
    const multipleCorrect = answerKey.filter(item => item.hasMultipleCorrect).length;
    const totalMarks = answerKey.reduce((sum, item) => sum + item.marks, 0);
    
    return {
      answered,
      unanswered,
      multipleCorrect,
      totalMarks,
      isComplete: unanswered === 0,
      percentage: Math.round((answered / answerKey.length) * 100)
    };
  }, [answerKey]);

  // Handle answer selection
  const handleAnswerSelect = (questionNumber: number, answer: string) => {
    setAnswerKey(prev => prev.map(item => {
      if (item.questionNumber === questionNumber) {
        return {
          ...item,
          correctAnswer: item.correctAnswer === answer ? null : answer,
          isValid: answer !== null
        };
      }
      return item;
    }));
  };

  // Handle marks change
  const handleMarksChange = (questionNumber: number, marks: number) => {
    setAnswerKey(prev => prev.map(item => {
      if (item.questionNumber === questionNumber) {
        return { ...item, marks: Math.max(1, marks) };
      }
      return item;
    }));
  };

  // Import from test paper
  const handleImportFromPaper = async () => {
    if (!selectedImportPaper) return;
    
    setImportLoading(true);
    try {
      const paper = await getTestPaperWithQuestions(selectedImportPaper);
      if (paper && paper.questions) {
        const importedKey: AnswerKeyItem[] = paper.questions.map((q: any, idx: number) => {
          const correctOption = q.options?.find((opt: any) => opt.is_correct);
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
        
        setAnswerKey(importedKey);
        setActiveTab('editor');
      }
    } catch (error) {
      console.error('Error importing from test paper:', error);
    }
    setImportLoading(false);
  };

  // Bulk set answers
  const handleBulkSetAnswers = () => {
    if (!bulkAnswer) return;
    
    setAnswerKey(prev => prev.map(item => {
      if (item.questionNumber >= bulkStartQuestion && item.questionNumber <= bulkEndQuestion) {
        return {
          ...item,
          correctAnswer: bulkAnswer,
          isValid: true
        };
      }
      return item;
    }));
  };

  // Clear all answers
  const handleClearAll = () => {
    setAnswerKey(prev => prev.map(item => ({
      ...item,
      correctAnswer: null,
      isValid: false
    })));
  };

  // Save answer key
  const handleSave = async () => {
    setShowValidation(true);
    
    if (!validationStats.isComplete) {
      return;
    }
    
    setIsSaving(true);
    try {
      await onSave(answerKey);
      onClose();
    } catch (error) {
      console.error('Error saving answer key:', error);
    }
    setIsSaving(false);
  };

  // Export as JSON
  const handleExportJSON = () => {
    const exportData = {
      testPaperId,
      testPaperTitle,
      totalQuestions: answerKey.length,
      totalMarks: validationStats.totalMarks,
      exportedAt: new Date().toISOString(),
      answers: answerKey.map(item => ({
        questionNumber: item.questionNumber,
        correctAnswer: item.correctAnswer,
        marks: item.marks,
        indicatorCode: item.indicatorCode
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `answer-key-${testPaperTitle || 'export'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import from JSON
  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.answers && Array.isArray(data.answers)) {
          setAnswerKey(prev => prev.map(item => {
            const imported = data.answers.find((a: any) => a.questionNumber === item.questionNumber);
            if (imported) {
              return {
                ...item,
                correctAnswer: imported.correctAnswer,
                marks: imported.marks || item.marks,
                isValid: imported.correctAnswer !== null
              };
            }
            return item;
          }));
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    };
    reader.readAsText(file);
  };

  // Render bubble for an option
  const renderBubble = (questionNumber: number, option: string, isSelected: boolean, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-6 h-6 text-xs',
      md: 'w-8 h-8 text-sm',
      lg: 'w-10 h-10 text-base'
    };
    
    return (
      <button
        key={option}
        onClick={() => handleAnswerSelect(questionNumber, option)}
        className={`
          ${sizeClasses[size]} rounded-full border-2 font-semibold
          flex items-center justify-center transition-all duration-200
          ${isSelected 
            ? 'bg-emerald-600 border-emerald-600 text-white shadow-md scale-110' 
            : 'bg-white border-gray-300 text-gray-600 hover:border-emerald-400 hover:bg-emerald-50'
          }
        `}
      >
        {option}
      </button>
    );
  };

  // Render grid view
  const renderGridView = () => {
    const questionsPerRow = 5;
    const rows = Math.ceil(answerKey.length / questionsPerRow);
    
    return (
      <div className="space-y-4">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-5 gap-3">
            {answerKey
              .slice(rowIndex * questionsPerRow, (rowIndex + 1) * questionsPerRow)
              .map(item => (
                <div
                  key={item.questionNumber}
                  className={`
                    p-3 rounded-lg border-2 transition-all cursor-pointer
                    ${selectedQuestion === item.questionNumber 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : item.correctAnswer 
                        ? 'border-emerald-200 bg-emerald-50' 
                        : showValidation && !item.correctAnswer
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                    }
                  `}
                  onClick={() => setSelectedQuestion(item.questionNumber)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-700">Q{item.questionNumber}</span>
                    {item.correctAnswer ? (
                      <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                        {item.correctAnswer}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-gray-400">
                        --
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1 justify-center">
                    {item.options.map(option => 
                      renderBubble(item.questionNumber, option, item.correctAnswer === option, 'sm')
                    )}
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    );
  };

  // Render list view
  const renderListView = () => {
    return (
      <div className="space-y-2">
        {answerKey.map(item => (
          <div
            key={item.questionNumber}
            className={`
              p-4 rounded-lg border-2 transition-all
              ${item.correctAnswer 
                ? 'border-emerald-200 bg-emerald-50' 
                : showValidation && !item.correctAnswer
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 bg-white'
              }
            `}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-16">
                <span className="font-bold text-lg text-gray-700">Q{item.questionNumber}</span>
                <div className="mt-1">
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={item.marks}
                    onChange={(e) => handleMarksChange(item.questionNumber, parseInt(e.target.value) || 1)}
                    className="w-14 h-7 text-xs text-center"
                  />
                  <span className="text-xs text-gray-500 block">marks</span>
                </div>
              </div>
              
              <div className="flex-1">
                {item.questionText && item.questionText !== `Question ${item.questionNumber}` && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.questionText}</p>
                )}
                {item.indicatorCode && (
                  <Badge variant="outline" className="text-xs mb-2 bg-purple-50 text-purple-700">
                    <Target className="w-3 h-3 mr-1" />
                    {item.indicatorCode}
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                {item.options.map(option => 
                  renderBubble(item.questionNumber, option, item.correctAnswer === option, 'md')
                )}
              </div>
              
              <div className="flex-shrink-0 w-8">
                {item.correctAnswer ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                ) : showValidation ? (
                  <XCircle className="w-6 h-6 text-red-500" />
                ) : (
                  <HelpCircle className="w-6 h-6 text-gray-300" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render OMR-style preview
  const renderOMRPreview = () => {
    const columns = 2;
    const questionsPerColumn = Math.ceil(answerKey.length / columns);
    
    return (
      <div className="bg-white p-6 rounded-lg border-2 border-gray-300 shadow-inner">
        {/* Header */}
        <div className="text-center mb-6 pb-4 border-b-2 border-gray-300">
          <h2 className="text-xl font-bold text-gray-800">ANSWER KEY</h2>
          {testPaperTitle && (
            <p className="text-sm text-gray-600 mt-1">{testPaperTitle}</p>
          )}
          <div className="flex justify-center gap-6 mt-3 text-sm text-gray-600">
            <span>Total Questions: <strong>{answerKey.length}</strong></span>
            <span>Total Marks: <strong>{validationStats.totalMarks}</strong></span>
          </div>
        </div>
        
        {/* Answer Grid */}
        <div className="grid grid-cols-2 gap-8">
          {Array.from({ length: columns }, (_, colIndex) => (
            <div key={colIndex} className="space-y-1">
              {/* Column Header */}
              <div className="grid grid-cols-6 gap-1 text-center text-xs font-semibold text-gray-600 mb-2 pb-1 border-b">
                <span>Q#</span>
                {OPTION_LABELS.slice(0, optionsPerQuestion).map(opt => (
                  <span key={opt}>{opt}</span>
                ))}
              </div>
              
              {/* Questions */}
              {answerKey
                .slice(colIndex * questionsPerColumn, (colIndex + 1) * questionsPerColumn)
                .map(item => (
                  <div key={item.questionNumber} className="grid grid-cols-6 gap-1 items-center">
                    <span className="text-sm font-medium text-gray-700 text-center">
                      {item.questionNumber}
                    </span>
                    {item.options.map(option => (
                      <div key={option} className="flex justify-center">
                        <div
                          className={`
                            w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs
                            ${item.correctAnswer === option
                              ? 'bg-gray-800 border-gray-800 text-white'
                              : 'bg-white border-gray-400'
                            }
                          `}
                        >
                          {item.correctAnswer === option && '●'}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="mt-6 pt-4 border-t-2 border-gray-300 text-center text-xs text-gray-500">
          <p>Generated on {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-6 h-6 text-emerald-600" />
            Answer Key Editor
            {testPaperTitle && (
              <Badge variant="outline" className="ml-2 font-normal">
                {testPaperTitle}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto flex-shrink-0">
            <TabsTrigger value="editor" className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Import
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          {/* Editor Tab */}
          <TabsContent value="editor" className="flex-1 overflow-hidden flex flex-col mt-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Progress */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${validationStats.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">
                    {validationStats.answered}/{answerKey.length}
                  </span>
                </div>
                
                {validationStats.isComplete ? (
                  <Badge className="bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Complete
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 border-amber-300">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {validationStats.unanswered} unanswered
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={handleClearAll}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Clear all answers</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={handleExportJSON}>
                        <FileDown className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Export as JSON</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Bulk Edit Panel */}
            <Card className="p-3 mb-4 bg-gray-50 flex-shrink-0">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Bulk Set:</span>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-gray-500">From Q</Label>
                  <Input
                    type="number"
                    min={1}
                    max={answerKey.length}
                    value={bulkStartQuestion}
                    onChange={(e) => setBulkStartQuestion(parseInt(e.target.value) || 1)}
                    className="w-16 h-8"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-gray-500">To Q</Label>
                  <Input
                    type="number"
                    min={1}
                    max={answerKey.length}
                    value={bulkEndQuestion}
                    onChange={(e) => setBulkEndQuestion(parseInt(e.target.value) || answerKey.length)}
                    className="w-16 h-8"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-gray-500">Answer</Label>
                  <Select value={bulkAnswer} onValueChange={setBulkAnswer}>
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue placeholder="--" />
                    </SelectTrigger>
                    <SelectContent>
                      {OPTION_LABELS.slice(0, optionsPerQuestion).map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button size="sm" onClick={handleBulkSetAnswers} disabled={!bulkAnswer}>
                  Apply
                </Button>
              </div>
            </Card>

            {/* Answer Key Grid/List */}
            <ScrollArea className="flex-1">
              <div className="pr-4">
                {viewMode === 'grid' ? renderGridView() : renderListView()}
              </div>
            </ScrollArea>

            {/* Validation Warning */}
            {showValidation && !validationStats.isComplete && (
              <Alert variant="destructive" className="mt-4 flex-shrink-0">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  Please mark correct answers for all questions before saving. 
                  {validationStats.unanswered} question(s) still need answers.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="flex-1 overflow-auto mt-4">
            <div className="space-y-6">
              {/* Import from Test Paper */}
              <Card className="p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Import from Existing Test Paper
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select a test paper to automatically import its answer key based on the correct options marked in the questions.
                </p>
                
                {importLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Loading test papers...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Select value={selectedImportPaper} onValueChange={setSelectedImportPaper}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a test paper to import from..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTestPapers.map(paper => (
                          <SelectItem key={paper.id} value={paper.id}>
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <span>{paper.title}</span>
                              <Badge variant="outline" className="text-xs ml-2">
                                {paper.grade_level}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      onClick={handleImportFromPaper} 
                      disabled={!selectedImportPaper || importLoading}
                      className="w-full"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Import Answer Key
                    </Button>
                  </div>
                )}
              </Card>

              {/* Import from JSON */}
              <Card className="p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FileUp className="w-5 h-5 text-purple-600" />
                  Import from JSON File
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Upload a previously exported answer key JSON file to restore your answers.
                </p>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJSON}
                    className="hidden"
                    id="json-import"
                  />
                  <label htmlFor="json-import" className="cursor-pointer">
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      JSON files only
                    </p>
                  </label>
                </div>
              </Card>

              {/* Quick Fill Patterns */}
              <Card className="p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-amber-600" />
                  Quick Fill Patterns
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Use these patterns for testing or as a starting point.
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAnswerKey(prev => prev.map((item, idx) => ({
                        ...item,
                        correctAnswer: OPTION_LABELS[idx % optionsPerQuestion],
                        isValid: true
                      })));
                    }}
                  >
                    Sequential (A, B, C, D...)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAnswerKey(prev => prev.map(item => ({
                        ...item,
                        correctAnswer: OPTION_LABELS[Math.floor(Math.random() * optionsPerQuestion)],
                        isValid: true
                      })));
                    }}
                  >
                    Random Fill
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAnswerKey(prev => prev.map(item => ({
                        ...item,
                        correctAnswer: 'A',
                        isValid: true
                      })));
                    }}
                  >
                    All A
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAnswerKey(prev => prev.map(item => ({
                        ...item,
                        correctAnswer: 'C',
                        isValid: true
                      })));
                    }}
                  >
                    All C
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="flex-1 overflow-auto mt-4">
            <div className="space-y-4">
              {/* Preview Actions */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-gray-600" />
                  OMR-Style Answer Key Preview
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => window.print()}>
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportJSON}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
              
              {/* OMR Preview */}
              {renderOMRPreview()}
              
              {/* Statistics */}
              <Card className="p-4 bg-gray-50">
                <h4 className="font-medium text-gray-700 mb-3">Answer Distribution</h4>
                <div className="grid grid-cols-4 gap-4">
                  {OPTION_LABELS.slice(0, optionsPerQuestion).map(option => {
                    const count = answerKey.filter(item => item.correctAnswer === option).length;
                    const percentage = Math.round((count / answerKey.length) * 100);
                    
                    return (
                      <div key={option} className="text-center">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 font-bold text-lg flex items-center justify-center mx-auto mb-1">
                          {option}
                        </div>
                        <p className="text-sm font-medium text-gray-700">{count}</p>
                        <p className="text-xs text-gray-500">{percentage}%</p>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex-shrink-0 mt-4 pt-4 border-t">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{validationStats.answered}</span> of{' '}
              <span className="font-medium">{answerKey.length}</span> questions answered
              {' '}•{' '}
              Total: <span className="font-medium">{validationStats.totalMarks}</span> marks
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Answer Key
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
