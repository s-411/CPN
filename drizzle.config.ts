// @ts-nocheck
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    // Use SUPABASE_DATABASE_URL if present, otherwise POSTGRES_URL
    url: process.env.SUPABASE_DATABASE_URL ?? process.env.POSTGRES_URL!,
  },
});
