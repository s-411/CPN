# CPN Calculator

A performance tracking application for calculating and analyzing CPN (Cost Per Nut) metrics with gamification elements, achievements, and peer comparison features.

## Features

- **CPN Calculation**: Track encounters and calculate your CPN score based on multiple performance metrics
- **User Dashboard**: Personalized dashboard with performance statistics and quick actions
- **Achievement System**: Unlock achievements based on your performance milestones
- **Peer Comparison**: See how your scores compare with other users
- **Social Sharing**: Share your CPN results with custom graphics
- **Authentication**: Secure user authentication with Clerk
- **Dark Theme**: Modern dark-themed UI with CPN branding
  - Primary: CPN Yellow (#f2f661)
  - Background: CPN Dark (#1f1f1f)
  - Text: CPN White (#ffffff)
  - Muted: CPN Gray (#ABABAB)

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

## CPN Design System

### Color Implementation

The CPN application uses a consistent color system defined in multiple layers:

#### 1. Brand Colors (RGB format with opacity support)
```css
/* tailwind.config.ts */
cpn-yellow: rgb(242 246 97 / <alpha-value>)   // #f2f661
cpn-dark: rgb(31 31 31 / <alpha-value>)       // #1f1f1f
cpn-white: rgb(255 255 255 / <alpha-value>)   // #ffffff
cpn-gray: rgb(171 171 171 / <alpha-value>)    // #ABABAB
```

#### 2. Usage in Components
```jsx
// Use Tailwind classes with opacity modifiers
<div className="bg-cpn-dark text-cpn-white">
  <button className="bg-cpn-yellow hover:bg-cpn-yellow/80">
  <div className="ring-2 ring-cpn-yellow/50">
```

#### 3. CSS Variables (for semantic colors)
```css
/* globals.css */
--primary: var(--cpn-yellow);
--background: var(--cpn-dark);
--foreground: var(--cpn-white);
--muted: var(--cpn-gray);
```

### Important Notes
- Always use CPN color classes (`cpn-yellow`, `cpn-dark`, etc.) instead of hex values
- Opacity modifiers (`/50`, `/80`, etc.) are fully supported
- The RGB format with `<alpha-value>` enables Tailwind's opacity utilities
- Dark theme is the default and only theme

## Deployment

### DigitalOcean App Platform

1. **Build Command**: `npm install && npm run build`
2. **Run Command**: `npm run start`
3. **Node Version**: Ensure Node.js 18.x is selected
4. **Environment Variables**: Add all required env vars in DigitalOcean dashboard

### Important Deployment Notes

- Use the **pooled connection string** from Supabase for `POSTGRES_URL`
- Ensure Node.js version is set to **18.x** (not 19 or 20)
- The `postcss.config.js` file is required for Tailwind CSS
- CSS requires `@tailwind` directives at the top of `globals.css`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.


Push Trigger 1