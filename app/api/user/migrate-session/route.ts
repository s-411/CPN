import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { migrateSessionData } from '@/app/actions/onboarding-actions';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { sessionData } = body;

    // Validate session data
    if (!sessionData || (!sessionData.profile && (!sessionData.interactions || sessionData.interactions.length === 0))) {
      return NextResponse.json({ error: 'No session data to migrate' }, { status: 400 });
    }

    // Perform migration using server action
    const result = await migrateSessionData(sessionData);

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || 'Migration failed'
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true,
      message: result.message,
      details: result.details
    });

  } catch (error) {
    console.error('Error in migrate-session API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to migrate session data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}