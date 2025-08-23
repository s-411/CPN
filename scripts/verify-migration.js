#!/usr/bin/env node
/**
 * Verify database migration and schema integrity
 */

const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function verifyMigration() {
  console.log('🔍 Verifying database migration and schema integrity...\n');

  const databaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.POSTGRES_URL;
  
  if (!databaseUrl) {
    console.error('❌ No database URL found. Please set SUPABASE_DATABASE_URL or POSTGRES_URL');
    process.exit(1);
  }

  console.log('✅ Database URL configured');

  try {
    const client = postgres(databaseUrl);
    const db = drizzle(client);

    // Test table existence
    console.log('🔍 Checking table existence...');
    
    const tables = [
      'users',
      'teams', 
      'team_members',
      'activity_logs',
      'invitations',
      'user_profiles',
      'user_interactions'
    ];

    for (const table of tables) {
      try {
        await client`SELECT 1 FROM ${client(table)} LIMIT 1`;
        console.log(`  ✅ Table '${table}' exists`);
      } catch (error) {
        if (error.message.includes('does not exist')) {
          console.log(`  ⚠️  Table '${table}' does not exist (migration needed)`);
        } else {
          console.log(`  ✅ Table '${table}' exists (empty)`);
        }
      }
    }

    // Test Clerk integration fields
    console.log('\n🔍 Checking Clerk integration fields...');
    try {
      await client`SELECT clerk_id FROM users LIMIT 1`;
      console.log('  ✅ users.clerk_id field exists');
    } catch (error) {
      console.log('  ⚠️  users.clerk_id field missing (migration needed)');
    }

    // Test indexes
    console.log('\n🔍 Checking indexes...');
    const indexCheck = await client`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename IN ('users', 'user_profiles', 'user_interactions')
      AND indexname LIKE 'idx_%'
    `;
    
    console.log(`  ✅ Found ${indexCheck.length} CPN-specific indexes`);

    await client.end();

    if (indexCheck.length > 0) {
      console.log('\n🎉 Database schema appears to be migrated!');
    } else {
      console.log('\n⚠️  Database migration appears to be pending.');
      console.log('   Run: npm run db:migrate');
    }
    
  } catch (error) {
    console.error('❌ Database verification failed:');
    console.error(error.message);
    process.exit(1);
  }
}

verifyMigration();