import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with service role key for server-side operations
export const createSupabaseServerClient = () => {
  return createClient(supabaseUrl, supabaseServiceKey);
};

// Create authenticated Supabase client that respects RLS policies
export const createAuthenticatedSupabaseClient = async () => {
  const { getToken } = await auth();
  
  // Get Clerk JWT token
  const token = await getToken({ template: 'supabase' });
  
  if (!token) {
    throw new Error('No authentication token available');
  }

  // Create Supabase client with Clerk JWT
  return createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
};

// Helper function to get current user's Clerk ID
export const getCurrentUserClerkId = async (): Promise<string | null> => {
  try {
    const { userId } = await auth();
    return userId;
  } catch (error) {
    console.error('Error getting current user Clerk ID:', error);
    return null;
  }
};

// Helper function to create or update user record from Clerk
export const syncUserWithClerk = async (clerkUser: any) => {
  const supabase = createSupabaseServerClient();
  
  const userData = {
    clerk_id: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress,
    name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
    updated_at: new Date().toISOString(),
  };

  // Upsert user record
  const { data, error } = await supabase
    .from('users')
    .upsert(userData, { 
      onConflict: 'clerk_id',
      ignoreDuplicates: false 
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to sync user with Clerk: ${error.message}`);
  }

  return data;
};