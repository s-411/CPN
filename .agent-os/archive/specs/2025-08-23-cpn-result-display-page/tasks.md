# Spec Tasks

## Tasks

- [ ] 1. Database Schema Implementation and Migrations
  - [ ] 1.1 Write tests for CPN scores database operations
  - [ ] 1.2 Create Drizzle schema definitions for cpn_scores, achievements, user_achievements, and share_analytics tables
  - [ ] 1.3 Generate and run database migrations
  - [ ] 1.4 Create database query functions in lib/db/queries.ts for CPN operations
  - [ ] 1.5 Seed initial achievement data
  - [ ] 1.6 Verify all database tests pass

- [ ] 2. API Routes and Server Actions
  - [ ] 2.1 Write tests for CPN results API endpoints and server actions
  - [ ] 2.2 Implement GET /api/cpn/results/[userId] endpoint
  - [ ] 2.3 Implement POST /api/cpn/share endpoint for tracking shares
  - [ ] 2.4 Implement GET /api/achievements/available endpoint
  - [ ] 2.5 Create generateShareGraphic server action with Canvas API
  - [ ] 2.6 Create unlockAchievement server action
  - [ ] 2.7 Verify all API tests pass

- [ ] 3. CPN Results Display Component
  - [ ] 3.1 Write tests for CPN results display component
  - [ ] 3.2 Create responsive CPN score display with animated reveal
  - [ ] 3.3 Implement category scores breakdown visualization
  - [ ] 3.4 Add peer comparison and percentile display
  - [ ] 3.5 Integrate with user authentication and data fetching
  - [ ] 3.6 Optimize for mobile-first design with proper touch targets
  - [ ] 3.7 Verify all component tests pass

- [ ] 4. Achievement Badge System
  - [ ] 4.1 Write tests for achievement badge components and logic
  - [ ] 4.2 Create achievement badge display component with animations
  - [ ] 4.3 Implement achievement unlock detection and notification system
  - [ ] 4.4 Add achievement progress indicators and criteria explanations
  - [ ] 4.5 Integrate with framer-motion for smooth animations
  - [ ] 4.6 Verify all achievement system tests pass

- [ ] 5. Social Sharing Engine
  - [ ] 5.1 Write tests for sharing functionality and graphic generation
  - [ ] 5.2 Implement Canvas API graphic generation for multiple formats (9:16, 1:1)
  - [ ] 5.3 Add Web Share API integration with fallbacks
  - [ ] 5.4 Create referral code generation and embedding system
  - [ ] 5.5 Implement share analytics tracking
  - [ ] 5.6 Optimize graphics generation performance and caching
  - [ ] 5.7 Verify all sharing tests pass