import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Star, Trophy, Sparkles } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizSlideProps {
  questions: QuizQuestion[];
}

export const QuizSlide: React.FC<QuizSlideProps> = ({ questions }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setShowResult(true);
    if (index === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
  };

  const isComplete = currentQuestion === questions.length - 1 && showResult;

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-center gap-4 bg-gradient-to-r from-purple-400 to-pink-400 text-white px-8 py-4 rounded-full text-3xl font-black shadow-xl">
        <Star className="w-8 h-8 fill-white" />
        Question {currentQuestion + 1} of {questions.length}
      </div>
      <h2 className="text-6xl font-black text-purple-600 mb-10 text-center leading-tight">
        {questions[currentQuestion].question}
      </h2>
      <div className="space-y-6">
        {questions[currentQuestion].options.map((option, index) => (
          <button
            key={index}
            onClick={() => !showResult && handleAnswer(index)}
            disabled={showResult}
            className={`w-full text-left p-8 rounded-[2rem] text-3xl font-black transition-all transform hover:scale-105 shadow-xl border-4 ${
              showResult
                ? index === questions[currentQuestion].correctAnswer
                  ? 'bg-gradient-to-r from-green-400 to-green-600 text-white border-green-700'
                  : index === selectedAnswer
                  ? 'bg-gradient-to-r from-red-400 to-red-600 text-white border-red-700'
                  : 'bg-gray-200 text-gray-500 border-gray-300'
                : 'bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white border-purple-600'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      {showResult && (
        <div className="mt-10">
          {isComplete ? (
            <div className="text-center bg-gradient-to-br from-yellow-200 to-orange-200 rounded-[3rem] p-12 border-8 border-yellow-400 shadow-2xl">
              <Trophy className="w-32 h-32 text-yellow-600 mx-auto mb-6 animate-bounce" />
              <div className="text-7xl font-black text-orange-600 mb-6">
                Great Job!
              </div>
              <div className="text-5xl text-purple-700 mb-10 font-black">
                You got {score} out of {questions.length} correct!
              </div>
              <Button onClick={resetQuiz} size="lg" className="text-3xl px-16 py-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full font-black shadow-xl transform hover:scale-110 transition-all">
                <Sparkles className="mr-3 w-8 h-8" />
                Try Again!
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <Button onClick={nextQuestion} size="lg" className="text-3xl px-16 py-8 bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white rounded-full font-black shadow-xl transform hover:scale-110 transition-all">
                Next Question
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
