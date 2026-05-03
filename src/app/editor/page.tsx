"use client";

import * as React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateId, cn } from "@/lib/utils";
import ErrorBoundary from "@/components/ErrorBoundary";
import {
  FileText,
  Download,
  Share2,
  Save,
  Palette,
  Eye,
  Plus,
  Briefcase,
  GraduationCap,
  Lightbulb,
  FolderOpen,
  Award,
  Languages,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Circle,
  Brain,
  Wand2,
  Target,
  TrendingUp,
  User,
} from "lucide-react";

import { useResumeStore } from "@/store/useResumeStore";
import { useAIChatStore } from "@/store/useAIChatStore";
import TemplateSelector from "@/components/resume/TemplateSelector";
import AIChat from "@/components/ai/AIChat";
import { BaseResumeData } from "@/components/resume/templates/types";

// Import modularized sections
import {
  PersonalInfoSection,
  ExperienceSection,
  EducationSection,
  SkillsSection,
  ProjectsSection,
  CertificationsSection,
  LanguagesSection,
  SummarySection,
} from "@/components/resume/editor/sections";

const ResumePreview = dynamic(() => import("@/components/resume/ResumePreview"), { ssr: false });

const PDFExportButton = dynamic(
  () => import("@/components/resume/PDFExport").then((mod) => mod.PDFExport),
  { ssr: false }
);

interface Section {
  id: string;
  label: string;
  icon: React.ReactNode;
  required: boolean;
}

const SECTIONS: Section[] = [
  { id: "personal", label: "Personal Info", icon: <User className="h-4 w-4" />, required: true },
  { id: "summary", label: "Summary", icon: <FileText className="h-4 w-4" />, required: false },
  { id: "experience", label: "Experience", icon: <Briefcase className="h-4 w-4" />, required: true },
  { id: "education", label: "Education", icon: <GraduationCap className="h-4 w-4" />, required: false },
  { id: "skills", label: "Skills", icon: <Lightbulb className="h-4 w-4" />, required: true },
  { id: "projects", label: "Projects", icon: <FolderOpen className="h-4 w-4" />, required: false },
  { id: "certifications", label: "Certifications", icon: <Award className="h-4 w-4" />, required: false },
  { id: "languages", label: "Languages", icon: <Languages className="h-4 w-4" />, required: false },
];

export default function ResumeBuilderPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("personal");
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "ai">("preview");

  const { updateResume } = useResumeStore();
  const { currentResume } = useResumeStore();

  const [resumeData, setResumeData] = useState<BaseResumeData & { template: string }>({
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
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    references: [],
  });

  // Load existing resume if available
  useEffect(() => {
    if (currentResume) {
      setResumeData((prev) => ({
        ...prev,
        ...currentResume,
        template: currentResume.template || prev.template,
        personalInfo: {
          ...prev.personalInfo,
          ...currentResume.personalInfo,
        },
      }));
    }
  }, [currentResume]);

  // Auto-save effect
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
        return (resumeData.experience?.length ?? 0) > 0 && resumeData.experience!.some(e => e.position && e.company);
      case "education":
        return (resumeData.education?.length ?? 0) > 0 && resumeData.education!.some(e => e.institution && e.degree);
      case "skills":
        return (resumeData.skills?.length ?? 0) > 0 && resumeData.skills!.some(s => s.items.length > 0);
      case "projects":
        return (resumeData.projects?.length ?? 0) > 0 && resumeData.projects!.some(p => p.name);
      case "certifications":
        return (resumeData.certifications?.length ?? 0) > 0 && resumeData.certifications!.some(c => c.name);
      case "languages":
        return (resumeData.languages?.length ?? 0) > 0 && resumeData.languages!.some(l => l.language);
      default:
        return false;
    }
  }, [resumeData]);

  const completionRate = useMemo(() => {
    const completedCount = SECTIONS.filter(s => checkSectionCompleted(s.id)).length;
    return Math.round((completedCount / SECTIONS.length) * 100);
  }, [checkSectionCompleted]);

  // Handler functions
  const addExperience = useCallback(() => {
    setResumeData((prev) => ({
      ...prev,
      experience: [...(prev.experience || []), {
        id: generateId(),
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
        achievements: [],
      }],
    }));
  }, []);

  const removeExperience = useCallback((id: string) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience?.filter((exp) => exp.id !== id),
    }));
  }, []);

  const updateExperience = useCallback((id: string, field: string, value: any) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience?.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }));
  }, []);

  const addEducation = useCallback(() => {
    setResumeData((prev) => ({
      ...prev,
      education: [...(prev.education || []), {
        id: generateId(),
        institution: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: "",
        gpa: "",
      }],
    }));
  }, []);

  const removeEducation = useCallback((id: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education?.filter((edu) => edu.id !== id),
    }));
  }, []);

  const updateEducation = useCallback((id: string, field: string, value: any) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education?.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    }));
  }, []);

  const addSkill = useCallback((category: string, skill: string) => {
    setResumeData((prev) => {
      const skills = prev.skills || [];
      const existingCategory = skills.find((s) => s.category === category);
      if (existingCategory) {
        return {
          ...prev,
          skills: skills.map((s) =>
            s.category === category
              ? { ...s, items: [...s.items, skill] }
              : s
          ),
        };
      }
      return {
        ...prev,
        skills: [...skills, { category, items: [skill] }],
      };
    });
  }, []);

  const removeSkill = useCallback((category: string, skillIndex: number) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills?.map((s) =>
        s.category === category
          ? { ...s, items: s.items.filter((_, i) => i !== skillIndex) }
          : s
      ),
    }));
  }, []);

  const addProject = useCallback(() => {
    setResumeData((prev) => ({
      ...prev,
      projects: [...(prev.projects || []), {
        id: generateId(),
        name: "",
        description: "",
        url: "",
        technologies: [],
      }],
    }));
  }, []);

  const removeProject = useCallback((id: string) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects?.filter((p) => p.id !== id),
    }));
  }, []);

  const updateProject = useCallback((id: string, field: string, value: any) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects?.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    }));
  }, []);

  const addCertification = useCallback(() => {
    setResumeData((prev) => ({
      ...prev,
      certifications: [...(prev.certifications || []), { name: "", issuer: "", date: "" }],
    }));
  }, []);

  const removeCertification = useCallback((index: number) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: prev.certifications?.filter((_, i) => i !== index),
    }));
  }, []);

  const updateCertification = useCallback((index: number, field: string, value: any) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: prev.certifications?.map((c, i) =>
        i === index ? { ...c, [field]: value } : c
      ),
    }));
  }, []);

  const addLanguage = useCallback(() => {
    setResumeData((prev) => ({
      ...prev,
      languages: [...(prev.languages || []), { language: "", proficiency: "Intermediate" }],
    }));
  }, []);

  const removeLanguage = useCallback((index: number) => {
    setResumeData((prev) => ({
      ...prev,
      languages: prev.languages?.filter((_, i) => i !== index),
    }));
  }, []);

  const updateLanguage = useCallback((index: number, field: string, value: any) => {
    setResumeData((prev) => ({
      ...prev,
      languages: prev.languages?.map((l, i) =>
        i === index ? { ...l, [field]: value } : l
      ),
    }));
  }, []);

  const handleTemplateSelect = useCallback((template: string) => {
    setResumeData((prev) => ({ ...prev, template }));
    setShowTemplates(false);
  }, []);

  const renderActiveSection = () => {
    switch (activeSection) {
      case "personal":
        return (
          <PersonalInfoSection
            data={resumeData.personalInfo}
            updatePersonalInfo={updatePersonalInfo}
            getInitials={getInitials}
          />
        );
      case "experience":
        return (
          <ExperienceSection
            data={resumeData.experience}
            addExperience={addExperience}
            removeExperience={removeExperience}
            updateExperience={updateExperience}
          />
        );
      case "education":
        return (
          <EducationSection
            data={resumeData.education}
            addEducation={addEducation}
            removeEducation={removeEducation}
            updateEducation={updateEducation}
          />
        );
      case "skills":
        return (
          <SkillsSection
            data={resumeData.skills}
            addSkill={addSkill}
            removeSkill={removeSkill}
            setResumeData={setResumeData}
          />
        );
      case "projects":
        return (
          <ProjectsSection
            data={resumeData.projects}
            addProject={addProject}
            removeProject={removeProject}
            updateProject={updateProject}
          />
        );
      case "certifications":
        return (
          <CertificationsSection
            data={resumeData.certifications}
            addCertification={addCertification}
            removeCertification={removeCertification}
            updateCertification={updateCertification}
          />
        );
      case "languages":
        return (
          <LanguagesSection
            data={resumeData.languages}
            addLanguage={addLanguage}
            removeLanguage={removeLanguage}
            updateLanguage={updateLanguage}
          />
        );
      case "summary":
        return (
          <SummarySection
            data={resumeData.personalInfo.summary || ""}
            updateSummary={(val) => updatePersonalInfo("summary", val)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex h-screen flex-col bg-background">
        <header className="flex items-center border-b bg-card/50 backdrop-blur-md px-4 sm:px-6 py-2 h-14">
          <div className="flex items-center gap-3 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className="h-9 w-9"
            >
              <FileText className="h-5 w-5 text-primary" />
            </Button>
            <div className="hidden md:flex flex-col">
              <h1 className="text-sm font-bold">Open Resume</h1>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Editor Panel</span>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-1 justify-center">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/50 rounded-full border border-border/50">
               <Palette className="h-4 w-4 text-primary" />
               <button 
                 onClick={() => setShowTemplates(true)}
                 className="text-xs font-semibold hover:text-primary transition-colors"
               >
                 {resumeData.template}
               </button>
             </div>
             
             <div className="hidden sm:flex items-center gap-2">
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                )}
                <span className="text-[11px] font-medium text-muted-foreground">
                  {isSaving ? "Saving..." : "All changes saved"}
                </span>
             </div>
          </div>

          <div className="flex items-center gap-2 flex-1 justify-end">
            <PDFExportButton data={resumeData}>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </PDFExportButton>

            <Button size="sm" onClick={() => handleSave()} className="h-9 gap-2 shadow-sm shadow-primary/20">
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Save</span>
            </Button>

            <div className="h-8 w-[1px] bg-border mx-1" />

            <Avatar className="h-8 w-8 ring-2 ring-primary/10">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                {getInitials(resumeData.personalInfo.fullName || "JD")}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <main className={cn(
            "flex flex-col bg-muted/30 relative transition-all duration-500 ease-in-out",
            rightPanelOpen ? "w-[40%]" : "w-full"
          )}>
            {/* Top Navigation Bar */}
            <div className="bg-background border-b z-10">
               <ScrollArea className="w-full">
                <div className="flex p-2 gap-1 min-w-max px-4">
                  {SECTIONS.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all",
                        activeSection === section.id
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      {section.icon}
                      {section.label}
                      {checkSectionCompleted(section.id) && (
                        <CheckCircle2 className="h-3 w-3 text-green-400 fill-current bg-white rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 sm:p-8 lg:p-12">
                <Card className="mx-auto w-full max-w-4xl p-6 sm:p-10 shadow-2xl shadow-primary/5 border-none bg-card/80 backdrop-blur-sm">
                  {renderActiveSection()}
                </Card>
              </div>
            </ScrollArea>

            {/* Bottom Progress Bar */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[300px] bg-card/80 backdrop-blur-md border border-border/50 rounded-full p-1.5 shadow-xl hidden md:flex items-center gap-3">
              <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden ml-2">
                <div 
                  className="bg-primary h-full transition-all duration-500 rounded-full"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-primary mr-2 w-8 text-right">
                {completionRate}%
              </span>
            </div>
          </main>

          <aside
            className={cn(
              "flex flex-col border-l bg-card transition-all duration-500 ease-in-out relative",
              rightPanelOpen ? "w-[60%]" : "w-0 overflow-hidden border-none"
            )}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 p-3 border-b">
                 <div className="flex-1 flex gap-1 bg-muted p-1 rounded-lg">
                    <button
                      onClick={() => setActiveTab("preview")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[11px] font-bold transition-all",
                        activeTab === "preview" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Eye className="h-3.5 w-3.5" /> PREVIEW
                    </button>
                    <button
                      onClick={() => setActiveTab("ai")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[11px] font-bold transition-all",
                        activeTab === "ai" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Brain className="h-3.5 w-3.5" /> AI COPILOT
                    </button>
                 </div>
              </div>

              <div className="flex-1 overflow-hidden">
                {activeTab === "preview" ? (
                  <div className="h-full bg-muted/50 p-4">
                    <div className="h-full bg-white rounded-xl shadow-inner overflow-hidden flex flex-col">
                       <ResumePreview data={resumeData} template={resumeData.template} />
                    </div>
                  </div>
                ) : (
                  <AIChat resumeId={currentResume?.id || ""} />
                )}
              </div>
            </div>
          </aside>

          {/* Floating Action Buttons */}
          <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
              className="h-12 w-12 rounded-full shadow-lg border-2 border-primary/20"
            >
              {rightPanelOpen ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
            </Button>
          </div>
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
