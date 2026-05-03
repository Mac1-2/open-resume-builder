"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { BaseResumeData } from "@/components/resume/templates/types";

interface ProfessionalExecutiveProps {
  data: BaseResumeData;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
  };
  className?: string;
}

export default function ProfessionalExecutive({
  data,
  theme = {
    primaryColor: "#1e3a5f", // Dark blue/slate
    secondaryColor: "#f8fafc",
    accentColor: "#3b82f6",
    fontFamily: "Georgia, 'Times New Roman', serif",
  },
  className,
}: ProfessionalExecutiveProps) {
  return (
    <div
      className={cn("min-h-[1056px] w-[794px] mx-auto bg-white print:shadow-none", className)}
      style={{
        fontFamily: theme.fontFamily,
        fontSize: "11px",
        lineHeight: "1.5",
        color: "#1e293b",
        padding: "40px",
        boxSizing: "border-box",
      }}
    >
      {/* Two-column layout */}
      <div className="flex gap-8">
        {/* Left Sidebar - 30% */}
        <aside
          className="w-1/3 pr-4 border-r-4"
          style={{
            borderColor: theme.primaryColor,
            paddingRight: "16px",
          }}
        >
          {/* Contact Info */}
          <section className="mb-6">
            <h2
              className="text-xs font-bold uppercase tracking-wider mb-3 pb-2 border-b"
              style={{
                color: theme.primaryColor,
                borderColor: theme.accentColor,
                letterSpacing: "0.5px",
              }}
            >
              Contact
            </h2>
            <div className="space-y-2 text-[10px]">
              {data.personalInfo?.email && (
                <div className="flex items-start">
                  <span className="mr-2" style={{ color: theme.accentColor }}>✉</span>
                  <span>{data.personalInfo.email}</span>
                </div>
              )}
              {data.personalInfo?.phone && (
                <div className="flex items-start">
                  <span className="mr-2" style={{ color: theme.accentColor }}>📞</span>
                  <span>{data.personalInfo.phone}</span>
                </div>
              )}
              {data.personalInfo?.location && (
                <div className="flex items-start">
                  <span className="mr-2" style={{ color: theme.accentColor }}>📍</span>
                  <span>{data.personalInfo.location}</span>
                </div>
              )}
              {data.personalInfo?.website && (
                <div className="flex items-start">
                  <span className="mr-2" style={{ color: theme.accentColor }}>🌐</span>
                  <span>{data.personalInfo.website}</span>
                </div>
              )}
            </div>
          </section>

           {/* Skills */}
           {data.skills && data.skills.length > 0 && (
             <section className="mb-6">
               <h2
                 className="text-xs font-bold uppercase tracking-wider mb-3 pb-2 border-b"
                 style={{
                   color: theme.primaryColor,
                   borderColor: theme.accentColor,
                   letterSpacing: "0.5px",
                 }}
               >
                 Skills
               </h2>
               <div className="space-y-3">
                 {data.skills && data.skills.length > 0 && (
                   <div>
                     {data.skills.map((skillCategory, idx) => (
                       <div key={idx}>
                         <h3
                           className="text-[10px] font-semibold mb-1"
                           style={{ color: theme.primaryColor }}
                         >
                           {skillCategory.category}
                         </h3>
                         <div className="space-y-1">
                           {skillCategory.items.map((skill: string, i: number) => (
                             <div key={i} className="flex items-center">
                               <div
                                 className="w-1 h-1 rounded-full mr-2 flex-shrink-0"
                                 style={{ backgroundColor: theme.accentColor }}
                               />
                               <span className="text-[9px] text-gray-600">{skill}</span>
                             </div>
                           ))}
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
             </section>
           )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <section>
              <h2
                className="text-xs font-bold uppercase tracking-wider mb-3 pb-2 border-b"
                style={{
                  color: theme.primaryColor,
                  borderColor: theme.accentColor,
                  letterSpacing: "0.5px",
                }}
              >
                Languages
              </h2>
              <div className="space-y-1">
                {data.languages.map((lang: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between text-[10px]"
                  >
                    <span>{lang.language}</span>
                    <span className="text-gray-500">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>

        {/* Main Content - 70% */}
        <main className="flex-1">
          {/* Header */}
          <header className="mb-6 pb-6 border-b-2" style={{ borderColor: theme.primaryColor }}>
            <h1
              className="text-3xl font-bold mb-2"
              style={{
                color: theme.primaryColor,
                fontFamily: theme.fontFamily,
              }}
            >
              {data.personalInfo?.fullName || "Your Name"}
            </h1>
            <p
              className="text-base font-medium"
              style={{ color: theme.accentColor }}
            >
              {data.personalInfo?.title || ""}
            </p>
            {data.personalInfo?.summary && (
              <p
                className="text-[11px] mt-3 leading-relaxed"
                style={{ color: "#64748b", maxWidth: "90%" }}
              >
                {data.personalInfo.summary}
              </p>
            )}
          </header>

          {/* Experience */}
          {data.experience && data.experience.length > 0 && (
            <section className="mb-6">
              <h2
                className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center"
                style={{
                  color: theme.primaryColor,
                  letterSpacing: "0.5px",
                }}
              >
                <span
                  className="w-1 h-4 mr-3 rounded-full"
                  style={{ backgroundColor: theme.accentColor }}
                />
                Experience
              </h2>
              <div className="space-y-5">
                {data.experience.map((exp: any, idx: number) => (
                  <div
                    key={idx}
                    className="relative pl-4 border-l-2"
                    style={{ borderColor: theme.accentColor }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-sm" style={{ color: theme.primaryColor }}>
                        {exp.position}
                      </h3>
                      <span className="text-[10px] text-gray-500 whitespace-nowrap">
                        {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-gray-700 mb-1">
                      {exp.company}
                    </p>
                    {exp.description && (
                      <p className="text-[10px] leading-relaxed text-gray-600 mb-2">
                        {exp.description}
                      </p>
                    )}
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="space-y-1 pl-4 list-disc">
                        {exp.achievements.map((achievement: string, i: number) => (
                          <li
                            key={i}
                            className="text-[10px] text-gray-600"
                          >
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <section>
              <h2
                className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center"
                style={{
                  color: theme.primaryColor,
                  letterSpacing: "0.5px",
                }}
              >
                <span
                  className="w-1 h-4 mr-3 rounded-full"
                  style={{ backgroundColor: theme.accentColor }}
                />
                Education
              </h2>
              <div className="space-y-4">
                {data.education.map((edu: any, idx: number) => (
                  <div key={idx} className="relative pl-4 border-l-2 border-gray-200">
                    <h3 className="font-bold text-sm" style={{ color: theme.primaryColor }}>
                      {edu.degree}
                    </h3>
                    <p className="text-[11px] font-medium text-gray-700">
                      {edu.institution}
                    </p>
                    {edu.field && (
                      <p className="text-[10px] text-gray-500 italic">{edu.field}</p>
                    )}
                    <p className="text-[10px] text-gray-500 mt-1">
                      {edu.startDate} - {edu.endDate}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
