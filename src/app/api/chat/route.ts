import {NextRequest, NextResponse} from 'next/server';
import {prisma} from '@/lib/db';
import {createChatStream} from '@/lib/ai';

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

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      // Return mock streaming response for demo
      return createMockStreamingResponse(messages);
    }

    // Use streamText from AI SDK
    const result = await createChatStream(messages, resumeContext);

    // Return AI SDK's built-in streaming response
    return result.toDataStreamResponse();

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
  } else {
    response = `Great question! As your AI resume assistant, I can help with:

**Available Quick Actions:**
- 📝 **Improve Summary** - Craft a compelling professional summary
- 💡 **Skills Suggestions** - Discover relevant skills for your industry
- ✅ **Check Grammar** - Review for errors and consistency
- 🎯 **Tailor to Job** - Customize your resume for specific roles
- ✏️ **Rewrite Experience** - Transform weak bullets into impact statements
- 🤖 **ATS Optimization** - Ensure your resume passes automated screening

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
