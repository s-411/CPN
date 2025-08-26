import { eq, and, isNull } from 'drizzle-orm';
import { db } from './drizzle';
import { girls, users, teams, type Girl, type NewGirl } from './schema';
import { getUser } from './queries';

/**
 * Get all girls for the current user
 * Filters out soft-deleted girls and ensures proper team isolation
 */
export async function getGirlsForUser(): Promise<Girl[]> {
  const user = await getUser();
  
  if (!user?.id) {
    throw new Error('User not found');
  }

  const userGirls = await db.query.girls.findMany({
    where: and(
      eq(girls.userId, user.id),
      isNull(girls.deletedAt)
    ),
    orderBy: (girls, { desc }) => [desc(girls.createdAt)],
  });

  return userGirls;
}

/**
 * Get a specific girl by ID for the current user
 */
export async function getGirlById(id: number): Promise<Girl | null> {
  const user = await getUser();
  
  if (!user?.id) {
    throw new Error('User not found');
  }

  const girl = await db.query.girls.findFirst({
    where: and(
      eq(girls.id, id),
      eq(girls.userId, user.id),
      isNull(girls.deletedAt)
    ),
  });

  return girl || null;
}

/**
 * Create a new girl
 */
export async function createGirl(girlData: Omit<NewGirl, 'userId' | 'teamId' | 'createdAt' | 'updatedAt'>): Promise<Girl> {
  const user = await getUser();
  
  if (!user?.id) {
    throw new Error('User not found');
  }

  // Get user's team ID (assuming user has a team)
  const userWithTeam = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    with: {
      teamMembers: {
        with: {
          team: true
        }
      }
    }
  });

  if (!userWithTeam?.teamMembers?.[0]?.teamId) {
    throw new Error('User team not found');
  }

  const newGirl: NewGirl = {
    ...girlData,
    userId: user.id,
    teamId: userWithTeam.teamMembers[0].teamId,
  };

  const [createdGirl] = await db.insert(girls).values(newGirl).returning();
  
  if (!createdGirl) {
    throw new Error('Failed to create girl');
  }

  return createdGirl;
}

/**
 * Update an existing girl
 */
export async function updateGirl(id: number, updates: Partial<Omit<Girl, 'id' | 'userId' | 'teamId' | 'createdAt'>>): Promise<Girl> {
  const user = await getUser();
  
  if (!user?.id) {
    throw new Error('User not found');
  }

  // Verify the girl belongs to the current user
  const existingGirl = await getGirlById(id);
  if (!existingGirl) {
    throw new Error('Girl not found');
  }

  const [updatedGirl] = await db
    .update(girls)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(girls.id, id))
    .returning();

  if (!updatedGirl) {
    throw new Error('Failed to update girl');
  }

  return updatedGirl;
}

/**
 * Soft delete a girl
 */
export async function deleteGirl(id: number): Promise<void> {
  const user = await getUser();
  
  if (!user?.id) {
    throw new Error('User not found');
  }

  // Verify the girl belongs to the current user
  const existingGirl = await getGirlById(id);
  if (!existingGirl) {
    throw new Error('Girl not found');
  }

  await db
    .update(girls)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(girls.id, id));
}

/**
 * Get girls count for current user (excluding soft-deleted)
 */
export async function getGirlsCount(): Promise<number> {
  const user = await getUser();
  
  if (!user?.id) {
    throw new Error('User not found');
  }

  const userGirls = await db.query.girls.findMany({
    where: and(
      eq(girls.userId, user.id),
      isNull(girls.deletedAt)
    ),
  });

  return userGirls.length;
}

/**
 * Archive a girl (set status to archived)
 */
export async function archiveGirl(id: number): Promise<Girl> {
  return updateGirl(id, { status: 'archived' });
}

/**
 * Activate a girl (set status to active)
 */
export async function activateGirl(id: number): Promise<Girl> {
  return updateGirl(id, { status: 'active' });
}