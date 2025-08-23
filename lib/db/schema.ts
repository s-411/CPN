import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  decimal,
  date,
  unique,
  index,
  jsonb,
  boolean,
  check,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: varchar('clerk_id', { length: 255 }).unique(), // New Clerk ID field
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash'), // Made optional for Clerk integration
  role: varchar('role', { length: 20 }).notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  clerkIdIdx: index('idx_users_clerk_id').on(table.clerkId),
}));

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
  trialEnd: timestamp('trial_end'), // Added trial end field
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

// CPN-specific tables for onboarding and data tracking
export const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  clerkId: varchar('clerk_id', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }),
  age: integer('age'),
  ethnicity: varchar('ethnicity', { length: 50 }),
  rating: decimal('rating', { precision: 3, scale: 1 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_user_profiles_user_id').on(table.userId),
  clerkIdIdx: index('idx_user_profiles_clerk_id').on(table.clerkId),
  userClerkUnique: unique('user_profiles_user_clerk_unique').on(table.userId, table.clerkId),
}));

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
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_user_interactions_user_id').on(table.userId),
  clerkIdIdx: index('idx_user_interactions_clerk_id').on(table.clerkId),
  dateIdx: index('idx_user_interactions_date').on(table.date),
}));

// CPN Results and Achievement Tables
export const cpnScores = pgTable('cpn_scores', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  score: integer('score')
    .notNull(),
  categoryScores: jsonb('category_scores').notNull(),
  peerPercentile: integer('peer_percentile'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_cpn_scores_user_id').on(table.userId),
  createdAtIdx: index('idx_cpn_scores_created_at').on(table.createdAt),
  scoreCheck: check('cpn_scores_score_check', sql`${table.score} >= 0 AND ${table.score} <= 100`),
  percentileCheck: check('cpn_scores_percentile_check', sql`${table.peerPercentile} IS NULL OR (${table.peerPercentile} >= 0 AND ${table.peerPercentile} <= 100)`),
}));

export const achievements = pgTable('achievements', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description').notNull(),
  iconPath: varchar('icon_path', { length: 255 }).notNull(),
  badgeColor: varchar('badge_color', { length: 7 }).notNull(),
  criteria: jsonb('criteria').notNull(),
  displayOrder: integer('display_order').notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const userAchievements = pgTable('user_achievements', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  achievementId: integer('achievement_id')
    .notNull()
    .references(() => achievements.id, { onDelete: 'cascade' }),
  earnedAt: timestamp('earned_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_user_achievements_user_id').on(table.userId),
  earnedAtIdx: index('idx_user_achievements_earned_at').on(table.earnedAt),
  userAchievementUnique: unique('user_achievements_user_achievement_unique').on(table.userId, table.achievementId),
}));

export const shareAnalytics = pgTable('share_analytics', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  platform: varchar('platform', { length: 50 }).notNull(),
  referralCode: varchar('referral_code', { length: 20 }).notNull(),
  sharedAt: timestamp('shared_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_share_analytics_user_id').on(table.userId),
  referralCodeIdx: index('idx_share_analytics_referral_code').on(table.referralCode),
}));

// Relations
export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
  profiles: many(userProfiles),
  interactions: many(userInteractions),
  cpnScores: many(cpnScores),
  userAchievements: many(userAchievements),
  shareAnalytics: many(shareAnalytics),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

// CPN-specific table relations
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

// CPN Results and Achievement Relations
export const cpnScoresRelations = relations(cpnScores, ({ one }) => ({
  user: one(users, {
    fields: [cpnScores.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [cpnScores.teamId],
    references: [teams.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [userAchievements.teamId],
    references: [teams.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}));

export const shareAnalyticsRelations = relations(shareAnalytics, ({ one }) => ({
  user: one(users, {
    fields: [shareAnalytics.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [shareAnalytics.teamId],
    references: [teams.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
export type UserInteraction = typeof userInteractions.$inferSelect;
export type NewUserInteraction = typeof userInteractions.$inferInsert;
export type CpnScore = typeof cpnScores.$inferSelect;
export type NewCpnScore = typeof cpnScores.$inferInsert;
export type Achievement = typeof achievements.$inferSelect;
export type NewAchievement = typeof achievements.$inferInsert;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type NewUserAchievement = typeof userAchievements.$inferInsert;
export type ShareAnalytic = typeof shareAnalytics.$inferSelect;
export type NewShareAnalytic = typeof shareAnalytics.$inferInsert;

export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

// CPN-specific types
export type UserWithProfile = User & {
  profiles: UserProfile[];
};

export type UserProfileWithInteractions = UserProfile & {
  interactions: UserInteraction[];
};

export type CPNUserData = {
  user: User;
  profile: UserProfile | null;
  interactions: UserInteraction[];
  totalSpent: number;
  totalNuts: number;
  averageCostPerNut: number;
};

export enum ActivityType {
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
}
