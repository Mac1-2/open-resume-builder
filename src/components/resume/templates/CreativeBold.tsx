"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CreativeBoldProps {
  data: any;
  theme?: {
    gradientStart?: string;
    gradientEnd?: string;
    accentColor?: string;
    secondaryColor?: string;
  };
  className?: string;
}

export default function CreativeBold({
  data,
  theme = {
    gradientStart: "#8b5cf6", // Purple
    gradientEnd: "#ec4899", // Pink
    accentColor: "#8b5cf6",
    secondaryColor: "#1e1b4b",
  },
  className,
}: CreativeBoldProps) {
  return (
    <div
      className={cn("min-h-[1056px] w-[794px] mx-auto print:shadow-none", className)}
      style={{
        backgroundColor: "#ffffff",
        fontFamily: "'Poppins', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Full-width gradient header with asymmetric layout */}
      <header
        className="relative px-16 pt-16 pb-20 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${theme.gradientStart} 0%, ${theme.gradientEnd} 100%)`,
        }}
      >
        {/* Decorative elements */}
        <div
          className="absolute top-0 right-0 w-64 h-64 opacity-20"
          style={{
            background: "radial-gradient(circle, white 0%, transparent 70%)",
            transform: "translate(30%, -30%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-48 h-48 opacity-15"
          style={{
            background: "radial-gradient(circle, white 0%, transparent 70%)",
            transform: "translate(-30%, 30%)",
          }}
        />

        <div className="relative z-10">
          {/* Large typography name */}
          <h1
            className="text-5xl font-black mb-3 uppercase leading-tight"
            style={{
              color: "white",
              fontFamily: "'Poppins', sans-serif",
              letterSpacing: "-1px",
              textShadow: "2px 2px 0 rgba(0,0,0,0.1)",
            }}
          >
            {data.personalInfo?.fullName || "YOUR NAME"}
          </h1>

          {/* Title with overlapping element */}
          <div
            className="inline-block px-6 py-2 mb-6 transform rotate-1"
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
              borderRadius: "8px",
            }}
          >
            <p
              className="text-xl font-semibold tracking-wide"
              style={{ color: "white" }}
            >
              {data.personalInfo?.title || "Creative Professional"}
            </p>
          </div>

          {/* Contact row */}
          <div
            className="flex flex-wrap gap-6 mt-6 text-sm"
            style={{ color: "rgba(255,255,255,0.9)", fontFamily: "'Inter', sans-serif" }}
          >
            {data.personalInfo?.email && <span>{data.personalInfo.email}</span>}
            {data.personalInfo?.phone && <span>{data.personalInfo.phone}</span>}
            {data.personalInfo?.location && <span>{data.personalInfo.location}</span>}
          </div>
        </div>

        {/* Overlapping circle element */}
        <div
          className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full opacity-30"
          style={{
            background: `linear-gradient(135deg, ${theme.accentColor} 0%, #fff 100%)`,
          }}
        />
      </header>

      {/* Content Area */}
      <div className="px-16 py-12 space-y-10">
        {/* Summary */}
        {data.personalInfo?.summary && (
          <section>
            <h2
              className="text-lg font-bold mb-3 pb-2 inline-block"
              style={{
                color: theme.accentColor,
                borderBottom: `3px solid ${theme.accentColor}`,
              }}
            >
              About Me
            </h2>
            <p
              className="text-sm leading-relaxed mt-4"
              style={{ color: "#475569", maxWidth: "85%", lineHeight: "1.7" }}
            >
              {data.personalInfo.summary}
            </p>
          </section>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <section>
            <h2
              className="text-lg font-bold mb-6"
              style={{
                color: theme.secondaryColor,
                position: "relative",
                paddingLeft: "16px",
              }}
            >
              <span
                className="absolute left-0 top-1 w-3 h-8 rounded-full"
                style={{ backgroundColor: theme.accentColor }}
              />
              Work Experience
            </h2>
            <div className="space-y-8 relative">
              {/* Timeline line */}
              <div
                className="absolute left-3 top-0 bottom-0 w-0.5"
                style={{
                  background: `linear-gradient(180deg, ${theme.accentColor} 0%, ${theme.gradientEnd} 100%)`,
                }}
              />

              {data.experience.map((exp: any, idx: number) => (
                <div
                  key={idx}
                  className="relative pl-10"
                  style={{
                    transform: idx % 2 === 1 ? "translateX(20px)" : "translateX(0)",
                  }}
                >
                  {/* Timeline dot */}
                  <div
                    className="absolute left-2 w-4 h-4 rounded-full border-2 border-white"
                    style={{
                      backgroundColor: theme.gradientStart,
                      top: "4px",
                    }}
                  />

                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold" style={{ color: theme.secondaryColor }}>
                      {exp.position}
                    </h3>
                    <span
                      className="text-xs font-semibold px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: `${theme.accentColor}15`,
                        color: theme.accentColor,
                      }}
                    >
                      {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                    </span>
                  </div>
                  <p className="text-sm font-medium mb-2" style={{ color: "#64748b" }}>
                    {exp.company}
                  </p>
                  {exp.description && (
                    <p className="text-sm leading-relaxed mb-3" style={{ color: "#64748b", lineHeight: "1.6" }}>
                      {exp.description}
                    </p>
                  )}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="space-y-1 pl-4 list-disc">
                      {exp.achievements.map((achievement: string, i: number) => (
                        <li
                          key={i}
                          className="text-sm"
                          style={{ color: "#64748b" }}
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

        {/* Skills Cloud */}
        {data.skills && data.skills.length > 0 && (
          <section>
            <h2
              className="text-lg font-bold mb-5"
              style={{
                color: theme.secondaryColor,
                position: "relative",
                paddingLeft: "16px",
              }}
            >
              <span
                className="absolute left-0 top-1 w-3 h-8 rounded-full"
                style={{ backgroundColor: theme.gradientEnd }}
              />
              Skills
            </h2>
            <div className="flex flex-wrap gap-3">
              {data.skills.map((skillCategory: any, catIdx: number) =>
                skillCategory.items.map((skill: string, skillIdx: number) => (
                  <span
                    key={`${catIdx}-${skillIdx}`}
                    className="px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${theme.gradientStart} 0%, ${theme.gradientEnd} 100%)`,
                      color: "white",
                      borderRadius: "8px",
                      transform: `rotate(${Math.random() * 6 - 3}deg)`,
                    }}
                  >
                    {skill}
                  </span>
                ))
              )}
            </div>
          </section>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <section>
            <h2
              className="text-lg font-bold mb-5"
              style={{
                color: theme.secondaryColor,
                position: "relative",
                paddingLeft: "16px",
              }}
            >
              <span
                className="absolute left-0 top-1 w-3 h-8 rounded-full"
                style={{ backgroundColor: theme.gradientEnd }}
              />
              Education
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {data.education.map((edu: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: `${theme.secondaryColor}10`,
                    borderLeft: `3px solid ${theme.accentColor}`,
                  }}
                >
                  <h3 className="font-bold text-sm mb-1" style={{ color: theme.secondaryColor }}>
                    {edu.degree}
                  </h3>
                  <p className="text-xs mb-1" style={{ color: "#64748b" }}>
                    {edu.institution}
                  </p>
                  {edu.field && (
                    <p className="text-xs text-gray-500 mb-1">{edu.field}</p>
                  )}
                  <p className="text-xs font-medium">{edu.startDate} – {edu.endDate}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
