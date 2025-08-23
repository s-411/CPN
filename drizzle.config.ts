import type { Config } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default {
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // Use SUPABASE_DATABASE_URL for direct PostgreSQL connection or fallback to POSTGRES_URL
    url: process.env.SUPABASE_DATABASE_URL || process.env.POSTGRES_URL!,
  },
} satisfies Config;
