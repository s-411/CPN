import { desc, and, eq, isNull, sum, avg, count, sql } from 'drizzle-orm';
import { db } from './drizzle';
import { 
  activityLogs, 
  teamMembers, 
  teams, 
  users, 
  userProfiles, 
  userInteractions,
  cpnScores,
  achievements,
  userAchievements,
  shareAnalytics,
  type UserProfile,
  type NewUserProfile,
  type UserInteraction,
  type NewUserInteraction,
  type CPNUserData,
  type CpnScore,
  type NewCpnScore,
  type Achievement,
  type NewAchievement,
  type UserAchievement,
  type NewUserAchievement,
  type ShareAnalytic,
  type NewShareAnalytic
} from './schema';
import { auth } from '@clerk/nextjs/server';

// Updated getUser function to work with Clerk authentication
export async function getUser() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return null;
    }

    return await getUserByClerkId(userId);
  } catch (error) {
    console.error('Error in getUser:', error);
    return null;
  }
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date()
    })
    .where(eq(teams.id, teamId));
}

export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getTeamForUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }

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

  return result?.team || null;
}

// CPN-specific query functions

export async function getUserByClerkId(clerkId: string) {
  const result = await db
    .select()
    .from(users)
    .where(and(eq(users.clerkId, clerkId), isNull(users.deletedAt)))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createUserProfile(profileData: NewUserProfile): Promise<UserProfile> {
  const result = await db
    .insert(userProfiles)
    .values(profileData)
    .returning();

  return result[0];
}

export async function getUserProfile(clerkId: string): Promise<UserProfile | null> {
  const result = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.clerkId, clerkId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateUserProfile(clerkId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  const result = await db
    .update(userProfiles)
    .set({
      ...updates,
      updatedAt: new Date()
    })
    .where(eq(userProfiles.clerkId, clerkId))
    .returning();

  return result.length > 0 ? result[0] : null;
}

export async function createUserInteraction(interactionData: NewUserInteraction): Promise<UserInteraction> {
  const result = await db
    .insert(userInteractions)
    .values(interactionData)
    .returning();

  return result[0];
}

export async function getUserInteractions(clerkId: string, limit: number = 50): Promise<UserInteraction[]> {
  return await db
    .select()
    .from(userInteractions)
    .where(eq(userInteractions.clerkId, clerkId))
    .orderBy(desc(userInteractions.date))
    .limit(limit);
}

export async function getUserInteractionsByDateRange(
  clerkId: string,
  startDate: string,
  endDate: string
): Promise<UserInteraction[]> {
  return await db
    .select()
    .from(userInteractions)
    .where(
      and(
        eq(userInteractions.clerkId, clerkId),
        sql`${userInteractions.date} >= ${startDate}`,
        sql`${userInteractions.date} <= ${endDate}`
      )
    )
    .orderBy(desc(userInteractions.date));
}

export async function getCPNUserData(clerkId: string): Promise<CPNUserData | null> {
  // Get user
  const user = await getUserByClerkId(clerkId);
  if (!user) return null;

  // Get profile
  const profile = await getUserProfile(clerkId);

  // Get interactions with aggregated data
  const interactions = await getUserInteractions(clerkId);

  // Calculate totals
  const totals = await db
    .select({
      totalSpent: sum(userInteractions.cost),
      totalNuts: sum(userInteractions.nuts),
      interactionCount: count(userInteractions.id)
    })
    .from(userInteractions)
    .where(eq(userInteractions.clerkId, clerkId));

  const totalSpent = Number(totals[0]?.totalSpent || 0);
  const totalNuts = Number(totals[0]?.totalNuts || 0);
  const averageCostPerNut = totalNuts > 0 ? totalSpent / totalNuts : 0;

  return {
    user,
    profile,
    interactions,
    totalSpent,
    totalNuts,
    averageCostPerNut
  };
}

export async function deleteUserInteraction(clerkId: string, interactionId: number): Promise<boolean> {
  const result = await db
    .delete(userInteractions)
    .where(
      and(
        eq(userInteractions.id, interactionId),
        eq(userInteractions.clerkId, clerkId)
      )
    )
    .returning();

  return result.length > 0;
}

export async function updateUserInteraction(
  clerkId: string,
  interactionId: number,
  updates: Partial<UserInteraction>
): Promise<UserInteraction | null> {
  const result = await db
    .update(userInteractions)
    .set({
      ...updates,
      updatedAt: new Date()
    })
    .where(
      and(
        eq(userInteractions.id, interactionId),
        eq(userInteractions.clerkId, clerkId)
      )
    )
    .returning();

  return result.length > 0 ? result[0] : null;
}

// CPN Scores Query Functions

export async function createCpnScore(scoreData: NewCpnScore): Promise<CpnScore> {
  const result = await db
    .insert(cpnScores)
    .values(scoreData)
    .returning();

  return result[0];
}

export async function getCpnScoreByUserId(userId: number): Promise<CpnScore | null> {
  const result = await db
    .select()
    .from(cpnScores)
    .where(eq(cpnScores.userId, userId))
    .orderBy(desc(cpnScores.createdAt))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getCpnScoreByClerkId(clerkId: string): Promise<CpnScore | null> {
  const user = await getUserByClerkId(clerkId);
  if (!user) return null;

  return await getCpnScoreByUserId(user.id);
}

export async function updateCpnScore(userId: number, updates: Partial<CpnScore>): Promise<CpnScore | null> {
  const result = await db
    .update(cpnScores)
    .set({
      ...updates,
      updatedAt: new Date()
    })
    .where(eq(cpnScores.userId, userId))
    .returning();

  return result.length > 0 ? result[0] : null;
}

export async function getCpnScoreWithPeerData(userId: number): Promise<{
  score: CpnScore;
  peerComparison: {
    averageScore: number;
    totalUsers: number;
    userRank: number;
  };
} | null> {
  const score = await getCpnScoreByUserId(userId);
  if (!score) return null;

  // Calculate peer comparison data
  const peerStats = await db
    .select({
      averageScore: avg(cpnScores.score),
      totalUsers: count(cpnScores.id),
    })
    .from(cpnScores);

  // Calculate user rank
  const higherScores = await db
    .select({ count: count() })
    .from(cpnScores)
    .where(sql`${cpnScores.score} > ${score.score}`);

  const userRank = Number(higherScores[0]?.count || 0) + 1;

  return {
    score,
    peerComparison: {
      averageScore: Number(peerStats[0]?.averageScore || 0),
      totalUsers: Number(peerStats[0]?.totalUsers || 0),
      userRank
    }
  };
}

// Achievements Query Functions

export async function createAchievement(achievementData: NewAchievement): Promise<Achievement> {
  const result = await db
    .insert(achievements)
    .values(achievementData)
    .returning();

  return result[0];
}

export async function getAllAchievements(activeOnly: boolean = true): Promise<Achievement[]> {
  if (activeOnly) {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.active, true))
      .orderBy(achievements.displayOrder);
  }

  return await db
    .select()
    .from(achievements)
    .orderBy(achievements.displayOrder);
}

export async function getAchievementById(id: number): Promise<Achievement | null> {
  const result = await db
    .select()
    .from(achievements)
    .where(eq(achievements.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateAchievement(id: number, updates: Partial<Achievement>): Promise<Achievement | null> {
  const result = await db
    .update(achievements)
    .set(updates)
    .where(eq(achievements.id, id))
    .returning();

  return result.length > 0 ? result[0] : null;
}

// User Achievements Query Functions

export async function createUserAchievement(userAchievementData: NewUserAchievement): Promise<UserAchievement> {
  const result = await db
    .insert(userAchievements)
    .values(userAchievementData)
    .returning();

  return result[0];
}

export async function getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]> {
  const results = await db
    .select({
      id: userAchievements.id,
      userId: userAchievements.userId,
      teamId: userAchievements.teamId,
      achievementId: userAchievements.achievementId,
      earnedAt: userAchievements.earnedAt,
      achievement: achievements
    })
    .from(userAchievements)
    .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(eq(userAchievements.userId, userId))
    .orderBy(desc(userAchievements.earnedAt));

  return results.map(row => ({
    id: row.id,
    userId: row.userId,
    teamId: row.teamId,
    achievementId: row.achievementId,
    earnedAt: row.earnedAt,
    achievement: row.achievement
  }));
}

export async function getUserAchievementsByClerkId(clerkId: string): Promise<(UserAchievement & { achievement: Achievement })[]> {
  const user = await getUserByClerkId(clerkId);
  if (!user) return [];

  return await getUserAchievements(user.id);
}

export async function checkUserHasAchievement(userId: number, achievementId: number): Promise<boolean> {
  const result = await db
    .select()
    .from(userAchievements)
    .where(and(
      eq(userAchievements.userId, userId),
      eq(userAchievements.achievementId, achievementId)
    ))
    .limit(1);

  return result.length > 0;
}

export async function getAvailableAchievementsForUser(userId: number): Promise<(Achievement & { unlocked: boolean })[]> {
  const allAchievements = await getAllAchievements();
  const userAchievementsList = await getUserAchievements(userId);
  
  const unlockedIds = new Set(userAchievementsList.map(ua => ua.achievementId));

  return allAchievements.map(achievement => ({
    ...achievement,
    unlocked: unlockedIds.has(achievement.id)
  }));
}

// Share Analytics Query Functions

export async function createShareAnalytic(shareData: NewShareAnalytic): Promise<ShareAnalytic> {
  const result = await db
    .insert(shareAnalytics)
    .values(shareData)
    .returning();

  return result[0];
}

export async function getShareAnalyticsByUserId(userId: number, limit: number = 50): Promise<ShareAnalytic[]> {
  return await db
    .select()
    .from(shareAnalytics)
    .where(eq(shareAnalytics.userId, userId))
    .orderBy(desc(shareAnalytics.sharedAt))
    .limit(limit);
}

export async function getShareAnalyticsByClerkId(clerkId: string, limit: number = 50): Promise<ShareAnalytic[]> {
  const user = await getUserByClerkId(clerkId);
  if (!user) return [];

  return await getShareAnalyticsByUserId(user.id, limit);
}

export async function getShareAnalyticsByReferralCode(referralCode: string): Promise<ShareAnalytic | null> {
  const result = await db
    .select()
    .from(shareAnalytics)
    .where(eq(shareAnalytics.referralCode, referralCode))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getShareStatsByPlatform(userId?: number): Promise<{ platform: string; count: number }[]> {
  if (userId) {
    return await db
      .select({
        platform: shareAnalytics.platform,
        count: count(shareAnalytics.id)
      })
      .from(shareAnalytics)
      .where(eq(shareAnalytics.userId, userId))
      .groupBy(shareAnalytics.platform);
  }

  return await db
    .select({
      platform: shareAnalytics.platform,
      count: count(shareAnalytics.id)
    })
    .from(shareAnalytics)
    .groupBy(shareAnalytics.platform);
}

// CPN Results Display Helper Function
export async function getCpnResultsDisplayData(clerkId: string): Promise<{
  cpnScore: CpnScore;
  achievements: (UserAchievement & { achievement: Achievement })[];
  peerComparison: {
    averageScore: number;
    totalUsers: number;
    userRank: number;
    percentile: number;
  };
  shareHistory: ShareAnalytic[];
} | null> {
  const user = await getUserByClerkId(clerkId);
  if (!user) return null;

  const scoreWithPeerData = await getCpnScoreWithPeerData(user.id);
  if (!scoreWithPeerData) return null;

  const userAchievementsList = await getUserAchievements(user.id);
  const shareHistory = await getShareAnalyticsByUserId(user.id, 10);

  // Calculate percentile
  const percentile = scoreWithPeerData.peerComparison.totalUsers > 0 
    ? Math.round(((scoreWithPeerData.peerComparison.totalUsers - scoreWithPeerData.peerComparison.userRank + 1) / scoreWithPeerData.peerComparison.totalUsers) * 100)
    : 0;

  return {
    cpnScore: scoreWithPeerData.score,
    achievements: userAchievementsList,
    peerComparison: {
      ...scoreWithPeerData.peerComparison,
      percentile
    },
    shareHistory
  };
}
