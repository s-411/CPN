import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/supabase/user-mapping';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get('clerkId');

    // Verify the clerk ID matches the authenticated user
    if (!clerkId || clerkId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get user context
    const userContext = await getUserContext(clerkId);

    if (!userContext) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: userContext.user.id,
        clerkId: userContext.user.clerkId,
        email: userContext.user.email,
        name: userContext.user.name,
        role: userContext.user.role,
      },
      profile: userContext.profile ? {
        id: userContext.profile.id,
        firstName: userContext.profile.firstName,
        age: userContext.profile.age,
        ethnicity: userContext.profile.ethnicity,
        rating: userContext.profile.rating,
      } : null,
      interactions: userContext.interactions.map(interaction => ({
        id: interaction.id,
        date: interaction.date,
        cost: parseFloat(interaction.cost.toString()),
        timeMinutes: interaction.timeMinutes,
        nuts: interaction.nuts,
        notes: interaction.notes,
        createdAt: interaction.createdAt,
      })),
      hasProfile: userContext.hasProfile,
      hasInteractions: userContext.hasInteractions,
      stats: userContext.interactions.length > 0 ? {
        totalInteractions: userContext.interactions.length,
        totalCost: userContext.interactions.reduce((sum, i) => sum + parseFloat(i.cost.toString()), 0),
        totalNuts: userContext.interactions.reduce((sum, i) => sum + i.nuts, 0),
      } : null,
    });

  } catch (error) {
    console.error('Error in user context API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get user context',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}