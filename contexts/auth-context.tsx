'use client'

import { useUser } from "@clerk/nextjs";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: any;
  isLoaded: boolean;
  isSignedIn: boolean | undefined;
  migrateSessionData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const [hasMigrated, setHasMigrated] = useState(false);

  const migrateSessionData = async () => {
    if (isSignedIn && user && !hasMigrated) {
      // TODO: Implement session data migration in Phase 4
      // Get existing session data from localStorage/sessionStorage
      // const sessionData = getOnboardingData();
      // if (sessionData && (sessionData.profile || sessionData.dataEntry)) {
      //   await migrateSessionToUser(user.id, sessionData);
      //   clearOnboardingData();
      //   setHasMigrated(true);
      // }
      setHasMigrated(true);
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

// Temporary placeholder functions - will be implemented in Phase 4
function getOnboardingData() {
  // Get data from session storage
  return null;
}