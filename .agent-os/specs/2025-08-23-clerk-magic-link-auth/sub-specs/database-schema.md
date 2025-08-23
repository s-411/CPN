# Database Schema: Clerk Authentication Integration

## Current Database Schema
The application currently uses session storage for onboarding data. This needs to be migrated to persistent database storage with Clerk user authentication.

## New Schema Design

### Users Table (Primary User Records)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  clerk_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  
  -- Indexes
  CONSTRAINT unique_clerk_id UNIQUE (clerk_id),
  CONSTRAINT unique_email UNIQUE (email)
);

-- Indexes for performance
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

### User Profiles Table (From /add-girl onboarding)
```sql
CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clerk_id VARCHAR(255) NOT NULL,
  
  -- Profile data from onboarding form
  first_name VARCHAR(100) NOT NULL,
  age INTEGER CHECK (age >= 18 AND age <= 99),
  ethnicity VARCHAR(50),
  rating DECIMAL(3,1) CHECK (rating >= 0 AND rating <= 10),
  
  -- Metadata
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_profile UNIQUE (user_id),
  CONSTRAINT valid_rating CHECK (rating >= 0 AND rating <= 10),
  CONSTRAINT valid_age CHECK (age >= 18 AND age <= 99)
);

-- Indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_clerk_id ON user_profiles(clerk_id);
```

### User Interactions Table (From /data-entry form)
```sql
CREATE TABLE user_interactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clerk_id VARCHAR(255) NOT NULL,
  
  -- Interaction data from data entry form
  interaction_date DATE NOT NULL,
  cost DECIMAL(10,2) NOT NULL CHECK (cost >= 0),
  time_minutes INTEGER NOT NULL CHECK (time_minutes >= 15 AND time_minutes <= 1440),
  nuts INTEGER NOT NULL CHECK (nuts >= 0 AND nuts <= 5),
  notes TEXT,
  
  -- Calculated fields (for performance)
  cost_per_nut DECIMAL(10,2) GENERATED ALWAYS AS (
    CASE 
      WHEN nuts > 0 THEN cost / nuts 
      ELSE cost 
    END
  ) STORED,
  
  cost_per_hour DECIMAL(10,2) GENERATED ALWAYS AS (
    cost / (time_minutes::DECIMAL / 60)
  ) STORED,
  
  nuts_per_hour DECIMAL(6,3) GENERATED ALWAYS AS (
    nuts::DECIMAL / (time_minutes::DECIMAL / 60)
  ) STORED,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_cost CHECK (cost >= 0),
  CONSTRAINT valid_time CHECK (time_minutes >= 15 AND time_minutes <= 1440),
  CONSTRAINT valid_nuts CHECK (nuts >= 0 AND nuts <= 5),
  CONSTRAINT valid_interaction_date CHECK (interaction_date <= CURRENT_DATE)
);

-- Indexes
CREATE INDEX idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX idx_user_interactions_clerk_id ON user_interactions(clerk_id);
CREATE INDEX idx_user_interactions_date ON user_interactions(interaction_date);
CREATE INDEX idx_user_interactions_created_at ON user_interactions(created_at);
```

### CPN Results Table (From /cpn-result calculations)
```sql
CREATE TABLE user_cpn_results (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clerk_id VARCHAR(255) NOT NULL,
  
  -- CPN calculation results
  total_interactions INTEGER DEFAULT 0,
  total_cost DECIMAL(12,2) DEFAULT 0,
  total_time_hours DECIMAL(8,2) DEFAULT 0,
  total_nuts INTEGER DEFAULT 0,
  
  -- Efficiency metrics
  average_cost_per_nut DECIMAL(10,2),
  average_cost_per_hour DECIMAL(10,2),
  average_nuts_per_hour DECIMAL(6,3),
  overall_efficiency_score DECIMAL(5,3),
  
  -- Time period for calculations
  calculation_period_start DATE,
  calculation_period_end DATE,
  
  -- Recommendations (JSON)
  recommendations JSONB,
  
  -- Shareable content
  shareable_graphic_url TEXT,
  
  -- Metadata
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_totals CHECK (
    total_interactions >= 0 AND 
    total_cost >= 0 AND 
    total_time_hours >= 0 AND 
    total_nuts >= 0
  )
);

-- Indexes
CREATE INDEX idx_user_cpn_results_user_id ON user_cpn_results(user_id);
CREATE INDEX idx_user_cpn_results_clerk_id ON user_cpn_results(clerk_id);
CREATE INDEX idx_user_cpn_results_calculated_at ON user_cpn_results(calculated_at);
```

### User Sessions Table (For session management)
```sql
CREATE TABLE user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clerk_id VARCHAR(255) NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  
  -- Session metadata
  ip_address INET,
  user_agent TEXT,
  device_type VARCHAR(50),
  browser VARCHAR(50),
  location_country VARCHAR(2),
  location_city VARCHAR(100),
  
  -- Session lifecycle
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  
  -- Session status
  is_active BOOLEAN DEFAULT true,
  
  CONSTRAINT valid_session_times CHECK (
    created_at <= last_active_at AND
    (ended_at IS NULL OR last_active_at <= ended_at) AND
    (expires_at IS NULL OR created_at <= expires_at)
  )
);

-- Indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_clerk_id ON user_sessions(clerk_id);
CREATE INDEX idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active) WHERE is_active = true;
CREATE INDEX idx_user_sessions_last_active ON user_sessions(last_active_at);
```

### Migration Tracking Table
```sql
CREATE TABLE data_migrations (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) NOT NULL,
  session_data_id VARCHAR(255), -- For tracking session storage migrations
  clerk_id VARCHAR(255),
  user_id INTEGER REFERENCES users(id),
  
  -- Migration details
  migration_type VARCHAR(50) NOT NULL, -- 'session_to_user', 'profile_data', etc.
  original_data JSONB, -- Store original session data for rollback
  migrated_data JSONB, -- Store migrated data structure
  
  -- Status tracking
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, rolled_back
  error_message TEXT,
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  rolled_back_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT valid_migration_status CHECK (
    status IN ('pending', 'completed', 'failed', 'rolled_back')
  )
);

-- Indexes
CREATE INDEX idx_data_migrations_clerk_id ON data_migrations(clerk_id);
CREATE INDEX idx_data_migrations_status ON data_migrations(status);
CREATE INDEX idx_data_migrations_type ON data_migrations(migration_type);
```

## TypeScript Schema Definitions (Drizzle ORM)

```typescript
// lib/db/schema.ts
import { pgTable, serial, varchar, integer, decimal, boolean, timestamp, date, text, jsonb, inet, check } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: varchar('clerk_id', { length: 255 }).unique().notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: boolean('email_verified').default(false),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  lastSignInAt: timestamp('last_sign_in_at', { withTimezone: true }),
});

// User profiles table
export const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  clerkId: varchar('clerk_id', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  age: integer('age'),
  ethnicity: varchar('ethnicity', { length: 50 }),
  rating: decimal('rating', { precision: 3, scale: 1 }),
  completedAt: timestamp('completed_at', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  validAge: check('valid_age', sql`${table.age} >= 18 AND ${table.age} <= 99`),
  validRating: check('valid_rating', sql`${table.rating} >= 0 AND ${table.rating} <= 10`),
}));

// User interactions table
export const userInteractions = pgTable('user_interactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  clerkId: varchar('clerk_id', { length: 255 }).notNull(),
  interactionDate: date('interaction_date').notNull(),
  cost: decimal('cost', { precision: 10, scale: 2 }).notNull(),
  timeMinutes: integer('time_minutes').notNull(),
  nuts: integer('nuts').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  validCost: check('valid_cost', sql`${table.cost} >= 0`),
  validTime: check('valid_time', sql`${table.timeMinutes} >= 15 AND ${table.timeMinutes} <= 1440`),
  validNuts: check('valid_nuts', sql`${table.nuts} >= 0 AND ${table.nuts} <= 5`),
}));

// CPN results table
export const userCpnResults = pgTable('user_cpn_results', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  clerkId: varchar('clerk_id', { length: 255 }).notNull(),
  totalInteractions: integer('total_interactions').default(0),
  totalCost: decimal('total_cost', { precision: 12, scale: 2 }).default('0'),
  totalTimeHours: decimal('total_time_hours', { precision: 8, scale: 2 }).default('0'),
  totalNuts: integer('total_nuts').default(0),
  averageCostPerNut: decimal('average_cost_per_nut', { precision: 10, scale: 2 }),
  averageCostPerHour: decimal('average_cost_per_hour', { precision: 10, scale: 2 }),
  averageNutsPerHour: decimal('average_nuts_per_hour', { precision: 6, scale: 3 }),
  overallEfficiencyScore: decimal('overall_efficiency_score', { precision: 5, scale: 3 }),
  calculationPeriodStart: date('calculation_period_start'),
  calculationPeriodEnd: date('calculation_period_end'),
  recommendations: jsonb('recommendations'),
  shareableGraphicUrl: text('shareable_graphic_url'),
  calculatedAt: timestamp('calculated_at', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  interactions: many(userInteractions),
  cpnResults: many(userCpnResults),
  sessions: many(userSessions),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const userInteractionsRelations = relations(userInteractions, ({ one }) => ({
  user: one(users, {
    fields: [userInteractions.userId],
    references: [users.id],
  }),
}));
```

## Migration Scripts

### Initial Migration
```sql
-- migrations/001_create_auth_tables.sql
-- Create all authentication and user data tables
-- (SQL from above schema definitions)
```

### Data Migration Utility
```typescript
// scripts/migrate-session-data.ts
import { db } from '@/lib/db';
import { users, userProfiles, userInteractions } from '@/lib/db/schema';

export async function migrateSessionToUser(
  clerkId: string, 
  email: string,
  sessionData: {
    profile?: ProfileFormData;
    dataEntry?: DataEntryData;
  }
) {
  return await db.transaction(async (tx) => {
    // Create user record
    const [user] = await tx.insert(users).values({
      clerkId,
      email,
      emailVerified: true,
    }).returning();

    // Migrate profile data
    if (sessionData.profile) {
      await tx.insert(userProfiles).values({
        userId: user.id,
        clerkId,
        firstName: sessionData.profile.firstName,
        age: sessionData.profile.age,
        ethnicity: sessionData.profile.ethnicity,
        rating: sessionData.profile.rating,
      });
    }

    // Migrate interaction data
    if (sessionData.dataEntry) {
      await tx.insert(userInteractions).values({
        userId: user.id,
        clerkId,
        interactionDate: sessionData.dataEntry.date,
        cost: sessionData.dataEntry.cost,
        timeMinutes: sessionData.dataEntry.time,
        nuts: sessionData.dataEntry.nuts,
        notes: sessionData.dataEntry.notes,
      });
    }

    return user;
  });
}
```

## Query Functions

```typescript
// lib/db/queries.ts
import { db } from './index';
import { users, userProfiles, userInteractions, userCpnResults } from './schema';
import { eq, and, desc } from 'drizzle-orm';

export async function getUserByClerkId(clerkId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);
  
  return user;
}

export async function getUserWithProfile(clerkId: string) {
  const [userWithProfile] = await db
    .select({
      user: users,
      profile: userProfiles,
    })
    .from(users)
    .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
    .where(eq(users.clerkId, clerkId))
    .limit(1);
    
  return userWithProfile;
}

export async function getUserInteractions(clerkId: string, limit = 10) {
  return await db
    .select()
    .from(userInteractions)
    .where(eq(userInteractions.clerkId, clerkId))
    .orderBy(desc(userInteractions.createdAt))
    .limit(limit);
}

export async function saveUserProfile(clerkId: string, profileData: ProfileFormData) {
  const user = await getUserByClerkId(clerkId);
  if (!user) throw new Error('User not found');

  return await db
    .insert(userProfiles)
    .values({
      userId: user.id,
      clerkId,
      ...profileData,
    })
    .onConflictDoUpdate({
      target: userProfiles.userId,
      set: {
        ...profileData,
        updatedAt: new Date(),
      },
    });
}

export async function saveUserInteraction(clerkId: string, interactionData: DataEntryData) {
  const user = await getUserByClerkId(clerkId);
  if (!user) throw new Error('User not found');

  return await db
    .insert(userInteractions)
    .values({
      userId: user.id,
      clerkId,
      interactionDate: interactionData.date,
      cost: interactionData.cost,
      timeMinutes: interactionData.time,
      nuts: interactionData.nuts,
      notes: interactionData.notes,
    })
    .returning();
}
```

## Backup and Recovery

### Backup Strategy
```bash
#!/bin/bash
# scripts/backup-user-data.sh

# Create timestamped backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="user_data_backup_${TIMESTAMP}.sql"

# Backup user-related tables
pg_dump $DATABASE_URL \
  --table=users \
  --table=user_profiles \
  --table=user_interactions \
  --table=user_cpn_results \
  --table=user_sessions \
  --no-owner \
  --no-privileges \
  > $BACKUP_FILE

echo "Backup created: $BACKUP_FILE"
```

### Recovery Procedures
```sql
-- Restore from backup if needed
\i user_data_backup_20250823_120000.sql

-- Verify data integrity after restore
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN clerk_id IS NOT NULL THEN 1 END) as users_with_clerk_id,
  MAX(created_at) as latest_user
FROM users;
```