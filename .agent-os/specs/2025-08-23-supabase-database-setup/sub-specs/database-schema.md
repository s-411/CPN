# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-08-23-supabase-database-setup/spec.md

## Schema Changes

### New Columns for Clerk Integration

#### Users Table Updates
```sql
-- Add Clerk ID to existing users table
ALTER TABLE users ADD COLUMN clerk_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD CONSTRAINT users_clerk_id_unique UNIQUE (clerk_id);
CREATE INDEX idx_users_clerk_id ON users(clerk_id);

-- Make clerk_id required for new users (allow NULL for migration)
-- After migration: ALTER TABLE users ALTER COLUMN clerk_id SET NOT NULL;
```

#### User Profiles Table (New for CPN specific data)
```sql
-- Create user_profiles table for CPN onboarding data
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    clerk_id VARCHAR(255) NOT NULL,
    
    -- CPN Profile Data from onboarding
    first_name VARCHAR(100),
    age INTEGER CHECK (age > 0 AND age < 120),
    ethnicity VARCHAR(50),
    rating DECIMAL(3,1) CHECK (rating >= 0 AND rating <= 10),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT user_profiles_clerk_id_fkey FOREIGN KEY (clerk_id) REFERENCES users(clerk_id),
    CONSTRAINT user_profiles_user_clerk_unique UNIQUE (user_id, clerk_id)
);

-- Indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_clerk_id ON user_profiles(clerk_id);
```

#### User Interactions Table (New for CPN data entry)
```sql
-- Create user_interactions table for CPN data entry
CREATE TABLE user_interactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    clerk_id VARCHAR(255) NOT NULL,
    profile_id INTEGER REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- CPN Data Entry Fields
    date DATE NOT NULL,
    cost DECIMAL(10,2) NOT NULL CHECK (cost >= 0),
    time_minutes INTEGER NOT NULL CHECK (time_minutes > 0),
    nuts INTEGER NOT NULL CHECK (nuts >= 0),
    notes TEXT,
    
    -- Calculated Fields
    cost_per_nut DECIMAL(10,2) GENERATED ALWAYS AS (
        CASE WHEN nuts > 0 THEN cost / nuts ELSE NULL END
    ) STORED,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT user_interactions_clerk_id_fkey FOREIGN KEY (clerk_id) REFERENCES users(clerk_id)
);

-- Indexes
CREATE INDEX idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX idx_user_interactions_clerk_id ON user_interactions(clerk_id);
CREATE INDEX idx_user_interactions_date ON user_interactions(date DESC);
```

### Row Level Security Policies

#### Users Table RLS
```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own record
CREATE POLICY "Users can view own record" ON users
    FOR SELECT USING (clerk_id = auth.jwt() ->> 'sub');

-- Policy: Users can update their own record
CREATE POLICY "Users can update own record" ON users
    FOR UPDATE USING (clerk_id = auth.jwt() ->> 'sub');

-- Policy: System can create new users (for registration)
CREATE POLICY "System can create users" ON users
    FOR INSERT WITH CHECK (true);
```

#### Teams Table RLS (Existing - Enhanced)
```sql
-- Enable RLS on teams table
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see teams they belong to
CREATE POLICY "Users can view their teams" ON teams
    FOR SELECT USING (
        id IN (
            SELECT tm.team_id 
            FROM team_members tm 
            JOIN users u ON tm.user_id = u.id 
            WHERE u.clerk_id = auth.jwt() ->> 'sub'
        )
    );
```

#### User Profiles Table RLS
```sql
-- Enable RLS on user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own profiles
CREATE POLICY "Users can manage own profiles" ON user_profiles
    FOR ALL USING (clerk_id = auth.jwt() ->> 'sub');
```

#### User Interactions Table RLS
```sql
-- Enable RLS on user_interactions table  
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own interactions
CREATE POLICY "Users can manage own interactions" ON user_interactions
    FOR ALL USING (clerk_id = auth.jwt() ->> 'sub');
```

## Drizzle ORM Schema Updates

### Updated Schema Definitions
```typescript
// lib/db/schema.ts updates

import { pgTable, serial, varchar, text, timestamp, integer, decimal, date, boolean, check, unique, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enhanced users table with Clerk integration
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: varchar('clerk_id', { length: 255 }).unique(), // New Clerk ID field
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'), // Soft delete
}, (table) => ({
  clerkIdIdx: index('idx_users_clerk_id').on(table.clerkId),
}));

// New user_profiles table for CPN data
export const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  clerkId: varchar('clerk_id', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }),
  age: integer('age'),
  ethnicity: varchar('ethnicity', { length: 50 }),
  rating: decimal('rating', { precision: 3, scale: 1 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_user_profiles_user_id').on(table.userId),
  clerkIdIdx: index('idx_user_profiles_clerk_id').on(table.clerkId),
  userClerkUnique: unique('user_profiles_user_clerk_unique').on(table.userId, table.clerkId),
  ageCheck: check('user_profiles_age_check', sql`age > 0 AND age < 120`),
  ratingCheck: check('user_profiles_rating_check', sql`rating >= 0 AND rating <= 10`),
}));

// New user_interactions table for CPN data entry
export const userInteractions = pgTable('user_interactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  clerkId: varchar('clerk_id', { length: 255 }).notNull(),
  profileId: integer('profile_id').references(() => userProfiles.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  cost: decimal('cost', { precision: 10, scale: 2 }).notNull(),
  timeMinutes: integer('time_minutes').notNull(),
  nuts: integer('nuts').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_user_interactions_user_id').on(table.userId),
  clerkIdIdx: index('idx_user_interactions_clerk_id').on(table.clerkId),
  dateIdx: index('idx_user_interactions_date').on(table.date),
  costCheck: check('user_interactions_cost_check', sql`cost >= 0`),
  timeCheck: check('user_interactions_time_check', sql`time_minutes > 0`),
  nutsCheck: check('user_interactions_nuts_check', sql`nuts >= 0`),
}));

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profiles: many(userProfiles),
  interactions: many(userInteractions),
  // Existing relations...
  teamMembers: many(teamMembers),
}));

export const userProfilesRelations = relations(userProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
  interactions: many(userInteractions),
}));

export const userInteractionsRelations = relations(userInteractions, ({ one }) => ({
  user: one(users, {
    fields: [userInteractions.userId],
    references: [users.id],
  }),
  profile: one(userProfiles, {
    fields: [userInteractions.profileId],
    references: [userProfiles.id],
  }),
}));
```

## Migration Strategy

### Phase 1: Schema Setup
1. Create new Supabase project
2. Run initial migration to create base tables
3. Add Clerk ID columns to existing tables
4. Create new CPN-specific tables (user_profiles, user_interactions)

### Phase 2: RLS Configuration
1. Enable RLS on all user data tables
2. Create and test security policies
3. Verify data isolation between users/teams

### Phase 3: Application Integration
1. Update environment variables and connection strings
2. Test all existing database operations
3. Verify Drizzle ORM integration works correctly

## Rationale

### Clerk ID Integration
- **Purpose**: Link Supabase user records with Clerk authentication
- **Implementation**: Separate clerk_id field maintains existing user.id relationships
- **Flexibility**: Allows gradual migration from JWT to Clerk authentication

### CPN-Specific Tables
- **User Profiles**: Store onboarding data from /add-girl flow
- **User Interactions**: Store data entry from /data-entry flow  
- **Separation**: Keeps CPN business logic separate from core user management

### Row Level Security
- **Multi-tenancy**: Enforces team-based data isolation
- **Security**: Prevents unauthorized access to user data
- **Performance**: Database-level filtering reduces application logic overhead

### Performance Optimizations
- **Indexing**: Efficient lookups on clerk_id and user relationships
- **Constraints**: Database-level validation for data integrity
- **Generated Columns**: Automatic cost_per_nut calculation for reporting