"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ModernCleanProps {
  data: any;
  theme?: {
    accentStart?: string;
    accentEnd?: string;
    backgroundColor?: string;
    cardBg?: string;
    textColor?: string;
  };
  className?: string;
}

export default function ModernClean({
  data,
  theme = {
    accentStart: "#3b82f6", // Blue
    accentEnd: "#8b5cf6", // Violet
    backgroundColor: "#f8fafc",
    cardBg: "#ffffff",
    textColor: "#1e293b",
  },
  className,
}: ModernCleanProps) {
  return (
    <div
      className={cn("min-h-[1056px] w-[794px] mx-auto p-0 print:shadow-none", className)}
      style={{
        backgroundColor: theme.backgroundColor,
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Main Container */}
      <div
        className="max-w-3xl mx-auto bg-white shadow-sm"
        style={{
          maxWidth: "550px",
          margin: "0 auto",
          backgroundColor: theme.cardBg,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        {/* Gradient Header */}
        <header
          className="px-12 py-10 text-white relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${theme.accentStart} 0%, ${theme.accentEnd} 100%)`,
          }}
        >
          {/* Profile Photo */}
          <div className="flex items-center gap-6 mb-4">
            {data.personalInfo?.photo ? (
              <img
                src={data.personalInfo.photo}
                alt={data.personalInfo.fullName}
                className="w-20 h-20 rounded-full border-4 border-white/30 object-cover"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center text-2xl font-bold"
                style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white" }}
              >
                {data.personalInfo?.fullName?.charAt(0) || "?"}
              </div>
            )}
            <div>
              <h1
                className="text-2xl font-bold leading-none mb-2"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {data.personalInfo?.fullName || "Your Name"}
              </h1>
              <p
                className="text-sm opacity-90"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {data.personalInfo?.title || ""}
              </p>
            </div>
          </div>

          {/* Contact Info Bar */}
          <div
            className="flex flex-wrap gap-4 text-xs opacity-90"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {data.personalInfo?.email && <span>{data.personalInfo.email}</span>}
            {data.personalInfo?.phone && <span>{data.personalInfo.phone}</span>}
            {data.personalInfo?.location && <span>{data.personalInfo.location}</span>}
            {data.personalInfo?.website && <span>{data.personalInfo.website}</span>}
          </div>
        </header>

        {/* Content */}
        <div className="px-12 py-8 space-y-8">
          {/* Summary */}
          {data.personalInfo?.summary && (
            <section>
              <h2
                className="text-sm font-bold uppercase tracking-wider mb-3 pb-2"
                style={{
                  color: theme.accentStart,
                  borderBottom: `2px solid ${theme.accentStart}`,
                  letterSpacing: "0.5px",
                }}
              >
                About
              </h2>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#64748b", lineHeight: "1.7" }}
              >
                {data.personalInfo.summary}
              </p>
            </section>
          )}

          {/* Experience */}
          {data.experience && data.experience.length > 0 && (
            <section>
              <h2
                className="text-sm font-bold uppercase tracking-wider mb-4 pb-2"
                style={{
                  color: theme.accentStart,
                  borderBottom: `2px solid ${theme.accentStart}`,
                  letterSpacing: "0.5px",
                }}
              >
                Experience
              </h2>
              <div className="space-y-5">
                {data.experience.map((exp: any, idx: number) => (
                  <div
                    key={idx}
                    className="group"
                  >
                    <div className="flex justify-between items-baseline mb-1">
                      <h3
                        className="font-semibold text-base"
                        style={{ color: theme.textColor }}
                      >
                        {exp.position}
                      </h3>
                      <span
                        className="text-xs font-medium"
                        style={{ color: theme.accentEnd }}
                      >
                        {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      {exp.company}
                    </p>
                    {exp.description && (
                      <p
                        className="text-sm leading-relaxed mb-2"
                        style={{ color: "#64748b", lineHeight: "1.6" }}
                      >
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

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <section>
              <h2
                className="text-sm font-bold uppercase tracking-wider mb-4 pb-2"
                style={{
                  color: theme.accentStart,
                  borderBottom: `2px solid ${theme.accentStart}`,
                  letterSpacing: "0.5px",
                }}
              >
                Education
              </h2>
              <div className="space-y-4">
                {data.education.map((edu: any, idx: number) => (
                  <div key={idx}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-semibold text-base" style={{ color: theme.textColor }}>
                        {edu.degree}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {edu.startDate} – {edu.endDate}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {edu.institution}
                      {edu.field && ` • ${edu.field}`}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <section>
              <h2
                className="text-sm font-bold uppercase tracking-wider mb-4 pb-2"
                style={{
                  color: theme.accentStart,
                  borderBottom: `2px solid ${theme.accentStart}`,
                  letterSpacing: "0.5px",
                }}
              >
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skillCategory: any, catIdx: number) =>
                  skillCategory.items.map((skill: string, skillIdx: number) => (
                    <span
                      key={`${catIdx}-${skillIdx}`}
                      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                      style={{
                        backgroundColor: `${theme.accentStart}15`,
                        color: theme.accentStart,
                        border: `1px solid ${theme.accentStart}30`,
                      }}
                    >
                      {skill}
                    </span>
                  ))
                )}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .max-w-3xl {
            box-shadow: none !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
