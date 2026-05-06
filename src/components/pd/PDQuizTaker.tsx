import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Clock, AlertCircle, CheckCircle, XCircle, ArrowLeft, ArrowRight,
  Loader2, Trophy, RefreshCw, Eye, ChevronLeft, ChevronRight,
  ListChecks, ToggleLeft, MessageSquare, HelpCircle
} from 'lucide-react';
import { QuizQuestion, QuizSettings, QuizAttempt, QuizAnswer, DEFAULT_QUIZ_SETTINGS } from '@/types/pd-quiz';
import {
  getQuizQuestions, getQuizSettings, getQuizAttempts, getPassedAttempt,
  startQuizAttempt, submitQuizAttempt, gradeQuiz, shuffleArray
} from '@/lib/supabase-quiz';

interface PDQuizTakerProps {
  moduleId: string;
  moduleName: string;
  enrollmentId?: string;
  onComplete: (passed: boolean) => void;
  onClose: () => void;
}

type QuizPhase = 'intro' | 'taking' | 'results' | 'review';

export const PDQuizTaker: React.FC<PDQuizTakerProps> = ({
  moduleId,
  moduleName,
  enrollmentId,
  onComplete,
  onClose
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<QuizPhase>('intro');
  
  // Quiz data
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [settings, setSettings] = useState<QuizSettings | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [passedAttempt, setPassedAttempt] = useState<QuizAttempt | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(null);
  
  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  
  // Results
  const [results, setResults] = useState<{
    gradedAnswers: QuizAnswer[];
    correctCount: number;
    totalPoints: number;
    earnedPoints: number;
    scorePercent: number;
    passed: boolean;
  } | null>(null);
  
  // Review state
  const [reviewQuestionIndex, setReviewQuestionIndex] = useState(0);

  useEffect(() => {
    loadQuizData();
  }, [moduleId]);

  // Timer effect
  useEffect(() => {
    if (phase !== 'taking' || timeRemaining === null) return;
    
    if (timeRemaining <= 0) {
      handleSubmit();
      return;
    }
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [phase, timeRemaining]);

  const loadQuizData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [questionsData, settingsData, attemptsData, passedData] = await Promise.all([
        getQuizQuestions(moduleId),
        getQuizSettings(moduleId),
        getQuizAttempts(moduleId, user.id),
        getPassedAttempt(moduleId, user.id)
      ]);
      
      setQuestions(questionsData);
      setSettings(settingsData || { ...DEFAULT_QUIZ_SETTINGS, id: '', module_id: moduleId, created_at: '', updated_at: '' } as QuizSettings);
      setAttempts(attemptsData);
      setPassedAttempt(passedData);
      
      // If already passed, show results
      if (passedData) {
        setResults({
          gradedAnswers: passedData.answers,
          correctCount: passedData.correct_answers,
          totalPoints: passedData.total_questions,
          earnedPoints: passedData.correct_answers,
          scorePercent: passedData.score_percent,
          passed: true
        });
        setPhase('results');
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const canRetake = useCallback(() => {
    if (!settings) return true;
    if (settings.max_attempts === 0) return true; // Unlimited
    return attempts.filter(a => a.status === 'completed').length < settings.max_attempts;
  }, [settings, attempts]);

  const attemptsRemaining = useCallback(() => {
    if (!settings || settings.max_attempts === 0) return 'Unlimited';
    const completed = attempts.filter(a => a.status === 'completed').length;
    return settings.max_attempts - completed;
  }, [settings, attempts]);

  const handleStartQuiz = async () => {
    if (!user?.id) return;
    
    try {
      // Prepare questions (shuffle if needed)
      let quizQuestions = [...questions];
      if (settings?.shuffle_questions) {
        quizQuestions = shuffleArray(quizQuestions);
      }
      if (settings?.shuffle_options) {
        quizQuestions = quizQuestions.map(q => ({
          ...q,
          options: q.question_type === 'multiple_choice' ? shuffleArray(q.options) : q.options
        }));
      }
      setQuestions(quizQuestions);
      
      // Start attempt
      const attempt = await startQuizAttempt(moduleId, user.id, enrollmentId, quizQuestions.length);
      setCurrentAttempt(attempt);
      
      // Set timer if applicable
      if (settings?.time_limit_minutes) {
        setTimeRemaining(settings.time_limit_minutes * 60);
      }
      
      setStartTime(new Date());
      setCurrentQuestionIndex(0);
      setAnswers({});
      setPhase('taking');
    } catch (error) {
      console.error('Error starting quiz:', error);
    }
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (!currentAttempt || submitting) return;
    
    setSubmitting(true);
    try {
      // Grade the quiz
      const { gradedAnswers, correctCount, totalPoints, earnedPoints } = gradeQuiz(questions, answers);
      const scorePercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
      const passed = scorePercent >= (settings?.passing_score || 70);
      
      // Calculate time spent
      const timeSpentSeconds = startTime 
        ? Math.round((new Date().getTime() - startTime.getTime()) / 1000)
        : undefined;
      
      // Submit attempt
      await submitQuizAttempt(
        currentAttempt.id,
        gradedAnswers,
        questions.length,
        correctCount,
        scorePercent,
        passed,
        timeSpentSeconds
      );
      
      setResults({
        gradedAnswers,
        correctCount,
        totalPoints,
        earnedPoints,
        scorePercent,
        passed
      });
      
      // Reload attempts
      if (user?.id) {
        const newAttempts = await getQuizAttempts(moduleId, user.id);
        setAttempts(newAttempts);
      }
      
      setPhase('results');
      
      // Notify parent of completion
      onComplete(passed);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
          <h3 className="text-lg font-semibold mb-2">No Questions Available</h3>
          <p className="text-gray-500 mb-4">This quiz doesn't have any questions yet.</p>
          <Button variant="outline" onClick={onClose}>Go Back</Button>
        </CardContent>
      </Card>
    );
  }

  // Intro Phase
  if (phase === 'intro') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{moduleName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Questions</p>
              <p className="text-2xl font-bold">{questions.length}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Passing Score</p>
              <p className="text-2xl font-bold">{settings?.passing_score || 70}%</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Time Limit</p>
              <p className="text-2xl font-bold">
                {settings?.time_limit_minutes ? `${settings.time_limit_minutes} min` : 'None'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Attempts Remaining</p>
              <p className="text-2xl font-bold">{attemptsRemaining()}</p>
            </div>
          </div>

          {attempts.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Previous Attempts</h4>
              <div className="space-y-2">
                {attempts.slice(0, 3).map((attempt, index) => (
                  <div key={attempt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {attempt.passed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">Attempt {attempts.length - index}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(attempt.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                        {attempt.score_percent}%
                      </p>
                      <p className="text-xs text-gray-500">
                        {attempt.correct_answers}/{attempt.total_questions} correct
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            {canRetake() ? (
              <Button onClick={handleStartQuiz} className="flex-1">
                {attempts.length > 0 ? 'Retake Quiz' : 'Start Quiz'}
              </Button>
            ) : (
              <Button disabled className="flex-1">
                No Attempts Remaining
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Taking Phase
  if (phase === 'taking') {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    const Icon = getQuestionTypeIcon(currentQuestion.question_type);

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <Progress value={progress} className="w-32 h-2" />
          </div>
          {timeRemaining !== null && (
            <Badge variant={timeRemaining < 60 ? 'destructive' : 'secondary'} className="text-lg px-3 py-1">
              <Clock className="w-4 h-4 mr-2" />
              {formatTime(timeRemaining)}
            </Badge>
          )}
        </div>

        {/* Question Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Icon className="w-4 h-4 text-blue-600" />
              </div>
              <Badge variant="outline" className="capitalize">
                {currentQuestion.question_type.replace('_', ' ')}
              </Badge>
              <Badge variant="secondary">{currentQuestion.points} pt{currentQuestion.points !== 1 ? 's' : ''}</Badge>
            </div>

            <h3 className="text-lg font-medium mb-6">{currentQuestion.question_text}</h3>

            {/* Multiple Choice */}
            {currentQuestion.question_type === 'multiple_choice' && (
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
                className="space-y-3"
              >
                {currentQuestion.options.map((option) => (
                  <div
                    key={option.id}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      answers[currentQuestion.id] === option.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleAnswer(currentQuestion.id, option.id)}
                  >
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {/* True/False */}
            {currentQuestion.question_type === 'true_false' && (
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
                className="space-y-3"
              >
                {['true', 'false'].map((value) => (
                  <div
                    key={value}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      answers[currentQuestion.id] === value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleAnswer(currentQuestion.id, value)}
                  >
                    <RadioGroupItem value={value} id={value} />
                    <Label htmlFor={value} className="flex-1 cursor-pointer capitalize">
                      {value}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {/* Short Answer */}
            {currentQuestion.question_type === 'short_answer' && (
              <Input
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                placeholder="Type your answer here"
                className="text-lg p-4"
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-blue-500 text-white'
                    : answers[questions[index].id]
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Submit Quiz
            </Button>
          ) : (
            <Button onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Results Phase
  if (phase === 'results' && results) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          {results.passed ? (
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-green-600" />
            </div>
          ) : (
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
          )}

          <h2 className="text-2xl font-bold mb-2">
            {results.passed ? 'Congratulations!' : 'Keep Trying!'}
          </h2>
          <p className="text-gray-500 mb-6">
            {results.passed 
              ? 'You passed the quiz!' 
              : `You need ${settings?.passing_score || 70}% to pass.`}
          </p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className={`text-3xl font-bold ${results.passed ? 'text-green-600' : 'text-red-600'}`}>
                {results.scorePercent}%
              </p>
              <p className="text-sm text-gray-500">Score</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold">{results.correctCount}</p>
              <p className="text-sm text-gray-500">Correct</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold">{questions.length - results.correctCount}</p>
              <p className="text-sm text-gray-500">Incorrect</p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={onClose}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Course
            </Button>
            {settings?.allow_review && (
              <Button variant="outline" onClick={() => { setReviewQuestionIndex(0); setPhase('review'); }}>
                <Eye className="w-4 h-4 mr-2" />
                Review Answers
              </Button>
            )}
            {!results.passed && canRetake() && (
              <Button onClick={handleStartQuiz}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Review Phase
  if (phase === 'review' && results) {
    const currentQuestion = questions[reviewQuestionIndex];
    const answer = results.gradedAnswers.find(a => a.question_id === currentQuestion.id);
    const Icon = getQuestionTypeIcon(currentQuestion.question_type);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setPhase('results')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </Button>
          <span className="text-sm text-gray-500">
            Question {reviewQuestionIndex + 1} of {questions.length}
          </span>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Icon className="w-4 h-4 text-blue-600" />
              </div>
              {answer?.is_correct ? (
                <Badge className="bg-green-500">Correct</Badge>
              ) : (
                <Badge variant="destructive">Incorrect</Badge>
              )}
            </div>

            <h3 className="text-lg font-medium mb-6">{currentQuestion.question_text}</h3>

            {/* Show answers */}
            {currentQuestion.question_type === 'multiple_choice' && (
              <div className="space-y-3">
                {currentQuestion.options.map((option) => {
                  const isUserAnswer = answer?.answer === option.id;
                  const isCorrect = option.is_correct;
                  
                  return (
                    <div
                      key={option.id}
                      className={`p-4 rounded-lg border-2 ${
                        isCorrect
                          ? 'border-green-500 bg-green-50'
                          : isUserAnswer
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : isUserAnswer ? (
                          <XCircle className="w-5 h-5 text-red-500" />
                        ) : (
                          <div className="w-5 h-5" />
                        )}
                        <span>{option.text}</span>
                        {isUserAnswer && !isCorrect && (
                          <Badge variant="outline" className="ml-auto">Your answer</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {currentQuestion.question_type === 'true_false' && (
              <div className="space-y-3">
                {['true', 'false'].map((value) => {
                  const isUserAnswer = answer?.answer === value;
                  const isCorrect = currentQuestion.correct_answer === value;
                  
                  return (
                    <div
                      key={value}
                      className={`p-4 rounded-lg border-2 capitalize ${
                        isCorrect
                          ? 'border-green-500 bg-green-50'
                          : isUserAnswer
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : isUserAnswer ? (
                          <XCircle className="w-5 h-5 text-red-500" />
                        ) : (
                          <div className="w-5 h-5" />
                        )}
                        <span>{value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {currentQuestion.question_type === 'short_answer' && (
              <div className="space-y-3">
                <div className={`p-4 rounded-lg border-2 ${
                  answer?.is_correct ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                }`}>
                  <p className="text-sm text-gray-500 mb-1">Your answer:</p>
                  <p className="font-medium">{answer?.answer || '(no answer)'}</p>
                </div>
                {!answer?.is_correct && settings?.show_correct_answers && (
                  <div className="p-4 rounded-lg border-2 border-green-500 bg-green-50">
                    <p className="text-sm text-gray-500 mb-1">Correct answer:</p>
                    <p className="font-medium">{currentQuestion.correct_answer}</p>
                  </div>
                )}
              </div>
            )}

            {/* Explanation */}
            {currentQuestion.explanation && settings?.show_correct_answers && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-700 mb-1">Explanation:</p>
                <p className="text-sm text-blue-600">{currentQuestion.explanation}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setReviewQuestionIndex(prev => prev - 1)}
            disabled={reviewQuestionIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {questions.map((q, index) => {
              const qAnswer = results.gradedAnswers.find(a => a.question_id === q.id);
              return (
                <button
                  key={index}
                  onClick={() => setReviewQuestionIndex(index)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    index === reviewQuestionIndex
                      ? 'bg-blue-500 text-white'
                      : qAnswer?.is_correct
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          <Button
            variant="outline"
            onClick={() => setReviewQuestionIndex(prev => prev + 1)}
            disabled={reviewQuestionIndex === questions.length - 1}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default PDQuizTaker;
