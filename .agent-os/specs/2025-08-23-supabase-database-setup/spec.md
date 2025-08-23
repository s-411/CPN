# Spec Requirements Document

> Spec: Supabase Database Setup
> Created: 2025-08-23

## Overview

Migrate the CPN application from local PostgreSQL + Drizzle ORM to Supabase to enable cloud-based user data persistence and support Clerk authentication integration. This migration will provide the foundational database infrastructure needed for user account management, subscription tracking, and multi-tenant data isolation while preserving existing schema and development workflows.

## User Stories

### Database Migration for Developers
As a developer working on the CPN project, I want to migrate from local PostgreSQL to Supabase, so that we have a cloud-based database that supports production deployment and team collaboration.

The migration should preserve all existing tables (users, teams, teamMembers, activityLogs, invitations) while adding Clerk user ID mapping fields. The development workflow should remain unchanged with the same npm scripts and Drizzle ORM integration.

### Clerk Authentication Integration Support
As a system architect, I want the database schema to support Clerk user IDs, so that we can seamlessly integrate magic link authentication without losing existing user relationships.

The database must include clerk_id fields in relevant tables to link Clerk users to internal user records, profile data, and team memberships. This enables the planned transition from JWT-based auth to Clerk while maintaining data integrity.

### Multi-tenant Data Security
As a SaaS application owner, I want Supabase Row Level Security (RLS) policies configured, so that user data is properly isolated between different teams and accounts.

RLS policies should enforce team-based access control, ensuring users can only access data for teams they belong to. This maintains the existing multi-tenant architecture while leveraging Supabase's built-in security features.

## Spec Scope

1. **Database Migration** - Move from local PostgreSQL to Supabase while preserving all existing schema and relationships
2. **Clerk Integration Schema** - Add clerk_id fields to support user authentication mapping and data persistence
3. **Row Level Security** - Implement RLS policies for multi-tenant data isolation and team-based access control
4. **Environment Configuration** - Update connection strings and environment variables for Supabase integration
5. **Development Workflow** - Maintain existing npm scripts and Drizzle ORM commands with Supabase backend

## Out of Scope

- Data migration from existing local databases (new installation assumed)
- Clerk authentication implementation (handled in separate spec)
- Stripe subscription schema changes (handled in separate billing spec)
- UI/frontend changes (database migration only)
- Performance optimization beyond basic indexing

## Expected Deliverable

1. **Functional Supabase Database** - CPN application connects to Supabase with all existing tables and relationships working
2. **Clerk-Ready Schema** - Database includes clerk_id fields and proper constraints for authentication integration
3. **Secure Multi-tenancy** - RLS policies enforce team-based data isolation and proper access control