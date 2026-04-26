import { z } from 'zod';

const PersonalInfoSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100, 'Full name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional().refine(
    (val) => !val || /^\+?[\d\s\-\(\)]{10,}$/.test(val),
    'Please enter a valid phone number'
  ),
  location: z.string().optional(),
  title: z.string().optional(),
  summary: z.string().max(1000, 'Summary must be less than 1000 characters').optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  photo: z.string().optional(),
});

// Experience Validation
export const ExperienceSchema = z.object({
  id: z.string(),
  company: z.string().min(1, 'Company name is required'),
  position: z.string().min(1, 'Position title is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  description: z.string().optional(),
  achievements: z.array(z.string()).optional(),
});

// Education Validation
export const EducationSchema = z.object({
  id: z.string(),
  institution: z.string().min(1, 'Institution name is required'),
  degree: z.string().min(1, 'Degree is required'),
  field: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  gpa: z.string().optional(),
});

// Skills Validation
export const SkillSchema = z.object({
  category: z.string().min(1, 'Category name is required'),
  items: z.array(z.string().min(1, 'Skill name cannot be empty')).min(1, 'At least one skill is required'),
});

// Resume Validation
export const ResumeSchema = z.object({
  id: z.string().optional(),
  template: z.string().optional(),
  personalInfo: PersonalInfoSchema,
  experience: z.array(ExperienceSchema).optional(),
  education: z.array(EducationSchema).optional(),
  skills: z.array(SkillSchema).optional(),
  projects: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, 'Project name is required'),
    description: z.string().min(1, 'Description is required'),
    url: z.string().url().optional(),
    technologies: z.array(z.string()).optional(),
  })).optional(),
  certifications: z.array(z.object({
    name: z.string().min(1, 'Certification name is required'),
    issuer: z.string().min(1, 'Issuer is required'),
    date: z.string().min(1, 'Date is required'),
  })).optional(),
  languages: z.array(z.object({
    language: z.string().min(1, 'Language is required'),
    proficiency: z.string().min(1, 'Proficiency is required'),
  })).optional(),
  references: z.array(z.any()).optional(),
});

export type PersonalInfoData = z.infer<typeof PersonalInfoSchema>;
export type ExperienceData = z.infer<typeof ExperienceSchema>;
export type EducationData = z.infer<typeof EducationSchema>;
export type SkillData = z.infer<typeof SkillSchema>;
export type ResumeData = z.infer<typeof ResumeSchema>;

// Validation helper functions
export const validatePersonalInfo = (data: any) => {
  return PersonalInfoSchema.safeParse(data);
};

export const validateExperience = (data: any) => {
  return ExperienceSchema.safeParse(data);
};

export const validateEducation = (data: any) => {
  return EducationSchema.safeParse(data);
};

export const validateSkills = (data: any) => {
  return SkillSchema.safeParse(data);
};

export const validateResume = (data: any) => {
  return ResumeSchema.safeParse(data);
};