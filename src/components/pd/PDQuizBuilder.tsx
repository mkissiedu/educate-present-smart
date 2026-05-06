import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus, Trash2, Edit, Save, GripVertical, ChevronUp, ChevronDown,
  CheckCircle, XCircle, HelpCircle, Settings, Loader2, AlertCircle,
  ListChecks, ToggleLeft, MessageSquare
} from 'lucide-react';
import { QuizQuestion, QuizOption, QuizSettings, DEFAULT_QUIZ_SETTINGS } from '@/types/pd-quiz';
import {
  getQuizQuestions, createQuizQuestion, updateQuizQuestion, deleteQuizQuestion,
  getQuizSettings, createOrUpdateQuizSettings, getQuizStatistics
} from '@/lib/supabase-quiz';

interface PDQuizBuilderProps {
  moduleId: string;
  moduleName: string;
  onClose: () => void;
}

export const PDQuizBuilder: React.FC<PDQuizBuilderProps> = ({ moduleId, moduleName, onClose }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [settings, setSettings] = useState<QuizSettings | null>(null);
  const [statistics, setStatistics] = useState<{
    totalAttempts: number;
    passedAttempts: number;
    averageScore: number;
    averageTimeSeconds: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('questions');
  
  // Question modal state
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [questionForm, setQuestionForm] = useState({
    question_type: 'multiple_choice' as 'multiple_choice' | 'true_false' | 'short_answer',
    question_text: '',
    options: [
      { id: '1', text: '', is_correct: false },
      { id: '2', text: '', is_correct: false },
      { id: '3', text: '', is_correct: false },
      { id: '4', text: '', is_correct: false }
    ] as QuizOption[],
    correct_answer: '',
    points: 1,
    explanation: ''
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    passing_score: 70,
    max_attempts: 3,
    time_limit_minutes: '',
    shuffle_questions: false,
    shuffle_options: false,
    show_correct_answers: true,
    allow_review: true
  });

  useEffect(() => {
    loadData();
  }, [moduleId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [questionsData, settingsData, statsData] = await Promise.all([
        getQuizQuestions(moduleId),
        getQuizSettings(moduleId),
        getQuizStatistics(moduleId)
      ]);
      
      setQuestions(questionsData);
      setSettings(settingsData);
      setStatistics(statsData);
      
      if (settingsData) {
        setSettingsForm({
          passing_score: settingsData.passing_score,
          max_attempts: settingsData.max_attempts,
          time_limit_minutes: settingsData.time_limit_minutes?.toString() || '',
          shuffle_questions: settingsData.shuffle_questions,
          shuffle_options: settingsData.shuffle_options,
          show_correct_answers: settingsData.show_correct_answers,
          allow_review: settingsData.allow_review
        });
      }
    } catch (error) {
      console.error('Error loading quiz data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionForm({
      question_type: 'multiple_choice',
      question_text: '',
      options: [
        { id: '1', text: '', is_correct: false },
        { id: '2', text: '', is_correct: false },
        { id: '3', text: '', is_correct: false },
        { id: '4', text: '', is_correct: false }
      ],
      correct_answer: '',
      points: 1,
      explanation: ''
    });
    setShowQuestionModal(true);
  };

  const handleEditQuestion = (question: QuizQuestion) => {
    setEditingQuestion(question);
    setQuestionForm({
      question_type: question.question_type,
      question_text: question.question_text,
      options: question.options.length > 0 ? question.options : [
        { id: '1', text: '', is_correct: false },
        { id: '2', text: '', is_correct: false },
        { id: '3', text: '', is_correct: false },
        { id: '4', text: '', is_correct: false }
      ],
      correct_answer: question.correct_answer || '',
      points: question.points,
      explanation: question.explanation || ''
    });
    setShowQuestionModal(true);
  };

  const handleSaveQuestion = async () => {
    if (!questionForm.question_text.trim()) return;
    
    setSaving(true);
    try {
      const questionData = {
        module_id: moduleId,
        question_type: questionForm.question_type,
        question_text: questionForm.question_text,
        options: questionForm.question_type === 'multiple_choice' ? questionForm.options : [],
        correct_answer: questionForm.question_type !== 'multiple_choice' ? questionForm.correct_answer : undefined,
        points: questionForm.points,
        explanation: questionForm.explanation || undefined,
        order_index: editingQuestion?.order_index ?? questions.length
      };

      if (editingQuestion) {
        await updateQuizQuestion(editingQuestion.id, questionData);
      } else {
        await createQuizQuestion(questionData);
      }
      
      await loadData();
      setShowQuestionModal(false);
    } catch (error) {
      console.error('Error saving question:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    
    try {
      await deleteQuizQuestion(questionId);
      await loadData();
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const handleMoveQuestion = async (questionId: string, direction: 'up' | 'down') => {
    const index = questions.findIndex(q => q.id === questionId);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;

    try {
      await updateQuizQuestion(questions[index].id, { order_index: newIndex });
      await updateQuizQuestion(questions[newIndex].id, { order_index: index });
      await loadData();
    } catch (error) {
      console.error('Error reordering questions:', error);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await createOrUpdateQuizSettings(moduleId, {
        passing_score: settingsForm.passing_score,
        max_attempts: settingsForm.max_attempts,
        time_limit_minutes: settingsForm.time_limit_minutes ? parseInt(settingsForm.time_limit_minutes) : undefined,
        shuffle_questions: settingsForm.shuffle_questions,
        shuffle_options: settingsForm.shuffle_options,
        show_correct_answers: settingsForm.show_correct_answers,
        allow_review: settingsForm.allow_review
      });
      await loadData();
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleOptionChange = (index: number, field: 'text' | 'is_correct', value: string | boolean) => {
    const newOptions = [...questionForm.options];
    if (field === 'is_correct') {
      // Only one option can be correct
      newOptions.forEach((opt, i) => {
        opt.is_correct = i === index;
      });
    } else {
      newOptions[index] = { ...newOptions[index], [field]: value };
    }
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  const addOption = () => {
    const newId = String(questionForm.options.length + 1);
    setQuestionForm({
      ...questionForm,
      options: [...questionForm.options, { id: newId, text: '', is_correct: false }]
    });
  };

  const removeOption = (index: number) => {
    if (questionForm.options.length <= 2) return;
    const newOptions = questionForm.options.filter((_, i) => i !== index);
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple_choice': return ListChecks;
      case 'true_false': return ToggleLeft;
      case 'short_answer': return MessageSquare;
      default: return HelpCircle;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Quiz Builder</h2>
          <p className="text-sm text-gray-500">{moduleName}</p>
        </div>
        <Button variant="outline" onClick={onClose}>
          Done
        </Button>
      </div>

      {/* Statistics */}
      {statistics && statistics.totalAttempts > 0 && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{statistics.totalAttempts}</p>
              <p className="text-xs text-gray-500">Total Attempts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{statistics.passedAttempts}</p>
              <p className="text-xs text-gray-500">Passed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{statistics.averageScore}%</p>
              <p className="text-xs text-gray-500">Avg Score</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{Math.round(statistics.averageTimeSeconds / 60)}m</p>
              <p className="text-xs text-gray-500">Avg Time</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="questions">
            Questions ({questions.length})
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={handleAddQuestion}>
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>

          {questions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No questions yet. Add your first question to get started.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {questions.map((question, index) => {
                const Icon = getQuestionTypeIcon(question.question_type);
                return (
                  <Card key={question.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleMoveQuestion(question.id, 'up')}
                            disabled={index === 0}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleMoveQuestion(question.id, 'down')}
                            disabled={index === questions.length - 1}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs capitalize">
                              {question.question_type.replace('_', ' ')}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {question.points} pt{question.points !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          <p className="font-medium">{question.question_text}</p>
                          {question.question_type === 'multiple_choice' && (
                            <div className="mt-2 space-y-1">
                              {question.options.map((option, optIndex) => (
                                <div key={option.id} className="flex items-center gap-2 text-sm">
                                  {option.is_correct ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-gray-300" />
                                  )}
                                  <span className={option.is_correct ? 'text-green-700 font-medium' : 'text-gray-600'}>
                                    {option.text || `Option ${optIndex + 1}`}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          {question.question_type === 'true_false' && (
                            <p className="text-sm text-green-600 mt-1">
                              Answer: {question.correct_answer}
                            </p>
                          )}
                          {question.question_type === 'short_answer' && (
                            <p className="text-sm text-green-600 mt-1">
                              Answer: {question.correct_answer}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditQuestion(question)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500"
                            onClick={() => handleDeleteQuestion(question.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quiz Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Passing Score (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={settingsForm.passing_score}
                    onChange={(e) => setSettingsForm({ ...settingsForm, passing_score: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Teachers must score at least this percentage to pass
                  </p>
                </div>
                <div>
                  <Label>Maximum Attempts</Label>
                  <Input
                    type="number"
                    min="0"
                    value={settingsForm.max_attempts}
                    onChange={(e) => setSettingsForm({ ...settingsForm, max_attempts: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    0 = unlimited attempts
                  </p>
                </div>
              </div>

              <div>
                <Label>Time Limit (minutes)</Label>
                <Input
                  type="number"
                  min="0"
                  value={settingsForm.time_limit_minutes}
                  onChange={(e) => setSettingsForm({ ...settingsForm, time_limit_minutes: e.target.value })}
                  placeholder="No time limit"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for no time limit
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Shuffle Questions</Label>
                    <p className="text-xs text-gray-500">Randomize question order for each attempt</p>
                  </div>
                  <Switch
                    checked={settingsForm.shuffle_questions}
                    onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, shuffle_questions: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Shuffle Options</Label>
                    <p className="text-xs text-gray-500">Randomize answer options for multiple choice</p>
                  </div>
                  <Switch
                    checked={settingsForm.shuffle_options}
                    onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, shuffle_options: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Correct Answers</Label>
                    <p className="text-xs text-gray-500">Display correct answers after submission</p>
                  </div>
                  <Switch
                    checked={settingsForm.show_correct_answers}
                    onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, show_correct_answers: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Review</Label>
                    <p className="text-xs text-gray-500">Let teachers review their answers after submission</p>
                  </div>
                  <Switch
                    checked={settingsForm.allow_review}
                    onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, allow_review: checked })}
                  />
                </div>
              </div>

              <Button onClick={handleSaveSettings} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Question Modal */}
      <Dialog open={showQuestionModal} onOpenChange={setShowQuestionModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? 'Edit Question' : 'Add Question'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Question Type</Label>
              <select
                value={questionForm.question_type}
                onChange={(e) => setQuestionForm({ 
                  ...questionForm, 
                  question_type: e.target.value as any,
                  correct_answer: e.target.value === 'true_false' ? 'true' : ''
                })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="multiple_choice">Multiple Choice</option>
                <option value="true_false">True/False</option>
                <option value="short_answer">Short Answer</option>
              </select>
            </div>

            <div>
              <Label>Question Text *</Label>
              <Textarea
                value={questionForm.question_text}
                onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                placeholder="Enter your question"
                rows={3}
              />
            </div>

            {questionForm.question_type === 'multiple_choice' && (
              <div>
                <Label>Answer Options</Label>
                <p className="text-xs text-gray-500 mb-2">Click the circle to mark the correct answer</p>
                <div className="space-y-2">
                  {questionForm.options.map((option, index) => (
                    <div key={option.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOptionChange(index, 'is_correct', true)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          option.is_correct 
                            ? 'border-green-500 bg-green-500 text-white' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {option.is_correct && <CheckCircle className="w-4 h-4" />}
                      </button>
                      <Input
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1"
                      />
                      {questionForm.options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(index)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {questionForm.options.length < 6 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    className="mt-2"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Option
                  </Button>
                )}
              </div>
            )}

            {questionForm.question_type === 'true_false' && (
              <div>
                <Label>Correct Answer</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="trueFalse"
                      checked={questionForm.correct_answer === 'true'}
                      onChange={() => setQuestionForm({ ...questionForm, correct_answer: 'true' })}
                    />
                    <span>True</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="trueFalse"
                      checked={questionForm.correct_answer === 'false'}
                      onChange={() => setQuestionForm({ ...questionForm, correct_answer: 'false' })}
                    />
                    <span>False</span>
                  </label>
                </div>
              </div>
            )}

            {questionForm.question_type === 'short_answer' && (
              <div>
                <Label>Correct Answer</Label>
                <Input
                  value={questionForm.correct_answer}
                  onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })}
                  placeholder="Enter the correct answer"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The answer will be compared case-insensitively
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Points</Label>
                <Input
                  type="number"
                  min="1"
                  value={questionForm.points}
                  onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div>
              <Label>Explanation (Optional)</Label>
              <Textarea
                value={questionForm.explanation}
                onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                placeholder="Explain the correct answer (shown after submission)"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuestionModal(false)}>Cancel</Button>
            <Button 
              onClick={handleSaveQuestion} 
              disabled={saving || !questionForm.question_text.trim()}
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PDQuizBuilder;
