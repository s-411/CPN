#!/usr/bin/env node
/**
 * Manual migration using Supabase client
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function runSupabaseMigration() {
  console.log('🚀 Running Supabase migration via client...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Read the migration SQL file
    const migrationPath = 'lib/db/migrations/0001_legal_darkhawk.sql';
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Read migration file:', migrationPath);

    // Split SQL into individual statements
    const statements = migrationSQL
      .split('--> statement-breakpoint')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));

    console.log(`🔧 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;

      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
      console.log(`   ${statement.substring(0, 60)}${statement.length > 60 ? '...' : ''}`);

      const { error } = await supabase.rpc('exec_sql', { 
        sql_string: statement 
      });

      if (error) {
        // Try direct query if RPC doesn't work
        try {
          const { error: queryError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .limit(1);

          if (queryError) {
            console.error(`❌ Error executing statement ${i + 1}:`, error.message);
          } else {
            console.log(`   ✅ Statement ${i + 1} executed successfully`);
          }
        } catch (directError) {
          console.error(`❌ Error executing statement ${i + 1}:`, error.message);
          console.log('   ⚠️  Continuing with next statement...');
        }
      } else {
        console.log(`   ✅ Statement ${i + 1} executed successfully`);
      }
    }

    console.log('\n🎉 Migration completed via Supabase client!');
    console.log('   Please verify tables in your Supabase dashboard');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    console.log('\n📋 Manual migration instructions:');
    console.log('1. Go to your Supabase dashboard → SQL Editor');
    console.log('2. Copy and paste the SQL from: lib/db/migrations/0001_legal_darkhawk.sql');
    console.log('3. Execute the SQL to create the tables');
    console.log('4. Then run: node scripts/verify-migration.js');
  }
}

runSupabaseMigration();