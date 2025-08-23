# Clerk + Supabase Integration Documentation

This document outlines the integration between Clerk authentication and Supabase database for the CPN application.

## Architecture Overview

The integration follows these key patterns:

1. **Clerk** handles authentication, user management, and Magic Links
2. **Supabase** stores application data with Row Level Security (RLS)
3. **User Mapping** syncs Clerk users to Supabase users table
4. **Session Migration** transfers anonymous session data to authenticated users

## Database Schema Integration

### Users Table Enhancement
- Added `clerk_id` field to existing `users` table
- Made `password_hash` optional (for Clerk-only users)
- Added unique constraint and index on `clerk_id`

### CPN-Specific Tables
- `user_profiles` - Stores CPN onboarding data (first name, age, ethnicity, rating)
- `user_interactions` - Stores CPN data entries (date, cost, time, nuts, notes)

### Row Level Security (RLS)
All tables have RLS policies that enforce:
- Users can only access their own data via `clerk_id`
- Team members can access shared team data
- Service role can perform system operations

## User Synchronization Flow

### 1. User Registration/Sign-In
```mermaid
sequenceDiagram
    participant User
    participant Clerk
    participant Webhook
    participant Supabase
    
    User->>Clerk: Sign up/in with Magic Link
    Clerk->>Webhook: user.created/updated event
    Webhook->>Supabase: Sync user data
    Note over Supabase: Creates/updates user record with clerk_id
```

### 2. Session Data Migration
```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Supabase
    
    Client->>Client: Check localStorage for session data
    Client->>API: POST /api/user/migrate-session
    API->>Supabase: Create profile & interactions
    API->>Client: Migration successful
    Client->>Client: Clear localStorage
```

## Key Integration Points

### 1. Webhook Handler (`/api/clerk/webhook`)
Handles Clerk events:
- `user.created` - Creates new user in Supabase
- `user.updated` - Updates user information
- `user.deleted` - Soft deletes user

### 2. User Mapping Utilities (`lib/supabase/user-mapping.ts`)
Core functions:
- `syncClerkUserToSupabase()` - Creates/updates user records
- `migrateSessionDataToUser()` - Transfers session data
- `getUserContext()` - Gets complete user profile
- `validateUserAccess()` - Checks data access permissions

### 3. Client-Side Hooks (`lib/hooks/use-user-sync.ts`)
React hooks:
- `useUserSync()` - Manages session data migration
- `useUserContext()` - Gets authenticated user context

### 4. API Endpoints
- `POST /api/user/migrate-session` - Migrates session data
- `GET /api/user/context` - Gets user context with CPN data

## Environment Variables

### Required for Clerk Integration
```env
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase Configuration  
NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
SUPABASE_DATABASE_URL=postgresql://postgres.xyz:password@pooler.supabase.com:6543/postgres
```

## RLS Policy Examples

### Users Table Policy
```sql
CREATE POLICY "Users can view own record" ON users
  FOR SELECT USING (clerk_id = auth.jwt() ->> 'sub');
```

### User Profiles Policy
```sql
CREATE POLICY "Users can manage own profiles" ON user_profiles
  FOR ALL USING (clerk_id = auth.jwt() ->> 'sub');
```

## Usage Examples

### 1. Check if User Needs Migration
```tsx
import { useUserSync } from '@/lib/hooks/use-user-sync';

function Dashboard() {
  const { needsMigration, migrateSessionData } = useUserSync();
  
  if (needsMigration) {
    return <MigrationPrompt onMigrate={migrateSessionData} />;
  }
  
  return <DashboardContent />;
}
```

### 2. Get User Context
```tsx
import { useUserContext } from '@/lib/hooks/use-user-sync';

function ProfilePage() {
  const { userContext, hasProfile, hasInteractions } = useUserContext();
  
  if (!hasProfile) {
    return <CreateProfileForm />;
  }
  
  return <ProfileView profile={userContext.profile} />;
}
```

### 3. Server-Side Data Access
```tsx
import { auth } from '@clerk/nextjs/server';
import { getUserContext } from '@/lib/supabase/user-mapping';

export async function ProfilePage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  const userContext = await getUserContext(userId);
  
  return <ProfileDisplay context={userContext} />;
}
```

## Security Considerations

### 1. Data Isolation
- RLS policies ensure users can only access their own data
- Clerk JWT contains `sub` claim with user ID
- All database queries include user context

### 2. Webhook Security
- Webhooks verify signatures using Clerk webhook secret
- Invalid signatures are rejected
- Events are logged for audit trail

### 3. API Security
- All user APIs require Clerk authentication
- User ID verification prevents access to other users' data
- Session data migration validates ownership

## Testing Strategy

### 1. Integration Tests
- User synchronization flow
- Session data migration
- RLS policy enforcement
- Multi-tenant data access

### 2. Security Tests
- Unauthorized access attempts
- Cross-user data access
- Webhook signature verification

### 3. Performance Tests
- Database query performance with RLS
- Large session data migration
- Concurrent user operations

## Deployment Checklist

### Supabase Configuration
- [ ] Database schema migrated
- [ ] RLS policies applied
- [ ] Service role permissions configured
- [ ] Connection pooling enabled

### Clerk Configuration
- [ ] Webhooks configured with correct endpoint
- [ ] Magic Link authentication enabled
- [ ] JWT templates configured (if custom claims needed)
- [ ] Test users created for development

### Environment Setup
- [ ] All environment variables configured
- [ ] Webhook secrets match between Clerk and app
- [ ] Database connection string uses pooled connection
- [ ] API endpoints deployed and accessible

### Monitoring
- [ ] Webhook delivery monitoring enabled
- [ ] Database performance monitoring
- [ ] User synchronization error tracking
- [ ] Session migration success rates

## Troubleshooting

### Common Issues

1. **User not found in Supabase**
   - Check webhook delivery in Clerk dashboard
   - Verify webhook endpoint is accessible
   - Check server logs for sync errors

2. **RLS policy denying access**
   - Verify Clerk JWT contains correct `sub` claim
   - Check policy conditions match JWT structure
   - Test with service role to isolate RLS issues

3. **Session migration failing**
   - Verify user exists in Supabase before migration
   - Check session data format matches expected schema
   - Ensure all required fields are present

4. **Performance issues**
   - Check database query performance with RLS
   - Verify indexes are present on filtered columns
   - Monitor connection pool usage

## Future Enhancements

### Planned Features
- [ ] Team invitation flow with Clerk
- [ ] Advanced user profile sync
- [ ] Bulk data migration utilities
- [ ] Analytics integration with user context
- [ ] Advanced RLS policy optimization

### Monitoring & Analytics
- [ ] User onboarding funnel tracking
- [ ] Session migration success metrics
- [ ] Database performance dashboards
- [ ] Error rate monitoring and alerting