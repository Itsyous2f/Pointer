"use client";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Lightbulb, Globe, Zap, Brain, Users, Heart } from "lucide-react";
import ReactMarkdown from "react-markdown";

type ExplanationStyle = 'metaphor' | 'real-world' | 'simple' | 'story' | 'visual' | 'comparison';

interface StyleOption {
  id: ExplanationStyle;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const explanationStyles: StyleOption[] = [
  {
    id: 'metaphor',
    title: 'Use a metaphor',
    description: 'Explain it using a familiar comparison',
    icon: <Lightbulb className="w-4 h-4" />,
    color: 'bg-yellow-500'
  },
  {
    id: 'real-world',
    title: 'Give a real-world example',
    description: 'Show how it applies in everyday life',
    icon: <Users className="w-4 h-4" />,
    color: 'bg-blue-500'
  },
  {
    id: 'simple',
    title: 'Make it meme-level simple',
    description: 'Break it down to the absolute basics',
    icon: <Zap className="w-4 h-4" />,
    color: 'bg-green-500'
  },
  {
    id: 'story',
    title: 'Tell it as a story',
    description: 'Narrate it like you\'re explaining to a friend',
    icon: <Heart className="w-4 h-4" />,
    color: 'bg-purple-500'
  },
  {
    id: 'visual',
    title: 'Describe it visually',
    description: 'Paint a picture with words',
    icon: <Lightbulb className="w-4 h-4" />,
    color: 'bg-orange-500'
  },
  {
    id: 'comparison',
    title: 'Compare and contrast',
    description: 'Show what it\'s like vs what it\'s not like',
    icon: <Zap className="w-4 h-4" />,
    color: 'bg-red-500'
  }
];

export default function ExplainDifferently() {
  const [concept, setConcept] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<ExplanationStyle | null>(null);
  const [explanation, setExplanation] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const getPrompt = (style: ExplanationStyle, concept: string) => {
    const prompts = {
      metaphor: `Explain "${concept}" using a metaphor or analogy. Use a familiar, everyday comparison that makes the concept easy to understand. Make it relatable and memorable.`,
      'real-world': `Explain "${concept}" by giving concrete, real-world examples. Show how this concept appears or is used in everyday life, work, or common situations.`,
      simple: `Explain "${concept}" in the simplest possible terms. Use basic language, avoid jargon, and break it down to the absolute fundamentals. Make it so simple that anyone could understand it.`,
      story: `Explain "${concept}" by telling it as a story or narrative. Use a conversational tone, like you're explaining it to a friend over coffee. Make it engaging and easy to follow.`,
      visual: `Explain "${concept}" by describing it visually. Use vivid imagery and descriptive language to help someone picture or visualize the concept in their mind.`,
      comparison: `Explain "${concept}" by comparing and contrasting it with something else. Show what it's similar to and what it's different from, highlighting the key distinctions.`
    };
    
    return prompts[style];
  };

  const generateExplanation = async () => {
    if (!concept.trim() || !selectedStyle) return;
    
    setIsGenerating(true);
    setExplanation("");
    
    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concept, style: selectedStyle }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate explanation');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let streamedContent = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setExplanation(streamedContent);
              return;
            }
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                streamedContent = parsed.content;
                setExplanation(streamedContent);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      setExplanation("Error generating explanation. Please try again.");
      console.error('Explanation generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearAll = () => {
    setConcept("");
    setSelectedStyle(null);
    setExplanation("");
  };

  return (
    <div className="h-full flex flex-col p-6 gap-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Explain It Differently</h1>
        <Button variant="outline" onClick={clearAll} size="sm">
          Clear All
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="flex flex-col gap-4">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">What do you want explained?</h2>
            <Input
              placeholder="Enter a concept, topic, or idea..."
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              className="mb-4"
            />
            <div className="text-sm text-muted-foreground">
              Examples: "quantum physics", "machine learning", "supply and demand", "photosynthesis"
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Choose an explanation style:</h2>
            <div className="grid grid-cols-2 gap-3">
              {explanationStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-3 border rounded-lg text-left transition-all ${
                    selectedStyle === style.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-6 h-6 rounded-full ${style.color} flex items-center justify-center text-white`}>
                      {style.icon}
                    </div>
                    <span className="font-medium text-sm">{style.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{style.description}</p>
                </button>
              ))}
            </div>
          </Card>

          <Button 
            onClick={generateExplanation}
            disabled={!concept.trim() || !selectedStyle || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Explanation...
              </>
            ) : (
              'Explain It Differently'
            )}
          </Button>
        </div>

        {/* Output Section */}
        <Card className="p-4 flex flex-col">
          <h2 className="text-lg font-semibold mb-4">
            {selectedStyle ? `${explanationStyles.find(s => s.id === selectedStyle)?.title} Explanation` : 'Explanation'}
          </h2>
          <div className="flex-1 p-4 border rounded-md bg-muted overflow-y-auto">
            {explanation ? (
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
                    return <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>;
                  },
                  ul({ children }: any) {
                    return <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>;
                  },
                  ol({ children }: any) {
                    return <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>;
                  },
                  li({ children }: any) {
                    return <li className="text-sm">{children}</li>;
                  },
                  h1({ children }: any) {
                    return <h1 className="text-lg font-bold mb-3">{children}</h1>;
                  },
                  h2({ children }: any) {
                    return <h2 className="text-base font-semibold mb-2">{children}</h2>;
                  },
                  h3({ children }: any) {
                    return <h3 className="text-sm font-semibold mb-1">{children}</h3>;
                  },
                  blockquote({ children }: any) {
                    return (
                      <blockquote className="border-l-4 border-gray-300 pl-3 italic text-gray-600 mb-3">
                        {children}
                      </blockquote>
                    );
                  },
                  strong({ children }: any) {
                    return <strong className="font-semibold">{children}</strong>;
                  },
                  em({ children }: any) {
                    return <em className="italic">{children}</em>;
                  }
                }}
              >
                {explanation}
              </ReactMarkdown>
            ) : (
              <div className="text-muted-foreground text-center mt-8">
                {selectedStyle 
                  ? `Your ${explanationStyles.find(s => s.id === selectedStyle)?.title.toLowerCase()} explanation will appear here...`
                  : "Choose a concept and explanation style to get started"
                }
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
} 