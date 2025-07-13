"use client";
import React, { useState } from "react";
import { Code, Play, RotateCcw, CheckCircle, XCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Quiz {
  id: string;
  questions: QuizQuestion[];
  totalQuestions: number;
}

export default function CodingQuiz() {
  const [code, setCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const generateQuiz = async () => {
    if (!code.trim()) {
      toast.error("Please enter some code first");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/coding-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate quiz');
      }

      const data = await response.json();
      
      if (data.success) {
        setQuiz(data.quiz);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setShowResults(false);
        setScore(0);
        toast.success("Quiz generated successfully!");
      } else {
        toast.error(data.error || "Failed to generate quiz");
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast.error("Failed to generate quiz. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const selectAnswer = (questionId: string, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const nextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitQuiz = () => {
    if (!quiz) return;

    let correctAnswers = 0;
    quiz.questions.forEach(question => {
      const selectedAnswer = selectedAnswers[question.id];
      if (selectedAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const finalScore = Math.round((correctAnswers / quiz.questions.length) * 100);
    setScore(finalScore);
    setShowResults(true);
  };

  const resetQuiz = () => {
    setQuiz(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
  };

  const currentQuestion = quiz?.questions[currentQuestionIndex];

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-3">
          <Code className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Coding Quiz</h1>
        </div>
        {quiz && (
          <div className="flex items-center gap-4">
            <Badge variant="secondary">
              Question {currentQuestionIndex + 1} of {quiz.totalQuestions}
            </Badge>
            <Button variant="outline" size="sm" onClick={resetQuiz}>
              <RotateCcw className="w-4 h-4 mr-2" />
              New Quiz
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {!quiz ? (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold">Generate a Coding Quiz</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Paste your code below and get quizzed on it. The AI will generate multiple choice questions 
                to test your understanding of the code's logic, syntax, and concepts.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Code to Quiz On</label>
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your code here... (JavaScript, Python, Java, C++, etc.)"
                  className="min-h-[300px] max-h-[500px] font-mono text-sm resize-none"
                />
              </div>

              <Button 
                onClick={generateQuiz} 
                disabled={isGenerating || !code.trim()}
                className="w-full"
                size="lg"
              >
                <Play className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generating Quiz...' : 'Generate Quiz'}
              </Button>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-2">How it works:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Paste any code snippet (functions, classes, algorithms, etc.)</li>
                <li>• AI generates multiple choice questions about the code</li>
                <li>• Test your understanding of logic, syntax, and concepts</li>
                <li>• Get explanations for each answer</li>
                <li>• Track your score and performance</li>
              </ul>
            </div>
          </div>
        ) : showResults ? (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Quiz Results</h2>
              <div className="text-6xl font-bold text-primary">{score}%</div>
              <p className="text-muted-foreground">
                You got {Math.round((score / 100) * quiz.questions.length)} out of {quiz.questions.length} questions correct
              </p>
              
              <div className="flex gap-2 justify-center">
                <Button onClick={resetQuiz} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  New Quiz
                </Button>
                <Button onClick={() => setShowResults(false)}>
                  Review Answers
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {quiz.questions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-medium">Question {index + 1}</h3>
                  <p className="text-sm">{question.question}</p>
                  
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => {
                      const isSelected = selectedAnswers[question.id] === optionIndex;
                      const isCorrect = optionIndex === question.correctAnswer;
                      const showCorrect = showResults;
                      
                      return (
                        <div
                          key={optionIndex}
                          className={`p-3 rounded border text-sm ${
                            showCorrect
                              ? isCorrect
                                ? 'bg-green-50 border-green-200'
                                : isSelected
                                ? 'bg-red-50 border-red-200'
                                : 'bg-muted'
                              : isSelected
                              ? 'bg-primary/10 border-primary'
                              : 'bg-muted hover:bg-muted/80 cursor-pointer'
                          }`}
                          onClick={() => !showResults && selectAnswer(question.id, optionIndex)}
                        >
                          <div className="flex items-center gap-2">
                            {showCorrect ? (
                              isCorrect ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : isSelected ? (
                                <XCircle className="w-4 h-4 text-red-600" />
                              ) : (
                                <div className="w-4 h-4" />
                              )
                            ) : (
                              <div className={`w-4 h-4 rounded-full border ${
                                isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'
                              }`} />
                            )}
                            <span className={showCorrect && isCorrect ? 'font-medium' : ''}>
                              {option}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {showResults && (
                    <div className="bg-muted p-3 rounded text-sm">
                      <strong>Explanation:</strong> {question.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Question {currentQuestionIndex + 1} of {quiz.totalQuestions}</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextQuestion}
                  disabled={currentQuestionIndex === quiz.questions.length - 1}
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {currentQuestion && (
              <div className="space-y-6">
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>
                  
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => {
                      const isSelected = selectedAnswers[currentQuestion.id] === index;
                      
                      return (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-primary/10 border-primary'
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                          onClick={() => selectAnswer(currentQuestion.id, index)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'
                            }`}>
                              {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                            <span className="text-sm">{option}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {Object.keys(selectedAnswers).length} of {quiz.totalQuestions} questions answered
                  </div>
                  
                  <div className="flex gap-2">
                    {currentQuestionIndex > 0 && (
                      <Button variant="outline" onClick={previousQuestion}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>
                    )}
                    
                    {currentQuestionIndex < quiz.questions.length - 1 ? (
                      <Button onClick={nextQuestion}>
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button 
                        onClick={submitQuiz}
                        disabled={Object.keys(selectedAnswers).length < quiz.questions.length}
                      >
                        Submit Quiz
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 