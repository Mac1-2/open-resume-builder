import { NextRequest, NextResponse } from 'next/server';
import { getResumesByUser, createResume } from '@/lib/db';

/**
 * GET /api/resumes
 * Returns all resumes for the current user
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Replace with actual auth - get user from session
    const userId = 'temp-user-id'; // Placeholder - implement auth later
    
    const resumes = await getResumesByUser(userId);
    
    return NextResponse.json({
      success: true,
      data: resumes,
      count: resumes.length,
    });
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch resumes' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/resumes
 * Creates a new resume
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      template, 
      data, 
      userId = 'temp-user-id' // Placeholder
    } = body as {
      title: string;
      template: string;
      data?: Record<string, any>;
      userId?: string;
    };

    // Validation
    if (!title || !template) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Title and template are required' 
        },
        { status: 400 }
      );
    }

    const resume = await createResume({
      userId,
      title,
      template,
      data: data || {},
    });

    return NextResponse.json(
      { 
        success: true, 
        data: resume 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating resume:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create resume' 
      },
      { status: 500 }
    );
  }
}
