import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createShareAnalytic, getUserByClerkId, getTeamForUser } from '@/lib/db/queries';

// Valid platforms for sharing
const VALID_PLATFORMS = [
  'instagram_story',
  'instagram_post',
  'tiktok',
  'twitter',
  'other'
] as const;

type Platform = typeof VALID_PLATFORMS[number];

interface ShareRequest {
  platform: Platform;
  userId: number;
}

// Generate a unique referral code
function generateReferralCode(): string {
  const prefix = 'CPN';
  const suffix = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `${prefix}${suffix}`;
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: ShareRequest = await request.json();
    
    // Validate platform parameter
    if (!body.platform || !VALID_PLATFORMS.includes(body.platform)) {
      return NextResponse.json(
        { 
          error: 'Invalid platform. Must be one of: ' + VALID_PLATFORMS.join(', ')
        },
        { status: 400 }
      );
    }

    // Get user and team information
    const user = await getUserByClerkId(clerkUserId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const team = await getTeamForUser();
    if (!team) {
      return NextResponse.json(
        { error: 'User team not found' },
        { status: 404 }
      );
    }

    // Generate referral code
    const referralCode = generateReferralCode();
    
    // Create share analytics record
    await createShareAnalytic({
      userId: user.id,
      teamId: team.id,
      platform: body.platform,
      referralCode,
      sharedAt: new Date()
    });

    // Generate share URL with referral code
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/?ref=${referralCode}`;

    const response = {
      referralCode,
      shareUrl,
      success: true
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error creating share record:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}