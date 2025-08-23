# CPN Calculator

A performance tracking application for calculating and analyzing CPN (Cost Per Nut) metrics with gamification elements, achievements, and peer comparison features.

## Features

- **CPN Calculation**: Track encounters and calculate your CPN score based on multiple performance metrics
- **User Dashboard**: Personalized dashboard with performance statistics and quick actions
- **Achievement System**: Unlock achievements based on your performance milestones
- **Peer Comparison**: See how your scores compare with other users
- **Social Sharing**: Share your CPN results with custom graphics
- **Authentication**: Secure user authentication with Clerk
- **Dark Theme**: Modern dark-themed UI with CPN branding (yellow/dark/white color scheme)

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Database**: [PostgreSQL](https://www.postgresql.org/) with Supabase
- **ORM**: [Drizzle](https://orm.drizzle.team/)
- **Authentication**: [Clerk](https://clerk.com/)
- **Payments**: [Stripe](https://stripe.com/) (optional)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/)
- **Styling**: Tailwind CSS with custom CPN design system
- **Animations**: Framer Motion

## User Flow

1. **Onboarding**: Start at `/add-girl` (public)
2. **Data Entry**: Complete encounter details at `/data-entry` (public)
3. **Sign Up**: Create account at `/sign-up`
4. **Results**: View CPN score and analytics at `/cpn-results` (protected)
5. **Dashboard**: Access personalized dashboard at `/dashboard` (protected)

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database (Supabase recommended)
- Clerk account for authentication
- Stripe account (optional, for payments)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cpn.git
cd cpn
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Update `.env.local` with your credentials:
```env
# Database
POSTGRES_URL=your_supabase_connection_string

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/cpn-results
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/cpn-results

# Stripe (optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# App
BASE_URL=http://localhost:3000
```

4. Set up the database:
```bash
pnpm db:migrate
pnpm db:seed  # Optional: adds test data
```

5. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Development Commands

```bash
# Development
pnpm dev               # Start development server with Turbopack

# Database
pnpm db:migrate        # Run database migrations
pnpm db:seed          # Seed database with test data
pnpm db:generate      # Generate new migration files
pnpm db:studio        # Open Drizzle Studio GUI

# Build & Production
pnpm build            # Build for production
pnpm start            # Start production server

# Type checking & Linting
pnpm typecheck        # Run TypeScript type checking
pnpm lint            # Run ESLint
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
  /add-girl         # Onboarding step 1 (public)
  /data-entry       # Onboarding step 2 (public)
  /api              # API routes
    /cpn            # CPN-related endpoints
    /user           # User endpoints

/components
  /cpn              # CPN-specific components
  /ui               # Shared UI components

/lib
  /db               # Database schema and queries
  /auth             # Authentication utilities
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.