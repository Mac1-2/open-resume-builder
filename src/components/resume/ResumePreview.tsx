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
import TechiePro from "./templates/TechiePro";
import Startup from "./templates/Startup";
import RealEstate from "./templates/RealEstate";
import Hospitality from "./templates/Hospitality";
import RetailManager from "./templates/RetailManager";
import NonProfit from "./templates/NonProfit";
import GovernmentPro from "./templates/GovernmentPro";
import Educator from "./templates/Educator";
import ConsultantPro from "./templates/ConsultantPro";
import ArchitectPro from "./templates/ArchitectPro";
import MarketingBold from "./templates/MarketingBold";
import ProductManager from "./templates/ProductManager";
import DataScientist from "./templates/DataScientist";
import EngineeringLead from "./templates/EngineeringLead";
import SalesExecutive from "./templates/SalesExecutive";
import LegalClassic from "./templates/LegalClassic";
import FinanceProfessional from "./templates/FinanceProfessional";
import MedicalProfessional from "./templates/MedicalProfessional";
import CreativeBoldPro from "./templates/CreativeBoldPro";
import ExecutiveSuite from "./templates/ExecutiveSuite";
import AcademicElite from "./templates/AcademicElite";
import ModernMinimal from "./templates/ModernMinimal";
import CorporateClassic from "./templates/CorporateClassic";
import ProfessionalTemplate from "./templates/ProfessionalTemplate";

import type { BaseResumeData } from "@/components/resume/templates/types";

// Reuse the BaseResumeData type from our shared types
interface ResumeData extends BaseResumeData {
  template?: string;
}

interface ResumePreviewProps {
  data: ResumeData;
  template?: string;
  className?: string;
  showControls?: boolean;
}

import type { TemplateProps } from "@/components/resume/templates/types";

const TemplateComponents: Record<
  string,
  React.ComponentType<TemplateProps>
> = {
  // Original 5 templates
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
  
  // Additional templates
  techiePro: TechiePro,
  "Techie Pro": TechiePro,
  startup: Startup,
  "Startup": Startup,
  realEstate: RealEstate,
  "Real Estate": RealEstate,
  hospitality: Hospitality,
  "Hospitality": Hospitality,
  retailManager: RetailManager,
  "Retail Manager": RetailManager,
  nonProfit: NonProfit,
  "Non-Profit": NonProfit,
  governmentPro: GovernmentPro,
  "Government Pro": GovernmentPro,
  educator: Educator,
  "Educator": Educator,
  consultantPro: ConsultantPro,
  "Consultant Pro": ConsultantPro,
  architectPro: ArchitectPro,
  "Architect Pro": ArchitectPro,
  marketingBold: MarketingBold,
  "Marketing Bold": MarketingBold,
  productManager: ProductManager,
  "Product Manager": ProductManager,
  dataScientist: DataScientist,
  "Data Scientist": DataScientist,
  engineeringLead: EngineeringLead,
  "Engineering Lead": EngineeringLead,
  salesExecutive: SalesExecutive,
  "Sales Executive": SalesExecutive,
  legalClassic: LegalClassic,
  "Legal Classic": LegalClassic,
  financeProfessional: FinanceProfessional,
  "Finance Professional": FinanceProfessional,
  medicalProfessional: MedicalProfessional,
  "Medical Professional": MedicalProfessional,
  creativeBoldPro: CreativeBoldPro,
  "Creative Bold Pro": CreativeBoldPro,
  executiveSuite: ExecutiveSuite,
  "Executive Suite": ExecutiveSuite,
  academicElite: AcademicElite,
  "Academic Elite": AcademicElite,
  modernMinimal: ModernMinimal,
  "Modern Minimal": ModernMinimal,
  corporateClassic: CorporateClassic,
  "Corporate Classic": CorporateClassic,
  professionalTemplate: ProfessionalTemplate,
  "Professional Template": ProfessionalTemplate,
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
