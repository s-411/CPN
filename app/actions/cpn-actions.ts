'use server'

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { 
  getUserByClerkId, 
  getTeamForUser, 
  createUserAchievement, 
  checkUserHasAchievement,
  getCpnScoreByClerkId,
  createShareAnalytic,
  getAchievementById 
} from '@/lib/db/queries';

// Types for server actions
interface GenerateShareGraphicParams {
  userId: number;
  format: '9:16' | '1:1' | '16:9';
  includeReferral: boolean;
}

interface UnlockAchievementParams {
  userId: number;
  achievementId: number;
  trigger: string;
}

// Generate referral code
function generateReferralCode(): string {
  const prefix = 'CPN';
  const suffix = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `${prefix}${suffix}`;
}

// Create canvas for graphic generation (server-side compatible)
function createCanvas(width: number, height: number) {
  // In a real implementation, you'd use a server-side canvas library like 'canvas'
  // For now, we'll create a mock implementation that would work with an actual canvas library
  return {
    width,
    height,
    toDataURL: () => `data:image/png;base64,${Buffer.from(`mock-canvas-${width}x${height}`).toString('base64')}`
  };
}

export async function generateShareGraphic(params: GenerateShareGraphicParams) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate parameters
    if (!params.userId) {
      return { success: false, error: 'User ID required' };
    }

    const validFormats = ['9:16', '1:1', '16:9'] as const;
    if (!validFormats.includes(params.format)) {
      return { success: false, error: 'Invalid format' };
    }

    // Get user data for the graphic
    const user = await getUserByClerkId(clerkUserId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const cpnScore = await getCpnScoreByClerkId(clerkUserId);
    if (!cpnScore) {
      return { success: false, error: 'CPN score not found' };
    }

    // Set canvas dimensions based on format
    const dimensions = {
      '9:16': { width: 1080, height: 1920 }, // Instagram Stories
      '1:1': { width: 1080, height: 1080 },   // Instagram Posts  
      '16:9': { width: 1920, height: 1080 }   // General sharing
    };

    const { width, height } = dimensions[params.format];
    const canvas = createCanvas(width, height);

    // In a real implementation, you would:
    // 1. Create canvas context
    // 2. Set background gradient or color
    // 3. Add CPN logo/branding
    // 4. Display the user's CPN score prominently
    // 5. Add category scores breakdown
    // 6. Include percentile information
    // 7. Add referral code if requested
    // 8. Apply mobile-optimized typography
    // 9. Use consistent brand colors and styling

    // Generate referral code if requested
    let referralCode: string | undefined;
    if (params.includeReferral) {
      referralCode = generateReferralCode();
      
      // Track the share event if referral is included
      const team = await getTeamForUser();
      if (team) {
        await createShareAnalytic({
          userId: user.id,
          teamId: team.id,
          platform: 'other', // Default platform for generated graphics
          referralCode,
          sharedAt: new Date()
        });
      }
    }

    return {
      success: true,
      imageDataUrl: canvas.toDataURL(),
      referralCode
    };

  } catch (error) {
    console.error('Error generating share graphic:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function unlockAchievement(params: UnlockAchievementParams) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return { unlocked: false, error: 'Unauthorized' };
    }

    // Get user information
    const user = await getUserByClerkId(clerkUserId);
    if (!user) {
      return { unlocked: false, error: 'User not found' };
    }

    // Validate achievement exists
    const achievement = await getAchievementById(params.achievementId);
    if (!achievement) {
      return { unlocked: false, error: 'Achievement not found' };
    }

    // Check if user already has this achievement
    const hasAchievement = await checkUserHasAchievement(user.id, params.achievementId);
    if (hasAchievement) {
      return { unlocked: false, error: 'Achievement already unlocked' };
    }

    // Get user's team for multi-tenancy
    const team = await getTeamForUser();
    if (!team) {
      return { unlocked: false, error: 'User team not found' };
    }

    // Create user achievement record
    await createUserAchievement({
      userId: user.id,
      teamId: team.id,
      achievementId: params.achievementId,
      earnedAt: new Date()
    });

    // Revalidate relevant paths
    revalidatePath('/dashboard');
    revalidatePath('/cpn-results');

    return {
      unlocked: true,
      achievement: {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        iconPath: achievement.iconPath
      }
    };

  } catch (error) {
    console.error('Error unlocking achievement:', error);
    return { 
      unlocked: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Helper function to check and auto-unlock achievements based on triggers
export async function checkAchievementTriggers(trigger: string, userStats?: any) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await getUserByClerkId(clerkUserId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Get current user stats if not provided
    if (!userStats) {
      const cpnScore = await getCpnScoreByClerkId(clerkUserId);
      userStats = {
        currentScore: cpnScore?.score || 0,
        percentile: cpnScore?.peerPercentile || 0
      };
    }

    const team = await getTeamForUser();
    if (!team) {
      return { success: false, error: 'Team not found' };
    }

    // Define achievement triggers and their criteria
    const triggerMappings: Record<string, (stats: any) => Promise<number[]>> = {
      'first_calculation': async (stats) => {
        return stats.currentScore > 0 ? [1] : []; // Achievement ID 1: First Score
      },
      'score_threshold': async (stats) => {
        const unlockedIds = [];
        if (stats.currentScore >= 80) unlockedIds.push(2); // High Performer
        if (stats.currentScore >= 90) unlockedIds.push(3); // Elite Status
        return unlockedIds;
      },
      'percentile_rank': async (stats) => {
        return stats.percentile >= 90 ? [4] : []; // Top Percentile
      },
      'social_share': async () => {
        return [5]; // Social Sharer - unlocked on first share
      }
    };

    const handler = triggerMappings[trigger];
    if (!handler) {
      return { success: true, unlockedAchievements: [] };
    }

    const potentialAchievements = await handler(userStats);
    const newlyUnlocked = [];

    for (const achievementId of potentialAchievements) {
      const hasAchievement = await checkUserHasAchievement(user.id, achievementId);
      if (!hasAchievement) {
        const result = await unlockAchievement({
          userId: user.id,
          achievementId,
          trigger
        });
        
        if (result.unlocked) {
          newlyUnlocked.push(result.achievement);
        }
      }
    }

    return {
      success: true,
      unlockedAchievements: newlyUnlocked
    };

  } catch (error) {
    console.error('Error checking achievement triggers:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}