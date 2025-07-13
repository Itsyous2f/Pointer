"use client";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

type EssayMode = 'outline' | 'format' | 'improve' | 'summarize';

export default function EssayTools() {
  const [essayText, setEssayText] = useState("");
  const [outlinedEssay, setOutlinedEssay] = useState("");
  const [essayMode, setEssayMode] = useState<EssayMode>('outline');
  const [isProcessing, setIsProcessing] = useState(false);

  const getEssayPrompt = (mode: EssayMode, text: string) => {
    const prompts = {
      outline: `Create a detailed, well-structured outline for this essay. Include main points, subpoints, and key arguments. Format it clearly with proper indentation and numbering:

Essay: ${text}

Please provide:
1. Introduction outline
2. Main body points with subpoints
3. Conclusion outline
4. Key themes and arguments identified`,
      
      format: `Please format and improve the structure of this essay. Make it more readable with proper paragraph breaks, clear topic sentences, and logical flow. Also suggest improvements for clarity and coherence:

Essay: ${text}

Please provide:
1. Formatted version with proper structure
2. Suggestions for improvement
3. Grammar and style recommendations`,
      
      improve: `Please improve this essay by enhancing the arguments, adding more detail where needed, improving the writing style, and making it more compelling. Keep the original message but make it stronger:

Essay: ${text}

Please provide:
1. Improved version with enhanced arguments
2. Specific improvements made
3. Suggestions for further development`,
      
      summarize: `Please provide a comprehensive summary of this essay, including the main arguments, key points, and conclusions:

Essay: ${text}

Please provide:
1. Executive summary (2-3 sentences)
2. Key arguments and points
3. Main conclusions
4. Overall assessment`
    };
    
    return prompts[mode];
  };

  const handleEssayProcess = async () => {
    if (!essayText.trim()) return;
    
    setIsProcessing(true);
    try {
      const prompt = getEssayPrompt(essayMode, essayText);
      
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to process essay');
      }
      
      const data = await res.json();
      setOutlinedEssay(data.message);
    } catch (error) {
      setOutlinedEssay("Error processing essay. Please try again.");
      console.error('Essay processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearEssay = () => {
    setEssayText("");
    setOutlinedEssay("");
  };

  return (
    <div className="h-full flex flex-col p-6 gap-4">
      {/* Mode Selection */}
      <div className="flex gap-2">
        <Button
          variant={essayMode === 'outline' ? 'default' : 'outline'}
          onClick={() => setEssayMode('outline')}
          size="sm"
        >
          Create Outline
        </Button>
        <Button
          variant={essayMode === 'format' ? 'default' : 'outline'}
          onClick={() => setEssayMode('format')}
          size="sm"
        >
          Format & Structure
        </Button>
        <Button
          variant={essayMode === 'improve' ? 'default' : 'outline'}
          onClick={() => setEssayMode('improve')}
          size="sm"
        >
          Improve Writing
        </Button>
        <Button
          variant={essayMode === 'summarize' ? 'default' : 'outline'}
          onClick={() => setEssayMode('summarize')}
          size="sm"
        >
          Summarize
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4">
        {/* Essay Input */}
        <Card className="p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Essay Input</h2>
            <Button variant="outline" size="sm" onClick={clearEssay}>
              Clear
            </Button>
          </div>
          <textarea
            className="flex-1 p-3 border rounded-md resize-none bg-background"
            placeholder="Paste your essay here..."
            value={essayText}
            onChange={(e) => setEssayText(e.target.value)}
          />
          <Button 
            onClick={handleEssayProcess}
            disabled={!essayText.trim() || isProcessing}
            className="mt-4"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Process Essay (${essayMode})`
            )}
          </Button>
        </Card>

        {/* Essay Output */}
        <Card className="p-4 flex flex-col">
          <h2 className="text-lg font-semibold mb-4">
            {essayMode === 'outline' && 'Essay Outline'}
            {essayMode === 'format' && 'Formatted Essay'}
            {essayMode === 'improve' && 'Improved Essay'}
            {essayMode === 'summarize' && 'Essay Summary'}
          </h2>
          <div className="flex-1 p-3 border rounded-md bg-muted overflow-y-auto">
            {outlinedEssay ? (
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
                  pre({ children }) {
                    return (
                      <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                        {children}
                      </pre>
                    );
                  },
                  p({ children }) {
                    return <p className="mb-2 last:mb-0">{children}</p>;
                  },
                  ul({ children }) {
                    return <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>;
                  },
                  ol({ children }) {
                    return <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>;
                  },
                  li({ children }) {
                    return <li className="text-sm">{children}</li>;
                  },
                  h1({ children }) {
                    return <h1 className="text-lg font-bold mb-2">{children}</h1>;
                  },
                  h2({ children }) {
                    return <h2 className="text-base font-semibold mb-2">{children}</h2>;
                  },
                  h3({ children }) {
                    return <h3 className="text-sm font-semibold mb-1">{children}</h3>;
                  },
                  blockquote({ children }) {
                    return (
                      <blockquote className="border-l-4 border-gray-300 pl-3 italic text-gray-600">
                        {children}
                      </blockquote>
                    );
                  },
                  strong({ children }) {
                    return <strong className="font-semibold">{children}</strong>;
                  },
                  em({ children }) {
                    return <em className="italic">{children}</em>;
                  }
                }}
              >
                {outlinedEssay}
              </ReactMarkdown>
            ) : (
              <div className="text-muted-foreground">Your processed essay will appear here...</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
} 