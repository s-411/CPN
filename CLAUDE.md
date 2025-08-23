# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Setup and database commands
pnpm db:setup          # Interactive setup script to create .env file
pnpm db:migrate         # Run database migrations
pnpm db:seed           # Seed database with test user (test@test.com / admin123)
pnpm db:generate       # Generate new migration files
pnpm db:studio         # Open Drizzle Studio database GUI

# Development server
pnpm dev               # Start Next.js development server with Turbopack

# Build and deployment
pnpm build             # Build the application for production
pnpm start             # Start production server

# Stripe webhook testing (run in separate terminal)
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Architecture Overview

This is a multi-tenant SaaS application built with Next.js 15 using the App Router. The architecture follows these key patterns:

### Database Layer (PostgreSQL + Drizzle ORM)
- **Schema**: Defined in `lib/db/schema.ts` with proper relations
- **Core entities**: `users`, `teams`, `teamMembers`, `activityLogs`, `invitations`
- **Multi-tenancy**: Users belong to teams via `teamMembers` junction table
- **Soft deletes**: Users have `deletedAt` timestamp for soft deletion
- **Activity logging**: All user actions are logged to `activityLogs` table

### Authentication & Authorization
- **JWT-based sessions**: Stored in HTTP-only cookies using `jose` library
- **Password hashing**: Uses `bcryptjs` with 10 salt rounds
- **Session management**: Implemented in `lib/auth/session.ts`
- **Middleware patterns**: 
  - `validatedAction()`: Schema validation for Server Actions
  - `validatedActionWithUser()`: Authentication + validation
  - `withTeam()`: Team context required
- **Role-based access**: `owner` and `member` roles with different permissions

### Payment Integration (Stripe)
- **Subscription model**: Team-based subscriptions with 14-day trial
- **Webhook handling**: `/api/stripe/webhook` processes subscription changes
- **Customer portal**: Integrated billing management
- **Database sync**: Team subscription status kept in sync with Stripe

### Route Structure
- **Public routes**: `/` (landing), `/pricing`, `/sign-in`, `/sign-up`
- **Protected routes**: Everything under `/dashboard`
- **Route groups**: 
  - `(login)`: Authentication pages
  - `(dashboard)`: Protected dashboard pages
- **Global middleware**: `middleware.ts` handles route protection

### Server Actions Pattern
All user interactions use Server Actions defined in `app/(login)/actions.ts`:
- Input validation with Zod schemas
- Automatic activity logging for audit trail
- Consistent error handling and return patterns
- Type-safe with proper TypeScript inference

### Environment Variables Required
```env
POSTGRES_URL=postgresql://...           # Database connection
AUTH_SECRET=...                        # JWT signing secret
STRIPE_SECRET_KEY=sk_test_...          # Stripe API key
STRIPE_WEBHOOK_SECRET=whsec_...        # Stripe webhook secret
BASE_URL=http://localhost:3000         # App base URL
```

## Key Implementation Details

### Database Queries
- Use the query functions in `lib/db/queries.ts` for common operations
- Always check user authentication before database operations
- Use Drizzle's relational queries for complex joins

### Activity Logging
- Every user action should call `logActivity()` with appropriate `ActivityType`
- Activity logs are team-scoped and include IP addresses
- Defined activity types in `ActivityType` enum in schema

### Team Management
- New users automatically get their own team as `owner`
- Invitation system allows adding members to existing teams
- Team deletion cascades to remove all associated data

### Error Handling
- Server Actions return `{ error: string }` objects for validation failures
- Use consistent error messages across the application
- Handle Stripe webhook failures gracefully with proper logging