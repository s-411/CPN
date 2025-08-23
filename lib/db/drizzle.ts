import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

// Get database URL - prefer Supabase direct connection, fallback to local PostgreSQL
const databaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.POSTGRES_URL;

if (!databaseUrl) {
  throw new Error('Database URL is not set. Please provide SUPABASE_DATABASE_URL or POSTGRES_URL');
}

// Create PostgreSQL client with appropriate configuration
export const client = postgres(databaseUrl, {
  max: 20, // Connection pool size
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });

// Re-export schema for convenience
export { schema };
