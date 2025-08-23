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
      // For now, return a mock user for new Clerk users
      // In production, this would be handled by a Clerk webhook on user creation
      const mockUser = {
        id: 1,
        clerkId: userId,
        name: 'New User',
        email: 'user@example.com',
        role: 'member',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return NextResponse.json(mockUser);
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
