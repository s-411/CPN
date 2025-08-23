import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getCpnResultsDisplayData } from '@/lib/db/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Get the params
    const { userId } = await params;
    
    // Authenticate the request
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // For now, we'll use the authenticated user's clerkUserId instead of the URL param
    // In a production app, you'd want to verify the user has permission to access the requested userId
    const cpnData = await getCpnResultsDisplayData(clerkUserId);

    if (!cpnData || !cpnData.cpnScore) {
      // Calculate mock CPN score for new users
      // In production, this would be calculated from actual data
      const mockScore = {
        score: 75,
        categoryScores: {
          cost_efficiency: 80,
          time_management: 70,
          success_rate: 75
        },
        peerPercentile: 85,
        achievements: [],
        peerComparison: {
          averageScore: 65,
          demographicGroup: 'All Users',
          totalUsers: 100
        }
      };
      
      return NextResponse.json(mockScore);
    }

    // Transform the data to match the API spec
    const response = {
      score: cpnData.cpnScore.score,
      categoryScores: cpnData.cpnScore.categoryScores,
      peerPercentile: cpnData.cpnScore.peerPercentile,
      achievements: cpnData.achievements.map(ua => ({
        id: ua.achievement.id,
        name: ua.achievement.name,
        description: ua.achievement.description,
        iconPath: ua.achievement.iconPath,
        badgeColor: ua.achievement.badgeColor,
        earnedAt: ua.earnedAt.toISOString()
      })),
      peerComparison: {
        averageScore: cpnData.peerComparison.averageScore,
        demographicGroup: 'All Users', // Could be made dynamic based on user profile
        totalUsers: cpnData.peerComparison.totalUsers
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching CPN results:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}