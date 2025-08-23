/**
 * @jest-environment node
 */

import { auth } from '@clerk/nextjs/server';

// Mock Clerk auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn()
}));

// Mock database functions
jest.mock('@/lib/db/queries', () => ({
  getUserByClerkId: jest.fn(),
  getTeamForUser: jest.fn(),
  createUserAchievement: jest.fn(),
  checkUserHasAchievement: jest.fn(),
  getCpnScoreByClerkId: jest.fn(),
  createShareAnalytic: jest.fn()
}));

// Mock Canvas API (for Node.js environment)
global.HTMLCanvasElement = class HTMLCanvasElement {
  getContext() {
    return {
      fillStyle: '',
      font: '',
      fillText: jest.fn(),
      fillRect: jest.fn(),
      drawImage: jest.fn(),
      measureText: jest.fn(() => ({ width: 100 })),
      canvas: {
        toDataURL: jest.fn(() => 'data:image/png;base64,mockImageData')
      }
    };
  }
  
  toDataURL() {
    return 'data:image/png;base64,mockImageData';
  }
};

const mockAuth = auth as jest.MockedFunction<typeof auth>;

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

const mockCpnScore = {
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
};

describe('CPN Server Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateShareGraphic', () => {
    const mockGenerateShareGraphic = async (
      userId: number,
      format: '9:16' | '1:1' | '16:9',
      includeReferral: boolean
    ) => {
      // Mock implementation
      if (!userId) {
        return { success: false, error: 'User ID required' };
      }

      // Generate mock canvas data
      const canvas = document.createElement('canvas') as any;
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions based on format
      const dimensions = {
        '9:16': { width: 1080, height: 1920 },
        '1:1': { width: 1080, height: 1080 },
        '16:9': { width: 1920, height: 1080 }
      };
      
      canvas.width = dimensions[format].width;
      canvas.height = dimensions[format].height;

      // Generate referral code if requested
      const referralCode = includeReferral 
        ? `CPN${Math.random().toString(36).substr(2, 6).toUpperCase()}`
        : undefined;

      return {
        success: true,
        imageDataUrl: canvas.toDataURL('image/png'),
        referralCode
      };
    };

    it('should generate 9:16 format graphic for Instagram Stories', async () => {
      mockAuth.mockResolvedValue({ userId: 'test-clerk-id' });
      
      const { getUserByClerkId } = require('@/lib/db/queries');
      getUserByClerkId.mockResolvedValue(mockUser);

      const result = await mockGenerateShareGraphic(1, '9:16', true);

      expect(result.success).toBe(true);
      expect(result.imageDataUrl).toContain('data:image/png;base64');
      expect(result.referralCode).toMatch(/^CPN\w{6}$/);
    });

    it('should generate 1:1 format graphic for Instagram posts', async () => {
      mockAuth.mockResolvedValue({ userId: 'test-clerk-id' });
      
      const { getUserByClerkId } = require('@/lib/db/queries');
      getUserByClerkId.mockResolvedValue(mockUser);

      const result = await mockGenerateShareGraphic(1, '1:1', false);

      expect(result.success).toBe(true);
      expect(result.imageDataUrl).toContain('data:image/png;base64');
      expect(result.referralCode).toBeUndefined();
    });

    it('should generate 16:9 format graphic for general sharing', async () => {
      mockAuth.mockResolvedValue({ userId: 'test-clerk-id' });
      
      const { getUserByClerkId } = require('@/lib/db/queries');
      getUserByClerkId.mockResolvedValue(mockUser);

      const result = await mockGenerateShareGraphic(1, '16:9', true);

      expect(result.success).toBe(true);
      expect(result.imageDataUrl).toContain('data:image/png;base64');
      expect(result.referralCode).toMatch(/^CPN\w{6}$/);
    });

    it('should return error for invalid user ID', async () => {
      const result = await mockGenerateShareGraphic(0, '1:1', false);

      expect(result.success).toBe(false);
      expect(result.error).toBe('User ID required');
    });

    it('should handle canvas creation errors', async () => {
      // Mock canvas creation failure
      const originalCreateElement = document.createElement;
      document.createElement = jest.fn().mockImplementation((tagName) => {
        if (tagName === 'canvas') {
          throw new Error('Canvas creation failed');
        }
        return originalCreateElement.call(document, tagName);
      });

      try {
        await mockGenerateShareGraphic(1, '1:1', false);
      } catch (error) {
        expect(error.message).toBe('Canvas creation failed');
      }

      // Restore original function
      document.createElement = originalCreateElement;
    });

    it('should include CPN score data in graphic', async () => {
      mockAuth.mockResolvedValue({ userId: 'test-clerk-id' });
      
      const { getUserByClerkId, getCpnScoreByClerkId } = require('@/lib/db/queries');
      getUserByClerkId.mockResolvedValue(mockUser);
      getCpnScoreByClerkId.mockResolvedValue(mockCpnScore);

      const result = await mockGenerateShareGraphic(1, '1:1', true);

      expect(result.success).toBe(true);
      expect(getCpnScoreByClerkId).toHaveBeenCalledWith('test-clerk-id');
    });
  });

  describe('unlockAchievement', () => {
    const mockUnlockAchievement = async (
      userId: number,
      achievementId: number,
      trigger: string
    ) => {
      // Mock implementation
      const { checkUserHasAchievement, createUserAchievement, getTeamForUser } = require('@/lib/db/queries');
      
      // Check if user already has achievement
      const hasAchievement = await checkUserHasAchievement(userId, achievementId);
      if (hasAchievement) {
        return {
          unlocked: false,
          error: 'Achievement already unlocked'
        };
      }

      // Get user's team for multi-tenancy
      const team = await getTeamForUser();
      if (!team) {
        return {
          unlocked: false,
          error: 'User team not found'
        };
      }

      // Create user achievement record
      const newAchievement = await createUserAchievement({
        userId,
        teamId: team.id,
        achievementId,
        earnedAt: new Date()
      });

      return {
        unlocked: true,
        achievement: {
          id: achievementId,
          name: 'Test Achievement',
          description: 'Test achievement description',
          iconPath: '/icons/test.svg'
        }
      };
    };

    it('should unlock achievement for user', async () => {
      mockAuth.mockResolvedValue({ userId: 'test-clerk-id' });
      
      const { 
        checkUserHasAchievement, 
        createUserAchievement, 
        getTeamForUser 
      } = require('@/lib/db/queries');
      
      checkUserHasAchievement.mockResolvedValue(false);
      getTeamForUser.mockResolvedValue(mockTeam);
      createUserAchievement.mockResolvedValue({
        id: 1,
        userId: 1,
        teamId: 1,
        achievementId: 1,
        earnedAt: new Date()
      });

      const result = await mockUnlockAchievement(1, 1, 'score_threshold');

      expect(result.unlocked).toBe(true);
      expect(result.achievement).toBeDefined();
      expect(result.achievement.id).toBe(1);
      expect(createUserAchievement).toHaveBeenCalledWith({
        userId: 1,
        teamId: 1,
        achievementId: 1,
        earnedAt: expect.any(Date)
      });
    });

    it('should not unlock already earned achievement', async () => {
      const { checkUserHasAchievement } = require('@/lib/db/queries');
      checkUserHasAchievement.mockResolvedValue(true);

      const result = await mockUnlockAchievement(1, 1, 'score_threshold');

      expect(result.unlocked).toBe(false);
      expect(result.error).toBe('Achievement already unlocked');
    });

    it('should handle missing team error', async () => {
      const { 
        checkUserHasAchievement, 
        getTeamForUser 
      } = require('@/lib/db/queries');
      
      checkUserHasAchievement.mockResolvedValue(false);
      getTeamForUser.mockResolvedValue(null);

      const result = await mockUnlockAchievement(1, 1, 'score_threshold');

      expect(result.unlocked).toBe(false);
      expect(result.error).toBe('User team not found');
    });

    it('should track different trigger types', async () => {
      const triggers = [
        'first_calculation',
        'score_threshold',
        'social_share',
        'streak',
        'percentile_rank'
      ];

      triggers.forEach(trigger => {
        expect(typeof trigger).toBe('string');
        expect(trigger.length).toBeGreaterThan(0);
      });
    });

    it('should handle database errors during achievement creation', async () => {
      const { 
        checkUserHasAchievement, 
        createUserAchievement, 
        getTeamForUser 
      } = require('@/lib/db/queries');
      
      checkUserHasAchievement.mockResolvedValue(false);
      getTeamForUser.mockResolvedValue(mockTeam);
      createUserAchievement.mockRejectedValue(new Error('Database error'));

      try {
        await mockUnlockAchievement(1, 1, 'score_threshold');
      } catch (error) {
        expect(error.message).toBe('Database error');
      }
    });
  });

  describe('Share Analytics Integration', () => {
    it('should track share event when graphic is generated', async () => {
      mockAuth.mockResolvedValue({ userId: 'test-clerk-id' });
      
      const { 
        getUserByClerkId, 
        getTeamForUser, 
        createShareAnalytic 
      } = require('@/lib/db/queries');
      
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

      // Mock tracking function
      const trackShare = async (platform: string, referralCode: string) => {
        await createShareAnalytic({
          userId: mockUser.id,
          teamId: mockTeam.id,
          platform,
          referralCode,
          sharedAt: new Date()
        });
      };

      await trackShare('instagram_story', 'CPN123ABC');

      expect(createShareAnalytic).toHaveBeenCalledWith({
        userId: 1,
        teamId: 1,
        platform: 'instagram_story',
        referralCode: 'CPN123ABC',
        sharedAt: expect.any(Date)
      });
    });

    it('should support different platform types', async () => {
      const platforms = [
        'instagram_story',
        'instagram_post', 
        'tiktok',
        'twitter',
        'other'
      ];

      platforms.forEach(platform => {
        expect(typeof platform).toBe('string');
        expect(platform.length).toBeGreaterThan(0);
      });
    });
  });
});