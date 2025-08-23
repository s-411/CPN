/**
 * @jest-environment node
 */

describe('Supabase Client Utility', () => {
  beforeAll(() => {
    // Set up test environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-anon-key';
    process.env.SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-service-key';
  });

  describe('Client Import and Initialization', () => {
    it('should import supabase client utility', async () => {
      // This will initially fail until we create the utility
      const { createSupabaseClient } = await import('@/lib/supabase/client');
      expect(createSupabaseClient).toBeInstanceOf(Function);
    });

    it('should import server-side supabase client', async () => {
      // This will initially fail until we create the utility
      const { createSupabaseServerClient } = await import('@/lib/supabase/server');
      expect(createSupabaseServerClient).toBeInstanceOf(Function);
    });

    it('should create client-side supabase instance', async () => {
      const { createSupabaseClient } = await import('@/lib/supabase/client');
      const supabase = createSupabaseClient();
      
      expect(supabase).toBeDefined();
      expect(supabase.auth).toBeDefined();
    });

    it('should create server-side supabase instance', async () => {
      const { createSupabaseServerClient } = await import('@/lib/supabase/server');
      const supabase = createSupabaseServerClient();
      
      expect(supabase).toBeDefined();
      expect(supabase.auth).toBeDefined();
    });
  });

  describe('Environment Configuration', () => {
    it('should use environment variables correctly', async () => {
      const { createSupabaseClient } = await import('@/lib/supabase/client');
      
      // Mock console.error to check for warnings
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const supabase = createSupabaseClient();
      expect(supabase).toBeDefined();
      
      // Should not have environment variable errors
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('SUPABASE_URL')
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle missing environment variables gracefully', () => {
      // Temporarily remove env vars
      const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      expect(() => {
        // This should throw or handle missing env vars appropriately
        require('@/lib/supabase/client');
      }).not.toThrow(); // We'll handle this gracefully in the implementation
      
      // Restore env vars
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
    });
  });

  describe('Database Operations Setup', () => {
    it('should be able to query users table', async () => {
      const { createSupabaseClient } = await import('@/lib/supabase/client');
      const supabase = createSupabaseClient();
      
      const query = supabase.from('users').select('*');
      expect(query).toBeDefined();
    });

    it('should be able to query user_profiles table', async () => {
      const { createSupabaseClient } = await import('@/lib/supabase/client');
      const supabase = createSupabaseClient();
      
      const query = supabase.from('user_profiles').select('*');
      expect(query).toBeDefined();
    });

    it('should be able to query user_interactions table', async () => {
      const { createSupabaseClient } = await import('@/lib/supabase/client');
      const supabase = createSupabaseClient();
      
      const query = supabase.from('user_interactions').select('*');
      expect(query).toBeDefined();
    });

    it('should support RLS-enabled queries', async () => {
      const { createSupabaseClient } = await import('@/lib/supabase/client');
      const supabase = createSupabaseClient();
      
      // Test that RLS will be respected (mock test)
      const query = supabase
        .from('users')
        .select('*')
        .eq('clerk_id', 'test-clerk-id');
        
      expect(query).toBeDefined();
    });
  });

  describe('Type Safety', () => {
    it('should export database types', async () => {
      const { Database } = await import('@/lib/supabase/types');
      expect(Database).toBeDefined();
    });

    it('should have proper typing for tables', async () => {
      const { createSupabaseClient } = await import('@/lib/supabase/client');
      const { Database } = await import('@/lib/supabase/types');
      
      const supabase = createSupabaseClient();
      
      // This will be type-checked at compile time
      const query = supabase.from('users').select('id, clerk_id, email');
      expect(query).toBeDefined();
    });
  });
});