"use client";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, FileText, Sparkles, Target } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface EssaySection {
  title: string;
  content: string;
}

interface EssayDraft {
  thesis: string;
  introduction: string;
  bodyParagraphs: EssaySection[];
  conclusion: string;
  outline: string;
}

export default function EssayFormer() {
  const [thesis, setThesis] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [essayDraft, setEssayDraft] = useState<EssayDraft | null>(null);
  const [showOutline, setShowOutline] = useState(false);

  const generateEssay = async () => {
    if (!thesis.trim()) return;
    
    setIsGenerating(true);
    setEssayDraft(null);
    
    try {
      const response = await fetch("/api/essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thesis }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate essay');
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
              // Try to parse the final JSON with multiple fallback strategies
              try {
                // First, try to find JSON in the content
                let jsonMatch = streamedContent.match(/\{[\s\S]*\}/);
                let draft: EssayDraft;
                
                if (jsonMatch) {
                  try {
                    draft = JSON.parse(jsonMatch[0]);
                  } catch (e) {
                    // If that fails, try to clean up the JSON
                    const cleanedJson = jsonMatch[0]
                      .replace(/```json/g, '')
                      .replace(/```/g, '')
                      .replace(/\n/g, ' ')
                      .replace(/\r/g, '')
                      .trim();
                    draft = JSON.parse(cleanedJson);
                  }
                  setEssayDraft(draft);
                } else {
                  // If no JSON found, create a fallback essay from the raw content
                  const sections = streamedContent.split(/\n\n+/);
                  draft = {
                    thesis: thesis,
                    introduction: sections[0] || "Generated introduction",
                    bodyParagraphs: [
                      {
                        title: "Body Paragraph 1",
                        content: sections[1] || "Generated body paragraph 1"
                      },
                      {
                        title: "Body Paragraph 2", 
                        content: sections[2] || "Generated body paragraph 2"
                      },
                      {
                        title: "Body Paragraph 3",
                        content: sections[3] || "Generated body paragraph 3"
                      }
                    ],
                    conclusion: sections[4] || "Generated conclusion",
                    outline: "Essay generated from AI response"
                  };
                  setEssayDraft(draft);
                }
              } catch (parseError) {
                console.error('Failed to parse essay JSON:', parseError);
                console.log('Raw content:', streamedContent);
                setEssayDraft({
                  thesis: thesis,
                  introduction: "Error parsing AI response. Please try again with a different thesis.",
                  bodyParagraphs: [
                    {
                      title: "Body Paragraph 1",
                      content: "The AI response couldn't be parsed as an essay. Please try with a more specific thesis or topic."
                    }
                  ],
                  conclusion: "Please try generating the essay again.",
                  outline: "Error occurred during generation."
                });
              }
              return;
            }
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                streamedContent = parsed.content;
                // You could add a streaming display here if needed
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Essay generation error:', error);
      setEssayDraft({
        thesis: thesis,
        introduction: "Error generating essay. Please try again.",
        bodyParagraphs: [
          {
            title: "Error",
            content: "There was an error generating your essay. Please check your thesis and try again."
          }
        ],
        conclusion: "Please try again.",
        outline: "Error occurred."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const clearEssay = () => {
    setThesis("");
    setEssayDraft(null);
    setShowOutline(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-full flex flex-col p-6 gap-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Target className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Essay Former</h1>
        </div>
        <Button variant="outline" onClick={clearEssay} size="sm">
          Clear All
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
        {/* Input Section */}
        <div className="flex flex-col gap-4 min-h-0">
          <Card className="p-4 flex-shrink-0">
            <h2 className="text-lg font-semibold mb-4">Your Thesis or Topic</h2>
            <Input
              placeholder="Enter your thesis statement or topic..."
              value={thesis}
              onChange={(e) => setThesis(e.target.value)}
              className="mb-4"
            />
            <div className="text-sm text-muted-foreground mb-4">
              Examples: 
              <br />• "Social media has a negative impact on mental health"
              <br />• "Climate change requires immediate global action"
              <br />• "The benefits of remote work outweigh the drawbacks"
            </div>
            <Button 
              onClick={generateEssay}
              disabled={!thesis.trim() || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Essay...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate 5-Paragraph Essay
                </>
              )}
            </Button>
          </Card>

          {/* Outline Toggle */}
          {essayDraft && (
            <Card className="p-4 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Essay Outline</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowOutline(!showOutline)}
                >
                  {showOutline ? "Hide" : "Show"} Outline
                </Button>
              </div>
              {showOutline && (
                <div className="p-3 border rounded-md bg-muted">
                  <ReactMarkdown 
                    components={{
                      p({ children }: any) {
                        return <p className="mb-2 last:mb-0 text-sm">{children}</p>;
                      },
                      strong({ children }: any) {
                        return <strong className="font-semibold">{children}</strong>;
                      }
                    }}
                  >
                    {essayDraft.outline}
                  </ReactMarkdown>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Essay Output */}
        <Card className="p-4 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Generated Essay</h2>
            {essayDraft && (
              <Button
                variant="outline"
                onClick={() => {
                  const fullEssay = `
${essayDraft.thesis}

${essayDraft.introduction}

${essayDraft.bodyParagraphs.map((p, i) => `Body Paragraph ${i + 1}: ${p.title}\n${p.content}`).join('\n\n')}

${essayDraft.conclusion}
                  `.trim();
                  copyToClipboard(fullEssay);
                }}
                size="sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                Copy Full Essay
              </Button>
            )}
          </div>
          <div className="flex-1 p-4 border rounded-md bg-muted overflow-y-auto min-h-0">
            {essayDraft ? (
              <div className="space-y-6 pb-4">
                {/* Thesis */}
                <div>
                  <h3 className="font-semibold text-primary mb-2">Thesis Statement</h3>
                  <div className="p-3 bg-background rounded border">
                    <ReactMarkdown 
                      components={{
                        p({ children }: any) {
                          return <p className="mb-0 italic">{children}</p>;
                        }
                      }}
                    >
                      {essayDraft.thesis}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Introduction */}
                <div>
                  <h3 className="font-semibold text-primary mb-2">Introduction</h3>
                  <div className="p-3 bg-background rounded border">
                    <ReactMarkdown 
                      components={{
                        p({ children }: any) {
                          return <p className="mb-0 leading-relaxed">{children}</p>;
                        }
                      }}
                    >
                      {essayDraft.introduction}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Body Paragraphs */}
                {essayDraft.bodyParagraphs.map((paragraph, index) => (
                  <div key={index}>
                    <h3 className="font-semibold text-primary mb-2">
                      Body Paragraph {index + 1}
                    </h3>
                    <div className="p-3 bg-background rounded border">
                      <h4 className="font-medium mb-2 text-sm text-muted-foreground">
                        {paragraph.title}
                      </h4>
                      <ReactMarkdown 
                        components={{
                          p({ children }: any) {
                            return <p className="mb-0 leading-relaxed">{children}</p>;
                          }
                        }}
                      >
                        {paragraph.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}

                {/* Conclusion */}
                <div>
                  <h3 className="font-semibold text-primary mb-2">Conclusion</h3>
                  <div className="p-3 bg-background rounded border">
                    <ReactMarkdown 
                      components={{
                        p({ children }: any) {
                          return <p className="mb-0 leading-relaxed">{children}</p>;
                        }
                      }}
                    >
                      {essayDraft.conclusion}
                    </ReactMarkdown>
                  </div>
                </div>


              </div>
            ) : (
              <div className="text-muted-foreground text-center mt-8">
                Your generated essay will appear here...
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
} 