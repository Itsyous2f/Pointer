"use client";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

type QuizMode = 'notes' | 'topic';
type QuizType = 'multiple-choice' | 'short-answer';

interface QuizQuestion {
  question: string;
  options?: string[];
  correctAnswer: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

interface QuizState {
  questions: QuizQuestion[];
  currentQuestion: number;
  isComplete: boolean;
  score: number;
  totalQuestions: number;
}

export default function QuizGenerator() {
  const [notesText, setNotesText] = useState("");
  const [topicText, setTopicText] = useState("");
  const [quizMode, setQuizMode] = useState<QuizMode>('notes');
  const [quizType, setQuizType] = useState<QuizType>('multiple-choice');
  const [numQuestions, setNumQuestions] = useState(5);
  const [generatedQuiz, setGeneratedQuiz] = useState("");
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");

  const parseQuizFromText = (text: string, type: QuizType): QuizQuestion[] => {
    const questions: QuizQuestion[] = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    let currentQuestion: Partial<QuizQuestion> = {};
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.match(/^\d+\./)) {
        // New question
        if (currentQuestion.question) {
          questions.push(currentQuestion as QuizQuestion);
        }
        currentQuestion = {
          question: line.replace(/^\d+\.\s*/, ''),
          options: [],
          correctAnswer: ''
        };
      } else if (type === 'multiple-choice' && line.match(/^[A-D]\)/)) {
        // Multiple choice option
        const option = line.replace(/^[A-D]\)\s*/, '');
        currentQuestion.options?.push(option);
      } else if (type === 'multiple-choice' && (line.includes('Correct Answer:') || line.includes('Answer:'))) {
        // Correct answer line for multiple choice
        const match = line.match(/Correct Answer:\s*([A-D])/i) || line.match(/Answer:\s*([A-D])/i);
        if (match) {
          currentQuestion.correctAnswer = match[1].toUpperCase();
        }
      } else if (type === 'short-answer' && line.includes('Expected Answer:')) {
        // Short answer expected response
        const expectedAnswer = line.replace(/Expected Answer:\s*/, '');
        currentQuestion.correctAnswer = expectedAnswer;
      } else if (currentQuestion.question && !currentQuestion.options?.length && type === 'multiple-choice') {
        // Additional question text
        currentQuestion.question += ' ' + line;
      }
    }
    
    // Add the last question
    if (currentQuestion.question) {
      questions.push(currentQuestion as QuizQuestion);
    }
    
    return questions.slice(0, numQuestions);
  };

  const getQuizPrompt = (type: QuizType, content: string, count: number, mode: QuizMode) => {
    const basePrompts = {
      'multiple-choice': `Create ${count} multiple-choice questions ${mode === 'notes' ? 'based on these class notes/slides' : 'about this topic'}. Each question should have 4 options (A, B, C, D) with only one correct answer. Make sure the questions test understanding of key concepts.

${mode === 'notes' ? 'Class Notes/Slides' : 'Topic'}: ${content}

Please format the quiz as follows:
1. Question 1
   A) Option A
   B) Option B
   C) Option C
   D) Option D
   Correct Answer: A

2. Question 2
   A) Option A
   B) Option B
   C) Option C
   D) Option D
   Correct Answer: B

[Continue format...]

Make sure the questions are clear, relevant to the material, and test different aspects of the content.`,
      
      'short-answer': `Create ${count} short-answer questions ${mode === 'notes' ? 'based on these class notes/slides' : 'about this topic'}. The questions should require brief but thoughtful responses that demonstrate understanding of the material.

${mode === 'notes' ? 'Class Notes/Slides' : 'Topic'}: ${content}

Please format the quiz as follows:
1. Question 1: [Question text]
   Expected Answer: [Brief expected response]

2. Question 2: [Question text]
   Expected Answer: [Brief expected response]

[Continue format...]

Make sure the questions test comprehension, application, and analysis of the key concepts.`
    };
    
    return basePrompts[type];
  };

  const handleQuizGeneration = async () => {
    const content = quizMode === 'notes' ? notesText : topicText;
    if (!content.trim()) return;
    
    setIsGeneratingQuiz(true);
    setQuizState(null);
    setShowResults(false);
    
    try {
      const prompt = getQuizPrompt(quizType, content, numQuestions, quizMode);
      
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to generate quiz');
      }
      
      const data = await res.json();
      setGeneratedQuiz(data.message);
      
      // Parse the quiz and start it
      const questions = parseQuizFromText(data.message, quizType);
      setQuizState({
        questions,
        currentQuestion: 0,
        isComplete: false,
        score: 0,
        totalQuestions: questions.length
      });
    } catch (error) {
      setGeneratedQuiz("Error generating quiz. Please try again.");
      console.error('Quiz generation error:', error);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleAnswer = (answer: string) => {
    if (!quizState) return;
    
    const updatedQuestions = [...quizState.questions];
    const currentQ = updatedQuestions[quizState.currentQuestion];
    
    currentQ.userAnswer = answer;
    
    // Check if answer is correct based on question type
    let isCorrect = false;
    
    if (quizType === 'multiple-choice') {
      // For multiple choice, compare the letter (A, B, C, D)
      isCorrect = answer.toUpperCase() === currentQ.correctAnswer.toUpperCase();
    } else {
      // For short answer, do a more flexible comparison
      const userAnswerClean = answer.toLowerCase().trim();
      const correctAnswerClean = currentQ.correctAnswer.toLowerCase().trim();
      
      // Exact match
      if (userAnswerClean === correctAnswerClean) {
        isCorrect = true;
      } else {
        // Check if user answer contains key words from correct answer
        const correctWords = correctAnswerClean.split(/\s+/).filter(word => word.length > 2);
        const userWords = userAnswerClean.split(/\s+/).filter(word => word.length > 2);
        
        const matchingWords = correctWords.filter(word => 
          userWords.some(userWord => userWord.includes(word) || word.includes(userWord))
        );
        
        // If more than 50% of key words match, consider it correct
        isCorrect = matchingWords.length >= Math.ceil(correctWords.length * 0.5);
      }
    }
    
    currentQ.isCorrect = isCorrect;
    
    const newScore = isCorrect ? quizState.score + 1 : quizState.score;
    const isLastQuestion = quizState.currentQuestion === quizState.questions.length - 1;
    
    setQuizState({
      ...quizState,
      questions: updatedQuestions,
      score: newScore,
      currentQuestion: isLastQuestion ? quizState.currentQuestion : quizState.currentQuestion + 1,
      isComplete: isLastQuestion
    });
    
    if (isLastQuestion) {
      setShowResults(true);
    }
  };

  const restartQuiz = () => {
    setQuizState(null);
    setShowResults(false);
    setGeneratedQuiz("");
  };

  const clearQuiz = () => {
    setNotesText("");
    setTopicText("");
    setGeneratedQuiz("");
    setQuizState(null);
    setShowResults(false);
  };

  const renderQuizInterface = () => {
    if (!quizState) return null;

    if (showResults) {
      return (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-center">Quiz Results</h2>
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-primary mb-2">
              {quizState.score}/{quizState.totalQuestions}
            </div>
            <div className="text-lg text-muted-foreground">
              {Math.round((quizState.score / quizState.totalQuestions) * 100)}% Score
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            {quizState.questions.map((q, idx) => (
              <div key={idx} className="border rounded-lg p-4">
                <div className="flex items-start gap-2 mb-2">
                  {q.isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium mb-2">
                      {idx + 1}. 
                      <ReactMarkdown 
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            return (
                              <code
                                className={`${className} ${inline ? 'bg-gray-200 px-1 py-0.5 rounded text-sm' : 'block bg-gray-100 p-2 rounded text-sm overflow-x-auto'}`}
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          },
                          p({ children }: any) {
                            return <span>{children}</span>;
                          },
                          strong({ children }: any) {
                            return <strong className="font-semibold">{children}</strong>;
                          },
                          em({ children }: any) {
                            return <em className="italic">{children}</em>;
                          }
                        }}
                      >
                        {q.question}
                      </ReactMarkdown>
                    </div>
                    {quizType === 'multiple-choice' && q.options && (
                      <div className="space-y-1 text-sm">
                        {q.options.map((option, optIdx) => (
                          <div key={optIdx} className={`pl-4 ${
                            String.fromCharCode(65 + optIdx) === q.correctAnswer ? 'text-green-600 font-medium' : ''
                          }`}>
                            {String.fromCharCode(65 + optIdx)}) {option}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Your Answer:</span> {q.userAnswer}
                    </div>
                    {!q.isCorrect && (
                      <div className="text-sm text-green-600">
                        <span className="font-medium">Correct Answer:</span> {q.correctAnswer}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2 justify-center">
            <Button onClick={restartQuiz} variant="outline">
              Generate New Quiz
            </Button>
            <Button onClick={() => setShowResults(false)}>
              Review Quiz
            </Button>
          </div>
        </Card>
      );
    }

    const currentQ = quizState.questions[quizState.currentQuestion];
    
    return (
      <Card className="p-6">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Question {quizState.currentQuestion + 1} of {quizState.totalQuestions}
            </span>
            <span className="text-sm font-medium">
              Score: {quizState.score}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((quizState.currentQuestion + 1) / quizState.totalQuestions) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="mb-6">
          <div className="mb-4">
            <ReactMarkdown 
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  return (
                    <code
                      className={`${className} ${inline ? 'bg-gray-200 px-1 py-0.5 rounded text-sm' : 'block bg-gray-100 p-2 rounded text-sm overflow-x-auto'}`}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                pre({ children }: any) {
                  return (
                    <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                      {children}
                    </pre>
                  );
                },
                p({ children }: any) {
                  return <p className="mb-2 last:mb-0">{children}</p>;
                },
                ul({ children }: any) {
                  return <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>;
                },
                ol({ children }: any) {
                  return <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>;
                },
                li({ children }: any) {
                  return <li className="text-sm">{children}</li>;
                },
                strong({ children }: any) {
                  return <strong className="font-semibold">{children}</strong>;
                },
                em({ children }: any) {
                  return <em className="italic">{children}</em>;
                }
              }}
            >
              {currentQ.question}
            </ReactMarkdown>
          </div>
          
          {quizType === 'multiple-choice' && currentQ.options && (
            <div className="space-y-2">
              {currentQ.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(String.fromCharCode(65 + idx))}
                  className="w-full text-left p-3 border rounded-lg hover:bg-muted transition-colors"
                >
                  <span className="font-medium mr-2">{String.fromCharCode(65 + idx)})</span>
                  {option}
                </button>
              ))}
            </div>
          )}
          
          {quizType === 'short-answer' && (
            <div className="space-y-4">
              <Input
                placeholder="Type your answer..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    if (target.value.trim()) {
                      handleAnswer(target.value.trim());
                    }
                  }
                }}
              />
              <Button 
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Type your answer..."]') as HTMLInputElement;
                  if (input?.value.trim()) {
                    handleAnswer(input.value.trim());
                  }
                }}
                className="w-full"
              >
                Submit Answer
              </Button>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="h-full flex flex-col p-6 gap-4">
      {/* Quiz Settings */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Quiz Mode:</label>
          <select
            value={quizMode}
            onChange={(e) => setQuizMode(e.target.value as QuizMode)}
            className="px-3 py-1 border rounded-md bg-background"
          >
            <option value="notes">Based on Notes</option>
            <option value="topic">Based on Topic</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Question Type:</label>
          <select
            value={quizType}
            onChange={(e) => setQuizType(e.target.value as QuizType)}
            className="px-3 py-1 border rounded-md bg-background"
          >
            <option value="multiple-choice">Multiple Choice</option>
            <option value="short-answer">Short Answer</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Number of Questions:</label>
          <select
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
            className="px-3 py-1 border rounded-md bg-background"
          >
            <option value={3}>3</option>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
          </select>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4">
        {/* Input Section */}
        <Card className="p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {quizMode === 'notes' ? 'Class Notes/Slides' : 'Topic'}
            </h2>
            <Button variant="outline" size="sm" onClick={clearQuiz}>
              Clear
            </Button>
          </div>
          
          {quizMode === 'notes' ? (
            <textarea
              className="flex-1 p-3 border rounded-md resize-none bg-background"
              placeholder="Paste your class notes, slides, or study material here..."
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
            />
          ) : (
            <div className="flex-1 flex flex-col gap-2">
              <Input
                className="w-full"
                placeholder="Enter a topic (e.g., 'World War II', 'Photosynthesis', 'JavaScript Programming')"
                value={topicText}
                onChange={(e) => setTopicText(e.target.value)}
              />
              <div className="text-sm text-muted-foreground">
                Examples: "Ancient Rome", "Machine Learning", "Shakespeare's Hamlet", "Climate Change"
              </div>
            </div>
          )}
          
          <Button 
            onClick={handleQuizGeneration}
            disabled={!((quizMode === 'notes' && notesText.trim()) || (quizMode === 'topic' && topicText.trim())) || isGeneratingQuiz}
            className="mt-4"
          >
            {isGeneratingQuiz ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Quiz...
              </>
            ) : (
              `Generate ${numQuestions} ${quizType === 'multiple-choice' ? 'Multiple Choice' : 'Short Answer'} Questions ${quizMode === 'topic' ? 'about ' + topicText : ''}`
            )}
          </Button>
        </Card>

        {/* Quiz Interface */}
        <div className="flex-1">
          {renderQuizInterface() || (
            <Card className="p-4 flex flex-col h-full">
              <h2 className="text-lg font-semibold mb-4">
                Generated Quiz ({quizType === 'multiple-choice' ? 'Multiple Choice' : 'Short Answer'})
                {quizMode === 'topic' && topicText && ` - ${topicText}`}
              </h2>
              <div className="flex-1 p-3 border rounded-md bg-muted overflow-y-auto whitespace-pre-wrap">
                {generatedQuiz || "Your generated quiz will appear here..."}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 