# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-08-23-cpn-result-display-page/spec.md

## Database Changes

### New Tables

1. **cpn_scores** - Store calculated CPN scores for users
```sql
CREATE TABLE cpn_scores (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  category_scores JSONB NOT NULL, -- Store individual category breakdowns
  peer_percentile INTEGER CHECK (peer_percentile >= 0 AND peer_percentile <= 100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

2. **achievements** - Define available achievement badges
```sql
CREATE TABLE achievements (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon_path VARCHAR(255) NOT NULL,
  badge_color VARCHAR(7) NOT NULL, -- Hex color code
  criteria JSONB NOT NULL, -- Achievement unlock criteria
  display_order INTEGER NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

3. **user_achievements** - Track which achievements users have earned
```sql
CREATE TABLE user_achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, achievement_id)
);
```

4. **share_analytics** - Track social sharing activity
```sql
CREATE TABLE share_analytics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL, -- 'instagram_story', 'instagram_post', 'tiktok', etc.
  referral_code VARCHAR(20) NOT NULL,
  shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes

```sql
CREATE INDEX idx_cpn_scores_user_id ON cpn_scores(user_id);
CREATE INDEX idx_cpn_scores_created_at ON cpn_scores(created_at);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_earned_at ON user_achievements(earned_at);
CREATE INDEX idx_share_analytics_user_id ON share_analytics(user_id);
CREATE INDEX idx_share_analytics_referral_code ON share_analytics(referral_code);
```

## Rationale

**cpn_scores table**: Stores the calculated CPN score with category breakdowns in JSONB for flexibility while maintaining query performance. Peer percentile is pre-calculated for fast display.

**achievements system**: Separates achievement definitions from user progress, allowing easy addition of new badges without schema changes. JSONB criteria field enables complex unlock conditions.

**share_analytics table**: Tracks viral sharing effectiveness and referral attribution, critical for measuring growth metrics and user engagement.

**Multi-tenancy**: All tables include team_id to maintain consistency with existing schema patterns and support potential team-based features.