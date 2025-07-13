"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Copy, RotateCcw, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface Feedback {
  score: number;
  harshFeedback: string;
  suggestions: string[];
  strengths: string[];
}

export default function AnswerCritic() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setLoading] = useState(false);

  const generateFeedback = async () => {
    if (!question.trim() || !answer.trim()) {
      toast.error("Please provide both a question and your answer");
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/answer-critic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.trim(),
          answer: answer.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate feedback");
      }

      const data = await response.json();
      setFeedback(data);
      toast.success("Feedback generated! Brace yourself...");
    } catch (error) {
      console.error("Error generating feedback:", error);
      toast.error("Failed to generate feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyFeedback = () => {
    if (!feedback) return;
    
    const feedbackText = `Score: ${feedback.score}/10

Harsh Feedback:
${feedback.harshFeedback}

Suggestions:
${feedback.suggestions.map(s => `• ${s}`).join('\n')}

Strengths:
${feedback.strengths.map(s => `• ${s}`).join('\n')}`;

    navigator.clipboard.writeText(feedbackText);
    toast.success("Feedback copied to clipboard");
  };

  const resetForm = () => {
    setQuestion("");
    setAnswer("");
    setFeedback(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-green-100 text-green-800";
    if (score >= 6) return "bg-yellow-100 text-yellow-800";
    if (score >= 4) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 8) return "🎯";
    if (score >= 6) return "😐";
    if (score >= 4) return "😬";
    return "💀";
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Answer Critic</h1>
        <p className="text-muted-foreground">
          Submit your answer and get brutally honest feedback to sharpen your skills
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Input Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Your Question & Answer
              </CardTitle>
              <CardDescription>
                Type the question and your answer below
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Question
                </label>
                <Textarea
                  placeholder="What question are you answering?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Your Answer
                </label>
                <Textarea
                  placeholder="Type your answer here..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={generateFeedback} 
                  disabled={isLoading || !question.trim() || !answer.trim()}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Get Brutal Feedback"
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={resetForm}
                  disabled={isLoading}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Section */}
        <div className="space-y-4">
          {feedback && (
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-red-800">Brutal Feedback</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getScoreColor(feedback.score)}>
                      {getScoreEmoji(feedback.score)} {feedback.score}/10
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyFeedback}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-red-800 mb-2">Harsh Reality Check:</h4>
                  <div className="bg-white p-3 rounded-md border border-red-200">
                    <p className="text-sm leading-relaxed">{feedback.harshFeedback}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-orange-800 mb-2">What You Need to Fix:</h4>
                  <ul className="space-y-1">
                    {feedback.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-green-800 mb-2">What You Did Right:</h4>
                  <ul className="space-y-1">
                    {feedback.strengths.map((strength, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {!feedback && !isLoading && (
            <Card className="border-dashed">
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Submit your answer to receive brutal feedback</p>
                </div>
              </CardContent>
            </Card>
          )}

          {isLoading && (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Analyzing your answer...</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 