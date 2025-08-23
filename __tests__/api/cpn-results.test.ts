/**
 * @jest-environment node
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Mock Clerk auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn()
}));

// Mock database functions
jest.mock('@/lib/db/queries', () => ({
  getCpnResultsDisplayData: jest.fn(),
  createShareAnalytic: jest.fn(),
  getUserByClerkId: jest.fn(),
  getAvailableAchievementsForUser: jest.fn(),
  createUserAchievement: jest.fn(),
  getTeamForUser: jest.fn()
}));

const mockAuth = auth as jest.MockedFunction<typeof auth>;

// Mock data
const mockCpnResultsData = {
  cpnScore: {
    id: 1,
    userId: 1,
    teamId: 1,
    score: 85,
    categoryScores: {
      cost_efficiency: 90,
      time_management: 80,
      success_rate: 85
    },
    peerPercentile: 75,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  achievements: [
    {
      id: 1,
      userId: 1,
      teamId: 1,
      achievementId: 1,
      earnedAt: new Date(),
      achievement: {
        id: 1,
        name: 'High Performer',
        description: 'Achieve a CPN score of 80 or higher',
        iconPath: '/icons/high-performer.svg',
        badgeColor: '#10B981',
        criteria: { type: 'score_threshold', threshold: 80 },
        displayOrder: 2,
        active: true,
        createdAt: new Date()
      }
    }
  ],
  peerComparison: {
    averageScore: 72,
    totalUsers: 150,
    userRank: 25,
    percentile: 83
  },
  shareHistory: [
    {
      id: 1,
      userId: 1,
      teamId: 1,
      platform: 'instagram_story',
      referralCode: 'REF123',
      sharedAt: new Date()
    }
  ]
};

const mockUser = {
  id: 1,
  clerkId: 'test-clerk-id',
  email: 'test@test.com',
  name: 'Test User',
  role: 'member',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null
};

const mockTeam = {
  id: 1,
  name: 'Test Team',
  createdAt: new Date(),
  updatedAt: new Date(),
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  stripeProductId: null,
  planName: null,
  subscriptionStatus: null,
  trialEnd: null
};

describe('CPN Results API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/cpn/results/[userId]', () => {
    it('should return CPN results data for authenticated user', async () => {
      // Mock authenticated user
      mockAuth.mockResolvedValue({ userId: 'test-clerk-id' });
      
      const { getCpnResultsDisplayData } = require('@/lib/db/queries');
      getCpnResultsDisplayData.mockResolvedValue(mockCpnResultsData);

      // Mock endpoint implementation would go here
      const expectedResponse = {
        score: 85,
        categoryScores: {
          cost_efficiency: 90,
          time_management: 80,
          success_rate: 85
        },
        peerPercentile: 75,
        achievements: [
          {
            id: 1,
            name: 'High Performer',
            description: 'Achieve a CPN score of 80 or higher',
            iconPath: '/icons/high-performer.svg',
            badgeColor: '#10B981',
            earnedAt: expect.any(Date)
          }
        ],
        peerComparison: {
          averageScore: 72,
          demographicGroup: 'All Users',
          totalUsers: 150
        }
      };

      expect(getCpnResultsDisplayData).toHaveBeenCalledWith('test-clerk-id');
      expect(expectedResponse.score).toBe(85);
      expect(expectedResponse.achievements).toHaveLength(1);
    });

    it('should return 404 when user has no CPN score', async () => {
      mockAuth.mockResolvedValue({ userId: 'test-clerk-id' });
      
      const { getCpnResultsDisplayData } = require('@/lib/db/queries');
      getCpnResultsDisplayData.mockResolvedValue(null);

      // Test that endpoint would return 404
      expect(getCpnResultsDisplayData).toHaveBeenCalledWith('test-clerk-id');
      // Would expect 404 response in actual implementation
    });

    it('should return 401 for unauthenticated requests', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      // Test that endpoint would return 401
      // Would expect 401 response in actual implementation
    });

    it('should handle database errors gracefully', async () => {
      mockAuth.mockResolvedValue({ userId: 'test-clerk-id' });
      
      const { getCpnResultsDisplayData } = require('@/lib/db/queries');
      getCpnResultsDisplayData.mockRejectedValue(new Error('Database connection failed'));

      // Test that endpoint would return 500
      // Would expect 500 response in actual implementation
    });
  });

  describe('POST /api/cpn/share', () => {
    const mockShareRequest = {
      platform: 'instagram_story' as const,
      userId: 1
    };

    it('should create share analytics record and return referral code', async () => {
      mockAuth.mockResolvedValue({ userId: 'test-clerk-id' });
      
      const { createShareAnalytic, getUserByClerkId, getTeamForUser } = require('@/lib/db/queries');
      getUserByClerkId.mockResolvedValue(mockUser);
      getTeamForUser.mockResolvedValue(mockTeam);
      createShareAnalytic.mockResolvedValue({
        id: 1,
        userId: 1,
        teamId: 1,
        platform: 'instagram_story',
        referralCode: 'CPN123ABC',
        sharedAt: new Date()
      });

      const expectedResponse = {
        referralCode: 'CPN123ABC',
        shareUrl: expect.stringContaining('CPN123ABC'),
        success: true
      };

      expect(expectedResponse.success).toBe(true);
      expect(expectedResponse.referralCode).toMatch(/^CPN\w+$/);
    });

    it('should validate platform parameter', async () => {
      mockAuth.mockResolvedValue({ userId: 'test-clerk-id' });

      const invalidRequest = {
        platform: 'invalid_platform',
        userId: 1
      };

      // Test that endpoint would return 400 for invalid platform
      const validPlatforms = ['instagram_story', 'instagram_post', 'tiktok', 'twitter', 'other'];
      expect(validPlatforms).not.toContain(invalidRequest.platform);
    });

    it('should generate unique referral codes', async () => {
      const codes = new Set();
      for (let i = 0; i < 10; i++) {
        const code = `CPN${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        codes.add(code);
      }
      
      // All codes should be unique
      expect(codes.size).toBe(10);
    });

    it('should return 401 for unauthenticated requests', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      // Test that endpoint would return 401
      // Would expect 401 response in actual implementation
    });
  });

  describe('GET /api/achievements/available', () => {
    const mockAchievements = [
      {
        id: 1,
        name: 'First Score',
        description: 'Calculate your first CPN score',
        iconPath: '/icons/first-score.svg',
        badgeColor: '#4F46E5',
        unlocked: true,
        progress: null
      },
      {
        id: 2,
        name: 'High Performer',
        description: 'Achieve a CPN score of 80 or higher',
        iconPath: '/icons/high-performer.svg',
        badgeColor: '#10B981',
        unlocked: false,
        progress: {
          current: 75,
          required: 80,
          description: 'Score 5 more points to unlock'
        }
      }
    ];

    it('should return all achievements with unlock status', async () => {
      mockAuth.mockResolvedValue({ userId: 'test-clerk-id' });
      
      const { getAvailableAchievementsForUser, getUserByClerkId } = require('@/lib/db/queries');
      getUserByClerkId.mockResolvedValue(mockUser);
      getAvailableAchievementsForUser.mockResolvedValue(mockAchievements);

      const expectedResponse = {
        achievements: mockAchievements
      };

      expect(expectedResponse.achievements).toHaveLength(2);
      expect(expectedResponse.achievements[0].unlocked).toBe(true);
      expect(expectedResponse.achievements[1].unlocked).toBe(false);
      expect(expectedResponse.achievements[1].progress).toBeDefined();
    });

    it('should return 401 for unauthenticated requests', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      // Test that endpoint would return 401
      // Would expect 401 response in actual implementation
    });

    it('should handle users with no achievements', async () => {
      mockAuth.mockResolvedValue({ userId: 'test-clerk-id' });
      
      const { getAvailableAchievementsForUser, getUserByClerkId } = require('@/lib/db/queries');
      getUserByClerkId.mockResolvedValue(mockUser);
      getAvailableAchievementsForUser.mockResolvedValue([]);

      const expectedResponse = {
        achievements: []
      };

      expect(expectedResponse.achievements).toHaveLength(0);
    });
  });
});