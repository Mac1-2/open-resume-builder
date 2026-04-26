"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  FileText,
  Download,
  Printer,
  LayoutGrid,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useRef, useEffect } from "react";
import { PDFExport } from "./PDFExport";

// Import template components
import ProfessionalExecutive from "./templates/ProfessionalExecutive";
import ModernClean from "./templates/ModernClean";
import CreativeBold from "./templates/CreativeBold";
import MinimalSwiss from "./templates/MinimalSwiss";
import TechDeveloper from "./templates/TechDeveloper";

interface ResumeData {
  template?: string;
  personalInfo: {
    fullName: string;
    title: string;
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
    summary?: string;
    photo?: string;
  };
  experience: Array<{
    position: string;
    company: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description?: string;
    achievements?: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    field?: string;
    startDate: string;
    endDate: string;
  }>;
  skills: Array<{
    category: string;
    items: string[];
  }>;
  projects: Array<{
    name: string;
    description: string;
    url?: string;
    technologies?: string[];
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
  languages: Array<{
    language: string;
    proficiency: string;
  }>;
}

interface ResumePreviewProps {
  data: ResumeData;
  template?: string;
  className?: string;
  showControls?: boolean;
}

const TemplateComponents: Record<
  string,
  React.ComponentType<{ data: ResumeData; className?: string }>
> = {
  professional: ProfessionalExecutive,
  modern: ModernClean,
  creative: CreativeBold,
  minimal: MinimalSwiss,
  tech: TechDeveloper,
  "Professional Executive": ProfessionalExecutive,
  "Modern Clean": ModernClean,
  "Creative Bold": CreativeBold,
  "Minimal Swiss": MinimalSwiss,
  "Tech Developer": TechDeveloper,
};

export default function ResumePreview({
  data,
  template = "modern",
  className,
  showControls = true,
}: ResumePreviewProps) {
  const [isPrintView, setIsPrintView] = useState(false);
  const [viewSize, setViewSize] = useState<"desktop" | "mobile">("desktop");
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const activeTemplate = data?.template || template || "modern";
  const TemplateComponent = TemplateComponents[activeTemplate] || ModernClean;

  // Auto-scale to fit container width
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const targetWidth = 794; // Fixed A4 width
        const padding = 48; // Padding for visual breathing room
        const availableWidth = containerWidth - padding;
        
        if (availableWidth < targetWidth) {
          setScale(availableWidth / targetWidth);
        } else {
          setScale(1);
        }
      }
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, [viewSize]);

  const handlePrint = () => {
    setIsPrintView(true);
    setTimeout(() => {
      window.print();
      setIsPrintView(false);
    }, 500);
  };

  const toggleViewSize = () => {
    setViewSize(viewSize === "desktop" ? "mobile" : "desktop");
  };

  return (
    <Card className={cn("relative flex flex-col h-full border-none shadow-none bg-transparent overflow-hidden", className)} ref={containerRef}>
      {/* Preview Header */}
      {showControls && (
        <div className={cn(
          "flex items-center justify-between border-b bg-muted/50 px-4 py-2 shrink-0 z-10",
          isPrintView && "hidden"
        )}>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground leading-none">Preview</p>
              <h3 className="text-xs font-semibold">
                {activeTemplate}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrint} title="Print">
              <Printer className="h-4 w-4" />
            </Button>
            <PDFExport data={data}>
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Download PDF">
                <Download className="h-4 w-4" />
              </Button>
            </PDFExport>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleViewSize} title={viewSize === "desktop" ? "Mobile View" : "Desktop View"}>
              {viewSize === "desktop" ? (
                <LayoutGrid className="h-4 w-4" />
              ) : (
                <Info className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Preview Content Area with scroll */}
      <div className={cn(
        "flex-1 overflow-auto bg-muted/20 p-4 sm:p-6 flex flex-col items-center",
        isPrintView && "p-0 bg-white overflow-visible",
        !showControls && "p-0 bg-white"
      )}>
        <div 
          className="transition-all duration-300 origin-top shadow-2xl bg-white mb-8"
          style={{
            transform: `scale(${scale})`,
            width: "794px",
            // We set minHeight to ensure it looks like a page
            minHeight: "1123px",
            // The margin-bottom adjustment to prevent empty space when scaled down
            marginBottom: `calc((1123px * (1 - ${scale})) * -1 + 2rem)`,
          }}
        >
          <TemplateComponent data={data} />
        </div>
      </div>
    </Card>
  );
}
