import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { 
  getAvailableAchievementsForUser, 
  getUserByClerkId, 
  getCpnScoreByClerkId,
  getUserInteractions 
} from '@/lib/db/queries';

// Calculate achievement progress based on criteria
function calculateProgress(achievement: any, userStats: any) {
  const criteria = achievement.criteria;
  
  switch (criteria.type) {
    case 'score_threshold':
      if (userStats.currentScore >= criteria.threshold) {
        return null; // Already unlocked
      }
      return {
        current: userStats.currentScore || 0,
        required: criteria.threshold,
        description: `Score ${criteria.threshold - (userStats.currentScore || 0)} more points to unlock`
      };

    case 'social_share':
      if (userStats.shareCount >= criteria.threshold) {
        return null; // Already unlocked
      }
      return {
        current: userStats.shareCount || 0,
        required: criteria.threshold,
        description: `Share ${criteria.threshold - (userStats.shareCount || 0)} more time${criteria.threshold - (userStats.shareCount || 0) === 1 ? '' : 's'} to unlock`
      };

    case 'total_interactions':
      if (userStats.totalInteractions >= criteria.threshold) {
        return null; // Already unlocked
      }
      return {
        current: userStats.totalInteractions || 0,
        required: criteria.threshold,
        description: `Log ${criteria.threshold - (userStats.totalInteractions || 0)} more interaction${criteria.threshold - (userStats.totalInteractions || 0) === 1 ? '' : 's'} to unlock`
      };

    case 'percentile_rank':
      if (userStats.percentile >= criteria.threshold) {
        return null; // Already unlocked
      }
      return {
        current: userStats.percentile || 0,
        required: criteria.threshold,
        description: `Reach top ${100 - criteria.threshold}% to unlock`
      };

    case 'first_calculation':
      if (userStats.currentScore > 0) {
        return null; // Already unlocked
      }
      return {
        current: 0,
        required: 1,
        description: 'Complete your first CPN calculation to unlock'
      };

    default:
      return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user information
    const user = await getUserByClerkId(clerkUserId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user achievements and stats for progress calculation
    const achievementsWithStatus = await getAvailableAchievementsForUser(user.id);
    const cpnScore = await getCpnScoreByClerkId(clerkUserId);
    const interactions = await getUserInteractions(clerkUserId, 1000);

    // Calculate user stats for progress calculation
    const userStats = {
      currentScore: cpnScore?.score || 0,
      percentile: cpnScore?.peerPercentile || 0,
      totalInteractions: interactions.length,
      shareCount: 0, // Would need to get from share analytics
    };

    // Transform achievements data
    const achievements = achievementsWithStatus.map(achievement => ({
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      iconPath: achievement.iconPath,
      badgeColor: achievement.badgeColor,
      unlocked: achievement.unlocked,
      progress: achievement.unlocked 
        ? null 
        : calculateProgress(achievement, userStats)
    }));

    return NextResponse.json({
      achievements
    });

  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}