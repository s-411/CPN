# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-08-23-add-girl-profile-page/spec.md

## Schema Changes

### New Table: profiles

This table will store user profile data after account creation. During onboarding, data is stored in session storage only.

```sql
CREATE TABLE profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(50) NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 99),
  ethnicity VARCHAR(50), -- Optional field
  rating DECIMAL(2,1) NOT NULL CHECK (rating >= 5.0 AND rating <= 10.0 AND rating % 0.5 = 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete support
  
  -- Indexes for performance
  CONSTRAINT unique_active_profile_per_user UNIQUE (user_id) WHERE deleted_at IS NULL
);

-- Indexes
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_active ON profiles(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_profiles_created_at ON profiles(created_at);
```

### Migration Script

```typescript
// Drizzle migration file
import { pgTable, serial, integer, varchar, decimal, timestamp, index, foreignKey, unique } from 'drizzle-orm/pg-core';
import { users } from './schema';

export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  firstName: varchar('first_name', { length: 50 }).notNull(),
  age: integer('age').notNull(),
  ethnicity: varchar('ethnicity', { length: 50 }), // Optional
  rating: decimal('rating', { precision: 2, scale: 1 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }), // Soft delete
}, (table) => ({
  userIdIdx: index('idx_profiles_user_id').on(table.userId),
  activeIdx: index('idx_profiles_active').on(table.userId).where(isNull(table.deletedAt)),
  createdAtIdx: index('idx_profiles_created_at').on(table.createdAt),
  uniqueActiveProfile: unique('unique_active_profile_per_user').on(table.userId).where(isNull(table.deletedAt)),
}));
```

## Data Validation Rules

### Field Constraints
- **first_name**: Required, 2-50 characters, trimmed whitespace
- **age**: Required, integer between 18-99 inclusive
- **ethnicity**: Optional, predefined values from dropdown list, max 50 characters
- **rating**: Required, decimal with 0.5 increments from 5.0-10.0 inclusive
- **user_id**: Required foreign key, cascading delete when user is deleted

### Business Rules
- Each user can have only one active profile (enforced by unique constraint)
- Soft delete support maintains data integrity for historical records
- Rating precision limited to single decimal place with 0.5 increments
- Age validation ensures legal age compliance

## Rationale

### Single Profile Limitation (Phase 1)
During MVP/onboarding phase, users can only create one profile. This simplifies the UX and focuses on conversion. Multi-profile support will be added in Phase 2 for premium users.

### Soft Delete Strategy
Profiles use soft deletion to maintain referential integrity with future features like activity logs, statistics, and analytics. Hard deletion would break historical data relationships.

### Ethnicity as Optional
Following privacy-first principles, ethnicity is optional to respect user privacy preferences. The field supports the demographic analysis features planned for later phases.

### Rating Precision
Using DECIMAL(2,1) ensures exact storage of ratings without floating-point precision issues. CHECK constraint enforces valid rating values and 0.5 increment rule.

### Performance Considerations
Indexes are optimized for common query patterns:
- User profile lookup (user_id)
- Active profile filtering (excluding soft-deleted)
- Time-based queries for analytics

### Data Integrity
Foreign key constraints ensure profile orphaning is impossible. Cascading delete removes profiles when users are deleted, maintaining database consistency.

## Implementation Timeline

### Phase 1 (Current)
- Session storage only for onboarding flow
- No permanent database storage until account creation

### Phase 2 (Post-MVP)
- Implement profiles table with single profile per user
- Migration script for existing session data
- Add profile management UI

### Phase 3 (Premium Features)
- Extend to support multiple profiles per premium user
- Modify unique constraint to allow multiple active profiles
- Add profile_limit based on user subscription tier