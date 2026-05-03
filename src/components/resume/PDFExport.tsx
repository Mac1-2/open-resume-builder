"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { pdf } from '@react-pdf/renderer';
import { Loader2, FileDown } from "lucide-react";
import { BasePDF } from "./pdf-templates/BasePDF";

const PDFTemplateComponents: Record<
  string,
  React.ComponentType<{ data: any; className?: string }>
> = {
  // Original 5 templates
  "Professional Executive": BasePDF,
  "Modern Clean": BasePDF,
  "Creative Bold": BasePDF,
  "Minimal Swiss": BasePDF,
  "Tech Developer": BasePDF,
  // fallback keys
  professional: BasePDF,
  modern: BasePDF,
  creative: BasePDF,
  minimal: BasePDF,
  tech: BasePDF,
  
  // Additional templates - all map to BasePDF initially
  "Techie Pro": BasePDF,
  "Startup": BasePDF,
  "Real Estate": BasePDF,
  "Hospitality": BasePDF,
  "Retail Manager": BasePDF,
  "Non-Profit": BasePDF,
  "Government Pro": BasePDF,
  "Educator": BasePDF,
  "Consultant Pro": BasePDF,
  "Architect Pro": BasePDF,
  "Marketing Bold": BasePDF,
  "Product Manager": BasePDF,
  "Data Scientist": BasePDF,
  "Engineering Lead": BasePDF,
  "Sales Executive": BasePDF,
  "Legal Classic": BasePDF,
  "Finance Professional": BasePDF,
  "Medical Professional": BasePDF,
  "Creative Bold Pro": BasePDF,
  "Executive Suite": BasePDF,
  "Academic Elite": BasePDF,
  "Modern Minimal": BasePDF,
  "Corporate Classic": BasePDF,
  "Professional Template": BasePDF,
  
  // camelCase keys
  techiePro: BasePDF,
  startup: BasePDF,
  realEstate: BasePDF,
  hospitality: BasePDF,
  retailManager: BasePDF,
  nonProfit: BasePDF,
  governmentPro: BasePDF,
  educator: BasePDF,
  consultantPro: BasePDF,
  architectPro: BasePDF,
  marketingBold: BasePDF,
  productManager: BasePDF,
  dataScientist: BasePDF,
  engineeringLead: BasePDF,
  salesExecutive: BasePDF,
  legalClassic: BasePDF,
  financeProfessional: BasePDF,
  medicalProfessional: BasePDF,
  creativeBoldPro: BasePDF,
  executiveSuite: BasePDF,
  academicElite: BasePDF,
  modernMinimal: BasePDF,
  corporateClassic: BasePDF,
  professionalTemplate: BasePDF,
};

export function PDFExport({ children, data }: { children?: React.ReactNode; data: any }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!data) return;
    
    setIsExporting(true);
    
    try {
      // Dynamically import the PDF component based on template
      const TemplateComponent = PDFTemplateComponents[data?.template || "Modern Clean"] || BasePDF;

      // Create PDF document using @react-pdf/renderer
      const doc = <TemplateComponent data={data} />;
      
      // Generate PDF blob
      const blob = await pdf(doc).toBlob();
      
      // Download the PDF
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${data?.personalInfo?.fullName || "resume"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className="relative inline-block" onClick={handleExport}>
        {children || (
          <Button variant="outline" size="sm" disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                PDF
              </>
            )}
          </Button>
        )}
      </div>
    </>
  );
}
