import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db/drizzle';
import { userInteractions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

type Props = {
  params: Promise<{ id: string }>;
};

export async function PUT(
  request: NextRequest,
  props: Props
) {
  const params = await props.params;
  
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const interactionId = parseInt(params.id);
    if (isNaN(interactionId)) {
      return NextResponse.json(
        { error: 'Invalid interaction ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { date, cost, timeMinutes, nuts, notes } = body;

    // Validate required fields
    if (!date || cost === undefined || timeMinutes === undefined || nuts === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update interaction (only if it belongs to the current user)
    const [updatedInteraction] = await db
      .update(userInteractions)
      .set({
        date,
        cost: cost.toString(),
        timeMinutes: parseInt(timeMinutes),
        nuts: parseInt(nuts),
        notes: notes || null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(userInteractions.id, interactionId),
          eq(userInteractions.clerkId, userId)
        )
      )
      .returning();

    if (!updatedInteraction) {
      return NextResponse.json(
        { error: 'Interaction not found or not authorized' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedInteraction);
  } catch (error) {
    console.error('Error updating interaction:', error);
    return NextResponse.json(
      { error: 'Failed to update interaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  props: Props
) {
  const params = await props.params;
  
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const interactionId = parseInt(params.id);
    if (isNaN(interactionId)) {
      return NextResponse.json(
        { error: 'Invalid interaction ID' },
        { status: 400 }
      );
    }

    // Delete interaction (only if it belongs to the current user)
    const [deletedInteraction] = await db
      .delete(userInteractions)
      .where(
        and(
          eq(userInteractions.id, interactionId),
          eq(userInteractions.clerkId, userId)
        )
      )
      .returning();

    if (!deletedInteraction) {
      return NextResponse.json(
        { error: 'Interaction not found or not authorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting interaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete interaction' },
      { status: 500 }
    );
  }
}