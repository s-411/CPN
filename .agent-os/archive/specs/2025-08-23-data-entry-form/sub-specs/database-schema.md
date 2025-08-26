# Database Schema Specification

This document outlines the database schema requirements for the data entry form feature as part of the CPN onboarding flow.

## Schema Overview

The data entry form operates primarily with session/localStorage during the onboarding flow, with permanent database storage occurring after account creation. However, the schema design must accommodate the future persistence of this data structure.

## Session Data Structure

### Profile + Interaction Combined Schema
```typescript
interface OnboardingData {
  profile: {
    firstName: string;
    age: number;
    ethnicity?: string;
    rating: number; // 5.0-10.0 in 0.5 increments
  };
  interaction: {
    date: Date;
    cost?: number; // USD, optional
    duration: number; // minutes
    outcome: 'success' | 'unsuccessful';
  };
  metadata: {
    createdAt: Date;
    stepCompleted: number; // 2 after data entry
    sessionId: string;
  };
}
```

## Future Database Schema (Post-Account Creation)

### Profiles Table Enhancement
```sql
-- Extends existing users table or creates profiles table
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_data JSONB;
CREATE INDEX IF NOT EXISTS idx_users_onboarding_data ON users USING gin(onboarding_data);

-- OR create separate profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(50) NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 99),
  ethnicity VARCHAR(100),
  rating DECIMAL(3,1) NOT NULL CHECK (rating >= 5.0 AND rating <= 10.0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_rating ON profiles(rating);
```

### Interactions Table
```sql
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  interaction_date DATE NOT NULL,
  cost_usd DECIMAL(6,2) CHECK (cost_usd >= 0 AND cost_usd <= 9999.99),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes >= 15 AND duration_minutes <= 480),
  outcome VARCHAR(20) NOT NULL CHECK (outcome IN ('success', 'unsuccessful')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_interactions_user_id ON interactions(user_id);
CREATE INDEX idx_interactions_profile_id ON interactions(profile_id);
CREATE INDEX idx_interactions_date ON interactions(interaction_date);
CREATE INDEX idx_interactions_outcome ON interactions(outcome);
CREATE INDEX idx_interactions_created_at ON interactions(created_at);
```

## Session Storage Schema

### LocalStorage Keys
```typescript
// Session data keys for onboarding flow
const SESSION_KEYS = {
  ONBOARDING_PROFILE: 'cpn_onboarding_profile',
  ONBOARDING_INTERACTION: 'cpn_onboarding_interaction',
  ONBOARDING_STEP: 'cpn_onboarding_step',
  SESSION_ID: 'cpn_session_id'
} as const;
```

### Session Data Validation Schema (Zod)
```typescript
import { z } from 'zod';

export const ProfileSchema = z.object({
  firstName: z.string().min(2).max(50).trim(),
  age: z.number().int().min(18).max(99),
  ethnicity: z.string().optional(),
  rating: z.number().min(5.0).max(10.0).multipleOf(0.5)
});

export const InteractionSchema = z.object({
  date: z.date().max(new Date()).min(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), // within last 30 days
  cost: z.number().min(0).max(999.99).optional(),
  duration: z.number().int().min(15).max(480), // 15 minutes to 8 hours
  outcome: z.enum(['success', 'unsuccessful'])
});

export const OnboardingDataSchema = z.object({
  profile: ProfileSchema,
  interaction: InteractionSchema,
  metadata: z.object({
    createdAt: z.date(),
    stepCompleted: z.number().int().min(1).max(4),
    sessionId: z.string().uuid()
  })
});
```

## Data Migration Strategy

### Session to Database Migration
```sql
-- Migration function for converting session data to permanent storage
-- Called after successful account creation
CREATE OR REPLACE FUNCTION migrate_onboarding_data(
  p_user_id UUID,
  p_onboarding_data JSONB
) RETURNS VOID AS $$
DECLARE
  v_profile_id UUID;
BEGIN
  -- Insert profile data
  INSERT INTO profiles (user_id, first_name, age, ethnicity, rating)
  VALUES (
    p_user_id,
    (p_onboarding_data->'profile'->>'firstName'),
    (p_onboarding_data->'profile'->>'age')::INTEGER,
    (p_onboarding_data->'profile'->>'ethnicity'),
    (p_onboarding_data->'profile'->>'rating')::DECIMAL
  )
  RETURNING id INTO v_profile_id;
  
  -- Insert interaction data
  INSERT INTO interactions (user_id, profile_id, interaction_date, cost_usd, duration_minutes, outcome)
  VALUES (
    p_user_id,
    v_profile_id,
    (p_onboarding_data->'interaction'->>'date')::DATE,
    CASE WHEN p_onboarding_data->'interaction'->>'cost' IS NOT NULL 
         THEN (p_onboarding_data->'interaction'->>'cost')::DECIMAL 
         ELSE NULL END,
    (p_onboarding_data->'interaction'->>'duration')::INTEGER,
    (p_onboarding_data->'interaction'->>'outcome')
  );
END;
$$ LANGUAGE plpgsql;
```

## Data Access Patterns

### Session Data Operations
```typescript
// Session data management utilities
export class OnboardingSessionManager {
  static setProfile(profile: ProfileData): void {
    localStorage.setItem(SESSION_KEYS.ONBOARDING_PROFILE, JSON.stringify(profile));
  }
  
  static getProfile(): ProfileData | null {
    const data = localStorage.getItem(SESSION_KEYS.ONBOARDING_PROFILE);
    return data ? JSON.parse(data) : null;
  }
  
  static setInteraction(interaction: InteractionData): void {
    localStorage.setItem(SESSION_KEYS.ONBOARDING_INTERACTION, JSON.stringify(interaction));
  }
  
  static getCombinedData(): OnboardingData | null {
    const profile = this.getProfile();
    const interaction = JSON.parse(localStorage.getItem(SESSION_KEYS.ONBOARDING_INTERACTION) || 'null');
    
    if (profile && interaction) {
      return {
        profile,
        interaction,
        metadata: {
          createdAt: new Date(),
          stepCompleted: 2,
          sessionId: this.getSessionId()
        }
      };
    }
    return null;
  }
}
```

## Performance Considerations

### Session Storage Optimization
- Keep session data minimal and well-structured
- Use JSON compression for larger datasets
- Implement automatic cleanup of expired session data
- Optimize for mobile storage limitations

### Database Query Optimization
- Index on frequently queried columns (user_id, interaction_date, outcome)
- Use composite indexes for complex queries
- Implement proper connection pooling for mobile traffic patterns
- Consider read replicas for analytics queries

## Data Privacy & Security

### Session Data Protection
- Encrypt sensitive data in localStorage using Web Crypto API
- Implement session expiration and automatic cleanup
- Avoid storing PII beyond necessary onboarding requirements

### Database Security
- Use row-level security (RLS) policies for user data isolation
- Implement audit logging for data access patterns
- Encrypt sensitive fields at rest
- Regular backup and recovery procedures

## Future Considerations

### Analytics Schema Extensions
```sql
-- Future analytics table for CPN calculations
CREATE TABLE cpn_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  calculation_date DATE NOT NULL,
  total_cost DECIMAL(8,2),
  total_time_minutes INTEGER,
  success_rate DECIMAL(5,4),
  cpn_score DECIMAL(8,4),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Multi-Profile Support
- Schema designed to support multiple profiles per user in future versions
- Profile-scoped interactions maintain data integrity
- Flexible schema accommodates feature expansion without breaking changes