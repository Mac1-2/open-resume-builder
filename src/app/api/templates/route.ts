import { NextRequest, NextResponse } from 'next/server';
import { getActiveTemplates } from '@/lib/db';

/**
 * GET /api/templates
 * Returns all active resume templates
 */
export async function GET(request: NextRequest) {
  try {
    const templates = await getActiveTemplates();
    
    return NextResponse.json({
      success: true,
      data: templates,
      count: templates.length,
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch templates' 
      },
      { status: 500 }
    );
  }
}
