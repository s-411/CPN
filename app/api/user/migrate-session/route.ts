import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { migrateSessionDataToUser, type CPNOnboardingData } from '@/lib/supabase/user-mapping';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { clerkId, sessionData }: { 
      clerkId: string; 
      sessionData: CPNOnboardingData; 
    } = body;

    // Verify the clerk ID matches the authenticated user
    if (clerkId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate session data
    if (!sessionData || (!sessionData.profile && !sessionData.interactions)) {
      return NextResponse.json({ error: 'No session data to migrate' }, { status: 400 });
    }

    // Perform migration
    await migrateSessionDataToUser(clerkId, sessionData);

    return NextResponse.json({ 
      success: true,
      message: 'Session data migrated successfully',
      migratedProfile: !!sessionData.profile,
      migratedInteractions: sessionData.interactions?.length || 0,
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