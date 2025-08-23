'use client'

import { useUser, useAuth as useClerkAuth } from "@clerk/nextjs";

export function useAuth() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerkAuth();

  return {
    user,
    isLoaded,
    isSignedIn,
    signOut,
    userId: user?.id,
    email: user?.emailAddresses[0]?.emailAddress,
    firstName: user?.firstName,
    lastName: user?.lastName,
    fullName: user?.fullName,
    imageUrl: user?.imageUrl
  };
}

export function useRequireAuth() {
  const { isLoaded, isSignedIn } = useAuth();
  
  if (isLoaded && !isSignedIn) {
    throw new Error('Authentication required');
  }
  
  return useAuth();
}