import {create} from 'zustand';
import {devtools} from 'zustand/middleware';
import {z} from 'zod';

const ResumeDataSchema = z.object({
  id: z.string().optional(),
  template: z.string().optional(),
  personalInfo: z.object({
    fullName: z.string(),
    email: z.string(),
    phone: z.string().optional(),
    location: z.string().optional(),
    title: z.string().optional(),
    summary: z.string().optional(),
    website: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    photo: z.string().optional(),
  }).optional(),
  experience: z.array(z.object({
    id: z.string(),
    company: z.string(),
    position: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    current: z.boolean().optional(),
    description: z.string().optional(),
    achievements: z.array(z.string()).optional(),
  })).optional(),
  education: z.array(z.object({
    id: z.string(),
    institution: z.string(),
    degree: z.string(),
    field: z.string().optional(),
    startDate: z.string(),
    endDate: z.string().optional(),
    gpa: z.string().optional(),
  })).optional(),
  skills: z.array(z.object({
    category: z.string(),
    items: z.array(z.string()),
  })).optional(),
  projects: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    url: z.string().optional(),
    technologies: z.array(z.string()).optional(),
  })).optional(),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    date: z.string(),
  })).optional(),
  languages: z.array(z.object({
    language: z.string(),
    proficiency: z.string(),
  })).optional(),
  references: z.array(z.any()).optional(),
});

export type ResumeData = z.infer<typeof ResumeDataSchema>;

interface ResumeStore {
  resumes: ResumeData[];
  currentResume: ResumeData | null;
  isLoading: boolean;
  error: string | null;
  
  setCurrentResume: (resume: ResumeData | null) => void;
  addResume: (resume: ResumeData) => void;
  createResume: (resume: ResumeData) => void;
  updateResume: (id: string, data: Partial<ResumeData>) => void;
  deleteResume: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useResumeStore = create<ResumeStore>()(
  devtools(
    (set) => ({
      resumes: [],
      currentResume: null,
      isLoading: false,
      error: null,

      setCurrentResume: (resume) => set({currentResume: resume}),
      addResume: (resume) =>
        set((state) => ({
          resumes: [...state.resumes, resume],
          currentResume: resume,
        })),
      createResume: (resume: ResumeData) =>
        set((state) => ({
          resumes: [...state.resumes, resume],
          currentResume: resume,
        })),
      updateResume: (id, data) =>
        set((state) => ({
          resumes: state.resumes.map((resume) =>
            resume?.id === id
              ? {...resume, ...data}
              : resume
          ),
          currentResume:
            state.currentResume?.id === id
              ? {...state.currentResume, ...data}
              : state.currentResume,
        })),
      deleteResume: (id) =>
        set((state) => ({
          resumes: state.resumes.filter((resume) => resume?.id !== id),
          currentResume:
            state.currentResume?.id === id
              ? null
              : state.currentResume,
        })),
      setLoading: (loading) => set({isLoading: loading}),
      setError: (error) => set({error}),
    }),
    {
      name: 'resume-store',
    }
  )
);