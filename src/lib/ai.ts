import OpenAI from 'openai';
import {z} from 'zod';

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI Configuration
export const AI_CONFIG = {
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2000,
};

// Schema for AI resume suggestions
export const ResumeSuggestionSchema = z.object({
  sections: z.array(
    z.object({
      name: z.string(),
      content: z.string(),
      suggestions: z.array(z.string()),
    })
  ),
  overallFeedback: z.string(),
  improvements: z.array(z.string()),
  strengths: z.array(z.string()),
});

export type ResumeSuggestion = z.infer<typeof ResumeSuggestionSchema>;

// Schema for job match analysis
export const JobMatchSchema = z.object({
  matchPercentage: z.number(),
  missingKeywords: z.array(z.string()),
  strongKeywords: z.array(z.string()),
  suggestions: z.array(z.string()),
  skillsGap: z.array(z.string()),
});

export type JobMatch = z.infer<typeof JobMatchSchema>;

// Generate resume content suggestions
export const generateResumeSuggestions = async (
  resumeData: any,
  targetRole?: string
): Promise<ResumeSuggestion> => {
  try {
    const prompt = `
      Analyze this resume and provide suggestions for improvement.
      ${targetRole ? `Target role: ${targetRole}` : ''}
      
      Resume data: ${JSON.stringify(resumeData, null, 2)}
      
      Please provide:
      1. Section-by-section suggestions
      2. Overall feedback
      3. Key improvements to make
      4. Strengths to highlight
      
      Format the response in a structured way.
    `;

    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert career coach and resume writer. Provide actionable, specific suggestions for resume improvement.',
        },
        {role: 'user', content: prompt},
      ],
      temperature: AI_CONFIG.temperature,
      max_tokens: AI_CONFIG.maxTokens,
    });

    // Parse and validate the response
    const content = completion.choices[0]?.message?.content || '{}';
    
    try {
      const parsed = JSON.parse(content);
      return ResumeSuggestionSchema.parse(parsed);
    } catch {
      // Return default structure if parsing fails
      return {
        sections: [],
        overallFeedback: content,
        improvements: [],
        strengths: [],
      };
    }
  } catch (error) {
    console.error('Error generating resume suggestions:', error);
    throw error;
  }
};

// Analyze resume against job description
export const analyzeJobMatch = async (
  resumeData: any,
  jobDescription: string
): Promise<JobMatch> => {
  try {
    const prompt = `
      Analyze this resume against the following job description:
      
      Resume: ${JSON.stringify(resumeData, null, 2)}
      
      Job Description: ${jobDescription}
      
      Please provide:
      1. Match percentage (0-100)
      2. Missing keywords from the job description
      3. Strong keywords that are present
      4. Specific suggestions for improvement
      5. Skills gaps
    `;

    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      messages: [
        {
          role: 'system',
          content:
            'You are an ATS (Applicant Tracking System) expert. Analyze resumes against job descriptions to identify keyword matches and gaps.',
        },
        {role: 'user', content: prompt},
      ],
      temperature: AI_CONFIG.temperature,
      max_tokens: AI_CONFIG.maxTokens,
    });

    const content = completion.choices[0]?.message?.content || '{}';
    
    try {
      const parsed = JSON.parse(content);
      return JobMatchSchema.parse(parsed);
    } catch {
      return {
        matchPercentage: 0,
        missingKeywords: [],
        strongKeywords: [],
        suggestions: [],
        skillsGap: [],
      };
    }
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
): Promise<string> => {
  try {
    const prompt = `
      Write a professional cover letter for this candidate.
      
      Resume: ${JSON.stringify(resumeData, null, 2)}
      Job Description: ${jobDescription}
      Company: ${companyName}
      
      The cover letter should:
      1. Be tailored to the specific role and company
      2. Highlight relevant experience and skills
      3. Show enthusiasm for the position
      4. Be professional yet engaging
      5. Be around 3-4 paragraphs
    `;

    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert copywriter specializing in professional cover letters. Write compelling, tailored cover letters.',
        },
        {role: 'user', content: prompt},
      ],
      temperature: 0.8,
      max_tokens: 1000,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw error;
  }
};

// Optimize resume content
export const optimizeResumeContent = async (
  content: string,
  optimizationType: 'brevity' | 'impact' | 'clarity' | 'professionalism'
): Promise<string> => {
  try {
    const prompts = {
      brevity: 'Make the following content more concise while preserving all key information:',
      impact: 'Rewrite the following content to have more impact and use stronger action verbs:',
      clarity: 'Rewrite the following content to be clearer and easier to understand:',
      professionalism: 'Rewrite the following content to be more professional and formal:',
    };

    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert resume writer. Rewrite resume content to optimize it for the specified criteria.',
        },
        {
          role: 'user',
          content: `${prompts[optimizationType]}\n\n${content}`,
        },
      ],
      temperature: 0.6,
      max_tokens: 1000,
    });

    return completion.choices[0]?.message?.content || content;
  } catch (error) {
    console.error('Error optimizing content:', error);
    throw error;
  }
};