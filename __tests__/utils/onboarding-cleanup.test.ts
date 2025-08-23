import { createOnboardingCleanupManager } from '@/lib/utils/onboarding-cleanup'

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null)
  }
})()

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
})

// Mock Date.now
const mockDateNow = jest.fn()
Date.now = mockDateNow

describe('OnboardingCleanupManager', () => {
  let cleanupManager: ReturnType<typeof createOnboardingCleanupManager>
  const currentTime = 1640995200000 // Jan 1, 2022 00:00:00 GMT

  beforeEach(() => {
    mockSessionStorage.clear()
    jest.clearAllMocks()
    mockDateNow.mockReturnValue(currentTime)
    cleanupManager = createOnboardingCleanupManager()
  })

  describe('initSession', () => {
    it('should set session timestamp on first init', () => {
      cleanupManager.initSession()

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'cpn_onboarding_session_start',
        currentTime.toString()
      )
    })

    it('should not overwrite existing session timestamp', () => {
      // Pre-populate store directly
      const store = (mockSessionStorage as any).getItem.mock.calls = []
      mockSessionStorage.setItem('cpn_onboarding_session_start', '123456789')
      
      // Clear the mock calls from setup
      jest.clearAllMocks()

      cleanupManager.initSession()

      // Should only call getItem to check, not setItem to overwrite
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('cpn_onboarding_session_start')
      expect(mockSessionStorage.setItem).not.toHaveBeenCalled()
    })
  })

  describe('getSessionAge', () => {
    it('should return correct session age', () => {
      const sessionStart = currentTime - 60 * 60 * 1000 // 1 hour ago
      mockSessionStorage.setItem('cpn_onboarding_session_start', sessionStart.toString())

      const age = cleanupManager.getSessionAge()

      expect(age).toBe(60 * 60 * 1000) // 1 hour in milliseconds
    })

    it('should return 0 when no session timestamp exists', () => {
      const age = cleanupManager.getSessionAge()

      expect(age).toBe(0)
    })

    it('should handle invalid timestamp gracefully', () => {
      mockSessionStorage.setItem('cpn_onboarding_session_start', 'invalid')

      const age = cleanupManager.getSessionAge()

      expect(age).toBe(0)
    })
  })

  describe('isSessionExpired', () => {
    it('should return true when session is expired', () => {
      const sessionStart = currentTime - 8 * 24 * 60 * 60 * 1000 // 8 days ago
      mockSessionStorage.setItem('cpn_onboarding_session_start', sessionStart.toString())

      const isExpired = cleanupManager.isSessionExpired()

      expect(isExpired).toBe(true)
    })

    it('should return false when session is not expired', () => {
      const sessionStart = currentTime - 6 * 24 * 60 * 60 * 1000 // 6 days ago
      mockSessionStorage.setItem('cpn_onboarding_session_start', sessionStart.toString())

      const isExpired = cleanupManager.isSessionExpired()

      expect(isExpired).toBe(false)
    })

    it('should use custom max age', () => {
      const sessionStart = currentTime - 2 * 60 * 60 * 1000 // 2 hours ago
      mockSessionStorage.setItem('cpn_onboarding_session_start', sessionStart.toString())

      const isExpired = cleanupManager.isSessionExpired(60 * 60 * 1000) // 1 hour max age

      expect(isExpired).toBe(true)
    })
  })

  describe('cleanup', () => {
    it('should skip cleanup when recently cleaned', () => {
      const recentCleanup = currentTime - 30 * 60 * 1000 // 30 minutes ago
      mockSessionStorage.setItem('cpn_onboarding_cleanup_last', recentCleanup.toString())

      const result = cleanupManager.cleanup()

      expect(result).toEqual({
        cleaned: false,
        reason: 'Recently cleaned'
      })
    })

    it('should clean expired session when preserveCurrentSession is false', () => {
      const oldSession = currentTime - 8 * 24 * 60 * 60 * 1000 // 8 days ago
      mockSessionStorage.setItem('cpn_onboarding_session_start', oldSession.toString())
      mockSessionStorage.setItem('cpn_onboarding_profile', '{"firstName":"John"}')

      const result = cleanupManager.cleanup({
        preserveCurrentSession: false
      })

      expect(result).toEqual({
        cleaned: true,
        reason: 'Session expired'
      })
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('cpn_onboarding_session_start')
    })

    it('should clean incomplete expired sessions when onlyIncomplete is true', () => {
      const oldSession = currentTime - 8 * 24 * 60 * 60 * 1000 // 8 days ago
      mockSessionStorage.setItem('cpn_onboarding_session_start', oldSession.toString())
      mockSessionStorage.setItem('cpn_onboarding_profile', '{"firstName":"John"}') // Incomplete

      const result = cleanupManager.cleanup({
        onlyIncomplete: true
      })

      expect(result).toEqual({
        cleaned: true,
        reason: 'Incomplete session expired'
      })
    })

    it('should not clean complete sessions when onlyIncomplete is true', () => {
      const oldSession = currentTime - 8 * 24 * 60 * 60 * 1000 // 8 days ago
      mockSessionStorage.setItem('cpn_onboarding_session_start', oldSession.toString())
      // Mock complete session
      mockSessionStorage.setItem('cpn_onboarding_profile', '{"firstName":"John"}')
      mockSessionStorage.setItem('cpn_onboarding_dataEntry', '{"date":"2025-01-01"}')
      mockSessionStorage.setItem('cpn_onboarding_result', '{"cpn":10}')

      const result = cleanupManager.cleanup({
        onlyIncomplete: true
      })

      expect(result.cleaned).toBe(false)
      expect(mockSessionStorage.removeItem).not.toHaveBeenCalledWith('cpn_onboarding_profile')
    })

    it('should update cleanup timestamp after cleanup attempt', () => {
      const result = cleanupManager.cleanup()

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'cpn_onboarding_cleanup_last',
        currentTime.toString()
      )
    })
  })

  describe('forceCleanup', () => {
    it('should remove all onboarding data and timestamps', () => {
      mockSessionStorage.setItem('cpn_onboarding_profile', '{"firstName":"John"}')
      mockSessionStorage.setItem('cpn_onboarding_session_start', currentTime.toString())
      mockSessionStorage.setItem('cpn_onboarding_cleanup_last', currentTime.toString())

      cleanupManager.forceCleanup()

      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('cpn_onboarding_profile')
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('cpn_onboarding_session_start')
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('cpn_onboarding_cleanup_last')
    })
  })

  describe('getCleanupStatus', () => {
    it('should return correct cleanup status', () => {
      const sessionStart = currentTime - 2 * 60 * 60 * 1000 // 2 hours ago
      const lastCleanup = currentTime - 2 * 60 * 60 * 1000 // 2 hours ago
      
      mockSessionStorage.setItem('cpn_onboarding_session_start', sessionStart.toString())
      mockSessionStorage.setItem('cpn_onboarding_cleanup_last', lastCleanup.toString())

      const status = cleanupManager.getCleanupStatus()

      expect(status).toEqual({
        sessionAge: 2 * 60 * 60 * 1000,
        lastCleanup: lastCleanup,
        isExpired: false,
        needsCleanup: true
      })
    })
  })

  describe('validateSessionIntegrity', () => {
    it('should validate session data successfully', () => {
      mockSessionStorage.setItem('cpn_onboarding_profile', '{"firstName":"John","age":25}')
      
      const validation = cleanupManager.validateSessionIntegrity()

      expect(validation.isValid).toBe(true)
      expect(validation.errors).toEqual([])
    })

    it('should detect corrupted data', () => {
      // Mock corrupted data that can't be serialized
      const originalStringify = JSON.stringify
      JSON.stringify = jest.fn().mockImplementationOnce(() => {
        throw new Error('Circular reference')
      }).mockImplementation(originalStringify)

      mockSessionStorage.setItem('cpn_onboarding_profile', '{"firstName":"John"}')
      
      const validation = cleanupManager.validateSessionIntegrity()

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('Corrupted data in step: profile')
      
      JSON.stringify = originalStringify
    })

    it('should warn about old sessions', () => {
      const oldSession = currentTime - 8 * 24 * 60 * 60 * 1000 // 8 days ago
      mockSessionStorage.setItem('cpn_onboarding_session_start', oldSession.toString())
      
      const validation = cleanupManager.validateSessionIntegrity()

      expect(validation.warnings).toContain('Session is older than recommended maximum age')
    })
  })

  describe('autoInit', () => {
    it('should initialize session and schedule cleanup', (done) => {
      const initSpy = jest.spyOn(cleanupManager, 'initSession')
      const cleanupSpy = jest.spyOn(cleanupManager, 'cleanup')

      cleanupManager.autoInit()

      expect(initSpy).toHaveBeenCalled()

      // Wait for setTimeout to execute
      setTimeout(() => {
        expect(cleanupSpy).toHaveBeenCalledWith({
          onlyIncomplete: true,
          preserveCurrentSession: true
        })
        done()
      }, 1100)
    })
  })
})