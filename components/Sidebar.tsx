"use client";
import React from "react";
import { MessageSquare, FileText, HelpCircle, Lightbulb, Target, Mail, CheckCircle, MessageSquare as MessageSquareIcon, Settings, Calendar, Code } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type TabType = 'chat' | 'essay' | 'essay-former' | 'email' | 'quiz' | 'explain' | 'answer-critic' | 'settings' | 'tasks' | 'docs' | 'calendar' | 'coding-quiz';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="w-64 bg-card border-r flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-lg font-semibold">Pointer</h1>
      </div>
      <nav className="flex-1 p-2 space-y-2">
        {/* AI Section */}
        <div>
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            AI
          </div>
          <button
            onClick={() => onTabChange('chat')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeTab === 'chat' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            AI Chat
          </button>
          <button
            onClick={() => onTabChange('essay')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors mt-2 ${
              activeTab === 'essay' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted'
            }`}
          >
            <FileText className="w-4 h-4" />
            Essay Tools
          </button>
          <button
            onClick={() => onTabChange('essay-former')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors mt-2 ${
              activeTab === 'essay-former' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted'
            }`}
          >
            <Target className="w-4 h-4" />
            Essay Former
          </button>
          <button
            onClick={() => onTabChange('email')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors mt-2 ${
              activeTab === 'email' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted'
            }`}
          >
            <Mail className="w-4 h-4" />
            Email Writer
          </button>
          <button
            onClick={() => onTabChange('quiz')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors mt-2 ${
              activeTab === 'quiz' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Quiz Generator
          </button>
          <button
            onClick={() => onTabChange('explain')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors mt-2 ${
              activeTab === 'explain' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            Explain Differently
          </button>
          <button
            onClick={() => onTabChange('answer-critic')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors mt-2 ${
              activeTab === 'answer-critic' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted'
            }`}
          >
            <MessageSquareIcon className="w-4 h-4" />
            Answer Critic
          </button>
          <button
            onClick={() => onTabChange('coding-quiz')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors mt-2 ${
              activeTab === 'coding-quiz' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted'
            }`}
          >
            <Code className="w-4 h-4" />
            Coding Quiz
          </button>

        </div>

        {/* Separator */}
        <Separator className="my-4" />

        {/* Personal Section */}
        <div>
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Personal
          </div>
          <button
            onClick={() => onTabChange('docs')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeTab === 'docs' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted'
            }`}
          >
            <FileText className="w-4 h-4" />
            Docs
          </button>
          <button
            onClick={() => onTabChange('tasks')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeTab === 'tasks' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Tasks
          </button>
          <button
            onClick={() => onTabChange('calendar')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors mt-2 ${
              activeTab === 'calendar' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Calendar
          </button>
        </div>

        {/* Settings Section */}
        <div className="mt-auto">
          <Separator className="my-4" />
          <button
            onClick={() => onTabChange('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeTab === 'settings' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted'
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </nav>
    </div>
  );
} 