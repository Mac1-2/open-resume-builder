"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { BaseResumeData } from "@/components/resume/templates/types";

interface TechDeveloperProps {
  data: BaseResumeData;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
    codeBgColor?: string;
    terminalColor?: string;
  };
  className?: string;
}

export default function TechDeveloper({
  data,
  theme = {
    primaryColor: "#1a1a2e", // Dark blue
    secondaryColor: "#16213e", // Darker blue
    accentColor: "#0ea5e9", // Cyan/Sky blue
    backgroundColor: "#0f0f1a", // Deep dark
    codeBgColor: "#1e1e2e",
    terminalColor: "#16a34a", // Matrix green
  },
  className,
}: TechDeveloperProps) {
  return (
    <div
      className={cn("min-h-[1056px] w-[794px] mx-auto print:shadow-none", className)}
      style={{
        backgroundColor: theme.backgroundColor,
        fontFamily: "'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
        color: "#e2e8f0",
      }}
    >
      {/* Terminal Header Bar */}
      <div
        className="px-6 py-3 flex items-center gap-2 border-b"
        style={{
          backgroundColor: theme.secondaryColor,
          borderColor: theme.accentColor + "30",
        }}
      >
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#ef4444" }} />
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#eab308" }} />
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#22c55e" }} />
        </div>
        <span
          className="ml-2 text-xs font-bold uppercase tracking-wider"
          style={{ color: theme.accentColor }}
        >
          developer_resume.sh — v2.0.1
        </span>
      </div>

      <div className="flex">
        {/* Sidebar - System Info */}
        <aside
          className="w-1/3 p-6 border-r"
          style={{
            backgroundColor: theme.secondaryColor,
            borderColor: theme.accentColor + "20",
          }}
        >
          {/* Profile */}
          <section className="mb-8">
            {/* Avatar with terminal frame */}
            <div className="relative mb-4">
              <div
                className="w-24 h-24 mx-auto rounded-lg overflow-hidden border-2"
                style={{
                  borderColor: theme.accentColor,
                  backgroundColor: theme.codeBgColor,
                }}
              >
                {data.personalInfo?.photo ? (
                  <img
                    src={data.personalInfo.photo}
                    alt={data.personalInfo.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-3xl font-bold"
                    style={{ color: theme.terminalColor }}
                  >
                    {data.personalInfo?.fullName?.charAt(0) || "$"}
                  </div>
                )}
              </div>
              {/* Corner brackets */}
              <div
                className="absolute -top-1 -left-1 w-4 h-4 border-l-2 border-t-2"
                style={{ borderColor: theme.terminalColor }}
              />
              <div
                className="absolute -top-1 -right-1 w-4 h-4 border-r-2 border-t-2"
                style={{ borderColor: theme.terminalColor }}
              />
              <div
                className="absolute -bottom-1 -left-1 w-4 h-4 border-l-2 border-b-2"
                style={{ borderColor: theme.terminalColor }}
              />
              <div
                className="absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2"
                style={{ borderColor: theme.terminalColor }}
              />
            </div>

            <div className="text-center">
              <h1
                className="text-xl font-bold mb-1"
                style={{ color: theme.terminalColor, fontFamily: "'Fira Code', monospace" }}
              >
                {data.personalInfo?.fullName || "user@dev:~$"}
              </h1>
              <p
                className="text-xs text-center"
                style={{ color: "#94a3b8" }}
              >
                {data.personalInfo?.title || "Senior Developer"}
              </p>
            </div>
          </section>

          {/* Contact Info */}
          <section className="mb-6">
            <h2
              className="text-xs font-bold uppercase mb-3 pb-2 border-b"
              style={{
                color: theme.accentColor,
                borderColor: theme.accentColor + "40",
                fontFamily: "'Fira Code', monospace",
              }}
            >
              <span className="mr-1">#</span> contact
            </h2>
            <div className="space-y-2 text-[10px]">
              {data.personalInfo?.email && (
                <div className="flex items-center">
                  <span className="mr-2" style={{ color: theme.accentColor }}>&lt;/&gt;</span>
                  <a
                    href={`mailto:${data.personalInfo.email}`}
                    className="hover:underline"
                    style={{ color: "#94a3b8" }}
                  >
                    {data.personalInfo.email}
                  </a>
                </div>
              )}
              {data.personalInfo?.phone && (
                <div className="flex items-center">
                  <span className="mr-2" style={{ color: theme.accentColor }}>📱</span>
                  <span style={{ color: "#94a3b8" }}>{data.personalInfo.phone}</span>
                </div>
              )}
              {data.personalInfo?.location && (
                <div className="flex items-center">
                  <span className="mr-2" style={{ color: theme.accentColor }}>📍</span>
                  <span style={{ color: "#94a3b8" }}>{data.personalInfo.location}</span>
                </div>
              )}
              {data.personalInfo?.website && (
                <div className="flex items-center">
                  <span className="mr-2" style={{ color: theme.accentColor }}>🔗</span>
                  <a
                    href={data.personalInfo.website}
                    className="hover:underline"
                    style={{ color: "#94a3b8" }}
                  >
                    {data.personalInfo.website}
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <section className="mb-6">
              <h2
                className="text-xs font-bold uppercase mb-3 pb-2 border-b"
                style={{
                  color: theme.accentColor,
                  borderColor: theme.accentColor + "40",
                  fontFamily: "'Fira Code', monospace",
                }}
              >
                <span className="mr-1">{'>>'}</span> skills
              </h2>
              <div className="space-y-3">
                {data.skills.map((skillCategory: any, idx: number) => (
                  <div key={idx}>
                    <h3 className="text-[9px] font-bold mb-1" style={{ color: "#64748b" }}>
                      {skillCategory.category}
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {skillCategory.items.map((skill: string, i: number) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 text-[9px] font-mono border"
                          style={{
                            backgroundColor: theme.codeBgColor,
                            borderColor: theme.accentColor + "40",
                            color: theme.terminalColor,
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <section>
              <h2
                className="text-xs font-bold uppercase mb-3 pb-2 border-b"
                style={{
                  color: theme.accentColor,
                  borderColor: theme.accentColor + "40",
                  fontFamily: "'Fira Code', monospace",
                }}
              >
                <span className="mr-1">{'>>'}</span> languages
              </h2>
              <div className="space-y-1 text-[10px]">
                {data.languages.map((lang: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between"
                  >
                    <span style={{ color: "#94a3b8" }}>{lang.language}</span>
                    <span
                      className="font-mono"
                      style={{ color: theme.terminalColor }}
                    >
                      [{lang.proficiency}]
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Terminal styled sections */}
          <section className="mb-8">
            <div
              className="px-3 py-1 mb-4 inline-block"
              style={{
                backgroundColor: theme.codeBgColor,
                borderLeft: `2px solid ${theme.accentColor}`,
              }}
            >
              <span
                className="text-xs font-bold"
                style={{ color: theme.accentColor }}
              >
                cat about.txt
              </span>
            </div>
            {data.personalInfo?.summary ? (
              <div
                className="p-4 border"
                style={{
                  backgroundColor: theme.codeBgColor,
                  borderColor: theme.accentColor + "30",
                }}
              >
                <p className="text-xs leading-relaxed" style={{ color: "#94a3b8", lineHeight: "1.6" }}>
                  {data.personalInfo.summary}
                </p>
              </div>
            ) : (
              <div className="text-xs italic" style={{ color: "#64748b" }}>
                {'//'} No summary available
              </div>
            )}
          </section>

          {/* Experience */}
          {data.experience && data.experience.length > 0 && (
            <section className="mb-8">
              <div
                className="px-3 py-1 mb-4 inline-block"
                style={{
                  backgroundColor: theme.codeBgColor,
                  borderLeft: `2px solid ${theme.accentColor}`,
                }}
              >
                <span
                  className="text-xs font-bold"
                  style={{ color: theme.accentColor }}
                >
                  cat experience.json
                </span>
              </div>

              <div className="space-y-4">
                {data.experience.map((exp: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 border relative"
                    style={{
                      backgroundColor: theme.codeBgColor,
                      borderColor: theme.accentColor + "20",
                      borderLeft: "3px solid " + theme.accentColor,
                    }}
                  >
                    {/* Code comment indicator */}
                    <div className="absolute -top-2 -left-2 text-[9px] opacity-50">
                      {/*<span style={{ color: theme.terminalColor }}>//</span>*/}
                    </div>

                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-sm" style={{ color: "#e2e8f0" }}>
                          {exp.position}
                        </h3>
                        <p
                          className="text-xs"
                          style={{ color: theme.accentColor }}
                        >
                          @ {exp.company}
                        </p>
                      </div>
                      <span
                        className="text-[9px] px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: theme.primaryColor,
                          color: theme.terminalColor,
                        }}
                      >
                        {exp.startDate} → {exp.current ? "NOW" : exp.endDate}
                      </span>
                    </div>

                    {exp.description && (
                      <p
                        className="text-xs mb-2 leading-relaxed"
                        style={{ color: "#94a3b8" }}
                      >
                        {exp.description}
                      </p>
                    )}

                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="space-y-1">
                        {exp.achievements.map((achievement: string, i: number) => (
                          <li
                            key={i}
                            className="text-xs flex items-start"
                            style={{ color: "#94a3b8" }}
                          >
                            <span className="mr-2" style={{ color: theme.terminalColor }}>▸</span>
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
              <div
                className="px-3 py-1 mb-4 inline-block"
                style={{
                  backgroundColor: theme.codeBgColor,
                  borderLeft: `2px solid ${theme.accentColor}`,
                }}
              >
                <span
                  className="text-xs font-bold"
                  style={{ color: theme.accentColor }}
                >
                  cat education.md
                </span>
              </div>

              <div className="space-y-3">
                {data.education.map((edu: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 border-l-2"
                    style={{
                      borderColor: theme.terminalColor,
                      backgroundColor: `${theme.codeBgColor}80`,
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-sm" style={{ color: "#e2e8f0" }}>
                          {edu.degree}
                        </h3>
                        <p className="text-xs" style={{ color: theme.accentColor }}>
                          {edu.institution}
                          {edu.field && ` • ${edu.field}`}
                        </p>
                      </div>
                      <span
                        className="text-[9px] font-mono"
                        style={{ color: "#64748b" }}
                      >
                        {edu.startDate} - {edu.endDate}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Terminal footer */}
      <footer
        className="px-6 py-3 mt-4"
        style={{
          borderTop: `1px solid ${theme.accentColor}30`,
          backgroundColor: theme.secondaryColor,
        }}
      >
        <div className="flex justify-between items-center text-[9px]">
          <span style={{ color: "#64748b" }}>
            <span style={{ color: theme.terminalColor }}>user@dev</span>:~$ echo &quot;Resume generated successfully&quot;
          </span>
          <span style={{ color: theme.accentColor }}>[EXIT]</span>
        </div>
      </footer>
    </div>
  );
}
