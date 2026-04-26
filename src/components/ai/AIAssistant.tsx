"use client";

import * as React from "react";
import { useState, useCallback, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  FileText,
  Target,
  BarChart,
  CheckCircle,
  ArrowRight,
  Loader2,
  X,
  MessageCircle,
  Zap,
  TrendingUp,
  Lightbulb,
  Award,
  BookOpen,
  Palette,
  RefreshCw,
  Maximize2,
} from "lucide-react";

interface AIAssistantProps {
  resumeData?: any;
  className?: string;
  onSuggestionClick?: (suggestion: string) => void;
  activeField?: string; // Current field being edited
}

interface Insight {
  id: string;
  type: "tip" | "warning" | "success" | "keyword";
  title: string;
  description: string;
  actionable: boolean;
  field?: string;
}

interface QuickSuggestion {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: string;
  targetField?: string;
}

const FIELD_SPECIFIC_SUGGESTIONS: Record<string, QuickSuggestion[]> = {
  summary: [
    {
      id: "summary-1",
      label: "Add metrics",
      icon: <TrendingUp className="h-3 w-3" />,
      content: "Include specific numbers and achievements",
      targetField: "summary",
    },
    {
      id: "summary-2",
      label: "Add value prop",
      icon: <Lightbulb className="h-3 w-3" />,
      content: "What unique value do you bring?",
      targetField: "summary",
    },
  ],
  experience: [
    {
      id: "exp-1",
      label: "Use STAR method",
      icon: <BookOpen className="h-3 w-3" />,
      content: "Situation, Task, Action, Result",
      targetField: "experience",
    },
    {
      id: "exp-2",
      label: "Add quantifiable results",
      icon: <TrendingUp className="h-3 w-3" />,
      content: "Include numbers for impact",
      targetField: "experience",
    },
  ],
  skills: [
    {
      id: "skills-1",
      label: "Group by category",
      icon: <Palette className="h-3 w-3" />,
      content: "Technical, Soft, Languages",
      targetField: "skills",
    },
    {
      id: "skills-2",
      label: "Add proficiency",
      icon: <Award className="h-3 w-3" />,
      content: "Include skill levels (Expert, Proficient, etc.)",
      targetField: "skills",
    },
  ],
};

const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  default: [
    "leadership",
    "communication",
    "problem-solving",
    "team collaboration",
    "project management",
    "analytics",
    "strategic planning",
  ],
  tech: [
    "agile",
    "scrum",
    "CI/CD",
    "microservices",
    "cloud architecture",
    "DevOps",
    "TDD",
    "code review",
  ],
  marketing: [
    "campaign strategy",
    "growth hacking",
    "conversion optimization",
    "brand positioning",
    "content marketing",
    "SEO/SEM",
  ],
  finance: [
    "financial modeling",
    "risk assessment",
    "budget management",
    "ROI analysis",
    "forecasting",
    "compliance",
  ],
};

export default function AIAssistant({
  resumeData,
  className,
  onSuggestionClick,
  activeField,
}: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("insights");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState("default");
  const [resumeScore, setResumeScore] = useState<number | null>(null);
  const assistantRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (assistantRef.current && !assistantRef.current.contains(event.target as Node)) {
        // Don't close if clicking the toggle button (it's outside the ref)
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Initial analysis on mount if resume data exists
  useEffect(() => {
    if (resumeData) {
      runQuickAnalysis();
    }
  }, [resumeData]);

  const runQuickAnalysis = useCallback(async () => {
    if (!resumeData) return;

    setIsAnalyzing(true);
    
    // Simulate analysis (in production, call actual AI)
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newInsights: Insight[] = [];
    
    // Check summary
    const summary = resumeData.personalInfo?.summary || "";
    if (summary.length < 50) {
      newInsights.push({
        id: "summary-short",
        type: "warning",
        title: "Summary too short",
        description: `Your summary is only ${summary.length} characters. Aim for 100-200 characters to effectively showcase your value.`,
        actionable: true,
        field: "summary",
      });
    }

    // Check experience bullets
    const experience = resumeData.experience || [];
    let hasQuantifiable = false;
    experience.forEach((exp: any) => {
      if (exp.description) {
        const bullets = Array.isArray(exp.description) ? exp.description : [exp.description];
        bullets.forEach((bullet: string) => {
          if (/\d+%|\$[\d,]+|\d+\s*(?:years?|months?|customers?|clients?|users?|projects?)/i.test(bullet)) {
            hasQuantifiable = true;
          }
        });
      }
    });
    
    if (!hasQuantifiable && experience.length > 0) {
      newInsights.push({
        id: "no-metrics",
        type: "tip",
        title: "Add quantifiable achievements",
        description: "Use numbers, percentages, or specific metrics to demonstrate impact in your experience section.",
        actionable: true,
        field: "experience",
      });
    }

    // Check skills
    const skills = resumeData.skills || [];
    if (skills.length < 5) {
      newInsights.push({
        id: "few-skills",
        type: "warning",
        title: "Limited skills listed",
        description: `You have ${skills.length} skill categories. Consider adding more relevant skills (aim for 10-15 total).`,
        actionable: true,
        field: "skills",
      });
    }

    // Calculate a simple score
    let score = 70;
    if (summary.length >= 100) score += 10;
    if (hasQuantifiable) score += 10;
    if (skills.length >= 8) score += 10;
    score = Math.min(100, score);
    setResumeScore(score);

    setInsights(newInsights);
    setIsAnalyzing(false);
  }, [resumeData]);

  const handleSuggestionClick = (suggestion: string, targetField?: string) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    }
    // In production, this would update the form field
    console.log("Suggestion clicked:", suggestion, "for field:", targetField);
  };

  const handleQuickAction = (action: string) => {
    // These would integrate with chat or direct editing
    console.log("Quick action:", action);
    // Could open chat with pre-filled message
    window.dispatchEvent(new CustomEvent('ai-quick-action', { detail: { action } }));
  };

  const getInsightIcon = (type: Insight["type"]) => {
    switch (type) {
      case "tip":
        return <Lightbulb className="h-4 w-4 text-blue-500" />;
      case "warning":
        return <Zap className="h-4 w-4 text-yellow-500" />;
      case "success":
        return <Sparkles className="h-4 w-4 text-green-500" />;
      case "keyword":
        return <Target className="h-4 w-4 text-purple-500" />;
    }
  };

  const filteredSuggestions = activeField
    ? (FIELD_SPECIFIC_SUGGESTIONS[activeField] || FIELD_SPECIFIC_SUGGESTIONS.default)
    : [];

  return (
    <div ref={assistantRef} className={cn("relative", className)}>
      {/* Floating Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          "transition-all duration-300 hover:scale-105",
          isOpen && "rotate-90"
        )}
        size="icon"
      >
        <Sparkles className="h-6 w-6" />
      </Button>

      {/* Floating Panel */}
      {isOpen && (
        <Card
          className={cn(
            "fixed bottom-24 right-6 z-40 w-80 h-[500px]",
            "flex flex-col shadow-2xl border-2",
            "animate-in fade-in slide-in-from-bottom-5 duration-300"
          )}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between border-b bg-primary/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">AI Assistant</h3>
                {resumeScore !== null && (
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          resumeScore >= 80 ? "bg-green-500" :
                          resumeScore >= 60 ? "bg-yellow-500" : "bg-red-500"
                        )}
                        style={{ width: `${resumeScore}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{resumeScore}</span>
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("insights")}
              className={cn(
                "flex-1 px-4 py-2 text-sm font-medium transition-colors",
                activeTab === "insights"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Insights
              {insights.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">
                  {insights.length}
                </Badge>
              )}
            </button>
            <button
              onClick={() => setActiveTab("suggest")}
              className={cn(
                "flex-1 px-4 py-2 text-sm font-medium transition-colors",
                activeTab === "suggest"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Quick Fixes
            </button>
            <button
              onClick={() => setActiveTab("keywords")}
              className={cn(
                "flex-1 px-4 py-2 text-sm font-medium transition-colors",
                activeTab === "keywords"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Keywords
            </button>
          </div>

          {/* Tab Content */}
          <ScrollArea className="flex-1 p-4">
            {activeTab === "insights" && (
              <div className="space-y-4">
                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                    <p className="text-sm text-muted-foreground">Analyzing your resume...</p>
                  </div>
                ) : insights.length > 0 ? (
                  insights.map((insight) => (
                    <Card
                      key={insight.id}
                      className="p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex gap-3">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">{insight.title}</h4>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {insight.description}
                          </p>
                          {insight.actionable && (
                            <Button
                              variant="link"
                              size="sm"
                              className="mt-2 h-auto p-0 text-xs"
                              onClick={() => insight.field && handleSuggestionClick(insight.description, insight.field)}
                            >
                              Fix this →
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <p className="text-sm font-medium">No issues found!</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your resume looks good. Keep it up!
                    </p>
                  </div>
                )}

                {/* Quick Stats */}
                {resumeData && (
                  <div className="pt-4 border-t space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Resume Stats
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded bg-muted p-2">
                        <p className="text-muted-foreground">Sections</p>
                        <p className="text-lg font-bold">
                          {Object.keys(resumeData).length}
                        </p>
                      </div>
                      <div className="rounded bg-muted p-2">
                        <p className="text-muted-foreground">Experience</p>
                        <p className="text-lg font-bold">
                          {resumeData.experience?.length || 0}
                        </p>
                      </div>
                      <div className="rounded bg-muted p-2">
                        <p className="text-muted-foreground">Skills</p>
                        <p className="text-lg font-bold">
                          {Array.isArray(resumeData.skills)
                            ? resumeData.skills.reduce((acc: number, s: any) => acc + (s.items?.length || 0), 0)
                            : 0}
                        </p>
                      </div>
                      <div className="rounded bg-muted p-2">
                        <p className="text-muted-foreground">Words</p>
                        <p className="text-lg font-bold">
                          {JSON.stringify(resumeData).split(/\s+/).length}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "suggest" && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground mb-3">
                  One-click improvements for {activeField || "your resume"}
                </p>
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map((suggestion) => (
                    <Card
                      key={suggestion.id}
                      className="p-3 cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
                      onClick={() => handleSuggestionClick(suggestion.content, suggestion.targetField)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                          {suggestion.icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{suggestion.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {suggestion.content}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Select a field to see suggestions
                    </p>
                  </div>
                )}

                {/* General Quick Actions */}
                <div className="pt-4 border-t space-y-2 mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    General Actions
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => handleQuickAction("rewrite-summary")}
                  >
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Rewrite Entire Summary
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => handleQuickAction("format-consistency")}
                  >
                    <Palette className="mr-2 h-3 w-3" />
                    Check Format Consistency
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "keywords" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium mb-2 block">Industry</label>
                  <select
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option value="default">General</option>
                    <option value="tech">Technology</option>
                    <option value="marketing">Marketing</option>
                    <option value="finance">Finance</option>
                  </select>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Keywords to Include
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(INDUSTRY_KEYWORDS[selectedIndustry] || INDUSTRY_KEYWORDS.default).map(
                      (keyword, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="cursor-pointer hover:bg-primary/20 transition-colors"
                          onClick={() => {
                            navigator.clipboard.writeText(keyword);
                          }}
                          title="Click to copy"
                        >
                          {keyword}
                        </Badge>
                      )
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Click any keyword to copy. Incorporate these naturally into your resume.
                  </p>
                </div>

                <Card className="p-3 bg-primary/5 border-primary/20">
                  <div className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-primary">ATS Tip</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Match exact keywords from job descriptions. Even synonyms may not be recognized by ATS.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="border-t p-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                setActiveTab("insights");
                runQuickAnalysis();
              }}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Refresh Analysis
                </>
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}