# CPN Calculator

A performance tracking application for calculating and analyzing CPN (Cost Per Nut) metrics with gamification elements, achievements, and peer comparison features.

## Features

- **CPN Calculation**: Track encounters and calculate your CPN score based on multiple performance metrics
- **User Dashboard**: Personalized dashboard with performance statistics and quick actions
- **Achievement System**: Unlock achievements based on your performance milestones
- **Peer Comparison**: See how your scores compare with other users
- **Social Sharing**: Share your CPN results with custom graphics
- **Authentication**: Dual authentication system (Clerk + Custom JWT)
- **Dark Theme**: Modern dark-themed UI with CPN branding (yellow/dark/white color scheme)

## Tech Stack

- **Framework**: [Next.js 15.3.0](https://nextjs.org/) with App Router
- **Runtime**: Node.js 18.x (npm 10.8.2)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with Supabase
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) v0.30.10
- **Authentication**: Dual system - [Clerk](https://clerk.com/) + Custom JWT (jose)
- **Payments**: [Stripe](https://stripe.com/) v16.8.0
- **UI Components**: [Radix UI](https://www.radix-ui.com/) primitives + shadcn/ui foundation
- **Styling**: Tailwind CSS 3.4.13 with custom CPN design system
- **Type Safety**: TypeScript 5.6.2 with Zod validation
- **Animations**: Framer Motion v11.0.8

## User Flow

1. **Onboarding**: Start at `/add-girl` (public)
2. **Data Entry**: Complete encounter details at `/data-entry` (public)
3. **Sign Up**: Create account at `/sign-up`
4. **Results**: View CPN score and analytics at `/cpn-results` (protected)
5. **Dashboard**: Access personalized dashboard at `/dashboard` (protected)

## Getting Started

### Prerequisites

- Node.js 18.x (exactly - not 19 or 20)
- npm 10.8.2 (comes with Node.js 18)
- PostgreSQL database (Supabase recommended)
- Clerk account for authentication (optional if using custom auth)
- Stripe account (optional, for payments)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cpn.git
cd cpn
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Update `.env.local` with your credentials:
```env
# Database (use pooled connection from Supabase)
POSTGRES_URL=postgresql://postgres.[project-ref]:[password]@aws-1-[region].pooler.supabase.com:6543/postgres

# Authentication (Custom JWT)
AUTH_SECRET=your_jwt_secret_key  # Generate with: openssl rand -base64 32

# Clerk Authentication (optional - if using Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/cpn-results
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/cpn-results

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
BASE_URL=http://localhost:3000
```

4. Set up the database:
```bash
npm run db:migrate
npm run db:seed  # Optional: adds test user (test@test.com / admin123)
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Development Commands

```bash
# Development
npm run dev           # Start development server

# Database
npm run db:setup      # Interactive setup script to create .env file
npm run db:migrate    # Run database migrations
npm run db:seed       # Seed database with test user (test@test.com / admin123)
npm run db:generate   # Generate new migration files
npm run db:studio     # Open Drizzle Studio GUI

# Testing
npm test              # Run tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Build & Production
npm run build         # Build for production
npm run start         # Start production server

# Stripe webhook testing (run in separate terminal)
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Project Structure

```
/app
  /(dashboard)        # Protected dashboard routes
    /dashboard       # Main dashboard
    /cpn-results     # CPN results display
  /(login)           # Authentication routes
    /sign-in        # Sign in page
    /sign-up        # Sign up page
    actions.ts      # Server actions for auth
  /add-girl         # Onboarding step 1 (public)
  /data-entry       # Onboarding step 2 (public)
  /api              # API routes
    /cpn            # CPN-related endpoints
    /stripe         # Stripe webhook endpoints
    /user           # User endpoints

/components
  /cpn              # CPN-specific components
  /dashboard        # Dashboard section components
  /forms            # Form components
  /ui               # Base UI components (Radix UI)
  /user-sync        # User sync components

/lib
  /auth             # Authentication utilities (JWT sessions)
  /db               # Database schema and queries (Drizzle)
  /payments         # Stripe integration
```

## Deployment

### DigitalOcean App Platform

1. **Build Command**: `npm install && npm run build`
2. **Run Command**: `npm run start`
3. **Node Version**: Ensure Node.js 18.x is selected
4. **Environment Variables**: Add all required env vars in DigitalOcean dashboard

### Important Notes

- Use the **pooled connection string** from Supabase for `POSTGRES_URL`
- Ensure Node.js version is set to **18.x** (not 19 or 20)
- All packages use specific versions to avoid compatibility issues

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.


