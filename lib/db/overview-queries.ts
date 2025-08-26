import { desc, eq, sum, count } from 'drizzle-orm';
import { db } from './drizzle';
import { 
  userProfiles, 
  userInteractions,
  type UserProfile,
  type UserInteraction
} from './schema';
import { getUser } from './queries';

export interface GirlStatistics {
  id: number;
  name: string;
  rating: number;
  totalSpent: number;
  totalNuts: number;
  totalTime: number;
  costPerNut: number;
  timePerNut: number;
  costPerHour: number;
}

export interface GirlWithInteractions extends UserProfile {
  interactions: UserInteraction[];
}

export function calculateGirlMetrics(interactions: UserInteraction[]) {
  const totalSpent = interactions.reduce((sum, interaction) => {
    return sum + Number(interaction.cost);
  }, 0);

  const totalNuts = interactions.reduce((sum, interaction) => {
    return sum + interaction.nuts;
  }, 0);

  const totalTime = interactions.reduce((sum, interaction) => {
    return sum + interaction.timeMinutes;
  }, 0);

  // Calculate derived metrics
  const costPerNut = totalNuts > 0 ? totalSpent / totalNuts : 0;
  const timePerNut = totalNuts > 0 ? totalTime / totalNuts : 0;
  const costPerHour = totalTime > 0 ? (totalSpent / totalTime) * 60 : 0;

  return {
    totalSpent,
    totalNuts,
    totalTime,
    costPerNut,
    timePerNut,
    costPerHour
  };
}

export async function getGirlsStatisticsForUser(): Promise<GirlStatistics[]> {
  try {
    const currentUser = await getUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Get all user profiles for the current user
    const profiles = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.clerkId, currentUser.clerkId!))
      .orderBy(userProfiles.firstName);

    if (profiles.length === 0) {
      return [];
    }

    // Get all interactions for each profile
    const girlsWithStats: GirlStatistics[] = [];

    for (const profile of profiles) {
      // Get interactions for this profile
      const interactions = await db
        .select()
        .from(userInteractions)
        .where(eq(userInteractions.profileId, profile.id))
        .orderBy(desc(userInteractions.date));

      // Calculate metrics for this girl
      const metrics = calculateGirlMetrics(interactions);

      const girlStats: GirlStatistics = {
        id: profile.id,
        name: profile.firstName || 'Unknown',
        rating: Number(profile.rating) || 0,
        totalSpent: metrics.totalSpent,
        totalNuts: metrics.totalNuts,
        totalTime: metrics.totalTime,
        costPerNut: metrics.costPerNut,
        timePerNut: metrics.timePerNut,
        costPerHour: metrics.costPerHour
      };

      girlsWithStats.push(girlStats);
    }

    return girlsWithStats;
  } catch (error) {
    console.error('Error fetching girls statistics:', error);
    throw new Error('Failed to fetch girls statistics');
  }
}

export async function getGirlStatisticsById(profileId: number): Promise<GirlStatistics | null> {
  try {
    const currentUser = await getUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Get the specific profile
    const profile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.id, profileId))
      .limit(1);

    if (profile.length === 0 || profile[0].clerkId !== currentUser.clerkId) {
      return null;
    }

    // Get interactions for this profile
    const interactions = await db
      .select()
      .from(userInteractions)
      .where(eq(userInteractions.profileId, profileId))
      .orderBy(desc(userInteractions.date));

    // Calculate metrics
    const metrics = calculateGirlMetrics(interactions);

    return {
      id: profile[0].id,
      name: profile[0].firstName || 'Unknown',
      rating: Number(profile[0].rating) || 0,
      totalSpent: metrics.totalSpent,
      totalNuts: metrics.totalNuts,
      totalTime: metrics.totalTime,
      costPerNut: metrics.costPerNut,
      timePerNut: metrics.timePerNut,
      costPerHour: metrics.costPerHour
    };
  } catch (error) {
    console.error('Error fetching girl statistics by ID:', error);
    throw new Error('Failed to fetch girl statistics');
  }
}

export async function getGirlsWithInteractions(): Promise<GirlWithInteractions[]> {
  try {
    const currentUser = await getUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Get all profiles with their interactions using Drizzle relations
    const profilesWithInteractions = await db.query.userProfiles.findMany({
      where: eq(userProfiles.clerkId, currentUser.clerkId!),
      with: {
        interactions: {
          orderBy: desc(userInteractions.date)
        }
      },
      orderBy: userProfiles.firstName
    });

    return profilesWithInteractions;
  } catch (error) {
    console.error('Error fetching girls with interactions:', error);
    throw new Error('Failed to fetch girls with interactions');
  }
}

export async function getGirlsStatisticsSummary(): Promise<{
  totalGirls: number;
  totalSpent: number;
  totalNuts: number;
  totalTime: number;
  averageCostPerNut: number;
  averageRating: number;
}> {
  try {
    const currentUser = await getUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Get summary statistics
    const profileStats = await db
      .select({
        totalGirls: count(userProfiles.id),
        averageRating: sum(userProfiles.rating)
      })
      .from(userProfiles)
      .where(eq(userProfiles.clerkId, currentUser.clerkId!));

    const interactionStats = await db
      .select({
        totalSpent: sum(userInteractions.cost),
        totalNuts: sum(userInteractions.nuts),
        totalTime: sum(userInteractions.timeMinutes)
      })
      .from(userInteractions)
      .where(eq(userInteractions.clerkId, currentUser.clerkId!));

    const totalGirls = Number(profileStats[0]?.totalGirls || 0);
    const totalSpent = Number(interactionStats[0]?.totalSpent || 0);
    const totalNuts = Number(interactionStats[0]?.totalNuts || 0);
    const totalTime = Number(interactionStats[0]?.totalTime || 0);
    const averageRating = totalGirls > 0 
      ? Number(profileStats[0]?.averageRating || 0) / totalGirls 
      : 0;
    const averageCostPerNut = totalNuts > 0 ? totalSpent / totalNuts : 0;

    return {
      totalGirls,
      totalSpent,
      totalNuts,
      totalTime,
      averageCostPerNut,
      averageRating
    };
  } catch (error) {
    console.error('Error fetching girls statistics summary:', error);
    throw new Error('Failed to fetch statistics summary');
  }
}

// Helper function to sort girls by different criteria
export function sortGirlsStatistics(
  girls: GirlStatistics[], 
  sortBy: keyof GirlStatistics, 
  direction: 'asc' | 'desc' = 'asc'
): GirlStatistics[] {
  return [...girls].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    // Handle string sorting
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return direction === 'asc' ? comparison : -comparison;
    }

    // Handle numeric sorting
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      const comparison = aValue - bValue;
      return direction === 'asc' ? comparison : -comparison;
    }

    return 0;
  });
}

// Helper function to filter girls by criteria
export function filterGirlsStatistics(
  girls: GirlStatistics[],
  filters: {
    minRating?: number;
    maxCostPerNut?: number;
    minNuts?: number;
    hasInteractions?: boolean;
  }
): GirlStatistics[] {
  return girls.filter(girl => {
    if (filters.minRating && girl.rating < filters.minRating) {
      return false;
    }
    if (filters.maxCostPerNut && girl.costPerNut > filters.maxCostPerNut) {
      return false;
    }
    if (filters.minNuts && girl.totalNuts < filters.minNuts) {
      return false;
    }
    if (filters.hasInteractions !== undefined) {
      const hasInteractions = girl.totalNuts > 0 || girl.totalSpent > 0 || girl.totalTime > 0;
      if (filters.hasInteractions !== hasInteractions) {
        return false;
      }
    }
    return true;
  });
}