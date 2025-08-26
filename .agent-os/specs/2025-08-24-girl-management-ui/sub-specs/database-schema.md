# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-08-24-girl-management-ui/spec.md

## Database Changes

### New Table: `girls`

A new `girls` table will be added to store individual girl records with proper multi-tenant architecture integration. This table will:

- Store core girl information (name, age, nationality, rating, status)
- Link to existing user and team structures for proper isolation
- Support soft deletes for data preservation
- Include proper indexing for performance
- Enforce data integrity constraints

### Migration Requirements

- Add new `girls` table with proper foreign key constraints
- Create indexes for performance optimization
- Add database constraints for data validation
- Update existing relations in schema.ts

## Schema Implementation

```typescript
// Add to lib/db/schema.ts

export const girls = pgTable('girls', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  age: integer('age').notNull(),
  nationality: varchar('nationality', { length: 100 }).notNull(),
  rating: integer('rating').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'), // Soft delete support
}, (table) => ({
  // Performance indexes
  userIdIdx: index('idx_girls_user_id').on(table.userId),
  teamIdIdx: index('idx_girls_team_id').on(table.teamId),
  statusIdx: index('idx_girls_status').on(table.status),
  createdAtIdx: index('idx_girls_created_at').on(table.createdAt),
  
  // Data integrity constraints
  ratingCheck: check('girls_rating_check', sql`${table.rating} >= 1 AND ${table.rating} <= 10`),
  ageCheck: check('girls_age_check', sql`${table.age} >= 18 AND ${table.age} <= 120`),
  statusCheck: check('girls_status_check', sql`${table.status} IN ('active', 'inactive', 'archived')`),
  
  // Composite index for multi-tenant queries
  userTeamIdx: index('idx_girls_user_team').on(table.userId, table.teamId),
}));

// Relations - Add to existing relations section
export const girlsRelations = relations(girls, ({ one }) => ({
  user: one(users, {
    fields: [girls.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [girls.teamId],
    references: [teams.id],
  }),
}));

// Update existing relations to include girls
export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
  profiles: many(userProfiles),
  interactions: many(userInteractions),
  cpnScores: many(cpnScores),
  userAchievements: many(userAchievements),
  shareAnalytics: many(shareAnalytics),
  girls: many(girls), // Add this line
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
  girls: many(girls), // Add this line
}));

// Type exports - Add to existing type exports section
export type Girl = typeof girls.$inferSelect;
export type NewGirl = typeof girls.$inferInsert;

// Extended types for UI components
export type GirlWithDetails = Girl & {
  user: Pick<User, 'id' | 'name' | 'email'>;
  team: Pick<Team, 'id' | 'name'>;
};
```

### Activity Log Integration

Update the `ActivityType` enum to include girl management activities:

```typescript
export enum ActivityType {
  // ... existing activities
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
  
  // New girl management activities
  CREATE_GIRL = 'CREATE_GIRL',
  UPDATE_GIRL = 'UPDATE_GIRL',
  DELETE_GIRL = 'DELETE_GIRL',
  ARCHIVE_GIRL = 'ARCHIVE_GIRL',
}
```

## Rationale

### Multi-Tenant Architecture
- **userId and teamId references**: Ensures proper data isolation between teams while maintaining user ownership
- **Cascade deletes**: When users or teams are deleted, their girls are automatically removed
- **Composite indexing**: Optimizes queries that filter by both user and team (common access pattern)

### Data Integrity
- **Rating constraint**: Enforces 1-10 rating scale at database level
- **Age constraint**: Ensures realistic age ranges (18-120)
- **Status constraint**: Limits status values to predefined options
- **Required fields**: Name, age, nationality, and rating are mandatory

### Performance Considerations
- **Individual indexes**: Separate indexes on frequently queried fields (userId, teamId, status, createdAt)
- **Composite index**: user_team index optimizes the most common query pattern
- **Soft deletes**: deletedAt timestamp allows data recovery while hiding deleted records

### Scalability
- **Serial primary key**: Auto-incrementing integer for efficient joins
- **Proper normalization**: References to existing user/team tables avoid data duplication
- **Index strategy**: Balances query performance with write overhead

### Integration with Existing System
- **Consistent patterns**: Follows same conventions as other tables (timestamps, soft deletes, foreign keys)
- **Activity logging**: New activity types integrate with existing audit trail system
- **Type safety**: Drizzle ORM inference provides full TypeScript support
- **Relations**: Proper bidirectional relationships with users and teams tables

### Business Logic Support
- **Status field**: Supports workflow states (active, inactive, archived)
- **Audit trail**: createdAt/updatedAt timestamps for data tracking
- **Soft deletes**: Preserves data for compliance and recovery scenarios
- **Team isolation**: Ensures girls are only visible within appropriate team context