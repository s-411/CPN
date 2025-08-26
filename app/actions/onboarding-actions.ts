'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db/drizzle';
import { 
  users, 
  userProfiles, 
  userInteractions, 
  teams, 
  teamMembers,
  type NewUserProfile,
  type NewUserInteraction 
} from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { calculateAndSaveCPNScore } from '@/lib/cpn-calculation-engine';

// Validation schemas
const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  age: z.number().min(18, 'Must be 18 or older').max(120),
  ethnicity: z.string().min(1, 'Ethnicity is required').max(50),
  rating: z.number().min(1).max(10)
});

const interactionSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  cost: z.number().min(0, 'Cost must be positive'),
  timeMinutes: z.number().min(1, 'Time must be at least 1 minute'),
  nuts: z.number().min(0, 'Nuts must be 0 or positive'),
  girlId: z.number().optional(),
  notes: z.string().optional()
});

const girlSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  age: z.number().min(18, 'Must be 18 or older').max(120),
  nationality: z.string().min(1, 'Nationality is required').max(50),
  rating: z.number().min(1).max(10)
});

// Helper function to get or create user
async function getOrCreateUser(clerkId: string) {
  // Try to find existing user
  let user = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  if (user.length > 0) {
    return user[0];
  }

  // Create new user if doesn't exist
  const newUser = await db
    .insert(users)
    .values({
      clerkId,
      email: `user-${clerkId}@temp.com`, // Temporary email, will be updated
      role: 'member'
    })
    .returning();

  // Create default team for new user
  const team = await db
    .insert(teams)
    .values({
      name: `${newUser[0].id}'s Team`
    })
    .returning();

  // Add user to team
  await db.insert(teamMembers).values({
    userId: newUser[0].id,
    teamId: team[0].id,
    role: 'owner'
  });

  return newUser[0];
}

/**
 * Save user profile from onboarding
 */
export async function saveUserProfile(formData: FormData) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      throw new Error('Unauthorized');
    }

    // Validate form data
    const rawData = {
      firstName: formData.get('firstName') as string,
      age: parseInt(formData.get('age') as string),
      ethnicity: formData.get('ethnicity') as string,
      rating: parseFloat(formData.get('rating') as string)
    };

    const validatedData = profileSchema.parse(rawData);
    
    // Get or create user
    const user = await getOrCreateUser(clerkUserId);

    // Check if profile already exists
    const existingProfile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.clerkId, clerkUserId))
      .limit(1);

    if (existingProfile.length > 0) {
      // Update existing profile
      await db
        .update(userProfiles)
        .set({
          firstName: validatedData.firstName,
          age: validatedData.age,
          ethnicity: validatedData.ethnicity,
          rating: validatedData.rating.toString(),
          updatedAt: new Date()
        })
        .where(eq(userProfiles.clerkId, clerkUserId));
    } else {
      // Create new profile
      const profileData: NewUserProfile = {
        userId: user.id,
        clerkId: clerkUserId,
        firstName: validatedData.firstName,
        age: validatedData.age,
        ethnicity: validatedData.ethnicity,
        rating: validatedData.rating.toString()
      };

      await db.insert(userProfiles).values(profileData);
    }

    return { success: true, message: 'Profile saved successfully' };

  } catch (error) {
    console.error('Error saving user profile:', error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Validation failed', 
        details: error.errors 
      };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Save user interaction data
 */
export async function saveUserInteraction(formData: FormData) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      throw new Error('Unauthorized');
    }

    // Validate form data
    const girlIdStr = formData.get('girlId') as string;
    const rawData = {
      date: formData.get('date') as string,
      cost: parseFloat(formData.get('cost') as string),
      timeMinutes: parseInt(formData.get('timeMinutes') as string),
      nuts: parseInt(formData.get('nuts') as string),
      girlId: girlIdStr ? parseInt(girlIdStr) : undefined,
      notes: formData.get('notes') as string || undefined
    };

    const validatedData = interactionSchema.parse(rawData);
    
    // Get or create user
    const user = await getOrCreateUser(clerkUserId);

    // Get user's profile (needed for profileId)
    const profile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.clerkId, clerkUserId))
      .limit(1);

    if (profile.length === 0) {
      return { 
        success: false, 
        error: 'User profile not found. Please complete your profile first.' 
      };
    }

    // Create interaction record
    const interactionData: NewUserInteraction = {
      userId: user.id,
      clerkId: clerkUserId,
      profileId: profile[0].id,
      girlId: validatedData.girlId || null,
      date: validatedData.date,
      cost: validatedData.cost.toString(), // Convert to decimal string
      timeMinutes: validatedData.timeMinutes,
      nuts: validatedData.nuts,
      notes: validatedData.notes || null
    };

    await db.insert(userInteractions).values(interactionData);

    return { success: true, message: 'Interaction saved successfully' };

  } catch (error) {
    console.error('Error saving user interaction:', error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Validation failed', 
        details: error.errors 
      };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Complete onboarding and calculate CPN score
 */
export async function completeOnboarding() {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      throw new Error('Unauthorized');
    }

    // Check if user has the required data
    const profile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.clerkId, clerkUserId))
      .limit(1);

    if (profile.length === 0) {
      return { 
        success: false, 
        error: 'Profile data missing. Please complete your profile first.' 
      };
    }

    const interactions = await db
      .select()
      .from(userInteractions)
      .where(eq(userInteractions.clerkId, clerkUserId))
      .limit(1);

    if (interactions.length === 0) {
      return { 
        success: false, 
        error: 'No interaction data found. Please add at least one interaction.' 
      };
    }

    // Calculate and save CPN score
    const calculationResult = await calculateAndSaveCPNScore(clerkUserId);
    
    if (!calculationResult) {
      return { 
        success: false, 
        error: 'Failed to calculate CPN score. Please try again.' 
      };
    }

    // Clear any session storage data (handled on client-side)
    return { 
      success: true, 
      message: 'Onboarding completed successfully!',
      cpnScore: calculationResult.overallScore,
      redirectTo: '/cpn-results'
    };

  } catch (error) {
    console.error('Error completing onboarding:', error);
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Migrate session storage data to database (for users who started before auth)
 */
export async function migrateSessionData(sessionData: {
  profile?: any;
  interactions?: any[];
  girls?: any[];
}) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      throw new Error('Unauthorized');
    }

    const results: { success: boolean; message: string }[] = [];

    // Migrate profile data
    if (sessionData.profile) {
      const profileResult = await saveUserProfileFromData(clerkUserId, sessionData.profile);
      results.push(profileResult);
    }

    // Migrate interaction data
    if (sessionData.interactions && sessionData.interactions.length > 0) {
      for (const interaction of sessionData.interactions) {
        const interactionResult = await saveUserInteractionFromData(clerkUserId, interaction);
        results.push(interactionResult);
      }
    }

    // Calculate CPN score after migration
    if (results.some(r => r.success)) {
      await calculateAndSaveCPNScore(clerkUserId);
    }

    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    return {
      success: successCount > 0,
      message: `Migrated ${successCount}/${totalCount} records successfully`,
      details: results
    };

  } catch (error) {
    console.error('Error migrating session data:', error);
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Helper functions for data migration
async function saveUserProfileFromData(clerkUserId: string, profileData: any) {
  try {
    const validatedData = profileSchema.parse(profileData);
    const user = await getOrCreateUser(clerkUserId);

    const newProfile: NewUserProfile = {
      userId: user.id,
      clerkId: clerkUserId,
      firstName: validatedData.firstName,
      age: validatedData.age,
      ethnicity: validatedData.ethnicity,
      rating: validatedData.rating.toString()
    };

    await db.insert(userProfiles).values(newProfile);
    
    return { success: true, message: 'Profile migrated successfully' };
  } catch (error) {
    return { success: false, message: 'Failed to migrate profile' };
  }
}

async function saveUserInteractionFromData(clerkUserId: string, interactionData: any) {
  try {
    const validatedData = interactionSchema.parse(interactionData);
    const user = await getOrCreateUser(clerkUserId);
    
    const profile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.clerkId, clerkUserId))
      .limit(1);

    if (profile.length === 0) {
      throw new Error('Profile not found');
    }

    const newInteraction: NewUserInteraction = {
      userId: user.id,
      clerkId: clerkUserId,
      profileId: profile[0].id,
      date: validatedData.date,
      cost: validatedData.cost.toString(),
      timeMinutes: validatedData.timeMinutes,
      nuts: validatedData.nuts,
      notes: validatedData.notes || null
    };

    await db.insert(userInteractions).values(newInteraction);
    
    return { success: true, message: 'Interaction migrated successfully' };
  } catch (error) {
    return { success: false, message: 'Failed to migrate interaction' };
  }
}

/**
 * Recalculate CPN score for current user
 */
export async function recalculateCPNScore() {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      throw new Error('Unauthorized');
    }

    const calculationResult = await calculateAndSaveCPNScore(clerkUserId);
    
    if (!calculationResult) {
      return { 
        success: false, 
        error: 'Failed to recalculate CPN score' 
      };
    }

    return {
      success: true,
      message: 'CPN score recalculated successfully',
      score: calculationResult.overallScore,
      categoryScores: calculationResult.categoryScores
    };

  } catch (error) {
    console.error('Error recalculating CPN score:', error);
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}