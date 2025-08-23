#!/usr/bin/env node
/**
 * Simple script to verify Supabase connection and configuration
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function verifySupabaseConnection() {
  console.log('🔍 Verifying Supabase connection...\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('✅ Environment Variables:');
  console.log(`   SUPABASE_URL: ${supabaseUrl ? '✓' : '✗'}`);
  console.log(`   ANON_KEY: ${supabaseAnonKey ? '✓' : '✗'}`);
  console.log(`   SERVICE_KEY: ${supabaseServiceKey ? '✓' : '✗'}\n`);

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }

  try {
    // Test client-side connection
    console.log('🔗 Testing client connection...');
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test basic connection by getting auth status
    const { data: authData, error: authError } = await supabaseClient.auth.getUser();
    if (authError && authError.status !== 400) { // 400 is expected for no user
      throw authError;
    }
    console.log('✅ Client connection successful\n');

    // Test server-side connection if service key exists
    if (supabaseServiceKey) {
      console.log('🔗 Testing server connection...');
      const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);
      
      // Test a simple query (will fail if tables don't exist, but connection works)
      const { error: queryError } = await supabaseServer
        .from('users')
        .select('count', { count: 'exact' })
        .limit(1);
        
      if (queryError && 
          !queryError.message?.includes('relation "users" does not exist') &&
          !queryError.message?.includes('Could not find the table')) {
        throw queryError;
      }
      
      console.log('✅ Server connection successful');
      if (queryError?.message?.includes('relation "users" does not exist') ||
          queryError?.message?.includes('Could not find the table')) {
        console.log('⚠️  Database schema not yet created (expected for initial setup)');
      }
    }

    console.log('\n🎉 Supabase connection verification complete!');
    console.log('   Ready to proceed with database migration.');
    
  } catch (error) {
    console.error('❌ Supabase connection failed:');
    console.error(error.message);
    process.exit(1);
  }
}

// Run verification
verifySupabaseConnection();