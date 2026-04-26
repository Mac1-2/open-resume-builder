"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ProfessionalTemplateProps {
  data: any;
  className?: string;
}

export default function ProfessionalTemplate({
  data,
  className,
}: ProfessionalTemplateProps) {
  return (
    <div className={cn("min-h-[800px] flex flex-col", className)}>
      {/* Two-column layout for professional template */}
      <div className="flex flex-col md:flex-row h-full">
        {/* Left Sidebar - 30% width */}
        <div className="md:w-1/3 bg-gray-50 p-6 space-y-6">
          {/* Contact Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Contact</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <span>{data.personalInfo?.email || ""}</span>
              </div>
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.48 4.248a1 1 0 01-.496 1.064l-1.5 3a1 1 0 01-1.032.59l-.088.016a1 1 0 01-.998-.49l-.498-1.424A1 1 0 014.882 7H5a2 2 0 01-2-2z"></path>
                </svg>
                <span>{data.personalInfo?.phone || ""}</span>
              </div>
              {data.personalInfo?.location && (
                <div className="flex items-center">
                  <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span>{data.personalInfo.location}</span>
                </div>
              )}
              {data.personalInfo?.website && (
                <div className="flex items-center">
                  <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-5.186 6a1 1 0 01-.656.344l-.708 1.768a1.018 1.018 0 01-1.416.002l-.708-1.768a1 1 0 01.656-.344m7.288 0a1 1 0 01-.656.344l-.708 1.768a1.018 1.018 0 01-1.416.002l-.708-1.768a1 1 0 01.656-.344M20 12a8 8 0 11-16 0 8 8 0 0116 0z"></path>
                  </svg>
                  <span>{data.personalInfo.website}</span>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Skills</h2>
              <div className="space-y-3">
                {data.skills.map((skillCategory: any, index: number) => (
                  <div key={index}>
                    <h3 className="text-sm font-medium text-gray-700">{skillCategory.category}</h3>
                    <div className="mt-1 space-y-1">
                      {skillCategory.items.map((skill: string, skillIndex: number) => (
                        <div key={skillIndex} className="flex items-center">
                          <div className="h-2 w-2 bg-gray-300 rounded-full mr-2"></div>
                          <span className="text-xs text-gray-600">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Languages</h2>
              <div className="space-y-2">
                {data.languages.map((lang: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm text-gray-600">
                    <span>{lang.language}</span>
                    <span>{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content - 70% width */}
        <div className="md:w-2/3 p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {data.personalInfo?.fullName || ""}
            </h1>
            <p className="text-xl text-gray-600 font-medium">
              {data.personalInfo?.title || ""}
            </p>
          </div>

          {/* Professional Summary */}
          {data.personalInfo?.summary && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <svg className="h-5 w-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m2 0a2 2 0 110-4 2 2 0 010 4zm-6 0a2 2 0 100-4 2 2 0 000 4zM3 9h18"></path>
                </svg>
                Professional Summary
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {data.personalInfo.summary}
              </p>
            </div>
          )}

          {/* Experience */}
          {data.experience && data.experience.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <svg className="h-5 w-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                Experience
              </h2>
              <div className="space-y-6">
                {data.experience.map((exp: any, index: number) => (
                  <div key={index} className="space-y-3 border-l-2 pl-4 border-gray-200">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{exp.position}</h3>
                      <p className="text-sm text-gray-500">{exp.startDate} - {exp.current ? "Present" : exp.endDate}</p>
                    </div>
                    <h4 className="font-medium text-gray-800">{exp.company}</h4>
                    {exp.description && (
                      <p className="mt-1 text-gray-700 leading-relaxed">
                        {exp.description}
                      </p>
                    )}
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="mt-2 space-y-1 pl-5 list-disc text-gray-700">
                        {exp.achievements.map((achievement: string, achievementIndex: number) => (
                          <li key={achievementIndex}>{achievement}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <svg className="h-5 w-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Education
              </h2>
              <div className="space-y-3">
                {data.education.map((edu: any, index: number) => (
                  <div key={index} className="space-y-1">
                    <h3 className="text-lg font-semibold text-gray-900">{edu.degree}</h3>
                    <p className="text-sm text-gray-500">{edu.institution}</p>
                    {edu.field && (
                      <p className="text-xs text-gray-400">{edu.field}</p>
                    )}
                    <p className="text-sm text-gray-500">{edu.startDate} - {edu.endDate}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}