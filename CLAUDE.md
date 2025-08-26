# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

- **Framework**: Next.js 15.3.0 with App Router
- **Package Manager**: npm 10.8.2 (Node.js 18.x required)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Dual system - Clerk + Custom JWT
- **UI Components**: Radix UI primitives + shadcn/ui foundation
- **Styling**: Tailwind CSS 3.4.13 with custom CPN design system
- **Payments**: Stripe 16.8.0
- **Type Safety**: TypeScript 5.6.2 with Zod validation

## Development Commands

```bash
# Setup and database commands
npm run db:setup       # Interactive setup script to create .env file
npm run db:migrate     # Run database migrations
npm run db:seed        # Seed database with test user (test@test.com / admin123)
npm run db:generate    # Generate new migration files
npm run db:studio      # Open Drizzle Studio database GUI

# Development server
npm run dev            # Start Next.js development server

# Build and deployment
npm run build          # Build the application for production
npm run start          # Start production server

# Testing
npm test               # Run tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage

# Stripe webhook testing (run in separate terminal)
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Architecture Overview

This is a CPN (Cost Per Nut) calculator application with gamification, achievements, and social features. Built as a multi-tenant SaaS application with Next.js 15 using the App Router.

### Database Layer (PostgreSQL + Drizzle ORM)
- **Schema**: Defined in `lib/db/schema.ts` with proper relations
- **Core entities**: `users`, `teams`, `teamMembers`, `activityLogs`, `invitations`
- **Multi-tenancy**: Users belong to teams via `teamMembers` junction table
- **Soft deletes**: Users have `deletedAt` timestamp for soft deletion
- **Activity logging**: All user actions are logged to `activityLogs` table

### Authentication & Authorization
- **Dual Authentication System**:
  - **Clerk Integration**: `@clerk/nextjs` for managed authentication
  - **Custom JWT**: Self-hosted auth with `jose` library (v6.0.13)
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
# Database (Supabase recommended - use pooled connection)
POSTGRES_URL=postgresql://postgres.[project-ref]:[password]@aws-1-[region].pooler.supabase.com:6543/postgres

# Authentication
AUTH_SECRET=...                        # JWT signing secret (generate with openssl rand -base64 32)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...  # Clerk public key (if using Clerk)
CLERK_SECRET_KEY=...                   # Clerk secret key (if using Clerk)

# Payments
STRIPE_SECRET_KEY=sk_test_...          # Stripe API key
STRIPE_WEBHOOK_SECRET=whsec_...        # Stripe webhook secret

# Application
BASE_URL=http://localhost:3000         # App base URL (update for production)
```

## CPN Design System & Color Implementation

### Color System Architecture

The CPN application uses a three-layer color system:

#### 1. Tailwind Configuration (tailwind.config.ts)
```typescript
// Brand colors with opacity support (RGB format)
'cpn-yellow': 'rgb(242 246 97 / <alpha-value>)',   // #f2f661
'cpn-dark': 'rgb(31 31 31 / <alpha-value>)',       // #1f1f1f
'cpn-white': 'rgb(255 255 255 / <alpha-value>)',   // #ffffff
'cpn-gray': 'rgb(171 171 171 / <alpha-value>)',    // #ABABAB
```

#### 2. CSS Variables (globals.css)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --cpn-yellow: #f2f661;
    --cpn-dark: #1f1f1f;
    --cpn-white: #ffffff;
    --cpn-gray: #ABABAB;
    
    /* Semantic mappings */
    --primary: var(--cpn-yellow);
    --background: var(--cpn-dark);
    --foreground: var(--cpn-white);
    --muted: var(--cpn-gray);
  }
}
```

#### 3. Component Usage
```jsx
// CORRECT: Use Tailwind classes with CPN colors
<div className="bg-cpn-dark text-cpn-white">
  <button className="bg-cpn-yellow hover:bg-cpn-yellow/80">
  <div className="ring-2 ring-cpn-yellow/50 border-cpn-gray/30">

// WRONG: Don't use hex values directly
<div className="bg-[#1f1f1f]">  // ❌ Don't do this
```

### Important Color Guidelines

1. **Always use CPN color classes** (`cpn-yellow`, `cpn-dark`, `cpn-white`, `cpn-gray`)
2. **Opacity modifiers are supported** (`/10`, `/20`, `/30`, `/50`, `/80`, `/90`)
3. **RGB format with `<alpha-value>`** enables Tailwind's opacity utilities
4. **Dark theme is default** - no light theme support needed
5. **CSS variables** are available for semantic colors (primary, background, etc.)

### Common Color Patterns

```jsx
// Backgrounds
bg-cpn-dark              // Main background
bg-cpn-yellow/10         // Subtle yellow highlight

// Text
text-cpn-white           // Primary text
text-cpn-gray            // Muted text
text-cpn-yellow          // Accent text

// Borders
border-cpn-gray/30       // Subtle borders
border-cpn-yellow        // Accent borders

// Interactive States
hover:bg-cpn-yellow/80   // Button hover
focus:ring-cpn-yellow/50 // Focus rings
```

### Typography System

The CPN application uses two custom brand fonts:

#### Font Face Declarations
```css
@font-face {
  font-family: 'National2Condensed';
  src: url('/fonts/National-2-Condensed-Bold.ttf') format('truetype');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'ESKlarheit';
  src: url('/fonts/ESKlarheitGrotesk-Rg.otf') format('opentype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

#### Tailwind Font Families
```typescript
fontFamily: {
  'heading': ['National2Condensed', 'Arial Black', 'sans-serif'],
  'body': ['ESKlarheit', 'Inter', 'system-ui', 'sans-serif'],
  sans: ['ESKlarheit', 'Inter', 'system-ui', 'sans-serif'],
}
```

#### Usage in Components
```jsx
// Headings - National2Condensed (bold, condensed)
<h1 className="font-heading text-2xl">CPN Calculator</h1>

// Body text - ESKlarheit (regular weight)
<p className="font-body text-base">Your dating analytics dashboard</p>
<div className="font-sans">Default text uses ESKlarheit</div>
```

## CSS & Component Style Guidelines

### Multi-line Tailwind CSS Formatting

We use a unique multi-line formatting style for Tailwind CSS classes in HTML markup and JSX components:

- Each responsive size gets its own dedicated line
- Start with smallest size (no responsive prefix) on top
- Each line below represents the next responsive size up
- All lines are vertically aligned
- `hover:` and `focus:` classes get their own dedicated lines
- Custom CSS classes (if any) go at the start of the first line
- We implement an additional `xs` breakpoint at 400px

**Example of multi-line Tailwind CSS classes:**

```jsx
<div className="custom-cta bg-gray-50 dark:bg-gray-900 p-4 rounded cursor-pointer w-full
                hover:bg-gray-100 dark:hover:bg-gray-800
                xs:p-6
                sm:p-8 sm:font-medium
                md:p-10 md:text-lg
                lg:p-12 lg:text-xl lg:font-semibold lg:w-3/5
                xl:p-14 xl:text-2xl
                2xl:p-16 2xl:text-3xl 2xl:font-bold 2xl:w-3/4">
  I'm a call-to-action!
</div>
```

### Development Best Practices

#### Core Principles
- **Keep It Simple**: Implement code in the fewest lines possible, avoid over-engineering
- **Optimize for Readability**: Prioritize code clarity over micro-optimizations
- **DRY (Don't Repeat Yourself)**: Extract repeated logic to methods/components
- **File Structure**: Keep files focused on single responsibility with consistent naming

#### Component Guidelines
- Write self-documenting code with clear variable names
- Add comments for "why" not "what"
- Extract repeated UI markup to reusable components
- Create utility functions for common operations
- Group related functionality together

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