import { createSupabaseClient, createSupabaseServerClient } from './index';
import type { Database } from './types';

// Utility functions for Supabase operations

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Get Supabase client based on environment (client vs server)
 */
export function getSupabaseClient(serverSide: boolean = false) {
  if (serverSide) {
    return createSupabaseServerClient();
  }
  return createSupabaseClient();
}

/**
 * Handle Supabase errors consistently
 */
export function handleSupabaseError(error: any) {
  console.error('Supabase error:', error);
  
  if (error?.message) {
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
  
  return {
    success: false,
    error: 'An unexpected database error occurred',
    details: error
  };
}

/**
 * Format Supabase response for consistent API responses
 */
export function formatSupabaseResponse<T>(
  data: T | null, 
  error: any, 
  count?: number | null
) {
  if (error) {
    return handleSupabaseError(error);
  }
  
  return {
    success: true,
    data,
    count,
    error: null
  };
}

/**
 * Convert Clerk user ID to Supabase user query
 */
export function createClerkUserFilter(clerkId: string) {
  return { clerk_id: clerkId };
}

/**
 * Get current user from Supabase based on Clerk ID
 */
export async function getSupabaseUserByClerkId(clerkId: string, serverSide: boolean = false) {
  const supabase = getSupabaseClient(serverSide);
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();
    
  return formatSupabaseResponse(data, error);
}

/**
 * Create a new user in Supabase linked to Clerk
 */
export async function createSupabaseUser(
  clerkId: string, 
  email: string, 
  name?: string,
  serverSide: boolean = true
) {
  const supabase = getSupabaseClient(serverSide);
  
  const { data, error } = await supabase
    .from('users')
    .insert({
      clerk_id: clerkId,
      email,
      name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
    
  return formatSupabaseResponse(data, error);
}