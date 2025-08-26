// @ts-nocheck
import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations", 
  driver: "pg",
  dbCredentials: {
    // Use SUPABASE_DATABASE_URL if present, otherwise POSTGRES_URL
    connectionString: process.env.SUPABASE_DATABASE_URL ?? process.env.POSTGRES_URL!,
  },
});
