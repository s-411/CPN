# Technical Specification: Clerk Magic Link Authentication

## Architecture Overview

### Clerk Integration Pattern
```typescript
// Environment Variables (provided)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_dHJ1c3RpbmctY2FpbWFuLTQ1LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_57oFP7kJ3dmZW0vdN9r8sZpTr6emWXixUtl5SDkcp4

// middleware.ts - App Router Pattern
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

// app/layout.tsx - ClerkProvider Wrapper  
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### Package Dependencies
```json
{
  "dependencies": {
    "@clerk/nextjs": "^latest",
    "existing packages...": "..."
  }
}
```

### Remove Deprecated Auth Dependencies
```bash
# Remove these packages as they will be replaced by Clerk
npm uninstall bcryptjs @types/bcryptjs jose
```

## Database Schema Changes

### User Account Mapping
```typescript
// Add to existing schema
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: varchar('clerk_id', { length: 255 }).unique().notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  // Existing fields remain unchanged
});

export const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  clerkId: varchar('clerk_id', { length: 255 }).notNull(),
  // Profile data from onboarding
  firstName: varchar('first_name', { length: 100 }),
  age: integer('age'),
  ethnicity: varchar('ethnicity', { length: 50 }),
  rating: decimal('rating', { precision: 3, scale: 1 }),
});

export const userInteractions = pgTable('user_interactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  clerkId: varchar('clerk_id', { length: 255 }).notNull(),
  // Interaction data from data-entry
  date: date('date').notNull(),
  cost: decimal('cost', { precision: 10, scale: 2 }).notNull(),
  time: integer('time_minutes').notNull(),
  nuts: integer('nuts').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### Migration Strategy
```typescript
// Migration approach for existing anonymous session data
export const migrateSessionToUser = async (clerkId: string, sessionData: OnboardingData) => {
  const db = getDb();
  
  // Create user record
  const user = await db.insert(users).values({
    clerkId,
    email: await getCurrentUser()?.emailAddress,
  }).returning();
  
  // Migrate profile data if exists
  if (sessionData.profile) {
    await db.insert(userProfiles).values({
      userId: user[0].id,
      clerkId,
      ...sessionData.profile
    });
  }
  
  // Migrate interaction data if exists
  if (sessionData.dataEntry) {
    await db.insert(userInteractions).values({
      userId: user[0].id, 
      clerkId,
      ...sessionData.dataEntry
    });
  }
};
```

## Component Architecture

### Authentication Components
```typescript
// app/sign-in/page.tsx - Custom Magic Link Page
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-cpn-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-cpn-yellow rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-cpn-dark">CPN</span>
          </div>
          <h1 className="text-3xl font-bold text-cpn-white mb-2">
            Welcome Back
          </h1>
          <p className="text-cpn-gray">
            Sign in to access your CPN data
          </p>
        </div>
        
        <SignIn 
          appearance={{
            theme: {
              colorPrimary: "#f2f661",
              colorBackground: "#1f1f1f",
              colorText: "#ffffff",
            },
            elements: {
              formButtonPrimary: "bg-cpn-yellow hover:bg-cpn-yellow/90 text-cpn-dark",
              card: "bg-cpn-dark border border-cpn-gray",
              headerTitle: "text-cpn-white",
              headerSubtitle: "text-cpn-gray",
            }
          }}
          signUpUrl="/sign-up"
        />
      </div>
    </main>
  );
}
```

### User Context Integration
```typescript
// contexts/auth-context.tsx
'use client'

import { useUser } from "@clerk/nextjs";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: any;
  isLoaded: boolean;
  isSignedIn: boolean;
  migrateSessionData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const [hasMigrated, setHasMigrated] = useState(false);

  const migrateSessionData = async () => {
    if (isSignedIn && user && !hasMigrated) {
      const sessionData = getOnboardingData(); // From existing session storage
      if (sessionData && (sessionData.profile || sessionData.dataEntry)) {
        await migrateSessionToUser(user.id, sessionData);
        clearOnboardingData(); // Clear session storage after migration
        setHasMigrated(true);
      }
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      migrateSessionData();
    }
  }, [isLoaded, isSignedIn]);

  return (
    <AuthContext.Provider value={{ user, isLoaded, isSignedIn, migrateSessionData }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

## Route Protection Strategy

### Middleware Configuration
```typescript
// middleware.ts - Complete configuration
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/add-girl(.*)',
  '/data-entry(.*)', 
  '/cpn-result(.*)',
  '/dashboard(.*)',
  '/profile(.*)'
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
```

### API Route Protection
```typescript
// app/api/user/profile/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { userId } = auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch user data using userId (clerkId)
  const userData = await getUserData(userId);
  
  return NextResponse.json(userData);
}
```

## Integration with Existing Onboarding

### Updated OnboardingProvider
```typescript
// contexts/onboarding-context.tsx - Updated with authentication
'use client'

import { useAuth } from '@/contexts/auth-context';
import { useUser } from '@clerk/nextjs';

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const [data, setData] = useState<OnboardingData>(() => ({
    profile: null,
    dataEntry: null,
    result: null
  }));

  // Load user data from database if authenticated
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      loadUserData(user.id).then(userData => {
        if (userData) {
          setData({
            profile: userData.profile,
            dataEntry: userData.interactions?.[0] || null,
            result: userData.result || null
          });
        }
      });
    }
  }, [isLoaded, isSignedIn, user]);

  const saveProfileData = useCallback(async (profileData: ProfileFormData) => {
    if (isSignedIn && user) {
      // Save to database
      await saveUserProfile(user.id, profileData);
    }
    // Also save to session storage for immediate use
    sessionManager.saveStep('profile', profileData);
    setData(prev => ({ ...prev, profile: profileData }));
  }, [isSignedIn, user, sessionManager]);

  // ... rest of the context implementation
}
```

### Progressive Authentication
```typescript
// app/add-girl/page.tsx - Authentication check
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function AddGirlPage() {
  const { userId } = auth();
  
  if (!userId) {
    redirect('/sign-in?redirect_url=/add-girl');
  }
  
  return <AddGirlPageClient />;
}
```

## PWA Compatibility

### Service Worker Updates
```typescript
// public/sw.js - Updated for authentication
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'AUTH_STATE_CHANGED') {
    const { isSignedIn, userId } = event.data;
    
    if (isSignedIn && userId) {
      // Update caching strategies for authenticated user
      self.userId = userId;
      
      // Cache user-specific data
      caches.open(`user-data-${userId}`).then(cache => {
        // Implement user-specific caching
      });
    } else {
      // Clear user-specific caches on sign out
      caches.keys().then(keys => {
        keys.forEach(key => {
          if (key.startsWith('user-data-')) {
            caches.delete(key);
          }
        });
      });
    }
  }
});
```

### PWA Authentication State
```typescript
// lib/utils/pwa.ts - Updated for auth
export const updatePWAAuthState = (isSignedIn: boolean, userId?: string) => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'AUTH_STATE_CHANGED',
      isSignedIn,
      userId
    });
  }
};
```

## Security Considerations

### Environment Variables Security
```bash
# .env.local (never commit to version control)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_dHJ1c3RpbmctY2FpbWFuLTQ1LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_57oFP7kJ3dmZW0vdN9r8sZpTr6emWXixUtl5SDkcp4

# .env.example (commit this template)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
```

### Rate Limiting
```typescript
// lib/utils/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 requests per minute
});

export const checkRateLimit = async (identifier: string) => {
  const { success } = await ratelimit.limit(identifier);
  return success;
};
```

### Data Encryption
```typescript
// lib/utils/encryption.ts
import { encrypt, decrypt } from '@/lib/crypto';

export const encryptUserData = (data: any) => {
  return encrypt(JSON.stringify(data));
};

export const decryptUserData = (encryptedData: string) => {
  const decryptedString = decrypt(encryptedData);
  return JSON.parse(decryptedString);
};
```

## Testing Strategy

### Authentication Flow Testing
```typescript
// __tests__/auth/magic-link.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ClerkProvider } from '@clerk/nextjs';
import SignInPage from '@/app/sign-in/page';

describe('Magic Link Authentication', () => {
  it('should render sign-in form with CPN styling', () => {
    render(
      <ClerkProvider publishableKey="pk_test_...">
        <SignInPage />
      </ClerkProvider>
    );
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('CPN')).toBeInTheDocument();
  });

  it('should handle magic link email submission', async () => {
    // Mock Clerk's magic link flow
    // Test email validation and submission
  });
});
```

### Integration Testing
```typescript
// __tests__/integration/auth-onboarding.test.tsx
describe('Authenticated Onboarding Flow', () => {
  it('should complete full flow from sign-in to CPN result', async () => {
    // Test complete user journey:
    // 1. Sign in with magic link
    // 2. Complete /add-girl profile
    // 3. Fill /data-entry form  
    // 4. View /cpn-result
    // 5. Verify data persistence
  });
});
```

## Performance Considerations

### Code Splitting
```typescript
// Dynamic imports for authentication components
const SignInButton = dynamic(() => import('@clerk/nextjs').then(mod => ({ default: mod.SignInButton })));
const UserButton = dynamic(() => import('@clerk/nextjs').then(mod => ({ default: mod.UserButton })));
```

### Caching Strategy
```typescript
// lib/cache/user-data.ts
import { cache } from 'react';

export const getUserDataCache = cache(async (userId: string) => {
  // Cached user data fetching with 5 minute TTL
  return await fetchUserData(userId);
});
```

## Rollback Strategy

### Feature Flag Implementation
```typescript
// lib/features/flags.ts
export const FEATURES = {
  CLERK_AUTH: process.env.FEATURE_CLERK_AUTH === 'true',
} as const;

// Conditional authentication
if (FEATURES.CLERK_AUTH) {
  // Use Clerk authentication
} else {
  // Fall back to session-based flow
}
```

### Database Rollback Plan
```sql
-- Rollback migrations if needed
ALTER TABLE users DROP COLUMN clerk_id;
DROP TABLE user_profiles;
DROP TABLE user_interactions;
```

## Deployment Checklist

### Environment Setup
- [ ] Clerk account configured with proper domains
- [ ] Environment variables set in production
- [ ] SSL certificates configured for magic link security
- [ ] Email delivery configured and tested

### Security Verification  
- [ ] Rate limiting implemented and tested
- [ ] JWT token validation working
- [ ] CORS policies configured correctly
- [ ] Database access controls in place

### Performance Validation
- [ ] Authentication flow load time < 2 seconds
- [ ] Magic link email delivery < 30 seconds
- [ ] Database queries optimized with proper indexing
- [ ] CDN configured for static assets