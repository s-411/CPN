import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getCpnResultsDisplayData } from '@/lib/db/queries';

export async function GET() {
  try {
    // Authenticate the request
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get CPN data for the authenticated user
    const cpnData = await getCpnResultsDisplayData(clerkUserId);

    if (!cpnData || !cpnData.cpnScore) {
      // Return mock data for new users
      const mockScore = {
        score: 75,
        categoryScores: {
          cost_efficiency: 80,
          time_management: 70,
          success_rate: 75
        },
        peerPercentile: 85,
        achievements: [],
        totalSessions: 3,
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
      totalSessions: cpnData.cpnScore.totalSessions || 0,
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
        demographicGroup: 'All Users',
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