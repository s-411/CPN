# Clerk Magic Link Authentication Integration Specification

## Overview and Goals

This specification outlines the implementation of Clerk authentication with Magic Link functionality in the CPN (Cost Per Nut) application. The integration will replace the current custom JWT-based authentication system while preserving the existing onboarding flow and design system.

### Primary Goals

1. **Replace Custom Auth**: Migrate from the current custom JWT/bcrypt authentication to Clerk
2. **Magic Link Implementation**: Enable passwordless authentication via email magic links
3. **Preserve Onboarding Flow**: Maintain the existing `/add-girl` → `/data-entry` → `/cpn-result` flow
4. **Design System Consistency**: Keep the CPN brand design system (dark theme with yellow accents)
5. **PWA Compatibility**: Ensure authentication works seamlessly with the existing PWA functionality
6. **Mobile-First Experience**: Maintain the responsive, mobile-optimized user experience

### Success Criteria

- Users can sign up and sign in using magic links sent to their email
- Existing onboarding flow continues to work without user authentication interruption
- All protected dashboard routes are properly secured
- CPN design system is preserved throughout the authentication flow
- PWA functionality remains intact
- Existing database schema can be migrated or deprecated gracefully

## Technical Architecture

### Environment Configuration

#### Required Environment Variables
```bash
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_dHJ1c3RpbmctY2FpbWFuLTQ1LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_57oFP7kJ3dmZW0vdN9r8sZpTr6emWXixUtl5SDkcp4

# Existing Variables (to be phased out)
AUTH_SECRET=... # Can be removed after migration
POSTGRES_URL=... # Still needed for user data
STRIPE_SECRET_KEY=... # Still needed for payments
STRIPE_WEBHOOK_SECRET=... # Still needed for payments
BASE_URL=... # Still needed for redirects
```

### Package Dependencies

#### New Dependencies to Add
```json
{
  "dependencies": {
    "@clerk/nextjs": "^5.0.0"
  }
}
```

#### Dependencies to Remove (Post-Migration)
```json
{
  "dependencies": {
    "bcryptjs": "^3.0.2",
    "jose": "^6.0.11"
  }
}
```

### Core Architecture Changes

#### 1. App Router Integration

**File: `app/layout.tsx`**
- Wrap the application with `ClerkProvider`
- Maintain existing SWRConfig and design system classes
- Preserve PWA metadata and fonts

#### 2. Middleware Configuration

**File: `middleware.ts`**
- Replace custom middleware with `clerkMiddleware()`
- Configure public routes: `/`, `/add-girl`, `/data-entry`, `/simple`, `/design-test`
- Protect dashboard routes: `/dashboard/*`
- Maintain existing static file exclusions

#### 3. Authentication Flow

**Magic Link Configuration:**
- Primary sign-in method: Email magic link
- Fallback: Email + password (optional)
- Custom styling to match CPN design system
- Mobile-optimized magic link experience

## Implementation Tasks

### Phase 1: Core Setup (Priority: High)

#### Task 1.1: Install and Configure Clerk
- [ ] Install `@clerk/nextjs` package
- [ ] Add environment variables to `.env.local`
- [ ] Configure Clerk dashboard with provided keys
- [ ] Set up magic link authentication method in Clerk dashboard

#### Task 1.2: Wrap Application with ClerkProvider
- [ ] Modify `app/layout.tsx` to include ClerkProvider
- [ ] Maintain existing SWRConfig wrapper
- [ ] Preserve all existing metadata and styling
- [ ] Test PWA functionality after changes

#### Task 1.3: Update Middleware
- [ ] Replace current middleware logic with `clerkMiddleware()`
- [ ] Configure public routes array
- [ ] Protect `/dashboard/*` routes
- [ ] Test route protection logic
- [ ] Ensure static assets continue to work

### Phase 2: Authentication UI (Priority: High)

#### Task 2.1: Create Custom Sign-In Component
- [ ] Create `components/auth/SignInForm.tsx`
- [ ] Implement magic link request UI
- [ ] Apply CPN design system styling
- [ ] Handle loading and error states
- [ ] Ensure mobile responsiveness

#### Task 2.2: Create Custom Sign-Up Component
- [ ] Create `components/auth/SignUpForm.tsx`
- [ ] Implement magic link registration UI
- [ ] Apply CPN design system styling
- [ ] Handle email verification flow
- [ ] Ensure mobile responsiveness

#### Task 2.3: Update Authentication Pages
- [ ] Modify `app/(login)/sign-in/page.tsx` to use new components
- [ ] Modify `app/(login)/sign-up/page.tsx` to use new components
- [ ] Remove dependency on `app/(login)/actions.ts` server actions
- [ ] Preserve page metadata and SEO optimization

### Phase 3: Onboarding Flow Integration (Priority: High)

#### Task 3.1: Protect Onboarding Routes Conditionally
- [ ] Analyze if `/add-girl` should require authentication
- [ ] Implement conditional authentication for onboarding
- [ ] Ensure session storage onboarding data persists through auth
- [ ] Test complete flow: unauthenticated → auth → onboarding completion

#### Task 3.2: User Data Synchronization
- [ ] Create user profile sync with Clerk user data
- [ ] Map Clerk user ID to existing database schema
- [ ] Implement user data migration strategy
- [ ] Handle edge cases for existing users

#### Task 3.3: Onboarding Context Updates
- [ ] Update `contexts/onboarding-context.tsx` for Clerk integration
- [ ] Ensure session storage continues to work
- [ ] Test context state persistence through authentication
- [ ] Maintain existing cleanup logic

### Phase 4: Dashboard Protection (Priority: Medium)

#### Task 4.1: Protect Dashboard Routes
- [ ] Ensure all `/dashboard/*` routes require authentication
- [ ] Update dashboard layout with user information
- [ ] Implement proper loading states
- [ ] Add sign-out functionality

#### Task 4.2: Update User Queries
- [ ] Replace `getUser()` calls with Clerk's `currentUser()`
- [ ] Update database queries to use Clerk user ID
- [ ] Modify team membership logic
- [ ] Test all dashboard functionality

#### Task 4.3: Activity Logging Updates
- [ ] Update activity logging to use Clerk user data
- [ ] Maintain existing activity types
- [ ] Ensure proper user identification
- [ ] Test logging throughout the application

### Phase 5: Database Schema Migration (Priority: Medium)

#### Task 5.1: Add Clerk Integration Fields
- [ ] Add `clerkId` field to users table
- [ ] Create migration script
- [ ] Update database schema types
- [ ] Test migration on development database

#### Task 5.2: User Data Migration
- [ ] Create migration script for existing users
- [ ] Handle users without Clerk accounts
- [ ] Implement fallback authentication methods
- [ ] Test data integrity after migration

#### Task 5.3: Cleanup Legacy Auth Code
- [ ] Remove `lib/auth/session.ts`
- [ ] Remove `lib/auth/middleware.ts`
- [ ] Update imports throughout codebase
- [ ] Remove unused authentication dependencies

### Phase 6: Styling and UX (Priority: Medium)

#### Task 6.1: Custom Clerk Components Styling
- [ ] Override Clerk's default styling
- [ ] Apply CPN design system colors and fonts
- [ ] Ensure mobile-first responsive design
- [ ] Test across different devices and browsers

#### Task 6.2: Loading States and Animations
- [ ] Implement loading spinners with CPN styling
- [ ] Add smooth transitions between auth states
- [ ] Ensure animations work on mobile devices
- [ ] Test performance impact

#### Task 6.3: Error Handling and Messages
- [ ] Customize error messages to match CPN voice
- [ ] Style error states with design system
- [ ] Implement proper error boundaries
- [ ] Test error scenarios

### Phase 7: Testing and QA (Priority: High)

#### Task 7.1: Authentication Flow Testing
- [ ] Test magic link sign-up flow
- [ ] Test magic link sign-in flow
- [ ] Test protected route access
- [ ] Test sign-out functionality

#### Task 7.2: Onboarding Flow Testing
- [ ] Test complete onboarding flow with authentication
- [ ] Test session storage persistence
- [ ] Test context state management
- [ ] Test mobile experience

#### Task 7.3: PWA Compatibility Testing
- [ ] Test PWA installation with new auth
- [ ] Test offline behavior
- [ ] Test push notifications (if applicable)
- [ ] Test service worker compatibility

## Integration Points with Existing Code

### 1. Onboarding Context (`contexts/onboarding-context.tsx`)
**Integration Strategy:**
- Maintain existing session storage logic
- Add authentication state awareness
- Ensure context persists through auth flow
- Handle cleanup when user signs out

**Required Changes:**
```typescript
// Add authentication state to context
const { user, isLoaded } = useUser()

// Modify context to handle auth state changes
useEffect(() => {
  if (isLoaded && !user) {
    // Handle sign-out cleanup
    cleanupManager.forceCleanup()
  }
}, [isLoaded, user])
```

### 2. Middleware (`middleware.ts`)
**Integration Strategy:**
- Replace custom session verification with Clerk
- Maintain existing static file exclusions
- Preserve PWA route handling

**Required Changes:**
```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
])

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect()
})
```

### 3. Database Queries (`lib/db/queries.ts`)
**Integration Strategy:**
- Replace user ID lookups with Clerk user ID
- Maintain existing query patterns
- Add Clerk ID mapping

**Required Changes:**
```typescript
// Replace getUser() calls
import { currentUser } from '@clerk/nextjs/server'

export async function getUser() {
  const user = await currentUser()
  if (!user) return null
  
  // Map to existing database user
  return await getUserByClerkId(user.id)
}
```

### 4. Database Schema (`lib/db/schema.ts`)
**Integration Strategy:**
- Add Clerk ID mapping to users table
- Maintain existing relationships
- Phase out password-related fields

**Required Changes:**
```typescript
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: text('clerk_id').unique(), // New field
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  // passwordHash: text('password_hash').notNull(), // Remove after migration
  role: varchar('role', { length: 20 }).notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});
```

## Testing Requirements

### Unit Testing
- [ ] Authentication component rendering
- [ ] Onboarding context state management
- [ ] Database query functions
- [ ] Migration scripts

### Integration Testing
- [ ] Complete authentication flows
- [ ] Onboarding flow with authentication
- [ ] Dashboard access control
- [ ] PWA functionality

### E2E Testing
- [ ] Magic link email delivery and verification
- [ ] Complete user journey from sign-up to dashboard
- [ ] Mobile device authentication
- [ ] Cross-browser compatibility

### Performance Testing
- [ ] Authentication flow performance
- [ ] Database query performance
- [ ] PWA loading times
- [ ] Mobile responsiveness

## Security Considerations

### Authentication Security
- **Magic Link Security**: Configure appropriate expiration times (15 minutes recommended)
- **Rate Limiting**: Implement rate limiting for magic link requests
- **Email Verification**: Ensure email ownership verification
- **Session Security**: Leverage Clerk's secure session management

### Data Protection
- **User Data Mapping**: Securely map Clerk user IDs to existing database records
- **Migration Security**: Ensure secure handling during migration process
- **Legacy Data**: Safely handle users who haven't migrated to Clerk

### Route Protection
- **Protected Routes**: Ensure all dashboard routes require authentication
- **Public Routes**: Carefully define which routes should remain public
- **API Routes**: Protect API endpoints appropriately

## Migration Strategy

### Phase 1: Parallel Implementation
1. Implement Clerk alongside existing authentication
2. Allow existing users to continue using current system
3. New users automatically use Clerk

### Phase 2: User Migration
1. Provide migration path for existing users
2. Send migration emails with instructions
3. Maintain backward compatibility during transition

### Phase 3: Legacy Cleanup
1. Remove legacy authentication code
2. Clean up database schema
3. Update all references to old authentication system

## Rollback Plan

### Immediate Rollback
- Keep existing authentication system intact during development
- Use feature flags to toggle between systems
- Maintain database compatibility

### Data Rollback
- Preserve existing user data structure
- Maintain ability to revert database changes
- Keep backup of pre-migration state

## Success Metrics

### Functional Metrics
- [ ] 100% of authentication flows working
- [ ] Zero regression in onboarding completion rate
- [ ] All protected routes properly secured
- [ ] PWA functionality maintained

### Performance Metrics
- [ ] Authentication flow completes in <3 seconds
- [ ] Magic link delivery in <30 seconds
- [ ] No degradation in page load times
- [ ] Mobile performance maintained

### User Experience Metrics
- [ ] Design system consistency maintained
- [ ] Mobile experience optimized
- [ ] Error states properly handled
- [ ] Loading states provide good UX

## Maintenance and Monitoring

### Post-Implementation Monitoring
- Monitor magic link delivery rates
- Track authentication success rates
- Monitor for authentication-related errors
- Watch for performance regressions

### Ongoing Maintenance
- Keep Clerk SDK updated
- Monitor Clerk service status
- Maintain custom styling updates
- Regular security audits

## Conclusion

This specification provides a comprehensive roadmap for integrating Clerk authentication with Magic Link functionality into the CPN application. The implementation prioritizes maintaining the existing user experience while providing a more robust and secure authentication system.

The phased approach allows for careful testing and validation at each stage, minimizing the risk of disruption to existing functionality. The focus on preserving the CPN design system and onboarding flow ensures consistency in the user experience.

Success depends on careful execution of each phase, thorough testing, and monitoring throughout the implementation process.