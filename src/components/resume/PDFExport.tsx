"use client";

// Import template components for PDF rendering
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import { PDFDocument } from "pdf-lib";
import { Loader2, FileDown } from "lucide-react";

import ProfessionalExecutive from "./templates/ProfessionalExecutive";
import ModernClean from "./templates/ModernClean";
import CreativeBold from "./templates/CreativeBold";
import MinimalSwiss from "./templates/MinimalSwiss";
import TechDeveloper from "./templates/TechDeveloper";

const PDFTemplateComponents: Record<
  string,
  React.ComponentType<{ data: any; className?: string }>
> = {
  "Professional Executive": ProfessionalExecutive,
  "Modern Clean": ModernClean,
  "Creative Bold": CreativeBold,
  "Minimal Swiss": MinimalSwiss,
  "Tech Developer": TechDeveloper,
  // fallback keys
  professional: ProfessionalExecutive,
  modern: ModernClean,
  creative: CreativeBold,
  minimal: MinimalSwiss,
  tech: TechDeveloper,
};

export function PDFExport({ children, data }: { children?: React.ReactNode; data: any }) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState("");
  const exportRef = useRef<HTMLDivElement>(null);

  const handleExport = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!exportRef.current) return;
    
    setIsExporting(true);
    setProgress("Capturing resume layout...");
    
    try {
      // Capture the element using html2canvas
      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });
      
      setProgress("Generating PDF document...");
      const imgData = canvas.toDataURL("image/png");
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([canvas.width / 2, canvas.height / 2]);
      const { width, height } = page.getSize();
      const pngImage = await pdfDoc.embedPng(imgData);
      
      page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: width,
        height: height,
      });
      
      setProgress("Finalizing download...");
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
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
      setProgress("");
    }
  };

  return (
    <>
      <div className="relative inline-block" onClick={handleExport}>
        {children || <Button variant="outline" size="sm">Download PDF</Button>}
      </div>

      {/* Prominent Loading Overlay */}
      {isExporting && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/60 backdrop-blur-md">
          <div className="relative flex items-center justify-center">
            <div className="absolute h-20 w-20 rounded-full border-4 border-primary/20" />
            <div className="absolute h-20 w-20 rounded-full border-t-4 border-primary animate-spin" />
            <div className="bg-primary/10 p-4 rounded-full">
              <FileDown className="h-8 w-8 text-primary animate-bounce" />
            </div>
          </div>
          <div className="mt-6 text-center">
            <h3 className="text-lg font-bold">Generating PDF</h3>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              {progress}
            </p>
          </div>
        </div>
      )}
      
      {/* Hidden element for capturing */}
      <div 
        style={{ 
          position: "absolute", 
          left: "-9999px", 
          top: "-9999px",
          height: "0",
          overflow: "hidden"
        }}
      >
        <div ref={exportRef}>
          <PDFPreviewContent data={data} />
        </div>
      </div>
    </>
  );
}

function PDFPreviewContent({ data }: { data: any }) {
  const TemplateComponent = PDFTemplateComponents[data?.template || "Modern Clean"] || ModernClean;

  return (
    <div
      style={{
        width: "794px",
        minHeight: "1123px",
        backgroundColor: "white",
      }}
    >
      <TemplateComponent data={data} />
    </div>
  );
}
