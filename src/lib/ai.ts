import { generateText, streamText, tool } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';

// Initialize AI SDK OpenAI provider
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI Configuration
const AI_MODEL = 'gpt-4';
const AI_TEMPERATURE = 0.7;

// Tool definitions for resume updates
export const resumeTools = {
  updatePersonalInfo: tool({
    description: 'Update personal information in the resume (name, email, phone, location, title, summary, website, linkedin, github)',
    parameters: z.object({
      field: z.enum(['fullName', 'email', 'phone', 'location', 'title', 'summary', 'website', 'linkedin', 'github']),
      value: z.string(),
    }),
  }),

  addSkills: tool({
    description: 'Add skills to a specific category in the resume',
    parameters: z.object({
      category: z.string().describe('Skill category (e.g., "Technical Skills", "Soft Skills")'),
      skills: z.array(z.string()).describe('List of skills to add'),
    }),
  }),

  updateExperience: tool({
    description: 'Update or add work experience entries',
    parameters: z.object({
      action: z.enum(['add', 'update', 'remove']),
      index: z.number().optional().describe('Index of experience to update (0-based)'),
      data: z.object({
        company: z.string().optional(),
        position: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        current: z.boolean().optional(),
        description: z.string().optional(),
      }).optional(),
    }),
  }),

  updateEducation: tool({
    description: 'Update or add education entries',
    parameters: z.object({
      action: z.enum(['add', 'update', 'remove']),
      index: z.number().optional(),
      data: z.object({
        institution: z.string().optional(),
        degree: z.string().optional(),
        field: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        gpa: z.string().optional(),
      }).optional(),
    }),
  }),
};

// Generate resume content suggestions with tool support
export const generateResumeSuggestions = async (
  resumeData: any,
  targetRole?: string
) => {
  try {
    const { text, toolResults } = await generateText({
      model: openai(AI_MODEL),
      system: 'You are an expert career coach and resume writer. Provide actionable, specific suggestions for resume improvement.',
      prompt: `Analyze this resume and provide suggestions for improvement.
${targetRole ? `Target role: ${targetRole}` : ''}

Resume data: ${JSON.stringify(resumeData, null, 2)}

Please provide:
1. Section-by-section suggestions
2. Overall feedback
3. Key improvements to make
4. Strengths to highlight

Format the response in a structured way.`,
      tools: resumeTools,
      temperature: AI_TEMPERATURE,
      maxTokens: 2000,
    });

    return { text, toolResults };
  } catch (error) {
    console.error('Error generating resume suggestions:', error);
    throw error;
  }
};

// Analyze resume against job description
export const analyzeJobMatch = async (
  resumeData: any,
  jobDescription: string
) => {
  try {
    const { text, toolResults } = await generateText({
      model: openai(AI_MODEL),
      system: 'You are an ATS (Applicant Tracking System) expert. Analyze resumes against job descriptions to identify keyword matches and gaps.',
      prompt: `Analyze this resume against the following job description:

Resume: ${JSON.stringify(resumeData, null, 2)}

Job Description: ${jobDescription}

Please provide:
1. Match percentage (0-100)
2. Missing keywords from the job description
3. Strong keywords that are present
4. Specific suggestions for improvement
5. Skills gaps`,
      tools: resumeTools,
      temperature: AI_TEMPERATURE,
      maxTokens: 2000,
    });

    return { text, toolResults };
  } catch (error) {
    console.error('Error analyzing job match:', error);
    throw error;
  }
};

// Generate cover letter
export const generateCoverLetter = async (
  resumeData: any,
  jobDescription: string,
  companyName: string
) => {
  try {
    const { text } = await generateText({
      model: openai(AI_MODEL),
      system: 'You are an expert copywriter specializing in professional cover letters. Write compelling, tailored cover letters.',
      prompt: `Write a professional cover letter for this candidate.

Resume: ${JSON.stringify(resumeData, null, 2)}
Job Description: ${jobDescription}
Company: ${companyName}

The cover letter should:
1. Be tailored to the specific role and company
2. Highlight relevant experience and skills
3. Show enthusiasm for the position
4. Be professional yet engaging
5. Be around 3-4 paragraphs`,
      temperature: 0.8,
      maxTokens: 1000,
    });

    return text;
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw error;
  }
};

// Optimize resume content
export const optimizeResumeContent = async (
  content: string,
  optimizationType: 'brevity' | 'impact' | 'clarity' | 'professionalism'
) => {
  try {
    const prompts = {
      brevity: 'Make the following content more concise while preserving all key information:',
      impact: 'Rewrite the following content to have more impact and use stronger action verbs:',
      clarity: 'Rewrite the following content to be clearer and easier to understand:',
      professionalism: 'Rewrite the following content to be more professional and formal:',
    };

    const { text } = await generateText({
      model: openai(AI_MODEL),
      system: 'You are an expert resume writer. Rewrite resume content to optimize it for the specified criteria.',
      prompt: `${prompts[optimizationType]}\n\n${content}`,
      temperature: 0.6,
      maxTokens: 1000,
    });

    return text;
  } catch (error) {
    console.error('Error optimizing content:', error);
    throw error;
  }
};

// Streaming chat with tool support
export const createChatStream = async (
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  resumeContext?: any
) => {
  const systemPrompt = `You are a professional resume writing assistant and career coach. Your role is to help users create, improve, and tailor their resumes to land their target jobs.

Core Principles:
- Provide specific, actionable advice that can be implemented immediately
- Use strong action verbs and encourage quantifiable achievements
- Tailor suggestions to the user's industry and target role
- When suggesting content rewrites, provide complete alternative text
- Explain why each suggestion improves the resume's effectiveness
- Keep responses concise but thorough (max 300 words per response)
- Be encouraging yet honest about areas for improvement
${resumeContext ? `\n\nThe user's current resume data:\n${JSON.stringify(resumeContext, null, 2)}` : ''}`;

  return streamText({
    model: openai(AI_MODEL),
    system: systemPrompt,
    messages,
    tools: resumeTools,
    temperature: AI_TEMPERATURE,
    maxTokens: 2000,
  });
};
