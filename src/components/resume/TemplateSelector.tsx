"use client";

import * as React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, LayoutGrid, List, Search, Filter } from "lucide-react";
import type { TemplateMetadata, TemplateCategory } from "@/components/resume/templates/types";

// Image placeholder component for template thumbnails
const TemplateImage = ({ template }: { template: any }) => {
  const colors: Record<string, string> = {
    professional: "from-blue-400 to-blue-600",
    modern: "from-green-400 to-green-600",
    creative: "from-purple-400 to-pink-600",
    minimal: "from-gray-400 to-gray-600",
    tech: "from-cyan-400 to-indigo-600",
  };
  const baseColor = colors[template?.category?.toLowerCase() as keyof typeof colors] || "from-gray-400 to-gray-600";
  return (
    <div className={`h-48 w-full rounded-lg mb-3 overflow-hidden bg-gradient-to-br ${baseColor}`}>
      <div className="h-full flex items-center justify-center">
        <div className="text-white/30 text-4xl font-bold">
          {[template.name.charAt(0), template.name.split(" ")[1]?.charAt(0)].filter(Boolean).join("")}
        </div>
      </div>
    </div>
  );
};

interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  category: TemplateCategory | string;
  bestFor: string;
  usageCount: number;
}

interface TemplateSelectorProps {
  templates?: Template[];
  selectedTemplate?: string;
  onTemplateSelect?: (templateId: string) => void;
  onClose?: () => void;
  className?: string;
}

const defaultTemplates: Template[] = [
  // Original 5 templates
  {
    id: "professional",
    name: "Professional Executive",
    description: "Classic, conservative design with two-column layout and traditional fonts",
    category: "Professional",
    bestFor: "Executives, Managers, Corporate Roles",
    usageCount: 1240,
  },
  {
    id: "modern",
    name: "Modern Clean",
    description: "Minimal single-column design with accent colors and card-based sections",
    category: "Modern",
    bestFor: "Tech Professionals, Designers, Marketing",
    usageCount: 980,
  },
  {
    id: "creative",
    name: "Creative Bold",
    description: "Asymmetric layout with gradient header and skill tags for creative fields",
    category: "Creative",
    bestFor: "Designers, Artists, Writers, Creatives",
    usageCount: 760,
  },
  {
    id: "minimal",
    name: "Minimal Swiss",
    description: "Ultra-clean with ample whitespace, thin lines, and focus on content hierarchy",
    category: "Minimal",
    bestFor: "Academics, Researchers, Legal Professionals",
    usageCount: 650,
  },
  {
    id: "tech",
    name: "Tech Developer",
    description: "Monospace accents, terminal aesthetic, and code snippet styling for skills",
    category: "Tech",
    bestFor: "Software Developers, Engineers, IT Professionals",
    usageCount: 1100,
  },
  
  // Additional templates
  {
    id: "techiePro",
    name: "Techie Pro",
    description: "Terminal-style design with monospace fonts and code-inspired layout",
    category: "Tech",
    bestFor: "Software Developers, DevOps, System Administrators",
    usageCount: 890,
  },
  {
    id: "startup",
    name: "Startup",
    description: "Modern, energetic design with vibrant colors and dynamic layout",
    category: "Modern",
    bestFor: "Startup Employees, Entrepreneurs, Growth Hackers",
    usageCount: 720,
  },
  {
    id: "realEstate",
    name: "Real Estate",
    description: "Professional design with property-focused layout and clean typography",
    category: "Professional",
    bestFor: "Real Estate Agents, Brokers, Property Managers",
    usageCount: 580,
  },
  {
    id: "hospitality",
    name: "Hospitality",
    description: "Warm, inviting design with elegant touches for service industry professionals",
    category: "Professional",
    bestFor: "Hotel Managers, Event Planners, Restaurant Managers",
    usageCount: 450,
  },
  {
    id: "retailManager",
    name: "Retail Manager",
    description: "Clean, organized layout perfect for retail and store management roles",
    category: "Professional",
    bestFor: "Retail Managers, Store Directors, Merchandisers",
    usageCount: 380,
  },
  {
    id: "nonProfit",
    name: "Non-Profit",
    description: "Compassionate design with clear messaging for mission-driven organizations",
    category: "Professional",
    bestFor: "Non-Profit Leaders, Grant Writers, Program Directors",
    usageCount: 420,
  },
  {
    id: "governmentPro",
    name: "Government Pro",
    description: "Formal, structured design meeting government and public sector standards",
    category: "Professional",
    bestFor: "Government Employees, Policy Analysts, Public Administrators",
    usageCount: 510,
  },
  {
    id: "educator",
    name: "Educator",
    description: "Academic-friendly design with clear section organization for education professionals",
    category: "Professional",
    bestFor: "Teachers, Professors, Academic Administrators",
    usageCount: 680,
  },
  {
    id: "consultantPro",
    name: "Consultant Pro",
    description: "Sophisticated design with results-focused layout for consultants",
    category: "Professional",
    bestFor: "Management Consultants, Business Analysts, Strategy Advisors",
    usageCount: 590,
  },
  {
    id: "architectPro",
    name: "Architect Pro",
    description: "Design-forward layout with portfolio-style presentation for architects",
    category: "Creative",
    bestFor: "Architects, Interior Designers, Urban Planners",
    usageCount: 340,
  },
  {
    id: "marketingBold",
    name: "Marketing Bold",
    description: "Bold, attention-grabbing design with vibrant colors for marketing roles",
    category: "Creative",
    bestFor: "Marketing Managers, Brand Strategists, Digital Marketers",
    usageCount: 780,
  },
  {
    id: "productManager",
    name: "Product Manager",
    description: "Strategic layout with metrics-focused design for product roles",
    category: "Professional",
    bestFor: "Product Managers, Product Owners, Program Managers",
    usageCount: 850,
  },
  {
    id: "dataScientist",
    name: "Data Scientist",
    description: "Analytical design with clean data visualization-inspired layout",
    category: "Tech",
    bestFor: "Data Scientists, Analysts, Machine Learning Engineers",
    usageCount: 920,
  },
  {
    id: "engineeringLead",
    name: "Engineering Lead",
    description: "Leadership-focused design with technical credentials showcase",
    category: "Tech",
    bestFor: "Engineering Managers, CTOs, Technical Leads",
    usageCount: 760,
  },
  {
    id: "salesExecutive",
    name: "Sales Executive",
    description: "Results-driven design with achievement highlights for sales professionals",
    category: "Professional",
    bestFor: "Sales Directors, Account Executives, Business Development",
    usageCount: 640,
  },
  {
    id: "legalClassic",
    name: "Legal Classic",
    description: "Traditional, authoritative design for legal professionals",
    category: "Professional",
    bestFor: "Lawyers, Attorneys, Legal Consultants",
    usageCount: 520,
  },
  {
    id: "financeProfessional",
    name: "Finance Professional",
    description: "Precise, structured design with numerical focus for finance roles",
    category: "Professional",
    bestFor: "Financial Analysts, Investment Bankers, CFOs",
    usageCount: 710,
  },
  {
    id: "medicalProfessional",
    name: "Medical Professional",
    description: "Clean, clinical design with credentials-focused layout",
    category: "Professional",
    bestFor: "Doctors, Nurses, Healthcare Administrators",
    usageCount: 690,
  },
  {
    id: "creativeBoldPro",
    name: "Creative Bold Pro",
    description: "Advanced creative design with portfolio integration and bold typography",
    category: "Creative",
    bestFor: "Creative Directors, Art Directors, Senior Designers",
    usageCount: 480,
  },
  {
    id: "executiveSuite",
    name: "Executive Suite",
    description: "Premium design with executive presence for C-level positions",
    category: "Executive",
    bestFor: "CEOs, VPs, Senior Executives",
    usageCount: 880,
  },
  {
    id: "academicElite",
    name: "Academic Elite",
    description: "Scholarly design with publication-focused layout for academics",
    category: "Professional",
    bestFor: "Professors, Researchers, PhD Candidates",
    usageCount: 560,
  },
  {
    id: "modernMinimal",
    name: "Modern Minimal",
    description: "Ultra-modern minimalist design with generous whitespace",
    category: "Minimal",
    bestFor: "Designers, Architects, Minimalists",
    usageCount: 620,
  },
  {
    id: "corporateClassic",
    name: "Corporate Classic",
    description: "Timeless corporate design with traditional business aesthetics",
    category: "Professional",
    bestFor: "Corporate Employees, Bankers, Consultants",
    usageCount: 730,
  },
  {
    id: "professionalTemplate",
    name: "Professional Template",
    description: "Versatile professional design suitable for most career fields",
    category: "Professional",
    bestFor: "General Professionals, Career Changers",
    usageCount: 950,
  },
];

const templateNameToId: Record<string, string> = {
  // Original 5 templates
  "Professional Executive": "professional",
  "Modern Clean": "modern",
  "Creative Bold": "creative",
  "Minimal Swiss": "minimal",
  "Tech Developer": "tech",
  "professional": "professional",
  "modern": "modern",
  "creative": "creative",
  "minimal": "minimal",
  "tech": "tech",
  
  // Additional templates
  "Techie Pro": "techiePro",
  "techiePro": "techiePro",
  "Startup": "startup",
  "startup": "startup",
  "Real Estate": "realEstate",
  "realEstate": "realEstate",
  "Hospitality": "hospitality",
  "hospitality": "hospitality",
  "Retail Manager": "retailManager",
  "retailManager": "retailManager",
  "Non-Profit": "nonProfit",
  "nonProfit": "nonProfit",
  "Government Pro": "governmentPro",
  "governmentPro": "governmentPro",
  "Educator": "educator",
  "educator": "educator",
  "Consultant Pro": "consultantPro",
  "consultantPro": "consultantPro",
  "Architect Pro": "architectPro",
  "architectPro": "architectPro",
  "Marketing Bold": "marketingBold",
  "marketingBold": "marketingBold",
  "Product Manager": "productManager",
  "productManager": "productManager",
  "Data Scientist": "dataScientist",
  "dataScientist": "dataScientist",
  "Engineering Lead": "engineeringLead",
  "engineeringLead": "engineeringLead",
  "Sales Executive": "salesExecutive",
  "salesExecutive": "salesExecutive",
  "Legal Classic": "legalClassic",
  "legalClassic": "legalClassic",
  "Finance Professional": "financeProfessional",
  "financeProfessional": "financeProfessional",
  "Medical Professional": "medicalProfessional",
  "medicalProfessional": "medicalProfessional",
  "Creative Bold Pro": "creativeBoldPro",
  "creativeBoldPro": "creativeBoldPro",
  "Executive Suite": "executiveSuite",
  "executiveSuite": "executiveSuite",
  "Academic Elite": "academicElite",
  "academicElite": "academicElite",
  "Modern Minimal": "modernMinimal",
  "modernMinimal": "modernMinimal",
  "Corporate Classic": "corporateClassic",
  "corporateClassic": "corporateClassic",
  "Professional Template": "professionalTemplate",
  "professionalTemplate": "professionalTemplate",
};

const getTemplateId = (template: string): string => {
  return templateNameToId[template] || template;
};

export default function TemplateSelector({
  templates = defaultTemplates,
  selectedTemplate,
  onTemplateSelect,
  className,
}: TemplateSelectorProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const templateId = selectedTemplate ? getTemplateId(selectedTemplate) : null;

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.bestFor.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(
    (template) =>
      !filterCategory || template.category.toLowerCase() === filterCategory?.toLowerCase()
  );

  const categories = [
    "All",
    "Professional",
    "Creative",
    "Modern",
    "Minimal",
    "Tech",
    "Executive",
  ];

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Choose Your Template</h2>
          <p className="text-muted-foreground mt-1">
            Select a template that best fits your professional style
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex w-full sm:w-auto">
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-xs"
            />
          </div>
          <div className="flex items-center gap-2 sm:w-auto">
            <Button variant="outline" size="icon" onClick={() => {}}>
              <Filter className="h-4 w-4" />
            </Button>
            <div className="relative">
              <button
                className={cn(
                  "flex items-center gap-2 rounded-border border px-3 py-2 text-sm font-medium hover:bg-accent",
                  filterCategory ? "bg-accent" : "bg-background"
                )}
                onClick={() => {
                  // In a real app, this would open a dropdown menu
                  // For simplicity, we'll cycle through categories for demo
                  const currentIndex = categories.indexOf(
                    filterCategory || "All"
                  );
                  const nextIndex = (currentIndex + 1) % categories.length;
                  setFilterCategory(
                    categories[nextIndex] === "All" ? null : categories[nextIndex]
                  );
                }}
              >
                {filterCategory ? (
                  <>
                    {filterCategory}
                    <ChevronRight className="h-3 w-3" />
                  </>
                ) : (
                  <span>All Categories</span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          {filteredTemplates.length} of {templates.length} templates shown
        </div>
      </div>

      <div
        className={cn(
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        )}
      >
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className={cn(
              "group relative overflow-hidden cursor-pointer transition-all hover:shadow-lg border-2",
              templateId === template.id
                ? "border-primary bg-primary/5"
                : "border-transparent hover:border-primary/50",
              viewMode === "list" && "flex items-center p-4"
            )}
            onClick={() => onTemplateSelect?.(template.id)}
          >
            {templateId === template.id && (
              <div className="absolute top-3 right-3">
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
              </div>
            )}

            {/* Hover Preview - Show larger preview on hover */}
            <div
              className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                "pointer-events-none"
              )}
            >
              <div className="inset-0 bg-primary/90 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center text-white p-6">
                  <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                  <p className="text-sm">{template.description}</p>
                  <div className="mt-4 flex flex-col gap-2">
                    <span className="text-xs">
                      Best for: {template.bestFor}
                    </span>
                    <span className="text-xs">
                      Used {template.usageCount.toLocaleString()} times
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {viewMode === "grid" ? (
              <div className="p-6">
                {/* Thumbnail placeholder with category color */}
                <TemplateImage template={template} />
                <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn(
                    "px-2 py-0.5 text-xs rounded-full",
                    template.category === "Professional"
                      ? "bg-blue/20 text-blue"
                      : template.category === "Creative"
                      ? "bg-purple/20 text-purple"
                      : template.category === "Modern"
                      ? "bg-green/20 text-green"
                      : template.category === "Minimal"
                      ? "bg-gray/20 text-gray"
                      : "bg-primary/20 text-primary"
                  )}>
                    {template.category}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {template.description}
                </p>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Best for: {template.bestFor}</span>
                  <span>Used {template.usageCount.toLocaleString()} times</span>
                </div>
              </div>
            ) : (
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 flex-shrink-0">
                    <TemplateImage template={template} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full",
                        template.category === "Professional"
                          ? "bg-blue/20 text-blue"
                          : template.category === "Creative"
                          ? "bg-purple/20 text-purple"
                          : template.category === "Modern"
                          ? "bg-green/20 text-green"
                          : template.category === "Minimal"
                          ? "bg-gray/20 text-gray"
                          : "bg-primary/20 text-primary"
                      )}>
                        {template.category}
                      </span>
                      <span className="text-muted-foreground/80">
                        • {template.usageCount.toLocaleString()} uses
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {selectedTemplate && (
        <div className="flex justify-center pt-6">
          <Button size="lg" className="px-8">
            Use This Template
          </Button>
        </div>
      )}
    </div>
  );
}