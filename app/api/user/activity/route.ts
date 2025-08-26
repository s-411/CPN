import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { userInteractions, userAchievements, achievements, cpnScores } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { getUserByClerkId } from '@/lib/db/queries';

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

    const user = await getUserByClerkId(clerkUserId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get recent interactions (sessions)
    const recentInteractions = await db
      .select({
        type: sql<string>`'session'`,
        date: userInteractions.date,
        createdAt: userInteractions.createdAt,
        cost: userInteractions.cost,
        nuts: userInteractions.nuts,
        timeMinutes: userInteractions.timeMinutes
      })
      .from(userInteractions)
      .where(eq(userInteractions.clerkId, clerkUserId))
      .orderBy(desc(userInteractions.createdAt))
      .limit(5);

    // Get recent achievements
    const recentAchievements = await db
      .select({
        type: sql<string>`'achievement'`,
        date: userAchievements.earnedAt,
        createdAt: userAchievements.earnedAt,
        achievementName: achievements.name,
        achievementDescription: achievements.description,
        badgeColor: achievements.badgeColor
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, user.id))
      .orderBy(desc(userAchievements.earnedAt))
      .limit(3);

    // Get recent CPN score calculations
    const recentScores = await db
      .select({
        type: sql<string>`'score_update'`,
        date: cpnScores.createdAt,
        createdAt: cpnScores.createdAt,
        score: cpnScores.score,
        categoryScores: cpnScores.categoryScores
      })
      .from(cpnScores)
      .where(eq(cpnScores.userId, user.id))
      .orderBy(desc(cpnScores.createdAt))
      .limit(2);

    // Simplify activity mapping to avoid recursion issues
    const activities = [];

    // Add interactions
    for (const interaction of recentInteractions) {
      activities.push({
        type: 'session',
        date: interaction.date || interaction.createdAt.toISOString().split('T')[0],
        createdAt: interaction.createdAt.toISOString(),
        details: {
          cost: interaction.cost,
          nuts: interaction.nuts,
          timeMinutes: interaction.timeMinutes
        }
      });
    }

    // Add achievements
    for (const achievement of recentAchievements) {
      activities.push({
        type: 'achievement',
        date: achievement.date.toISOString().split('T')[0],
        createdAt: achievement.createdAt.toISOString(),
        details: {
          achievementName: achievement.achievementName,
          achievementDescription: achievement.achievementDescription,
          badgeColor: achievement.badgeColor
        }
      });
    }

    // Add score updates
    for (const score of recentScores) {
      activities.push({
        type: 'score_update',
        date: score.date.toISOString().split('T')[0],
        createdAt: score.createdAt.toISOString(),
        details: {
          score: score.score,
          categoryScores: score.categoryScores
        }
      });
    }

    // Sort by creation date and limit to most recent 10
    const sortedActivities = activities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    return NextResponse.json({
      activities: sortedActivities,
      total: activities.length
    });

  } catch (error) {
    console.error('Error fetching user activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}