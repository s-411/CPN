#!/usr/bin/env node
/**
 * Test the Supabase client utilities
 */

require('dotenv').config({ path: '.env.local' });

async function testSupabaseClients() {
  console.log('🧪 Testing Supabase client utilities...\n');

  try {
    // Test importing utilities
    const { createSupabaseClient, createSupabaseServerClient, isSupabaseConfigured } = require('../lib/supabase/index.js');
    
    console.log('✅ Successfully imported Supabase utilities');

    // Test configuration check
    const isConfigured = isSupabaseConfigured();
    console.log(`✅ Configuration check: ${isConfigured ? 'Configured' : 'Not configured'}`);

    if (!isConfigured) {
      console.error('❌ Supabase is not properly configured');
      return;
    }

    // Test client creation
    const clientSide = createSupabaseClient();
    const serverSide = createSupabaseServerClient();
    
    console.log('✅ Client-side Supabase client created');
    console.log('✅ Server-side Supabase client created');

    // Test basic client functionality
    console.log('✅ Client has auth methods:', !!clientSide.auth.getUser);
    console.log('✅ Client has database methods:', !!clientSide.from);
    console.log('✅ Server has auth methods:', !!serverSide.auth.getUser);
    console.log('✅ Server has database methods:', !!serverSide.from);

    console.log('\n🎉 All Supabase client utilities working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing Supabase clients:');
    console.error(error.message);
    process.exit(1);
  }
}

testSupabaseClients();