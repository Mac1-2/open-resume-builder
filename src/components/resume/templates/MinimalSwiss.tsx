"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { BaseResumeData } from "@/components/resume/templates/types";

interface MinimalSwissProps {
  data: BaseResumeData;
  theme?: {
    primaryColor?: string;
    borderColor?: string;
    accentColor?: string;
    backgroundColor?: string;
  };
  className?: string;
}

export default function MinimalSwiss({
  data,
  theme = {
    primaryColor: "#000000",
    borderColor: "#e5e7eb",
    accentColor: "#000000",
    backgroundColor: "#ffffff",
  },
  className,
}: MinimalSwissProps) {
  return (
    <div
      className={cn("min-h-[1056px] w-[794px] mx-auto p-0 print:shadow-none bg-white", className)}
      style={{
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        fontSize: "10px",
        lineHeight: "1.4",
        color: theme.primaryColor,
      }}
    >
      {/* Swiss grid layout - 2 columns with cool divisions */}
      <div className="grid grid-cols-12 gap-x-8 px-12 pt-12 pb-8">
        {/* Left column (7 cols) */}
        <div className="col-span-7">
          {/* Name */}
          <header className="mb-8 pb-6 border-b" style={{ borderColor: theme.borderColor }}>
            <h1
              className="text-4xl font-extralight mb-2 tracking-tight"
              style={{
                fontWeight: 300,
                letterSpacing: "-0.5px",
                fontSize: "36px",
              }}
            >
              {data.personalInfo?.fullName || "Your Name"}
            </h1>
            <p
              className="text-base font-light"
              style={{ color: "#6b7280", letterSpacing: "0.5px" }}
            >
              {data.personalInfo?.title || ""}
            </p>
          </header>

          {/* Professional Summary */}
          {data.personalInfo?.summary && (
            <section className="mb-10">
              <h2
                className="text-xs font-bold uppercase tracking-widest mb-3 pb-2 border-b"
                style={{
                  letterSpacing: "1px",
                  borderColor: theme.borderColor,
                }}
              >
                Profile
              </h2>
              <p
                className="leading-relaxed text-justify"
                style={{ color: "#4b5563" }}
              >
                {data.personalInfo.summary}
              </p>
            </section>
          )}

          {/* Work Experience */}
          {data.experience && data.experience.length > 0 && (
            <section className="mb-10">
              <h2
                className="text-xs font-bold uppercase tracking-widest mb-6 pb-2 border-b"
                style={{
                  letterSpacing: "1px",
                  borderColor: theme.borderColor,
                }}
              >
                Experience
              </h2>

              <div className="space-y-6">
                {data.experience?.map((exp: any, idx: number) => (
                  <div key={idx} className="relative">
                    {/* Vertical timeline connector */}
                    {idx < (data.experience?.length ?? 0) - 1 && (
                      <div
                        className="absolute left-2 top-8 bottom-0 w-px"
                        style={{ backgroundColor: theme.borderColor }}
                      />
                    )}

                    <div className="flex gap-4">
                      {/* Timeline dot */}
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2"
                        style={{ backgroundColor: theme.accentColor }}
                      />

                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-sm">{exp.position}</h3>
                          <span className="text-xs text-gray-500 font-light">
                            {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                          </span>
                        </div>
                        <p className="text-xs font-medium mb-2" style={{ color: theme.accentColor }}>
                          {exp.company}
                        </p>
                        {exp.description && (
                          <p className="text-xs leading-relaxed mb-2" style={{ color: "#6b7280" }}>
                            {exp.description}
                          </p>
                        )}
                        {exp.achievements && exp.achievements.length > 0 && (
                          <ul className="space-y-0.5 pl-3 list-disc">
                            {exp.achievements.map((achievement: string, i: number) => (
                              <li
                                key={i}
                                className="text-xs"
                                style={{ color: "#6b7280" }}
                              >
                                {achievement}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <section>
              <h2
                className="text-xs font-bold uppercase tracking-widest mb-6 pb-2 border-b"
                style={{
                  letterSpacing: "1px",
                  borderColor: theme.borderColor,
                }}
              >
                Education
              </h2>

              <div className="grid grid-cols-1 gap-6">
                {data.education.map((edu: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex gap-4 pb-4 border-b last:border-0"
                    style={{ borderColor: theme.borderColor, borderWidth: "1px" }}
                  >
                    <div className="flex-1">
                      <h3 className="font-bold text-sm mb-1">{edu.degree}</h3>
                      <p className="text-xs font-medium mb-1" style={{ color: theme.accentColor }}>
                        {edu.institution}
                      </p>
                      {edu.field && (
                        <p className="text-xs text-gray-500 mb-1">{edu.field}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {edu.startDate} – {edu.endDate}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right column (5 cols) */}
        <aside className="col-span-5 border-l" style={{ borderColor: theme.borderColor, paddingLeft: "32px" }}>
          {/* Contact */}
          <section className="mb-8">
            <h2
              className="text-xs font-bold uppercase tracking-widest mb-4"
              style={{ letterSpacing: "1px" }}
            >
              Contact
            </h2>
            <div className="space-y-2 text-xs">
              {data.personalInfo?.email && (
                <div>
                  <span className="block font-bold mb-0.5">Email</span>
                  <a
                    href={`mailto:${data.personalInfo.email}`}
                    className="text-gray-600 hover:underline"
                  >
                    {data.personalInfo.email}
                  </a>
                </div>
              )}
              {data.personalInfo?.phone && (
                <div>
                  <span className="block font-bold mb-0.5">Phone</span>
                  <span className="text-gray-600">{data.personalInfo.phone}</span>
                </div>
              )}
              {data.personalInfo?.location && (
                <div>
                  <span className="block font-bold mb-0.5">Location</span>
                  <span className="text-gray-600">{data.personalInfo.location}</span>
                </div>
              )}
              {data.personalInfo?.website && (
                <div>
                  <span className="block font-bold mb-0.5">Website</span>
                  <a
                    href={data.personalInfo.website}
                    className="text-gray-600 hover:underline"
                  >
                    {data.personalInfo.website}
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <section className="mb-8">
              <h2
                className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ letterSpacing: "1px" }}
              >
                Skills
              </h2>
              <div className="space-y-4">
                {data.skills?.map((skillCategory: any, idx: number) => (
                  <div key={idx}>
                    <h3
                      className="text-xs font-medium mb-2 uppercase"
                      style={{ color: theme.accentColor }}
                    >
                      {skillCategory.category}
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {skillCategory.items.map((skill: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-[9px] border"
                          style={{
                            borderColor: theme.borderColor,
                            backgroundColor: "transparent",
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
                className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ letterSpacing: "1px" }}
              >
                Languages
              </h2>
              <div className="space-y-2">
                {data.languages.map((lang: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between text-xs"
                  >
                    <span className="font-medium">{lang.language}</span>
                    <span className="text-gray-500">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
