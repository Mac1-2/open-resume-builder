import {NextRequest, NextResponse} from 'next/server';
import OpenAI from 'openai';
import {prisma} from '@/lib/db';
import {type ChatMessage} from '@/components/ai/AIChat';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {messages, resumeId, chatId, userId} = body as {
      messages: Array<{role: 'user' | 'assistant'; content: string}>;
      resumeId?: string;
      chatId?: string;
      userId?: string;
    };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        {error: 'Messages array is required'},
        {status: 400}
      );
    }

    // Get resume context if resumeId provided
    let resumeContext = null;
    if (resumeId) {
      try {
        const resume = await prisma.resume.findUnique({
          where: {id: resumeId},
          select: {data: true},
        });
        resumeContext = resume?.data;
      } catch (error) {
        console.error('Error fetching resume:', error);
      }
    }

     // Build system prompt with resume context
     let systemPrompt = `You are a professional resume writing assistant and career coach. Your role is to help users create, improve, and tailor their resumes to land their target jobs.

Core Principles:
- Provide specific, actionable advice that can be implemented immediately
- Use strong action verbs and encourage quantifiable achievements
- Tailor suggestions to the user's industry and target role
- When suggesting content rewrites, provide complete alternative text
- Explain why each suggestion improves the resume's effectiveness
- Keep responses concise but thorough (max 300 words per response)
- Be encouraging yet honest about areas for improvement`;

     if (resumeContext) {
       systemPrompt += `\n\nThe user's current resume data:\n${JSON.stringify(resumeContext, null, 2)}`;
     }

    // Prepare messages for OpenAI
    const apiMessages: Array<{role: 'system' | 'user' | 'assistant'; content: string}> = [
      {role: 'system', content: systemPrompt},
      ...messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      // Return mock streaming response for demo
      return createMockStreamingResponse(messages);
    }

    // Create streaming response from OpenAI
    const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 2000,
      stream: true,
    });

    // Create a TransformStream to process the OpenAI stream
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const text = decoder.decode(chunk);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            } else {
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({content})}\n\n`));
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }
      },
    });

    const readableStream = (stream as any).tee()[0].pipeThrough(transformStream as any);

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {error: 'Failed to process chat request'},
      {status: 500}
    );
  }
}

async function createMockStreamingResponse(messages: Array<{role: string; content: string}>) {
  const lastMessage = messages[messages.length - 1]?.content || '';
  
  let response = '';
  
  if (lastMessage.toLowerCase().includes('improve') || lastMessage.toLowerCase().includes('summary')) {
    response = `Here are suggestions to improve your professional summary:

**Current Issues:**
- Too vague - lacks specific achievements
- Doesn't showcase unique value proposition
- Missing keywords relevant to target roles

**Recommended Structure:**
1. **Opening line**: "Experienced [your role] with X+ years of expertise in [key skills]"
2. **Key achievement**: "Proven track record of [quantifiable result, e.g., increasing revenue by 30%]"
3. **Core competencies**: List 3-4 areas of expertise
4. **Career objective**: Brief statement about what you're seeking

**Example Rewrite:**
> Results-driven Software Engineer with 5+ years of experience building scalable web applications. Spearheaded a microservices migration that improved system reliability by 99.9%. Expertise in React, Node.js, and cloud architecture. Seeking to leverage technical leadership skills to drive innovation at a forward-thinking tech company.

Would you like me to rewrite your summary?`;
  } else if (lastMessage.toLowerCase().includes('skill')) {
    response = `Based on your experience, here are **high-impact skills** to consider adding:

**Technical Skills** (if applicable):
- Cloud Platforms: AWS, Azure, GCP
- DevOps: Docker, Kubernetes, CI/CD
- Databases: PostgreSQL, MongoDB, Redis
- Monitoring: Datadog, New Relic, Grafana

**Soft Skills**:
- Cross-functional collaboration
- Technical leadership & mentoring
- Agile/Scrum methodology
- Stakeholder communication

**Industry-Specific Keywords**:
- For Software Engineering: "microservices", "scalable architecture", "code reviews", "TDD"
- For Product Management: "roadmap", "user research", "A/B testing", "OKRs"
- For Design: "design systems", "user-centered design", "Figma", "prototyping"

**Tip:** Research 5-10 job descriptions for your target role and identify recurring keywords. Incorporate them naturally throughout your resume.`;
  } else if (lastMessage.toLowerCase().includes('grammar') || lastMessage.toLowerCase().includes('spelling')) {
    response = `Let me review your text for grammar and spelling. Here are **common resume mistakes** to watch for:

**Grammar Issues:**
1. **Tense consistency**: Use past tense for previous jobs, present for current
2. **Articles**: "a" vs "an" - use "an" before vowel sounds
3. **Parallel structure**: "Developed, deployed, and maintained" (all -ed verbs)
4. **Comma usage**: Avoid comma splices; use semicolons or separate sentences

**Spelling & Typos:**
- Homophones: their/there/they're, your/you're, its/it's
- Commonly misspelled: "separate", "definitely", "maintenance"
- Proper nouns: company names, technologies (check capitalization)

**Formatting Consistency:**
- Date formats: "Jan 2020 - Present" or "January 2020 - Present" (pick one)
- Punctuation: End bullet points with periods or not (be consistent)
- Spacing: Single space after periods

**Pro tip:** Use Grammarly or Hemingway Editor for a second pass, then read your resume aloud to catch awkward phrasing.

Would you like me to check a specific section?`;
  } else if (lastMessage.toLowerCase().includes('tailor') || lastMessage.toLowerCase().includes('job')) {
    response = `To tailor your resume to a specific job description:

**Step 1: Keyword Extraction**
- Copy the job description
- Identify 10-15 "must-have" skills and qualifications
- Note repeated terms and phrases

**Step 2: Match & Gap Analysis**
Compare your current resume against the job requirements:
- ✅ **Matches**: Skills/experience you already have
- ⚠️ **Partial matches**: Related experience that can be reframed
- ❌ **Gaps**: Missing requirements (be prepared to address in cover letter)

**Step 3: Strategic Updates**
1. **Professional Summary**: Mirror the job title and key requirements
2. **Skills Section**: Add relevant keywords naturally
3. **Experience Bullets**: Reframe achievements to match the job's needs
4. **Keywords**: Include exact phrases from the job description (ATS scanners look for these)

**Step 4: Quantify for Impact**
- Instead of "Managed a team" → "Led a team of 5 engineers, delivering 3 major releases"
- Instead of "Improved sales" → "Increased quarterly sales by 27% through targeted outreach"

**Action Item:** Paste your job description, and I'll analyze it against your resume to identify specific improvements.`;
  } else if (lastMessage.toLowerCase().includes('rewrite') || lastMessage.toLowerCase().includes('experience')) {
    response = `Let me help you rewrite your experience bullets for maximum impact.

**The STAR Method Framework:**
- **S**ituation: Brief context
- **T**ask: What you were responsible for
- **A**ction: Specific steps you took
- **R**esult: Quantifiable outcome

**Before & After Examples:**

❌ **Weak**: "Responsible for team projects"
✅ **Stronger**: "Led a cross-functional team of 8 to deliver 4 major product releases ahead of schedule"

❌ **Weak**: "Helped improve customer satisfaction"
✅ **Stronger**: "Implemented customer feedback system that increased satisfaction scores by 35% within 6 months"

**Powerful Action Verbs by Category:**
- **Leadership**: Spearheaded, Orchestrated, Championed
- **Achievement**: Delivered, Accelerated, Transformed
- **Innovation**: Pioneered, Architected, Engineered
- **Impact**: Boosted, Slashed, Optimized

**Pro Tips:**
1. Start every bullet with a strong action verb
2. Include metrics (%, $, #) wherever possible
3. Focus on outcomes, not responsibilities
4. Use consistent tense (past for previous roles)

Share a bullet point you'd like me to rewrite, and I'll provide specific improvements!`;
  } else if (lastMessage.toLowerCase().includes('ats') || lastMessage.toLowerCase().includes('optimization')) {
    response = `**ATS (Applicant Tracking System) Optimization Guide**

ATS systems parse and rank resumes based on keyword matches. Here's how to optimize:

**1. Formatting Rules**
- ✅ Use standard headings: "Professional Experience", "Education", "Skills"
- ❌ Avoid: headers/footers, tables, text boxes, images, fancy fonts
- ✅ Save as PDF (unless specified otherwise)
- ✅ Use simple bullet points (●, ▪, or -)

**2. Keyword Optimization**
- Mirror exact phrases from the job description
- Include both acronyms and full terms (e.g., "React.js" and "React JS")
- Place important keywords in your summary and at the beginning of bullet points

**3. Section Order Matters**
1. Contact Info (name, email, phone, LinkedIn, portfolio)
2. Professional Summary/Objective
3. Skills (both hard and soft)
4. Work Experience
5. Education
6. Certifications (if relevant)

**4. Parsing Test**
Upload your resume to a free ATS simulator (like Jobscan) to see:
- Match rate vs. job description
- Missing keywords
- Formatting issues

**5. Common ATS Failures**
- Special characters that break parsing
- Missing contact info in header
- Non-standard section titles
- Graphics that convert to empty strings

**Quick Check:** Your resume should be machine-readable first, human-readable second.

Want me to analyze your resume against a specific job posting?`;
  } else {
    response = `Great question! As your AI resume assistant, I can help with:

**Available Quick Actions:**
- 📝 **Improve Summary** - Craft a compelling professional summary
- 💡 **Skills Suggestions** - Discover relevant skills for your industry
- ✅ **Check Grammar** - Review for errors and consistency
- 🎯 **Tailor to Job** - Customize your resume for specific roles
- ✏️ **Rewrite Experience** - Transform weak bullets into impact statements
- 🤖 **ATS Optimization** - Ensure your resume passes automated screening

**How to Use Me:**
1. Type your question or request in the chat
2. Upload a job description for tailored advice
3. Click quick action buttons for common tasks
4. Click "Apply" on suggestions to update your resume

**Pro Tip:** The more specific you are, the better I can help! For example:
- ❌ "Help with my resume"
- ✅ "Rewrite my bullet point about improving sales"

What would you like to work on?`;
  }

  // Simulate streaming with delays
  const words = response.split(' ');
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      for (let i = 0; i < words.length; i++) {
        const word = words[i] + (i < words.length - 1 ? ' ' : '');
        const chunk = `data: ${JSON.stringify({content: word})}\n\n`;
        controller.enqueue(encoder.encode(chunk));
        
        // Random delay to simulate typing
        await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 50));
      }
      
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
