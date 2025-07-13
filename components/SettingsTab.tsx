"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Zap, 
  Brain, 
  Crown, 
  Settings as SettingsIcon, 
  Cpu, 
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";

type SpeedMode = 'fast' | 'balanced' | 'quality';
type SettingsTab = 'ai' | 'system' | 'about';

interface SpeedOption {
  id: SpeedMode;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  model: string;
  speed: string;
  quality: string;
}

const speedOptions: SpeedOption[] = [
  {
    id: 'fast',
    title: 'Fast Mode',
    description: 'Prioritize speed over quality',
    icon: <Zap className="w-4 h-4" />,
    color: 'bg-green-500',
    model: 'qwen2.5:0.5b',
    speed: '⚡ Very Fast',
    quality: '📝 Good'
  },
  {
    id: 'balanced',
    title: 'Balanced Mode',
    description: 'Good balance of speed and quality',
    icon: <Brain className="w-4 h-4" />,
    color: 'bg-blue-500',
    model: 'phi3:mini',
    speed: '🏃 Fast',
    quality: '📚 Very Good'
  },
  {
    id: 'quality',
    title: 'Quality Mode',
    description: 'Prioritize quality over speed',
    icon: <Crown className="w-4 h-4" />,
    color: 'bg-purple-500',
    model: 'llama3.1:8b',
    speed: '🐌 Slower',
    quality: '👑 Excellent'
  }
];

export default function SettingsTab() {
  const [currentMode, setCurrentMode] = useState<SpeedMode>('fast');
  const [activeTab, setActiveTab] = useState<SettingsTab>('ai');
  const [isUpdating, setIsUpdating] = useState(false);
  const [installedModels, setInstalledModels] = useState<string[]>([]);

  useEffect(() => {
    // Load saved mode from localStorage
    const savedMode = localStorage.getItem('ollama-speed-mode') as SpeedMode;
    if (savedMode && speedOptions.find(opt => opt.id === savedMode)) {
      setCurrentMode(savedMode);
    }
    
    // Load installed models
    loadInstalledModels();
  }, []);

  const loadInstalledModels = async () => {
    try {
      const response = await fetch('/api/models');
      if (response.ok) {
        const data = await response.json();
        setInstalledModels(data.models || []);
      }
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  };

  const updateSpeedMode = async (mode: SpeedMode) => {
    setIsUpdating(true);
    try {
      // Save to localStorage
      localStorage.setItem('ollama-speed-mode', mode);
      setCurrentMode(mode);
      
      // Update the server configuration
      await fetch('/api/speed-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
      
      toast.success(`Switched to ${speedOptions.find(opt => opt.id === mode)?.title}`);
    } catch (error) {
      console.error('Failed to update speed mode:', error);
      toast.error('Failed to update speed mode');
    } finally {
      setIsUpdating(false);
    }
  };

  const installModel = async (modelName: string) => {
    try {
      const response = await fetch('/api/install-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: modelName })
      });
      
      if (response.ok) {
        toast.success(`Installing ${modelName}...`);
        // Reload models after a delay
        setTimeout(loadInstalledModels, 5000);
      } else {
        toast.error('Failed to install model');
      }
    } catch (error) {
      toast.error('Failed to install model');
    }
  };

  const renderAISettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-6">AI Speed Settings</h2>
        <p className="text-muted-foreground mb-6">
          Choose between speed and quality for AI responses
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {speedOptions.map((option) => {
          const isInstalled = installedModels.includes(option.model);
          return (
            <Card 
              key={option.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                currentMode === option.id 
                  ? 'ring-2 ring-primary border-primary' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => updateSpeedMode(option.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full ${option.color} flex items-center justify-center text-white`}>
                      {option.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{option.title}</CardTitle>
                      {currentMode === option.id && (
                        <Badge variant="secondary" className="mt-1">Active</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <CardDescription>{option.description}</CardDescription>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Model:</span>
                    <span className="font-mono text-xs">{option.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Speed:</span>
                    <span>{option.speed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quality:</span>
                    <span>{option.quality}</span>
                  </div>
                </div>

                {!isInstalled && (
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      installModel(option.model);
                    }}
                    className="w-full"
                  >
                    Install Model
                  </Button>
                )}

                <Button 
                  variant={currentMode === option.id ? "default" : "outline"}
                  className="w-full"
                  disabled={isUpdating || !isInstalled}
                >
                  {isUpdating && currentMode === option.id ? (
                    <>
                      <SettingsIcon className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : currentMode === option.id ? (
                    'Active'
                  ) : !isInstalled ? (
                    'Model Not Installed'
                  ) : (
                    'Switch to This Mode'
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            Speed Optimization Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">For Maximum Speed:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Use Fast Mode (qwen2.5:0.5b)</li>
                <li>• Keep prompts short and specific</li>
                <li>• Use streaming responses</li>
                <li>• Close other applications</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">For Best Quality:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Use Quality Mode (llama3.1:8b)</li>
                <li>• Provide detailed context</li>
                <li>• Use specific instructions</li>
                <li>• Allow longer response times</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-6">System Settings</h2>
        <p className="text-muted-foreground mb-6">
          Configure system preferences and performance
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="w-5 h-5" />
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Auto-save</h4>
              <p className="text-sm text-muted-foreground">Automatically save your work</p>
            </div>
            <Button variant="outline" size="sm">Enabled</Button>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Streaming Responses</h4>
              <p className="text-sm text-muted-foreground">Show AI responses as they generate</p>
            </div>
            <Button variant="outline" size="sm">Enabled</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAbout = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-6">About</h2>
        <p className="text-muted-foreground mb-6">
          Information about this application
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pointer AI</CardTitle>
          <CardDescription>Version 1.0.0</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            A comprehensive AI-powered application with multiple tools for writing, 
            analysis, and productivity. Built with Next.js and powered by Ollama.
          </p>
          <div className="flex gap-2">
            <Badge variant="outline">Next.js 15</Badge>
            <Badge variant="outline">Ollama</Badge>
            <Badge variant="outline">TypeScript</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'ai':
        return renderAISettings();
      case 'system':
        return renderSystemSettings();
      case 'about':
        return renderAbout();
      default:
        return renderAISettings();
    }
  };

  return (
    <div className="h-full flex p-6 gap-6">
      {/* Settings Sidebar */}
      <div className="w-80 bg-muted/50 rounded-lg p-6">
        <nav className="space-y-3">
          <button
            onClick={() => setActiveTab('ai')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === 'ai' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted'
            }`}
          >
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4" />
              AI Settings
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setActiveTab('system')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === 'system' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted'
            }`}
          >
            <div className="flex items-center gap-3">
              <Cpu className="w-4 h-4" />
              System
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setActiveTab('about')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === 'about' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted'
            }`}
          >
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-4 h-4" />
              About
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      </div>
      
      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
} 