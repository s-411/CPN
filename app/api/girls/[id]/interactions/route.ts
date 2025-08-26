import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db/drizzle';
import { userInteractions, userProfiles } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  props: Props
) {
  const params = await props.params;
  
  try {
    // Check authentication first
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const girlId = params.id;

    // Get all interactions for this specific girl
    const interactions = await db
      .select({
        id: userInteractions.id,
        date: userInteractions.date,
        cost: userInteractions.cost,
        timeMinutes: userInteractions.timeMinutes,
        nuts: userInteractions.nuts,
        notes: userInteractions.notes,
        createdAt: userInteractions.createdAt,
        updatedAt: userInteractions.updatedAt,
      })
      .from(userInteractions)
      .where(
        and(
          eq(userInteractions.clerkId, userId),
          eq(userInteractions.girlId, girlId)
        )
      )
      .orderBy(desc(userInteractions.date), desc(userInteractions.createdAt));

    // Calculate girl-specific statistics
    const totalCost = interactions.reduce((sum, i) => sum + parseFloat(i.cost || '0'), 0);
    const totalNuts = interactions.reduce((sum, i) => sum + (i.nuts || 0), 0);
    const totalTimeMinutes = interactions.reduce((sum, i) => sum + (i.timeMinutes || 0), 0);
    
    const statistics = {
      totalInteractions: interactions.length,
      totalCost,
      totalNuts,
      totalTimeMinutes,
      averageCostPerNut: totalNuts > 0 ? totalCost / totalNuts : 0,
      averageTimePerNut: totalNuts > 0 ? totalTimeMinutes / totalNuts : 0,
      averageCostPerHour: totalTimeMinutes > 0 ? (totalCost / totalTimeMinutes) * 60 : 0,
    };

    return NextResponse.json({
      interactions,
      statistics
    });
  } catch (error) {
    console.error('Error fetching girl interactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interactions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  props: Props
) {
  const params = await props.params;
  
  try {
    // Check authentication first
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const girlId = params.id;
    const body = await request.json();

    const { date, cost, timeMinutes, nuts, notes } = body;

    // Validate required fields
    if (!date || cost === undefined || timeMinutes === undefined || nuts === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user profile (needed for profileId)
    const profile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.clerkId, userId))
      .limit(1);

    if (profile.length === 0) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Insert new interaction
    const [newInteraction] = await db
      .insert(userInteractions)
      .values({
        clerkId: userId,
        profileId: profile[0].id,
        girlId,
        date,
        cost: cost.toString(),
        timeMinutes: parseInt(timeMinutes),
        nuts: parseInt(nuts),
        notes: notes || null,
      })
      .returning();

    return NextResponse.json(newInteraction);
  } catch (error) {
    console.error('Error creating interaction:', error);
    return NextResponse.json(
      { error: 'Failed to create interaction' },
      { status: 500 }
    );
  }
}