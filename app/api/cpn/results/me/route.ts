import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getCpnResultsDisplayData } from '@/lib/db/queries';
import { calculateAndSaveCPNScore } from '@/lib/cpn-calculation-engine';

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
      // Try to calculate CPN score from existing data
      const calculationResult = await calculateAndSaveCPNScore(clerkUserId);
      
      if (calculationResult && calculationResult.overallScore > 0) {
        // Return calculated score
        return NextResponse.json({
          score: calculationResult.overallScore,
          categoryScores: calculationResult.categoryScores,
          peerPercentile: 50, // Default percentile for new scores
          achievements: [],
          totalSessions: calculationResult.metrics.totalSessions,
          metrics: calculationResult.metrics,
          peerComparison: {
            averageScore: 65,
            demographicGroup: 'All Users',
            totalUsers: 100
          }
        });
      }
      
      // Return empty state if no data to calculate from
      return NextResponse.json({
        score: 0,
        categoryScores: {
          cost_efficiency: 0,
          time_management: 0,
          success_rate: 0
        },
        peerPercentile: 0,
        achievements: [],
        totalSessions: 0,
        metrics: {
          totalCost: 0,
          totalNuts: 0,
          totalTimeMinutes: 0,
          averageCostPerNut: 0,
          averageTimePerNut: 0,
          totalSessions: 0,
          successRate: 0
        },
        peerComparison: {
          averageScore: 0,
          demographicGroup: 'No Users',
          totalUsers: 0
        }
      });
    }

    // Calculate fresh metrics from user data
    const freshCalculation = await calculateAndSaveCPNScore(clerkUserId);
    
    // Transform the data to match the API spec
    const response = {
      score: cpnData.cpnScore.score,
      categoryScores: cpnData.cpnScore.categoryScores,
      peerPercentile: cpnData.cpnScore.peerPercentile,
      totalSessions: freshCalculation?.metrics.totalSessions ?? 0,
      metrics: freshCalculation?.metrics ?? {
        totalCost: 0,
        totalNuts: 0,
        totalTimeMinutes: 0,
        averageCostPerNut: 0,
        averageTimePerNut: 0,
        totalSessions: 0,
        successRate: 0
      },
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