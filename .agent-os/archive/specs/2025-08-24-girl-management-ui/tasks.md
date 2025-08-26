# Spec Tasks

## Tasks

- [ ] 1. Database Schema & Migration Implementation
  - [ ] 1.1 Write tests for girls table schema and constraints
  - [ ] 1.2 Create database migration script for girls table with proper foreign keys and indexes
  - [ ] 1.3 Update lib/db/schema.ts with girls table definition and relations
  - [ ] 1.4 Add new ActivityType enum values for girl management operations
  - [ ] 1.5 Create database query functions in lib/db/queries.ts for CRUD operations
  - [ ] 1.6 Implement proper multi-tenant data isolation and team-scoped queries
  - [ ] 1.7 Add Zod validation schemas for girl data in lib/validations/girl.ts
  - [ ] 1.8 Verify all database tests pass and constraints work correctly

- [ ] 2. Navigation System Updates (Profiles → Girls)
  - [ ] 2.1 Write tests for navigation component updates and active state detection
  - [ ] 2.2 Update sidebar navigation to replace "Profiles" with "Girls" menu item
  - [ ] 2.3 Change navigation icon to Users from lucide-react with proper styling
  - [ ] 2.4 Implement active state highlighting with cpn-yellow color when on /girls route
  - [ ] 2.5 Update any premium messaging or help text to reflect new terminology
  - [ ] 2.6 Ensure responsive navigation behavior on mobile devices
  - [ ] 2.7 Test navigation accessibility and keyboard support
  - [ ] 2.8 Verify all navigation tests pass and routing works correctly

- [ ] 3. Girl Management Page & Core Components
  - [ ] 3.1 Write tests for girl management page component and empty state
  - [ ] 3.2 Create app/(dashboard)/girls/page.tsx server component with data fetching
  - [ ] 3.3 Implement app/(dashboard)/girls/page-client.tsx with state management
  - [ ] 3.4 Build GirlCard component with proper styling and action buttons
  - [ ] 3.5 Create responsive card grid layout with mobile-first breakpoints
  - [ ] 3.6 Implement empty state component with encouraging message and CTA
  - [ ] 3.7 Add proper loading states and error boundaries for data operations
  - [ ] 3.8 Verify all page component tests pass and UI renders correctly

- [ ] 4. Create Girl Modal & Form Implementation
  - [ ] 4.1 Write tests for create girl modal component and form validation
  - [ ] 4.2 Build CreateGirlModal component with proper modal styling and backdrop
  - [ ] 4.3 Implement form with fields for name, age, nationality, and rating
  - [ ] 4.4 Add form validation with Zod schema and error message display
  - [ ] 4.5 Create server actions for girl CRUD operations with proper error handling
  - [ ] 4.6 Implement optimistic updates for immediate UI feedback
  - [ ] 4.7 Add activity logging integration for all girl management operations
  - [ ] 4.8 Verify all modal and form tests pass with proper validation

- [ ] 5. Integration Testing & Polish
  - [ ] 5.1 Write comprehensive integration tests for complete girl management workflow
  - [ ] 5.2 Test edit and delete functionality with confirmation dialogs
  - [ ] 5.3 Implement proper accessibility features (ARIA labels, focus management)
  - [ ] 5.4 Add performance optimizations (React.memo, proper key props)
  - [ ] 5.5 Test responsive design across all device breakpoints
  - [ ] 5.6 Verify integration with existing authentication and team systems
  - [ ] 5.7 Test error scenarios and edge cases (network failures, validation errors)
  - [ ] 5.8 Verify all tests pass and feature is production-ready