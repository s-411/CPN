/**
 * Utility functions for mapping Clerk users to Supabase users
 * and managing user data persistence with Clerk authentication
 */

import { createSupabaseServerClient } from './auth';
import { 
  getUserByClerkId, 
  createUserProfile
} from '../db/queries';
import { 
  type User,
  type NewUser,
  type UserProfile,
  type NewUserProfile
} from '../db/schema';
import { db } from '../db/drizzle';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export interface ClerkUserData {
  id: string;
  emailAddresses: Array<{ emailAddress: string; id: string }>;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  imageUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CPNOnboardingData {
  profile?: {
    firstName?: string;
    age?: number;
    ethnicity?: string;
    rating?: number;
  };
  interactions?: Array<{
    date: string;
    cost: number;
    timeMinutes: number;
    nuts: number;
    notes?: string;
  }>;
}

/**
 * Creates or updates a user record in Supabase based on Clerk user data
 */
export async function syncClerkUserToSupabase(clerkUser: ClerkUserData): Promise<User> {
  const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress;
  
  if (!primaryEmail) {
    throw new Error('Clerk user must have at least one email address');
  }

  // Check if user already exists
  const existingUser = await getUserByClerkId(clerkUser.id);
  
  if (existingUser) {
    // Update existing user
    const [updatedUser] = await db
      .update(users)
      .set({
        email: primaryEmail,
        name: clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(users.clerkId, clerkUser.id))
      .returning();
    
    return updatedUser;
  } else {
    // Create new user
    const newUser: NewUser = {
      clerkId: clerkUser.id,
      email: primaryEmail,
      name: clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
      role: 'owner', // Default role for new users
    };

    const [createdUser] = await db
      .insert(users)
      .values(newUser)
      .returning();
    
    return createdUser;
  }
}

/**
 * Creates a user profile for CPN onboarding data
 */
export async function createCPNUserProfile(
  clerkId: string,
  profileData: CPNOnboardingData['profile']
): Promise<void> {
  if (!profileData) return;

  // Get the user ID from the synced user
  const user = await getUserByClerkId(clerkId);
  if (!user) {
    throw new Error('User must be synced before creating profile');
  }

  const newProfile: NewUserProfile = {
    userId: user.id,
    clerkId: clerkId,
    firstName: profileData.firstName || null,
    age: profileData.age || null,
    ethnicity: profileData.ethnicity || null,
    rating: profileData.rating ? profileData.rating.toString() as any : null,
  };

  await createUserProfile(newProfile);
}

/**
 * Migrates session storage data to user's Supabase profile
 */
export async function migrateSessionDataToUser(
  clerkId: string,
  sessionData: CPNOnboardingData
): Promise<void> {
  // First, ensure user is synced
  // Note: clerkUser data would need to be passed or fetched
  // This is a placeholder for the actual implementation
  
  // Create profile if exists
  if (sessionData.profile) {
    await createCPNUserProfile(clerkId, sessionData.profile);
  }

  // Create interactions if exist
  if (sessionData.interactions && sessionData.interactions.length > 0) {
    // Import createUserInteraction here to avoid circular imports
    const { createUserInteraction } = await import('../db/queries');
    
    const user = await getUserByClerkId(clerkId);
    if (!user) {
      throw new Error('User must be synced before creating interactions');
    }

    // Get user profile (needed for profile_id)
    const { getUserProfile } = await import('../db/queries');
    const profile = await getUserProfile(clerkId);
    
    for (const interaction of sessionData.interactions) {
      await createUserInteraction({
        userId: user.id,
        clerkId: clerkId,
        profileId: profile?.id || null,
        date: interaction.date,
        cost: interaction.cost.toString() as any,
        timeMinutes: interaction.timeMinutes,
        nuts: interaction.nuts,
        notes: interaction.notes || null,
      });
    }
  }
}

/**
 * Gets session data from localStorage (for migration)
 * This would be called client-side and passed to server
 */
export function getSessionDataForMigration(): CPNOnboardingData {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const profileData = localStorage.getItem('cpn_profile');
    const interactionsData = localStorage.getItem('cpn_interactions');

    return {
      profile: profileData ? JSON.parse(profileData) : undefined,
      interactions: interactionsData ? JSON.parse(interactionsData) : undefined,
    };
  } catch (error) {
    console.error('Error reading session data:', error);
    return {};
  }
}

/**
 * Clears session data from localStorage after successful migration
 */
export function clearSessionData(): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem('cpn_profile');
  localStorage.removeItem('cpn_interactions');
}

/**
 * Validates that a user has proper access to data based on Clerk ID
 */
export async function validateUserAccess(clerkId: string, userId?: number): Promise<boolean> {
  const user = await getUserByClerkId(clerkId);
  
  if (!user) {
    return false;
  }

  // If no specific userId is provided, just check if user exists
  if (!userId) {
    return true;
  }

  // Check if the Clerk user owns the data
  return user.id === userId;
}

/**
 * Gets complete user context for authenticated requests
 */
export async function getUserContext(clerkId: string) {
  const user = await getUserByClerkId(clerkId);
  
  if (!user) {
    return null;
  }

  const { getUserProfile, getUserInteractions } = await import('../db/queries');
  
  const [profile, interactions] = await Promise.all([
    getUserProfile(clerkId),
    getUserInteractions(clerkId, 10), // Get latest 10 interactions
  ]);

  return {
    user,
    profile,
    interactions,
    hasProfile: !!profile,
    hasInteractions: interactions.length > 0,
  };
}