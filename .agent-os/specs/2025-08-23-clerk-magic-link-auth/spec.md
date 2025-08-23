# Spec Requirements Document

> Spec: Magic Link Authentication System with Clerk
> Created: 2025-08-23

## Overview

Implement a secure, user-friendly Magic Link authentication system using Clerk to replace the current anonymous session-based onboarding flow. This system will allow users to sign in via Magic Link (passwordless email authentication), create persistent user accounts, and maintain their CPN data across sessions while preserving the existing onboarding experience and CPN design system.

## User Stories

### Magic Link Sign-In Experience
As a new user discovering the CPN app, I want to sign up using only my email address without creating a password, so that I can quickly access the app and start tracking my dating efficiency without friction.

The user visits the CPN app, enters their email address, receives a magic link in their email, clicks it to instantly sign in, and is immediately shown their CPN from session storage. The authentication should feel seamless and maintain the CPN brand experience throughout.

### Persistent Data Across Sessions
As a returning user, I want my profile data, dating interactions, and CPN calculations to persist across devices and sessions, so that I can build a comprehensive dataset for analyzing my dating patterns over time.

When users return to the app (from any device), they should be able to sign in with their email, receive a magic link, and immediately access all their previously entered data. Their onboarding progress, profile information, and interaction history should be preserved.

### Secure Account Management  
As a user concerned about privacy, I want my dating data to be securely associated with my account and accessible only to me, so that I can trust the app with sensitive personal information.

Users should have confidence that their data is secure, properly encrypted, and only accessible through authenticated sessions. The magic link authentication should provide enterprise-level security without complexity.

## Technical Requirements

### Core Authentication Features
- Magic Link email authentication using Clerk
- Passwordless sign-in/sign-up flow
- Secure session management with JWT tokens
- Email verification and account protection
- Multi-device access with persistent sessions

### Integration Requirements
- Preserve existing onboarding flow (/add-girl → /data-entry → /cpn-result)
- Maintain CPN design system (dark theme, #f2f661 yellow accents)
- Keep PWA functionality and service worker features
- Ensure mobile-first responsive design
- Integrate with existing session storage during transition

### Data Migration Strategy
- Map existing anonymous session data to authenticated users
- Preserve user progress during authentication adoption
- Maintain backward compatibility during rollout
- Secure migration of existing onboarding contexts

### Security & Compliance
- Implement proper route protection for authenticated areas
- Secure API endpoints with Clerk authentication
- Rate limiting on authentication attempts
- GDPR-compliant data handling and user deletion
- Secure storage of user CPN data and interactions

## User Interface Design

### Authentication Pages
- Custom-styled Magic Link sign-in page matching CPN theme
- Email input form with CPN yellow accent colors
- "Check your email" confirmation page with CPN branding
- Error handling pages with consistent design language

### Navigation Integration
- Seamless integration with existing header/navigation
- User profile dropdown matching CPN design system
- Sign-out functionality with proper cleanup
- Authentication state management across the app

### Onboarding Integration
- Authentication gate before onboarding flow begins
- Preserve existing /add-girl, /data-entry, /cpn-result pages
- Maintain progress tracking and step indicators
- Keep existing form validation and user experience

## Implementation Architecture

### Clerk Configuration
- Next.js 15 App Router integration using clerkMiddleware()
- Environment variables: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY
- ClerkProvider wrapping in app/layout.tsx
- Custom sign-in/sign-up components with CPN styling

### Database Integration
- Add Clerk user ID mapping to existing user data structures
- Maintain existing session storage during migration period
- Create user profile linking between Clerk accounts and CPN data
- Implement data synchronization between sessions and database

### Route Protection
- Protect onboarding flow behind authentication
- Secure API endpoints with Clerk server-side validation
- Implement proper middleware for route access control
- Handle authentication redirects gracefully

### PWA Compatibility
- Ensure Magic Link works in PWA installation mode
- Maintain offline functionality where possible
- Handle authentication state in service worker context
- Preserve existing caching strategies for authenticated users

## Success Metrics

### User Experience Metrics
- Magic Link email delivery success rate > 99%
- Authentication completion rate > 90%
- Time from email to app access < 30 seconds
- User retention improvement with persistent accounts

### Technical Performance
- Authentication flow load time < 2 seconds
- Zero downtime during implementation rollout  
- Backward compatibility maintained throughout migration
- No loss of existing user data or progress

### Security Validation
- Pass security audit with penetration testing
- Implement proper session timeout and refresh
- Validate JWT token security and expiration handling
- Ensure GDPR compliance for EU users

## Implementation Phases

### Phase 1: Core Setup
- Install and configure Clerk SDK
- Set up environment variables and basic configuration
- Create middleware.ts with clerkMiddleware()
- Wrap app with ClerkProvider in layout.tsx

### Phase 2: Authentication UI
- Create custom Magic Link sign-in page with CPN styling
- Implement email input form with validation
- Build "check your email" confirmation page
- Add error handling and loading states

### Phase 3: Route Protection  
- Implement authentication middleware for protected routes
- Secure the onboarding flow behind sign-in requirement
- Add user context to existing onboarding provider
- Handle authentication redirects and state management

### Phase 4: Data Integration
- Add Clerk user ID to existing data structures
- Create user account linking and data migration utilities
- Implement secure data persistence with authenticated users
- Test data synchronization between sessions and accounts

### Phase 5: Testing & Rollout
- Comprehensive testing of authentication flow
- User acceptance testing with Magic Link experience
- Security audit and penetration testing
- Gradual rollout with rollback plan

## Acceptance Criteria

### Functional Requirements
- [ ] Users can sign up using only email address (Magic Link)
- [ ] Magic Link emails are delivered within 30 seconds
- [ ] Clicking Magic Link successfully authenticates user
- [ ] Authenticated users maintain session across browser restarts
- [ ] Existing onboarding flow works unchanged after authentication
- [ ] User data persists across devices and sessions
- [ ] Sign-out properly clears user session and data

### Design Requirements  
- [ ] Authentication pages match CPN design system exactly
- [ ] Dark theme with #f2f661 yellow accents maintained
- [ ] Mobile-first responsive design works on all screen sizes
- [ ] Loading states and transitions feel smooth and branded
- [ ] Error messages are helpful and maintain CPN voice/tone

### Technical Requirements
- [ ] Clerk integration follows Next.js App Router best practices
- [ ] Environment variables are properly configured and secure
- [ ] Route protection works correctly for all protected areas
- [ ] PWA functionality remains intact with authentication
- [ ] Database integration preserves existing user data
- [ ] API endpoints are properly secured with Clerk validation

### Security Requirements
- [ ] Magic Links expire after appropriate time period
- [ ] JWT tokens are properly validated on server side
- [ ] User sessions timeout appropriately for security
- [ ] Authentication attempts are rate limited
- [ ] User data is encrypted and securely stored
- [ ] GDPR compliance for data deletion and export

## Risk Mitigation

### Technical Risks
- **Risk**: Authentication integration breaks existing onboarding flow
- **Mitigation**: Implement behind feature flag with thorough testing

- **Risk**: Magic Link emails land in spam folders  
- **Mitigation**: Configure Clerk with proper email authentication (SPF, DKIM)

- **Risk**: User data loss during migration
- **Mitigation**: Comprehensive backup strategy and gradual rollout

### User Experience Risks  
- **Risk**: Magic Link flow adds friction to user onboarding
- **Mitigation**: Optimize email delivery speed and provide clear instructions

- **Risk**: Users don't understand passwordless authentication
- **Mitigation**: Clear onboarding copy and help documentation

- **Risk**: Existing users lost during authentication requirement addition
- **Mitigation**: Optional authentication initially, with incentives to sign up

## Dependencies

### External Services
- Clerk authentication service (account setup required)
- Email delivery service (configured through Clerk)
- SSL certificate for secure Magic Link handling

### Internal Dependencies
- Next.js 15 App Router architecture
- Existing onboarding context and session management
- CPN design system and styling framework
- PWA service worker and offline functionality

### Development Dependencies  
- @clerk/nextjs package (latest version)
- TypeScript types for Clerk integration
- Testing utilities for authentication flows
- Development environment with proper environment variables