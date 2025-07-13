"use client";
import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles, BookOpen, Brain, Zap, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
}

interface ChatTemplate {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: React.ReactNode;
  color: string;
}

const chatTemplates: ChatTemplate[] = [
  {
    id: "summarize",
    title: "Summarize this",
    description: "Get a concise summary",
    prompt: "Please provide a clear and concise summary of the following:",
    icon: <BookOpen className="w-4 h-4" />,
    color: "bg-blue-500"
  },
  {
    id: "quiz",
    title: "Turn this into a quiz",
    description: "Create questions from content",
    prompt: "Please create a quiz with multiple choice questions based on this content:",
    icon: <Brain className="w-4 h-4" />,
    color: "bg-green-500"
  },
  {
    id: "explain-simple",
    title: "Explain like I'm 5",
    description: "Simple explanation",
    prompt: "Please explain this in very simple terms, as if you're explaining it to a 5-year-old:",
    icon: <Zap className="w-4 h-4" />,
    color: "bg-yellow-500"
  },
  {
    id: "debate",
    title: "Debate both sides",
    description: "Show pros and cons",
    prompt: "Please present both sides of this argument, showing the pros and cons:",
    icon: <MessageSquare className="w-4 h-4" />,
    color: "bg-purple-500"
  },
  {
    id: "improve",
    title: "Improve this",
    description: "Enhance and refine",
    prompt: "Please help me improve this by providing suggestions and enhancements:",
    icon: <Sparkles className="w-4 h-4" />,
    color: "bg-orange-500"
  },
  {
    id: "analyze",
    title: "Analyze this",
    description: "Deep analysis",
    prompt: "Please provide a detailed analysis of this, including key insights and implications:",
    icon: <Bot className="w-4 h-4" />,
    color: "bg-red-500"
  }
];

export default function ChatInterface() {
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setChat((c) => [...c, { role: 'user', content: input }]);
    setInput("");
    
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to send message');
      }
      
      const data = await res.json();
      setChat((c) => [...c, { role: 'bot', content: data.message }]);
    } catch (error) {
      console.error('Chat error:', error);
      setChat((c) => [...c, { role: 'bot', content: "Sorry, I'm having trouble responding. Please try again." }]);
    }
  };

  const useTemplate = (template: ChatTemplate) => {
    const fullPrompt = `${template.prompt}\n\n[Your content here]`;
    setInput(fullPrompt);
    setShowTemplates(false);
    // Focus the input after setting the template
    setTimeout(() => {
      const inputElement = document.querySelector('input[placeholder="Type your message..."]') as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
        inputElement.setSelectionRange(template.prompt.length + 2, fullPrompt.length - 1);
      }
    }, 100);
  };

  return (
    <Card className="h-full w-full rounded-none border-0 flex flex-col">
      <div className="flex-1 flex flex-col gap-2 p-6 overflow-hidden">
        <div className="flex-1 flex flex-col gap-2 overflow-y-auto border rounded p-4 bg-muted">
          {chat.length === 0 && (
            <div className="text-center mt-8">
              <div className="text-muted-foreground mb-4">Start the conversation!</div>
              <Button
                variant="outline"
                onClick={() => setShowTemplates(!showTemplates)}
                className="mb-4"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Quick Templates
              </Button>
              {showTemplates && (
                <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                  {chatTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => useTemplate(template)}
                      className="p-3 border rounded-lg text-left hover:bg-background transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-6 h-6 rounded-full ${template.color} flex items-center justify-center text-white`}>
                          {template.icon}
                        </div>
                        <span className="font-medium text-sm">{template.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{template.description}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {chat.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'bot' && (
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="px-3 py-2 rounded-lg max-w-[80%] bg-secondary text-secondary-foreground">
                    <ReactMarkdown 
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          return (
                            <code
                              className={`${className} ${inline ? 'bg-gray-700 px-1 py-0.5 rounded text-sm' : 'block bg-gray-800 p-2 rounded text-sm overflow-x-auto'}`}
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                        pre({ children }: any) {
                          return (
                            <pre className="bg-gray-800 p-2 rounded text-sm overflow-x-auto">
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
                            <blockquote className="border-l-4 border-gray-600 pl-3 italic text-gray-300">
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
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
              {msg.role === 'user' && (
                <div className="px-3 py-2 rounded-lg max-w-[80%] bg-primary text-primary-foreground">
                  {msg.content}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Quick Templates Button (when chat has messages) */}
        {chat.length > 0 && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplates(!showTemplates)}
              className="mb-2"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Quick Templates
            </Button>
          </div>
        )}
        
        {/* Templates Grid (when chat has messages) */}
        {showTemplates && chat.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {chatTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => useTemplate(template)}
                className="p-2 border rounded-lg text-left hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-5 h-5 rounded-full ${template.color} flex items-center justify-center text-white`}>
                    {template.icon}
                  </div>
                  <span className="font-medium text-xs">{template.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{template.description}</p>
              </button>
            ))}
          </div>
        )}
        
        <form className="flex gap-2 mt-4" onSubmit={handleSubmit}>
          <Input
            className="flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            autoFocus
          />
          <Button type="submit" disabled={!input.trim()}>
            Send
          </Button>
        </form>
      </div>
    </Card>
  );
} 