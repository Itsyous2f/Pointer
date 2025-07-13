"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import ChatInterface from "@/components/ChatInterface";
import EssayTools from "@/components/EssayTools";
import EssayFormer from "@/components/EssayFormer";
import EmailWriter from "@/components/EmailWriter";
import QuizGenerator from "@/components/QuizGenerator";
import ExplainDifferently from "@/components/ExplainDifferently";
import AnswerCritic from "@/components/AnswerCritic";
import SettingsTab from "@/components/SettingsTab";
import Tasks from "@/components/Tasks";
import CommandLauncher from "@/components/CommandLauncher";
import Docs from "@/components/Docs";
import Calendar from "@/components/Calendar";
import CodingQuiz from "@/components/CodingQuiz";

type TabType = 'chat' | 'essay' | 'essay-former' | 'email' | 'quiz' | 'explain' | 'answer-critic' | 'settings' | 'tasks' | 'docs' | 'calendar' | 'coding-quiz';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('chat');

  // Handle OAuth callback parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    if (success === 'connected') {
      // Switch to calendar tab and show success message
      setActiveTab('calendar');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      // Switch to calendar tab and show error message
      setActiveTab('calendar');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleNavigate = (tab: string) => {
    setActiveTab(tab as TabType);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatInterface />;
      case 'essay':
        return <EssayTools />;
      case 'essay-former':
        return <EssayFormer />;
      case 'email':
        return <EmailWriter />;
      case 'quiz':
        return <QuizGenerator />;
      case 'explain':
        return <ExplainDifferently />;
      case 'answer-critic':
        return <AnswerCritic />;
      case 'settings':
        return <SettingsTab />;
      case 'tasks':
        return <Tasks />;
      case 'docs':
        return <Docs />;
      case 'calendar':
        return <Calendar />;
      case 'coding-quiz':
        return <CodingQuiz />;
      default:
        return <ChatInterface />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>
      <CommandLauncher onNavigate={handleNavigate} />
    </div>
  );
}
