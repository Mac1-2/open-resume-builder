"use client";

import * as React from "react";
import { useState, useRef, useEffect, useCallback, Component, ErrorInfo, ReactNode } from "react";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  Paperclip,
  Download,
  FileText,
  Lightbulb,
  Target,
  CheckCircle,
  BarChart,
  X,
  FileUp,
  Copy,
  Check,
  FileSearch,
  RefreshCw,
} from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { useAIChatStore, type Suggestion } from "@/store/useAIChatStore";
import { generateId } from "@/lib/utils";
import { useResumeStore } from "@/store/useResumeStore";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: Suggestion[];
}

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  prompt: string;
  description: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "summary",
    label: "💡 Improve Summary",
    icon: <FileText className="h-4 w-4" />,
    prompt: "Help me improve my professional summary",
    description: "Get suggestions for a more compelling summary",
  },
  {
    id: "skills",
    label: "🔧 Skills Suggestions",
    icon: <Lightbulb className="h-4 w-4" />,
    prompt: "What skills should I add to my resume?",
    description: "Discover relevant skills for your industry",
  },
  {
    id: "grammar",
    label: "✓ Grammar Check",
    icon: <CheckCircle className="h-4 w-4" />,
    prompt: "Check my resume for grammar and spelling errors",
    description: "Review for errors and consistency",
  },
  {
    id: "tailor",
    label: "🎯 Tailor to Job",
    icon: <Target className="h-4 w-4" />,
    prompt: "Help me tailor my resume to a specific job",
    description: "Customize for specific roles",
  },
  {
    id: "rewrite",
    label: "✨ Rewrite Bullet",
    icon: <Sparkles className="h-4 w-4" />,
    prompt: "Rewrite my experience bullet points for more impact",
    description: "Transform weak bullets into strong statements",
  },
  {
    id: "ats",
    label: "📊 ATS Optimize",
    icon: <BarChart className="h-4 w-4" />,
    prompt: "How can I optimize my resume for ATS scanners?",
    description: "Ensure automated screening success",
   },
 ];

// Error Boundary for graceful error handling
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ChatErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Chat component error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex h-full items-center justify-center p-4">
          <Card className="p-6 text-center max-w-sm">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <Bot className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2">Something went wrong</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The AI assistant encountered an unexpected error. Please try again.
            </p>
            <Button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset Chat
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

interface AIChatProps {
  resumeId?: string;
  className?: string;
  onApplySuggestion?: (suggestion: Suggestion) => void;
}

export default function AIChat({
  resumeId,
  className,
  onApplySuggestion,
}: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showJobUpload, setShowJobUpload] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const currentChatIdRef = useRef<string | null>(null);

  const resume = useResumeStore((state) => state.currentResume);
  const { addMessage, createChat, setCurrentChat, setLoading, activeSuggestions, addSuggestion } = useAIChatStore();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLDivElement;
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  // Initialize chat on mount
  useEffect(() => {
    const initChat = async () => {
      if (!currentChatIdRef.current && messages.length === 0) {
        await createChat(resumeId);
        const { chats } = useAIChatStore.getState();
        if (chats.length > 0) {
          currentChatIdRef.current = chats[0].id;
          setCurrentChat(chats[0].id);
        }
      }
    };
    initChat();
  }, []);

  const handleSendMessage = useCallback(
    async (content?: string, includeResumeContext = true) => {
      const messageContent = content || input.trim();
      if (!messageContent || isLoading) return;

      const userMessage: ChatMessage = {
        id: generateId(),
        role: "user",
        content: messageContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);
      setLoading(true);

      try {
        // Save user message
        if (currentChatIdRef.current) {
          await addMessage(currentChatIdRef.current, {
            role: "user",
            content: messageContent,
          });
        }

        // Prepare messages for API including history
        const apiMessages: Array<{role: "user" | "assistant"; content: string}> = [
          ...messages.map((m) => ({role: m.role, content: m.content})),
          {role: "user", content: messageContent},
        ];

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            messages: apiMessages,
            resumeId: includeResumeContext ? resumeId : undefined,
          }),
        });

        if (!response.ok) throw new Error("Failed to get response");

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";

        // Create assistant message placeholder
        const assistantMessageId = generateId();
        const assistantMessage: ChatMessage = {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
        };

        // Add empty message and stream content into it
        setMessages((prev) => [...prev, assistantMessage]);

        if (reader) {
          while (true) {
            const {done, value} = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") break;

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.content) {
                    assistantContent += parsed.content;
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === assistantMessageId
                          ? {...msg, content: assistantContent}
                          : msg
                      )
                    );
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
            }
          }
        }

        // Save assistant message
        if (currentChatIdRef.current) {
          await addMessage(currentChatIdRef.current, {
            role: "assistant",
            content: assistantContent,
          });
        }

        // Parse suggestions from response (simple heuristic)
        const suggestions = parseSuggestionsFromResponse(assistantContent);
        if (suggestions.length > 0) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId ? {...msg, suggestions} : msg
            )
          );
        }
      } catch (error) {
        console.error("Error sending message:", error);
        const errorMessage: ChatMessage = {
          id: generateId(),
          role: "assistant",
          content:
            "I apologize, but I encountered an error. Please try again or refresh the page.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        setLoading(false);
      }
    },
    [input, isLoading, addMessage, setLoading, messages, resumeId]
  );

  const handleCopyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleResumeAnalysis = async () => {
    await handleSendMessage("Please analyze my entire resume and give me a comprehensive score with specific feedback on strengths and areas for improvement.");
  };

  const parseSuggestionsFromResponse = (content: string): Suggestion[] => {
    const suggestions: Suggestion[] = [];

    if (content.toLowerCase().includes("improve") || content.toLowerCase().includes("suggest")) {
      suggestions.push({
        id: generateId(),
        type: "suggest",
        section: "summary",
        description: "Consider enhancing your summary with quantifiable achievements",
        suggestedContent: "",
        impact: "medium",
      });
    }

    return suggestions;
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = async (action: QuickAction) => {
    let prompt = action.prompt;
    
    // Add resume context if applicable
    if (resume) {
      if (action.id === "summary") {
        const summary = resume.personalInfo?.summary || "No summary";
        prompt = `My current summary: "${summary}". ${action.prompt}`;
      } else if (action.id === "skills") {
        const currentSkills = resume.skills?.flatMap(s => s.items || []).join(", ") || "No skills listed";
        prompt = `My current skills: ${currentSkills}. ${action.prompt}`;
      } else {
        prompt = `${action.prompt}. Here is my resume data: ${JSON.stringify(resume, null, 2).slice(0, 2000)}`;
      }
    }

    await handleSendMessage(prompt);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.txt') && !file.name.endsWith('.pdf') && !file.name.endsWith('.doc') && !file.name.endsWith('.docx')) {
      alert("Please upload a text file (.txt) containing the job description");
      return;
    }

    setIsLoading(true);
    
    try {
      let content = "";
      
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        content = await file.text();
      } else {
        // For PDF/DOCX, we'd need additional libraries
        // For now, prompt user to paste text
        alert("Please copy the text from the job description and paste it into the chat.");
        setShowJobUpload(false);
        setIsLoading(false);
        return;
      }

      setJobDescription(content);
      await handleSendMessage(`Here is the job description I want to tailor my resume to:\n\n${content}`, true);
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Error reading file. Please try again.");
    } finally {
      setIsLoading(false);
      setShowJobUpload(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleExportChat = () => {
    const chatContent = messages
      .map((msg) => {
        const role = msg.role === "user" ? "You" : "AI Assistant";
        return `${role} (${new Date(msg.timestamp).toLocaleString()}):\n${msg.content}`;
      })
      .join("\n\n---\n\n");

    const blob = new Blob([chatContent], {type: "text/plain"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleApplySuggestion = (suggestion: Suggestion) => {
    if (onApplySuggestion) {
      onApplySuggestion(suggestion);
    } else {
      console.log("Apply suggestion:", suggestion);
      // Could dispatch a custom event or use a global callback
    }
  };

  const hasResumeContext = !!resumeId || !!resume;

  return (
    <ChatErrorBoundary>
      <Card className={cn("flex h-full flex-col", className)}>
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b bg-muted/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">AI Resume Assistant</h3>
              <p className="text-xs text-muted-foreground">
                {hasResumeContext ? "Context-aware help" : "General resume advice"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {messages.length > 0 && (
              <>
                <Button variant="ghost" size="icon" onClick={handleResumeAnalysis} title="Analyze Resume">
                  <FileSearch className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleExportChat} title="Export chat">
                  <Download className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="border-b bg-background p-4">
          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => handleQuickAction(action)}
                disabled={isLoading}
                title={action.description}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src="/ai-avatar.png" />
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-4 py-2 relative group",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <MarkdownRenderer content={message.content} />
                  {message.role === "assistant" && message.content && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -right-8 top-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleCopyMessage(message.content, message.id)}
                      title="Copy message"
                    >
                      {copiedMessageId === message.id ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
                        💡 Suggested Actions
                      </p>
                      {message.suggestions.map((suggestion) => (
                        <div
                          key={suggestion.id}
                          className="flex items-start gap-2 rounded border bg-background/50 p-2 text-sm"
                        >
                          <Lightbulb className="h-4 w-4 mt-0.5 shrink-0 text-yellow-600" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{suggestion.section}</span>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-xs",
                                  suggestion.impact === "high" && "bg-red-100 text-red-700",
                                  suggestion.impact === "medium" && "bg-yellow-100 text-yellow-700",
                                  suggestion.impact === "low" && "bg-blue-100 text-blue-700"
                                )}
                              >
                                {suggestion.impact}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {suggestion.description}
                            </p>
                            {suggestion.suggestedContent && (
                              <div className="mt-2 rounded bg-muted p-2 text-xs">
                                {suggestion.suggestedContent}
                              </div>
                            )}
                            <Button
                              variant="link"
                              size="sm"
                              className="mt-2 h-auto p-0 text-xs"
                              onClick={() => handleApplySuggestion(suggestion)}
                            >
                              Apply Suggestion
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs opacity-70 mt-1 text-right">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {message.role === "user" && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src="/user-avatar.png" />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src="/ai-avatar.png" />
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t bg-muted/50 p-4">
          {/* Job description upload modal */}
          {showJobUpload && (
            <div className="mb-3 rounded-lg border bg-background p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Upload Job Description</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setShowJobUpload(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".txt,.pdf,.doc,.docx"
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileUp className="mr-2 h-4 w-4" />
                  Choose File
                </Button>
                <span className="text-xs text-muted-foreground self-center">
                  .txt, .pdf, .docx supported
                </span>
              </div>
              <div className="mt-3">
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Or paste the job description here..."
                  className="w-full h-24 rounded border bg-background p-2 text-sm resize-none"
                />
                <div className="flex justify-end mt-2">
                  <Button
                    size="sm"
                    onClick={() => handleSendMessage(`Tailor my resume to this job:\n\n${jobDescription}`, true)}
                  >
                    Analyze
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!showJobUpload && (
            <Button
              variant="ghost"
              size="sm"
              className="mb-2 w-full justify-start text-xs text-muted-foreground"
              onClick={() => setShowJobUpload(true)}
            >
              <Paperclip className="mr-2 h-3 w-3" />
              Attach job description for tailored advice
            </Button>
          )}

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your resume..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </ChatErrorBoundary>
  );
}