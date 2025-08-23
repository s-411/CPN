'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  getSessionDataForMigration, 
  clearSessionData,
  type CPNOnboardingData 
} from '../supabase/user-mapping';

interface UseUserSyncState {
  isLoading: boolean;
  hasMigrated: boolean;
  sessionData: CPNOnboardingData | null;
  error: string | null;
}

/**
 * Hook to handle user sync and session data migration
 * Use this on the main app layout or dashboard to ensure
 * user data is properly synced when they sign in
 */
export function useUserSync() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [state, setState] = useState<UseUserSyncState>({
    isLoading: false,
    hasMigrated: false,
    sessionData: null,
    error: null,
  });

  // Check for session data that needs migration
  useEffect(() => {
    if (isLoaded && isSignedIn && user && !state.hasMigrated) {
      const sessionData = getSessionDataForMigration();
      
      // Only set session data if there's something to migrate
      if (sessionData.profile || (sessionData.interactions && sessionData.interactions.length > 0)) {
        setState(prev => ({ ...prev, sessionData }));
      } else {
        // No session data to migrate
        setState(prev => ({ ...prev, hasMigrated: true }));
      }
    }
  }, [isLoaded, isSignedIn, user, state.hasMigrated]);

  // Migrate session data to user profile
  const migrateSessionData = async (): Promise<void> => {
    if (!user || !state.sessionData) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Call server-side migration endpoint
      const response = await fetch('/api/user/migrate-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerkId: user.id,
          sessionData: state.sessionData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to migrate session data');
      }

      // Clear local storage after successful migration
      clearSessionData();
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        hasMigrated: true, 
        sessionData: null 
      }));
    } catch (error) {
      console.error('Error migrating session data:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Migration failed' 
      }));
    }
  };

  // Skip migration (user doesn't want to transfer data)
  const skipMigration = (): void => {
    clearSessionData();
    setState(prev => ({ 
      ...prev, 
      hasMigrated: true, 
      sessionData: null 
    }));
  };

  return {
    ...state,
    needsMigration: !!state.sessionData && !state.hasMigrated,
    migrateSessionData,
    skipMigration,
  };
}

/**
 * Hook to get current user context with CPN data
 */
export function useUserContext() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [userContext, setUserContext] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      setIsLoading(true);
      
      fetch(`/api/user/context?clerkId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          setUserContext(data);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error fetching user context:', error);
          setIsLoading(false);
        });
    }
  }, [isLoaded, isSignedIn, user]);

  return {
    userContext,
    isLoading,
    hasProfile: userContext?.hasProfile || false,
    hasInteractions: userContext?.hasInteractions || false,
  };
}