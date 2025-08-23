import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { teamMembers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get current user from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data from database using Clerk ID
    const user = await getUserByClerkId(userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get team for this user using the updated query pattern
    const result = await db.query.teamMembers.findFirst({
      where: eq(teamMembers.userId, user.id),
      with: {
        team: {
          with: {
            teamMembers: {
              with: {
                user: {
                  columns: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    });

    const team = result?.team || null;
    return NextResponse.json(team);
  } catch (error) {
    console.error('Error in GET /api/team:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
