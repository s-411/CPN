# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-08-23-cpn-result-display-page/spec.md

## Endpoints

### GET /api/cpn/results/[userId]

**Purpose:** Fetch CPN score results and achievement data for the results page
**Parameters:** 
- `userId` (path parameter): User ID to fetch results for
**Response:** 
```typescript
{
  score: number;
  categoryScores: Record<string, number>;
  peerPercentile: number;
  achievements: Array<{
    id: number;
    name: string;
    description: string;
    iconPath: string;
    badgeColor: string;
    earnedAt: string;
  }>;
  peerComparison: {
    averageScore: number;
    demographicGroup: string;
    totalUsers: number;
  };
}
```
**Errors:** 
- 404: User not found or no CPN score available
- 401: Unauthorized access
- 500: Server error

### POST /api/cpn/share

**Purpose:** Track social sharing events and generate referral codes
**Parameters:** 
```typescript
{
  platform: 'instagram_story' | 'instagram_post' | 'tiktok' | 'twitter' | 'other';
  userId: number;
}
```
**Response:** 
```typescript
{
  referralCode: string;
  shareUrl: string;
  success: boolean;
}
```
**Errors:** 
- 400: Invalid platform or missing parameters
- 401: Unauthorized access
- 500: Server error

### GET /api/achievements/available

**Purpose:** Fetch all available achievements with unlock criteria
**Parameters:** None (uses authenticated user context)
**Response:** 
```typescript
{
  achievements: Array<{
    id: number;
    name: string;
    description: string;
    iconPath: string;
    badgeColor: string;
    unlocked: boolean;
    progress?: {
      current: number;
      required: number;
      description: string;
    };
  }>;
}
```
**Errors:** 
- 401: Unauthorized access
- 500: Server error

## Server Actions

### generateShareGraphic

**Purpose:** Generate optimized social media graphics using Canvas API
**Parameters:** 
```typescript
{
  userId: number;
  format: '9:16' | '1:1' | '16:9';
  includeReferral: boolean;
}
```
**Response:** 
```typescript
{
  imageDataUrl: string;
  referralCode?: string;
  success: boolean;
  error?: string;
}
```

### unlockAchievement

**Purpose:** Process achievement unlocking based on user actions
**Parameters:** 
```typescript
{
  userId: number;
  achievementId: number;
  trigger: string;
}
```
**Response:** 
```typescript
{
  unlocked: boolean;
  achievement?: {
    id: number;
    name: string;
    description: string;
    iconPath: string;
  };
  error?: string;
}
```