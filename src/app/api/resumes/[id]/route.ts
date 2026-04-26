import { NextRequest, NextResponse } from 'next/server';
import { getResumeById, updateResume, deleteResume } from '@/lib/db';

/**
 * GET /api/resumes/[id]
 * Get a single resume by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // TODO: Add auth - verify user owns this resume
    const resume = await getResumeById(id);
    
    if (!resume) {
      return NextResponse.json(
        { success: false, error: 'Resume not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: resume,
    });
  } catch (error) {
    console.error('Error fetching resume:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch resume' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/resumes/[id]
 * Update a resume
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validation
    const allowedFields = ['title', 'template', 'data', 'isPublic'];
    const updates = Object.keys(body)
      .filter(key => allowedFields.includes(key))
      .reduce((acc, key) => ({ ...acc, [key]: body[key] }), {});

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }
    
    // TODO: Verify user owns this resume
    
    const resume = await updateResume(id, updates);
    
    return NextResponse.json({
      success: true,
      data: resume,
      message: 'Resume updated successfully',
    });
  } catch (error) {
    console.error('Error updating resume:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update resume' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/resumes/[id]
 * Delete a resume
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // TODO: Verify user owns this resume
    await deleteResume(id);
    
    return NextResponse.json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting resume:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete resume' },
      { status: 500 }
    );
  }
}
