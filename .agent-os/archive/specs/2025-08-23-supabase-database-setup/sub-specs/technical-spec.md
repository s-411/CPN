# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-23-supabase-database-setup/spec.md

## Technical Requirements

### Supabase Project Configuration
- Create new Supabase project with PostgreSQL 15+
- Configure project settings for production-ready deployment
- Set up proper authentication and API settings
- Generate and secure project API keys and connection strings

### Database Schema Migration
- Preserve existing Drizzle ORM schema definitions in `lib/db/schema.ts`
- Add `clerk_id` varchar field to `users` table with unique constraint
- Add `clerk_id` varchar field to `user_profiles` table for profile linking
- Maintain all existing foreign key relationships and constraints
- Preserve soft delete functionality with `deletedAt` timestamps

### Row Level Security Implementation
- Enable RLS on all user-data tables (users, teams, teamMembers, activityLogs)
- Create policy for team-based data isolation: users can only access their team's data
- Implement user-level policies for personal data (profiles, individual activities)
- Create service role policies for system operations and administrative tasks

### Environment Configuration
- Replace `POSTGRES_URL` with `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Add `SUPABASE_SERVICE_KEY` for server-side operations
- Update connection string format for Supabase pooling
- Configure development vs production environment separation

### Drizzle ORM Integration
- Update Drizzle configuration to use Supabase connection
- Maintain existing migration commands: `db:generate`, `db:migrate`, `db:studio`
- Configure Drizzle to work with Supabase's connection pooling
- Test all existing database operations and queries

### Development Workflow Preservation
- Keep all existing npm scripts functional: `db:setup`, `db:seed`, `db:migrate`
- Ensure `db:studio` works with Supabase database
- Maintain seed data functionality for development environment
- Preserve existing query functions in `lib/db/queries.ts`

## External Dependencies

**@supabase/supabase-js** - Official Supabase JavaScript client
- **Justification:** Required for Supabase connection and real-time features
- **Version:** ^2.39.0 or latest stable

**postgres** - PostgreSQL driver (existing)
- **Justification:** Maintained for Drizzle ORM compatibility with Supabase
- **Version:** Keep existing version for consistency

No other new dependencies required - leveraging existing Drizzle ORM and PostgreSQL driver setup.

## Performance Considerations

### Database Indexing
- Add composite index on `(clerk_id, team_id)` for efficient user-team queries
- Index `clerk_id` fields for fast authentication lookups
- Maintain existing indexes on `email`, `team_id`, and `created_at` fields

### Connection Pooling
- Configure Supabase connection pooling for optimal performance
- Set appropriate pool size limits based on application requirements
- Enable connection reuse for reduced latency

### Query Optimization
- Review and optimize existing queries for Supabase environment
- Implement proper query batching where applicable
- Monitor query performance with Supabase dashboard analytics

## Security Requirements

### API Key Management
- Store Supabase keys securely in environment variables
- Use service role key only for server-side operations
- Implement key rotation strategy for production deployment

### RLS Policy Testing
- Create comprehensive test suite for RLS policies
- Verify data isolation between different teams/users
- Test edge cases and potential security vulnerabilities

### Data Encryption
- Leverage Supabase's built-in encryption at rest
- Ensure sensitive data fields are properly protected
- Implement additional encryption for PII if required