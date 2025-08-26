import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getGirlsForUser, createGirl } from '@/lib/db/girls-queries';

export async function GET() {
  try {
    // Check authentication first
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const girls = await getGirlsForUser();
    return NextResponse.json(girls);
  } catch (error) {
    console.error('Error fetching girls:', error);
    return NextResponse.json(
      { error: 'Failed to fetch girls' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication first
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const girl = await createGirl(body);
    return NextResponse.json(girl);
  } catch (error) {
    console.error('Error creating girl:', error);
    return NextResponse.json(
      { error: 'Failed to create girl' },
      { status: 500 }
    );
  }
}