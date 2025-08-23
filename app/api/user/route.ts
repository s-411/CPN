import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/lib/db/queries';
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

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error in GET /api/user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
