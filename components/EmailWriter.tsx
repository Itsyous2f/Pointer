"use client";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Mail, Sparkles, Copy, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";

type ToneType = 'casual' | 'formal' | 'confident';

interface ToneOption {
  id: ToneType;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const toneOptions: ToneOption[] = [
  {
    id: 'casual',
    title: 'Casual',
    description: 'Friendly and relaxed',
    icon: <Mail className="w-4 h-4" />,
    color: 'bg-green-500'
  },
  {
    id: 'formal',
    title: 'Formal',
    description: 'Professional and respectful',
    icon: <Mail className="w-4 h-4" />,
    color: 'bg-blue-500'
  },
  {
    id: 'confident',
    title: 'Confident',
    description: 'Assertive and direct',
    icon: <Mail className="w-4 h-4" />,
    color: 'bg-purple-500'
  }
];

export default function EmailWriter() {
  const [emailPrompt, setEmailPrompt] = useState("");
  const [existingEmail, setExistingEmail] = useState("");
  const [selectedTone, setSelectedTone] = useState<ToneType>('formal');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [mode, setMode] = useState<'write' | 'rewrite'>('write');

  const generateEmail = async () => {
    if (mode === 'write' && !emailPrompt.trim()) return;
    if (mode === 'rewrite' && !existingEmail.trim()) return;
    
    setIsGenerating(true);
    setGeneratedEmail("");
    
    try {
      const prompt = mode === 'write' 
        ? `Write a ${selectedTone} email based on this request: "${emailPrompt}"

Make the email:
- Professional and appropriate for the context
- Clear and concise
- ${selectedTone === 'casual' ? 'Friendly and conversational in tone' : ''}
- ${selectedTone === 'formal' ? 'Professional and respectful in tone' : ''}
- ${selectedTone === 'confident' ? 'Assertive and direct in tone' : ''}

Include a proper subject line and complete email structure.`
        : `Rewrite this email in a ${selectedTone} tone:

Original email:
${existingEmail}

Make the email:
- Professional and appropriate for the context
- Clear and concise
- ${selectedTone === 'casual' ? 'Friendly and conversational in tone' : ''}
- ${selectedTone === 'formal' ? 'Professional and respectful in tone' : ''}
- ${selectedTone === 'confident' ? 'Assertive and direct in tone' : ''}

Include a proper subject line and complete email structure.`;

      const response = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt,
          mode,
          tone: selectedTone,
          originalContent: mode === 'rewrite' ? existingEmail : emailPrompt
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate email');
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
              setGeneratedEmail(streamedContent);
              return;
            }
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                streamedContent = parsed.content;
                setGeneratedEmail(streamedContent);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      setGeneratedEmail("Error generating email. Please try again.");
      console.error('Email generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearAll = () => {
    setEmailPrompt("");
    setExistingEmail("");
    setGeneratedEmail("");
    setSelectedTone('formal');
    setMode('write');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-full flex flex-col p-6 gap-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Mail className="w-6 h-6" />
          <h1 className="text-2xl font-bold">AI Email Writer</h1>
        </div>
        <Button variant="outline" onClick={clearAll} size="sm">
          Clear All
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="flex flex-col gap-4">
          {/* Mode Selection */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Email Mode</h2>
            <div className="flex gap-2">
              <Button
                variant={mode === 'write' ? 'default' : 'outline'}
                onClick={() => setMode('write')}
                size="sm"
              >
                Write New Email
              </Button>
              <Button
                variant={mode === 'rewrite' ? 'default' : 'outline'}
                onClick={() => setMode('rewrite')}
                size="sm"
              >
                Rewrite Email
              </Button>
            </div>
          </Card>

          {/* Tone Selection */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Select Tone</h2>
            <div className="grid grid-cols-3 gap-2">
              {toneOptions.map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => setSelectedTone(tone.id)}
                  className={`p-3 border rounded-lg text-left transition-all ${
                    selectedTone === tone.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-5 h-5 rounded-full ${tone.color} flex items-center justify-center text-white`}>
                      {tone.icon}
                    </div>
                    <span className="font-medium text-sm">{tone.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{tone.description}</p>
                </button>
              ))}
            </div>
          </Card>

          {/* Content Input */}
          <Card className="p-4 flex-1">
            <h2 className="text-lg font-semibold mb-4">
              {mode === 'write' ? 'What do you want to email?' : 'Email to Rewrite'}
            </h2>
            
            {mode === 'write' ? (
              <div className="space-y-4">
                <Textarea
                  placeholder="e.g., 'Email my professor asking for an extension on my assignment' or 'Write a follow-up email to a job interview'"
                  value={emailPrompt}
                  onChange={(e) => setEmailPrompt(e.target.value)}
                  className="flex-1 min-h-[120px]"
                />
                <div className="text-sm text-muted-foreground">
                  Examples:
                  <br />• "Email my prof asking for extension"
                  <br />• "Follow up after job interview"
                  <br />• "Request meeting with client"
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Textarea
                  placeholder="Paste your existing email here..."
                  value={existingEmail}
                  onChange={(e) => setExistingEmail(e.target.value)}
                  className="flex-1 min-h-[200px]"
                />
                <div className="text-sm text-muted-foreground">
                  Paste your email and we'll rewrite it in the selected tone.
                </div>
              </div>
            )}
            
            <Button 
              onClick={generateEmail}
              disabled={((mode === 'write' && !emailPrompt.trim()) || (mode === 'rewrite' && !existingEmail.trim())) || isGenerating}
              className="w-full mt-4"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Email...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {mode === 'write' ? 'Generate Email' : 'Rewrite Email'}
                </>
              )}
            </Button>
          </Card>
        </div>

        {/* Email Output */}
        <Card className="p-4 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Generated Email</h2>
            {generatedEmail && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generatedEmail)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setExistingEmail(generatedEmail);
                    setMode('rewrite');
                  }}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Rewrite
                </Button>
              </div>
            )}
          </div>
          <div className="flex-1 p-4 border rounded-md bg-muted overflow-y-auto min-h-0">
            {generatedEmail ? (
              <div className="space-y-4">
                <ReactMarkdown 
                  components={{
                    p({ children }: any) {
                      return <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>;
                    },
                    strong({ children }: any) {
                      return <strong className="font-semibold">{children}</strong>;
                    },
                    em({ children }: any) {
                      return <em className="italic">{children}</em>;
                    },
                    h1({ children }: any) {
                      return <h1 className="text-lg font-bold mb-2">{children}</h1>;
                    },
                    h2({ children }: any) {
                      return <h2 className="text-base font-semibold mb-2">{children}</h2>;
                    },
                    h3({ children }: any) {
                      return <h3 className="text-sm font-semibold mb-1">{children}</h3>;
                    }
                  }}
                >
                  {generatedEmail}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-muted-foreground text-center mt-8">
                Your generated email will appear here...
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
} 