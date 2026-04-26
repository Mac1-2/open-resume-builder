"use client";

import * as React from "react";
import {useState, useEffect, useCallback} from "react";
import {useRouter} from "next/navigation";
import dynamic from "next/dynamic";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Separator} from "@/components/ui/separator";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Badge} from "@/components/ui/badge";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import { generateId } from "@/lib/utils";
import {cn} from "@/lib/utils";
import ErrorBoundary from "@/components/ErrorBoundary";
import {
  FileText,
  Download,
  Share2,
  Save,
  Palette,
  Settings,
  Eye,
  Edit,
  Plus,
  Briefcase,
  GraduationCap,
  Lightbulb,
  FolderOpen,
  Award,
  Languages,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Loader2,
  CheckCircle2,
  Circle,
  Brain,
  Zap,
  Wand2,
  Target,
  TrendingUp,
  BarChart,
  RefreshCw,
  Maximize2,
  User,
} from "lucide-react";
import {useResumeStore} from "@/store/useResumeStore";
import {useAIChatStore} from "@/store/useAIChatStore";
import TemplateSelector from "@/components/resume/TemplateSelector";
const ResumePreview = dynamic(() => import("@/components/resume/ResumePreview"), { ssr: false });
import AIChat from "@/components/ai/AIChat";

const PDFExportButton = dynamic(
  () => import("@/components/resume/PDFExport").then((mod) => mod.PDFExport),
  {ssr: false}
);

interface Section {
  id: string;
  label: string;
  icon: React.ReactNode;
  completed: boolean;
  required: boolean;
}

const SECTIONS: Section[] = [
  {id: "personal", label: "Personal Info", icon: <User className="h-4 w-4" />, completed: false, required: true},
  {id: "summary", label: "Summary", icon: <FileText className="h-4 w-4" />, completed: false, required: false},
  {id: "experience", label: "Experience", icon: <Briefcase className="h-4 w-4" />, completed: false, required: true},
  {id: "education", label: "Education", icon: <GraduationCap className="h-4 w-4" />, completed: false, required: false},
  {id: "skills", label: "Skills", icon: <Lightbulb className="h-4 w-4" />, completed: false, required: true},
  {id: "projects", label: "Projects", icon: <FolderOpen className="h-4 w-4" />, completed: false, required: false},
  {id: "certifications", label: "Certifications", icon: <Award className="h-4 w-4" />, completed: false, required: false},
  {id: "languages", label: "Languages", icon: <Languages className="h-4 w-4" />, completed: false, required: false},
];

const QUICK_ACTIONS = [
  {id: "improve", label: "Improve Bullets", icon: <Wand2 className="h-4 w-4" />, description: "Enhance impact"},
  {id: "grammar", label: "Grammar Check", icon: <Target className="h-4 w-4" />, description: "Fix errors"},
  {id: "skills", label: "Suggest Skills", icon: <Lightbulb className="h-4 w-4" />, description: "Add relevant skills"},
  {id: "ats", label: "ATS Optimize", icon: <TrendingUp className="h-4 w-4" />, description: "Pass scanners"},
];

export default function ResumeBuilderPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("personal");
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [aiChatOpen, setAiChatOpen] = useState(true);

  const {currentResume, updateResume, createResume} = useResumeStore();
  const {createChat, currentChatId} = useAIChatStore();

  const [resumeData, setResumeData] = useState({
    template: "Modern Clean",
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      photo: "",
      title: "",
      summary: "",
      website: "",
      linkedin: "",
      github: "",
    },
    experience: [] as Array<{
      id: string;
      company: string;
      position: string;
      startDate: string;
      endDate: string;
      current: boolean;
      description: string;
      achievements: string[];
    }>,
    education: [] as Array<{
      id: string;
      institution: string;
      degree: string;
      field: string;
      startDate: string;
      endDate: string;
      gpa: string;
    }>,
    skills: [] as Array<{
      category: string;
      items: string[];
    }>,
    projects: [] as Array<{
      id: string;
      name: string;
      description: string;
      url: string;
      technologies: string[];
    }>,
    certifications: [] as Array<{
      name: string;
      issuer: string;
      date: string;
    }>,
    languages: [] as Array<{
      language: string;
      proficiency: string;
    }>,
    references: [] as Array<{
      name: string;
      title: string;
      company: string;
      email: string;
      phone: string;
    }>,
  });

  useEffect(() => {
    const autoSave = setInterval(() => {
      handleSave(true);
    }, 30000);

    return () => clearInterval(autoSave);
  }, [resumeData]);

  const handleSave = useCallback(async (silent = false) => {
    if (!silent) setIsSaving(true);
    try {
      updateResume("current", resumeData);
      setLastSaved(new Date());
      console.log("Resume saved:", resumeData);
    } catch (error) {
      console.error("Error saving resume:", error);
    } finally {
      if (!silent) setIsSaving(false);
    }
  }, [resumeData, updateResume]);

  const updatePersonalInfo = useCallback((field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }));
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const checkSectionCompleted = useCallback((sectionId: string): boolean => {
    switch (sectionId) {
      case "personal":
        return !!(resumeData.personalInfo.fullName && resumeData.personalInfo.email);
      case "summary":
        return !!resumeData.personalInfo.summary;
      case "experience":
        return resumeData.experience.length > 0 && resumeData.experience.some(e => e.position && e.company);
      case "education":
        return resumeData.education.length > 0 && resumeData.education.some(e => e.institution && e.degree);
      case "skills":
        return resumeData.skills.length > 0 && resumeData.skills.some(s => s.items.length > 0);
      case "projects":
        return resumeData.projects.length > 0 && resumeData.projects.some(p => p.name);
      case "certifications":
        return resumeData.certifications.length > 0 && resumeData.certifications.some(c => c.name);
      case "languages":
        return resumeData.languages.length > 0 && resumeData.languages.some(l => l.language);
      default:
        return false;
    }
  }, [resumeData]);

  const completionRate = Math.round(
    (SECTIONS.filter(s => s.required ? checkSectionCompleted(s.id) : checkSectionCompleted(s.id)).length / SECTIONS.length) * 100
  );

  const addSkill = useCallback((category: string, skill: string) => {
    setResumeData((prev) => {
      const existingCategory = prev.skills.find((s) => s.category === category);
      if (existingCategory) {
        return {
          ...prev,
          skills: prev.skills.map((s) =>
            s.category === category
              ? {...s, items: [...s.items, skill]}
              : s
          ),
        };
      }
      return {
        ...prev,
        skills: [...prev.skills, {category, items: [skill]}],
      };
    });
  }, []);

  const removeSkill = useCallback((category: string, skillIndex: number) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.map((s) =>
        s.category === category
          ? {...s, items: s.items.filter((_, i) => i !== skillIndex)}
          : s
      ),
    }));
  }, []);

  const addExperience = useCallback(() => {
    const newExperience = {
      id: generateId(),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      achievements: [] as string[],
    };
    setResumeData((prev) => ({
      ...prev,
      experience: [...prev.experience, newExperience],
    }));
  }, []);

  const removeExperience = useCallback((id: string) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id),
    }));
  }, []);

  const updateExperience = useCallback(
    (id: string, field: string, value: any) => {
      setResumeData((prev) => ({
        ...prev,
        experience: prev.experience.map((exp) =>
          exp.id === id ? {...exp, [field]: value} : exp
        ),
      }));
    },
    []
  );

  const addEducation = useCallback(() => {
    const newEducation = {
      id: generateId(),
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      gpa: "",
    };
    setResumeData((prev) => ({
      ...prev,
      education: [...prev.education, newEducation],
    }));
  }, []);

  const removeEducation = useCallback((id: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  }, []);

  const updateEducation = useCallback(
    (id: string, field: string, value: any) => {
      setResumeData((prev) => ({
        ...prev,
        education: prev.education.map((edu) =>
          edu.id === id ? {...edu, [field]: value} : edu
        ),
      }));
    },
    []
  );

  const addProject = useCallback(() => {
    const newProject = {
      id: generateId(),
      name: "",
      description: "",
      url: "",
      technologies: [] as string[],
    };
    setResumeData((prev) => ({
      ...prev,
      projects: [...prev.projects, newProject],
    }));
  }, []);

  const removeProject = useCallback((id: string) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  }, []);

  const updateProject = useCallback((id: string, field: string, value: any) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    }));
  }, []);

  const addCertification = useCallback(() => {
    setResumeData((prev) => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        { name: "", issuer: "", date: "" },
      ],
    }));
  }, []);

  const removeCertification = useCallback((index: number) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter(
        (_, i) => i !== index
      ),
    }));
  }, []);

  const updateCertification = useCallback(
    (index: number, field: string, value: any) => {
      setResumeData((prev) => ({
        ...prev,
        certifications: prev.certifications.map((c, i) =>
          i === index
            ? { ...c, [field]: value }
            : c
        ),
      }));
    },
    []
  );

  const addLanguage = useCallback(() => {
    setResumeData((prev) => ({
      ...prev,
      languages: [...prev.languages, { language: "", proficiency: "Intermediate" }],
    }));
  }, []);

  const removeLanguage = useCallback((index: number) => {
    setResumeData((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
    }));
  }, []);

  const updateLanguage = useCallback((index: number, field: string, value: any) => {
    setResumeData((prev) => ({
      ...prev,
      languages: prev.languages.map((l, i) =>
        i === index ? { ...l, [field]: value } : l
      ),
    }));
  }, []);

  const handleTemplateSelect = useCallback((template: string) => {
    setResumeData((prev) => ({
      ...prev,
      template,
    }));
    setShowTemplates(false);
  }, []);

  return (
    <ErrorBoundary>
      <div className="flex h-screen flex-col bg-gradient-to-br from-background via-background to-muted/20">
        <header className="flex items-center justify-between border-b bg-card/80 backdrop-blur-sm px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className="hover:bg-primary/10"
            >
              <FileText className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Open Resume
              </h1>
              <Badge variant="secondary" className="text-xs">
                Beta
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplates(true)}
              className="gap-2 text-xs sm:text-sm"
            >
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Templates</span>
              <Badge variant="outline" className="ml-1 text-xs">
                {resumeData.template}
              </Badge>
            </Button>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Saving...</span>
                </>
              ) : lastSaved ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="hidden sm:inline">Saved {lastSaved.toLocaleTimeString()}</span>
                  <span className="sm:hidden">Saved</span>
                </>
              ) : (
                <>
                  <Circle className="h-4 w-4" />
                  <span className="hidden sm:inline">Not saved</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                <Share2 className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>
              
              <PDFExportButton data={resumeData}>
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <Download className="mr-1 sm:mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">PDF</span>
                </Button>
              </PDFExportButton>

              <Button size="sm" onClick={() => handleSave()} className="text-xs sm:text-sm">
                <Save className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Save</span>
              </Button>
            </div>

            <Avatar className="h-7 w-7 sm:h-8 sm:w-8 border-2 border-primary/20">
              <AvatarImage src="" />
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-xs sm:text-sm">
                {getInitials(resumeData.personalInfo.fullName || "JD")}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <aside
            className={cn(
              "flex flex-col border-r bg-card/50 backdrop-blur-sm transition-all duration-300",
              leftPanelOpen ? "w-64 sm:w-72" : "w-14"
            )}
          >
            <div className="flex items-center justify-between p-3 sm:p-4">
              {leftPanelOpen && (
                <div>
                  <h2 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Sections
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    {completionRate}% complete
                  </p>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                className="ml-auto"
              >
                {leftPanelOpen ? (
                  <ChevronLeft className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>

            {leftPanelOpen && (
              <div className="px-3 sm:px-4 mb-3">
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-500"
                    style={{width: `${completionRate}%`}}
                  />
                </div>
              </div>
            )}

            <ScrollArea className="flex-1">
              <nav className="p-2 space-y-1">
                {SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg text-sm font-medium transition-all",
                      activeSection === section.id
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <span className="flex-shrink-0">{section.icon}</span>
                    {leftPanelOpen && (
                      <>
                        <span className="flex-1 text-left truncate">{section.label}</span>
                        {checkSectionCompleted(section.id) ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                        )}
                      </>
                    )}
                  </button>
                ))}

                <button
                  className="w-full flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground border-2 border-dashed border-muted-foreground/20 mt-4"
                >
                  <Plus className="h-4 w-4 flex-shrink-0" />
                  {leftPanelOpen && "Add Section"}
                </button>
              </nav>
            </ScrollArea>

            {leftPanelOpen && (
              <div className="p-3 sm:p-4 border-t">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  AI Assistant
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_ACTIONS.map((action) => (
                    <Button
                      key={action.id}
                      variant="outline"
                      size="sm"
                      className="h-auto flex-col p-2 sm:p-3 gap-1 text-xs"
                      onClick={() => {
                        setAiChatOpen(true);
                      }}
                    >
                      {action.icon}
                      <span className="text-[10px] sm:text-xs font-medium line-clamp-2">{action.label}</span>
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="default"
                  size="sm"
                  className="w-full mt-3 gap-2 text-xs"
                  onClick={() => setAiChatOpen(!aiChatOpen)}
                >
                  <Brain className="h-3 w-3 sm:h-4 sm:w-4" />
                  {aiChatOpen ? "Hide AI" : "Show AI"}
                </Button>
              </div>
            )}
          </aside>

          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 border-b bg-background/50">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold capitalize">
                  {activeSection.replace("-", " ")}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {SECTIONS.find((s) => s.id === activeSection)?.label}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("preview")}
                  className="gap-2 text-xs sm:text-sm"
                >
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline">Preview</span>
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-3 sm:p-8">
                <Card className="mx-auto w-full max-w-4xl p-4 sm:p-8 shadow-xl">
                  {activeSection === "personal" && (
                    <div className="space-y-4 sm:space-y-6">
                      <h3 className="text-base sm:text-lg font-semibold border-b pb-3">
                        Personal Information
                      </h3>
                      
                      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                        <div className="relative">
                          <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-primary/10">
                            <AvatarImage src={resumeData.personalInfo.photo} />
                            <AvatarFallback className="text-xl sm:text-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
                              {getInitials(resumeData.personalInfo.fullName || "Your Name")}
                            </AvatarFallback>
                          </Avatar>
                          <Button
                            variant="outline"
                            size="sm"
                            className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full text-xs h-7 px-2"
                          >
                            Upload
                          </Button>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">
                            Upload a professional headshot (optional)
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Recommended: 300x400px, JPG or PNG
                          </p>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Full Name *</label>
                          <Input
                            value={resumeData.personalInfo.fullName}
                            onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
                            placeholder="John Doe"
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Professional Title</label>
                          <Input
                            value={resumeData.personalInfo.title}
                            onChange={(e) => updatePersonalInfo("title", e.target.value)}
                            placeholder="Senior Software Engineer"
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Email *</label>
                          <Input
                            type="email"
                            value={resumeData.personalInfo.email}
                            onChange={(e) => updatePersonalInfo("email", e.target.value)}
                            placeholder="john@example.com"
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Phone</label>
                          <Input
                            type="tel"
                            value={resumeData.personalInfo.phone}
                            onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                            placeholder="+1 (555) 000-0000"
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Location</label>
                          <Input
                            value={resumeData.personalInfo.location}
                            onChange={(e) => updatePersonalInfo("location", e.target.value)}
                            placeholder="San Francisco, CA"
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Website</label>
                          <Input
                            value={resumeData.personalInfo.website}
                            onChange={(e) => updatePersonalInfo("website", e.target.value)}
                            placeholder="johndoe.com"
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">LinkedIn</label>
                          <Input
                            value={resumeData.personalInfo.linkedin}
                            onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
                            placeholder="linkedin.com/in/johndoe"
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">GitHub</label>
                          <Input
                            value={resumeData.personalInfo.github}
                            onChange={(e) => updatePersonalInfo("github", e.target.value)}
                            placeholder="github.com/johndoe"
                            className="h-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Professional Summary</label>
                        <textarea
                          value={resumeData.personalInfo.summary}
                          onChange={(e) => updatePersonalInfo("summary", e.target.value)}
                          placeholder="Write a compelling professional summary that highlights your experience, skills, and career objectives..."
                          className="w-full rounded-lg border bg-background px-4 py-3 min-h-[120px] sm:min-h-[150px] resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          rows={4}
                        />
                        <p className="text-xs text-muted-foreground">
                          {resumeData.personalInfo.summary.length} characters
                        </p>
                      </div>
                    </div>
                  )}

                  {activeSection === "experience" && (
                    <div className="space-y-4 sm:space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base sm:text-lg font-semibold">Work Experience</h3>
                        <Button onClick={addExperience} className="gap-2 text-sm">
                          <Plus className="h-4 w-4" />
                          Add Experience
                        </Button>
                      </div>
                      <div className="space-y-4 sm:space-y-6">
                        {resumeData.experience.length === 0 ? (
                          <div className="text-center py-8 sm:py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                            <Briefcase className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-20" />
                            <p className="font-medium text-sm sm:text-base">No work experience added yet</p>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
                              Add your first work experience to showcase your career
                            </p>
                          </div>
                        ) : (
                          resumeData.experience.map((exp) => (
                            <Card key={exp.id} className="p-4 sm:p-6">
                              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Position</label>
                                  <Input
                                    value={exp.position}
                                    onChange={(e) =>
                                      updateExperience(exp.id, "position", e.target.value)
                                    }
                                    placeholder="Senior Developer"
                                    className="h-10"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Company</label>
                                  <Input
                                    value={exp.company}
                                    onChange={(e) =>
                                      updateExperience(exp.id, "company", e.target.value)
                                    }
                                    placeholder="Tech Corp"
                                    className="h-10"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Start Date</label>
                                  <Input
                                    type="date"
                                    value={exp.startDate}
                                    onChange={(e) =>
                                      updateExperience(exp.id, "startDate", e.target.value)
                                    }
                                    className="h-10"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">End Date</label>
                                  <Input
                                    type="date"
                                    value={exp.endDate}
                                    onChange={(e) =>
                                      updateExperience(exp.id, "endDate", e.target.value)
                                    }
                                    disabled={exp.current}
                                    className="h-10 disabled:opacity-50"
                                  />
                                </div>
                                <div className="flex items-center gap-4 md:col-span-2">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={exp.current}
                                      onChange={(e) =>
                                        updateExperience(
                                          exp.id,
                                          "current",
                                          e.target.checked
                                        )
                                      }
                                      className="rounded border-gray-300 h-4 w-4"
                                    />
                                    <span className="text-sm font-medium">
                                      Currently working here
                                    </span>
                                  </label>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                  <label className="text-sm font-medium">Description / Highlights</label>
                                  <textarea
                                    value={exp.description}
                                    onChange={(e) =>
                                      updateExperience(
                                        exp.id,
                                        "description",
                                        e.target.value
                                      )
                                    }
                                    className="w-full rounded-lg border bg-background px-3 py-2 min-h-[80px] resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Describe role and key accomplishments..."
                                  />
                                </div>
                                <div className="flex justify-end md:col-span-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeExperience(exp.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {activeSection === "education" && (
                    <div className="space-y-4 sm:space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base sm:text-lg font-semibold">Education</h3>
                        <Button onClick={addEducation} className="gap-2 text-sm">
                          <Plus className="h-4 w-4" />
                          Add Education
                        </Button>
                      </div>
                      <div className="space-y-4 sm:space-y-6">
                        {resumeData.education.length === 0 ? (
                          <div className="text-center py-8 sm:py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                            <GraduationCap className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-20" />
                            <p className="font-medium text-sm sm:text-base">No education added yet</p>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
                              Add your educational qualifications
                            </p>
                          </div>
                        ) : (
                          resumeData.education.map((edu) => (
                            <Card key={edu.id} className="p-4 sm:p-6">
                              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Institution</label>
                                  <Input
                                    value={edu.institution}
                                    onChange={(e) =>
                                      updateEducation(edu.id, "institution", e.target.value)
                                    }
                                    placeholder="University Name"
                                    className="h-10"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Degree</label>
                                  <Input
                                    value={edu.degree}
                                    onChange={(e) =>
                                      updateEducation(edu.id, "degree", e.target.value)
                                    }
                                    placeholder="Bachelor of Science"
                                    className="h-10"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Field of Study</label>
                                  <Input
                                    value={edu.field}
                                    onChange={(e) =>
                                      updateEducation(edu.id, "field", e.target.value)
                                    }
                                    placeholder="Computer Science"
                                    className="h-10"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">GPA (Optional)</label>
                                  <Input
                                    value={edu.gpa}
                                    onChange={(e) =>
                                      updateEducation(edu.id, "gpa", e.target.value)
                                    }
                                    placeholder="3.8"
                                    className="h-10"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Start Date</label>
                                  <Input
                                    type="date"
                                    value={edu.startDate}
                                    onChange={(e) =>
                                      updateEducation(edu.id, "startDate", e.target.value)
                                    }
                                    className="h-10"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">End Date</label>
                                  <Input
                                    type="date"
                                    value={edu.endDate}
                                    onChange={(e) =>
                                      updateEducation(edu.id, "endDate", e.target.value)
                                    }
                                    className="h-10"
                                  />
                                </div>
                                <div className="flex justify-end md:col-span-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeEducation(edu.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {activeSection === "skills" && (
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Skills</h2>
                        <div className="grid gap-4 sm:gap-6">
                          <div>
                            <label className="text-sm font-medium">Add Skill Category</label>
                            <div className="flex flex-col sm:flex-row gap-2 mt-2">
                              <Input
                                id="skills-category-input"
                                type="text"
                                placeholder="e.g., Technical Skills"
                                className="flex-1"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    const input = e.target as HTMLInputElement;
                                    const categoryName = input.value.trim();
                                    if (categoryName && !resumeData.skills.find(s => s.category === categoryName)) {
                                      setResumeData((prev) => ({
                                        ...prev,
                                        skills: [...prev.skills, { category: categoryName, items: [] }]
                                      }));
                                      input.value = "";
                                    }
                                  }
                                }}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const input = document.getElementById('skills-category-input') as HTMLInputElement;
                                  const categoryName = input?.value.trim();
                                  if (categoryName && !resumeData.skills.find(s => s.category === categoryName)) {
                                    setResumeData((prev) => ({
                                      ...prev,
                                      skills: [...prev.skills, { category: categoryName, items: [] }]
                                    }));
                                    if (input) input.value = "";
                                  }
                                }}
                              >
                                Add Category
                              </Button>
                            </div>
                          </div>
                          {resumeData.skills.map((category) => (
                            <Card key={category.category} className="p-4 sm:p-6">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base sm:text-lg font-semibold">
                                  {category.category}
                                </h3>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setResumeData((prev) => ({
                                      ...prev,
                                      skills: prev.skills.filter(s => s.category !== category.category)
                                    }));
                                  }}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm"
                                >
                                  Remove
                                </Button>
                              </div>
                              <div className="flex flex-wrap gap-2 mb-4">
                                {category.items.map((skill, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center rounded-full bg-primary/10 px-2 sm:px-3 py-1 text-xs sm:text-sm text-primary"
                                  >
                                    {skill}
                                    <button
                                      onClick={() =>
                                        removeSkill(category.category, index)
                                      }
                                      className="ml-1 sm:ml-2 text-primary hover:text-red-600"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <Input
                                  type="text"
                                  placeholder="Add new skill..."
                                  className="flex-1"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      const input = e.target as HTMLInputElement;
                                      if (input.value.trim()) {
                                        addSkill(category.category, input.value.trim());
                                        input.value = "";
                                      }
                                    }
                                  }}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    const input = (e.target as HTMLButtonElement).previousElementSibling as HTMLInputElement;
                                    if (input?.value.trim()) {
                                      addSkill(category.category, input.value.trim());
                                      input.value = "";
                                    }
                                  }}
                                  className="text-xs sm:text-sm"
                                >
                                  Add
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === "projects" && (
                    <div className="space-y-4 sm:space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-base sm:text-lg font-semibold">Projects</h2>
                        <Button onClick={addProject} className="gap-2 text-sm">
                          <Plus className="h-4 w-4" />
                          Add Project
                        </Button>
                      </div>
                      <div className="space-y-4 sm:space-y-6">
                        {resumeData.projects.length === 0 ? (
                          <div className="text-center py-8 sm:py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                            <FolderOpen className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-20" />
                            <p className="font-medium text-sm sm:text-base">No projects added yet</p>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
                              Add your portfolio projects
                            </p>
                          </div>
                        ) : (
                          resumeData.projects.map((proj) => (
                            <Card key={proj.id} className="p-4 sm:p-6">
                              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Project Name</label>
                                  <Input
                                    value={proj.name}
                                    onChange={(e) =>
                                      updateProject(proj.id, "name", e.target.value)
                                    }
                                    placeholder="Project name"
                                    className="h-10"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">URL (optional)</label>
                                  <Input
                                    value={proj.url || ""}
                                    onChange={(e) =>
                                      updateProject(proj.id, "url", e.target.value)
                                    }
                                    placeholder="https://project.example.com"
                                    className="h-10"
                                  />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                  <label className="text-sm font-medium">Description</label>
                                  <textarea
                                    value={proj.description}
                                    onChange={(e) =>
                                      updateProject(proj.id, "description", e.target.value)
                                    }
                                    className="w-full rounded-lg border bg-background px-3 py-2 min-h-[80px] resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Describe this project..."
                                  />
                                </div>
                                <div className="flex justify-end md:col-span-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeProject(proj.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {activeSection === "certifications" && (
                    <div className="space-y-4 sm:space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-base sm:text-lg font-semibold">Certifications</h2>
                        <Button onClick={addCertification} className="gap-2 text-sm">
                          <Plus className="h-4 w-4" />
                          Add Certification
                        </Button>
                      </div>
                      <div className="space-y-4 sm:space-y-6">
                        {resumeData.certifications.length === 0 ? (
                          <div className="text-center py-8 sm:py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                            <Award className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-20" />
                            <p className="font-medium text-sm sm:text-base">No certifications added yet</p>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
                              Add certifications
                            </p>
                          </div>
                        ) : (
                          resumeData.certifications.map((cert, index) => (
                            <Card key={index} className="p-4 sm:p-6">
                              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Name</label>
                                  <Input
                                    value={cert.name}
                                    onChange={(e) =>
                                      updateCertification(
                                        index,
                                        "name",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Certification"
                                    className="h-10"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Issuer</label>
                                  <Input
                                    value={cert.issuer}
                                    onChange={(e) =>
                                      updateCertification(
                                        index,
                                        "issuer",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Issuing organization"
                                    className="h-10"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Date</label>
                                  <Input
                                    value={cert.date}
                                    onChange={(e) =>
                                      updateCertification(
                                        index,
                                        "date",
                                        e.target.value
                                      )
                                    }
                                    placeholder="2023"
                                    className="h-10"
                                  />
                                </div>
                                <div className="flex justify-end md:col-span-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeCertification(index)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {activeSection === "languages" && (
                    <div className="space-y-4 sm:space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-base sm:text-lg font-semibold">Languages</h2>
                        <Button onClick={addLanguage} className="gap-2 text-sm">
                          <Plus className="h-4 w-4" />
                          Add Language
                        </Button>
                      </div>
                      <div className="space-y-4 sm:space-y-6">
                        {resumeData.languages.length === 0 ? (
                          <div className="text-center py-8 sm:py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                            <Languages className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-20" />
                            <p className="font-medium text-sm sm:text-base">No languages added yet</p>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
                              Add languages you speak
                            </p>
                          </div>
                        ) : (
                          resumeData.languages.map((lang, index) => (
                            <Card key={index} className="p-4 sm:p-6">
                              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Language</label>
                                  <Input
                                    value={lang.language}
                                    onChange={(e) =>
                                      updateLanguage(index, "language", e.target.value)
                                    }
                                    placeholder="Spanish"
                                    className="h-10"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Proficiency</label>
                                  <select
                                    value={lang.proficiency}
                                    onChange={(e) =>
                                      updateLanguage(index, "proficiency", e.target.value)
                                    }
                                    className="w-full rounded-md border px-3 py-2 h-10 bg-background"
                                  >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Fluent">Fluent</option>
                                    <option value="Native">Native</option>
                                  </select>
                                </div>
                                <div className="flex justify-end md:col-span-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeLanguage(index)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {activeSection === "summary" && (
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Professional Summary</h2>
                        <textarea
                          value={resumeData.personalInfo.summary}
                          onChange={(e) => updatePersonalInfo("summary", e.target.value)}
                          placeholder="Write a compelling professional summary that highlights your experience, skills, and career objectives..."
                          className="w-full rounded-lg border bg-background px-4 py-3 min-h-[200px] sm:min-h-[250px] resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          rows={8}
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          {resumeData.personalInfo.summary.length} characters
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </ScrollArea>
          </main>

          {rightPanelOpen && (
            <aside
              className={cn(
                "flex flex-col border-l bg-card/30 backdrop-blur-sm transition-all duration-300",
                rightPanelOpen ? "w-[380px] sm:w-[540px]" : "w-14"
              )}
            >
              <div className="flex items-center justify-between p-3 sm:p-4 border-b">
                <h2 className="font-semibold text-sm sm:text-base">Preview & AI</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRightPanelOpen(!rightPanelOpen)}
                  className="ml-auto"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
                <div className="px-3 sm:px-4 pt-3 sm:pt-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="preview" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Preview</span>
                    </TabsTrigger>
                    <TabsTrigger value="ai" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                      <Brain className="h-3 w-3 sm:h-4 sm:w-4" />
                      AI
                      {aiChatOpen && (
                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full animate-pulse" />
                      )}
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-hidden">
                  <TabsContent value="preview" className="h-full mt-0">
                    <div className="h-full">
                        <ResumePreview data={resumeData} template={resumeData.template} />
                    </div>
                  </TabsContent>

                  <TabsContent value="ai" className="h-full mt-0">
                    <AIChat resumeId={currentResume?.id || ""} />
                  </TabsContent>
                </div>
              </Tabs>
            </aside>
          )}
        </div>

        {showTemplates && (
          <TemplateSelector
            selectedTemplate={resumeData.template}
            onTemplateSelect={handleTemplateSelect}
            onClose={() => setShowTemplates(false)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
