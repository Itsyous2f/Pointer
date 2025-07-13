"use client";
import React, { useState, useEffect } from "react";
import { Command } from "cmdk";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { 
  MessageSquare, 
  FileText, 
  HelpCircle, 
  Brain,
  Search,
  Bot,
  BookOpen,
  Zap,
  Target,
  Mail,
  CheckCircle,
  MessageSquare as MessageSquareIcon,
  Zap as ZapIcon,
  Calendar,
  Code
} from "lucide-react";

interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  keywords: string[];
}

interface CommandLauncherProps {
  onNavigate: (tab: string) => void;
}

export default function CommandLauncher({ onNavigate }: CommandLauncherProps) {
  const [open, setOpen] = useState(false);

  const commands: CommandItem[] = [
    {
      id: "chat",
      title: "AI Chat",
      description: "Chat with the AI assistant",
      icon: <MessageSquare className="w-4 h-4" />,
      action: () => {
        onNavigate("chat");
        setOpen(false);
      },
      keywords: ["chat", "ai", "assistant", "conversation", "talk", "message"]
    },
    {
      id: "essay",
      title: "Essay Tools",
      description: "Outline, format, and improve essays",
      icon: <FileText className="w-4 h-4" />,
      action: () => {
        onNavigate("essay");
        setOpen(false);
      },
      keywords: ["essay", "writing", "outline", "format", "improve", "summarize", "paper"]
    },
    {
      id: "essay-former",
      title: "Essay Former",
      description: "Generate 5-paragraph essays from thesis",
      icon: <Target className="w-4 h-4" />,
      action: () => {
        onNavigate("essay-former");
        setOpen(false);
      },
      keywords: ["essay", "former", "generate", "thesis", "5-paragraph", "draft"]
    },
    {
      id: "email",
      title: "Email Writer",
      description: "Write and rewrite emails with different tones",
      icon: <Mail className="w-4 h-4" />,
      action: () => {
        onNavigate("email");
        setOpen(false);
      },
      keywords: ["email", "writer", "rewrite", "tone", "formal", "casual", "confident"]
    },
    {
      id: "quiz",
      title: "Quiz Generator",
      description: "Create interactive quizzes from notes or topics",
      icon: <HelpCircle className="w-4 h-4" />,
      action: () => {
        onNavigate("quiz");
        setOpen(false);
      },
      keywords: ["quiz", "test", "questions", "multiple choice", "short answer", "study"]
    },
    {
      id: "explain",
      title: "Explain Differently",
      description: "Get alternative explanations using metaphors and examples",
      icon: <Brain className="w-4 h-4" />,
      action: () => {
        onNavigate("explain");
        setOpen(false);
      },
      keywords: ["explain", "metaphor", "simple", "story", "example", "understand"]
    },
    {
      id: "answer-critic",
      title: "Answer Critic",
      description: "Get harsh but helpful feedback on your answers",
      icon: <MessageSquareIcon className="w-4 h-4" />,
      action: () => {
        onNavigate("answer-critic");
        setOpen(false);
      },
      keywords: ["answer", "critic", "feedback", "harsh", "brutal", "improve", "critique"]
    },

    {
      id: "tasks",
      title: "Tasks",
      description: "Manage your personal tasks and to-dos",
      icon: <CheckCircle className="w-4 h-4" />,
      action: () => {
        onNavigate("tasks");
        setOpen(false);
      },
      keywords: ["tasks", "todo", "checklist", "personal", "manage", "organize"]
    },
    {
      id: "calendar",
      title: "Calendar",
      description: "Manage events and appointments",
      icon: <Calendar className="w-4 h-4" />,
      action: () => {
        onNavigate("calendar");
        setOpen(false);
      },
      keywords: ["calendar", "events", "appointments", "schedule", "dates", "meetings"]
    },
    {
      id: "coding-quiz",
      title: "Coding Quiz",
      description: "Get quizzed on your code",
      icon: <Code className="w-4 h-4" />,
      action: () => {
        onNavigate("coding-quiz");
        setOpen(false);
      },
      keywords: ["coding", "quiz", "code", "programming", "test", "questions", "javascript", "python", "java"]
    }
  ];

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 w-12 h-12 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors flex items-center justify-center z-50"
        title="Open Command Palette (Ctrl+K)"
      >
        <Search className="w-5 h-5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 max-w-2xl">
          <DialogTitle className="sr-only">Command Palette</DialogTitle>
          <Command className="rounded-lg border shadow-md">
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Command.Input 
                placeholder="Search commands..." 
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <Command.List className="max-h-[300px] overflow-y-auto p-1">
              <Command.Empty className="py-6 text-center text-sm">
                No results found.
              </Command.Empty>
              <Command.Group heading="Navigation">
                {commands.map((command) => (
                  <Command.Item
                    key={command.id}
                    value={command.id}
                    onSelect={command.action}
                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground"
                  >
                    <div className="mr-2 flex h-4 w-4 items-center justify-center">
                      {command.icon}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{command.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {command.description}
                      </span>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
            <div className="flex items-center justify-between border-t px-2 py-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  <span className="text-xs">⌘</span>K
                </kbd>
                <span>to open</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  ↑↓
                </kbd>
                <span>to navigate</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  ↵
                </kbd>
                <span>to select</span>
              </div>
            </div>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
} 