'use client'

import { createOnboardingSessionManager, OnboardingStep } from './session-storage'

export interface CleanupOptions {
  maxAge?: number // Maximum age in milliseconds
  onlyIncomplete?: boolean // Only clean incomplete sessions
  preserveCurrentSession?: boolean // Don't clean current session
}

const DEFAULT_MAX_AGE = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
const CLEANUP_TIMESTAMP_KEY = 'cpn_onboarding_cleanup_last'
const SESSION_TIMESTAMP_KEY = 'cpn_onboarding_session_start'

export function createOnboardingCleanupManager() {
  const sessionManager = createOnboardingSessionManager()

  function safeSessionStorageAccess() {
    if (typeof window === 'undefined') {
      return {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        key: () => null,
        length: 0
      }
    }
    return window.sessionStorage
  }

  return {
    /**
     * Initialize session tracking
     */
    initSession(): void {
      const storage = safeSessionStorageAccess()
      const now = Date.now().toString()
      
      try {
        const existingTimestamp = storage.getItem(SESSION_TIMESTAMP_KEY)
        if (!existingTimestamp) {
          storage.setItem(SESSION_TIMESTAMP_KEY, now)
        }
      } catch (error) {
        console.error('Failed to initialize session timestamp:', error)
      }
    },

    /**
     * Get session age in milliseconds
     */
    getSessionAge(): number {
      const storage = safeSessionStorageAccess()
      
      try {
        const timestamp = storage.getItem(SESSION_TIMESTAMP_KEY)
        if (!timestamp) return 0
        
        const parsedTimestamp = parseInt(timestamp, 10)
        if (isNaN(parsedTimestamp)) return 0
        
        return Date.now() - parsedTimestamp
      } catch (error) {
        console.error('Failed to get session age:', error)
        return 0
      }
    },

    /**
     * Check if current session is expired
     */
    isSessionExpired(maxAge: number = DEFAULT_MAX_AGE): boolean {
      return this.getSessionAge() > maxAge
    },

    /**
     * Clean up expired or incomplete onboarding sessions
     */
    cleanup(options: CleanupOptions = {}): {
      cleaned: boolean
      reason?: string
    } {
      const {
        maxAge = DEFAULT_MAX_AGE,
        onlyIncomplete = false,
        preserveCurrentSession = true
      } = options

      const storage = safeSessionStorageAccess()
      const now = Date.now()

      try {
        // Check if we need to clean based on last cleanup time
        const lastCleanup = storage.getItem(CLEANUP_TIMESTAMP_KEY)
        const lastCleanupTime = lastCleanup ? parseInt(lastCleanup, 10) : 0
        const timeSinceLastCleanup = now - lastCleanupTime
        
        // Only run cleanup every hour at most
        if (timeSinceLastCleanup < 60 * 60 * 1000) {
          return { cleaned: false, reason: 'Recently cleaned' }
        }

        // Check session age
        const sessionAge = this.getSessionAge()
        if (sessionAge > maxAge) {
          if (!preserveCurrentSession) {
            sessionManager.clearAll()
            storage.removeItem(SESSION_TIMESTAMP_KEY)
            storage.setItem(CLEANUP_TIMESTAMP_KEY, now.toString())
            return { cleaned: true, reason: 'Session expired' }
          }
        }

        // Clean incomplete sessions if requested
        if (onlyIncomplete) {
          const progress = sessionManager.getProgress()
          if (progress.percentComplete < 100 && sessionAge > maxAge) {
            sessionManager.clearAll()
            storage.removeItem(SESSION_TIMESTAMP_KEY)
            storage.setItem(CLEANUP_TIMESTAMP_KEY, now.toString())
            return { cleaned: true, reason: 'Incomplete session expired' }
          }
        }

        // Update last cleanup time
        storage.setItem(CLEANUP_TIMESTAMP_KEY, now.toString())
        return { cleaned: false, reason: 'No cleanup needed' }

      } catch (error) {
        console.error('Failed to cleanup onboarding session:', error)
        return { cleaned: false, reason: 'Cleanup failed' }
      }
    },

    /**
     * Force clean all onboarding data
     */
    forceCleanup(): void {
      const storage = safeSessionStorageAccess()
      
      try {
        sessionManager.clearAll()
        storage.removeItem(SESSION_TIMESTAMP_KEY)
        storage.removeItem(CLEANUP_TIMESTAMP_KEY)
      } catch (error) {
        console.error('Failed to force cleanup onboarding session:', error)
      }
    },

    /**
     * Get cleanup status information
     */
    getCleanupStatus(): {
      sessionAge: number
      lastCleanup: number
      isExpired: boolean
      needsCleanup: boolean
    } {
      const storage = safeSessionStorageAccess()
      const sessionAge = this.getSessionAge()
      const lastCleanup = storage.getItem(CLEANUP_TIMESTAMP_KEY)
      const lastCleanupTime = lastCleanup ? parseInt(lastCleanup, 10) : 0
      
      return {
        sessionAge,
        lastCleanup: lastCleanupTime,
        isExpired: this.isSessionExpired(),
        needsCleanup: Date.now() - lastCleanupTime > 60 * 60 * 1000 // More than 1 hour
      }
    },

    /**
     * Validate session data integrity
     */
    validateSessionIntegrity(): {
      isValid: boolean
      errors: string[]
      warnings: string[]
    } {
      const errors: string[] = []
      const warnings: string[] = []
      
      try {
        const allSteps = sessionManager.getAllSteps()
        const progress = sessionManager.getProgress()

        // Check for corrupted data
        Object.entries(allSteps).forEach(([step, data]) => {
          if (data !== null) {
            try {
              JSON.parse(JSON.stringify(data)) // Test serialization
            } catch {
              errors.push(`Corrupted data in step: ${step}`)
            }
          }
        })

        // Check for inconsistent progress
        if (progress.completedSteps.length === 0 && progress.percentComplete > 0) {
          warnings.push('Progress percentage inconsistent with completed steps')
        }

        // Check session age
        const sessionAge = this.getSessionAge()
        if (sessionAge > DEFAULT_MAX_AGE) {
          warnings.push('Session is older than recommended maximum age')
        }

        return {
          isValid: errors.length === 0,
          errors,
          warnings
        }

      } catch (error) {
        errors.push(`Session validation failed: ${error}`)
        return {
          isValid: false,
          errors,
          warnings
        }
      }
    },

    /**
     * Auto-initialize cleanup on page load
     */
    autoInit(): void {
      this.initSession()
      
      // Run cleanup in background
      setTimeout(() => {
        this.cleanup({
          onlyIncomplete: true,
          preserveCurrentSession: true
        })
      }, 1000) // Wait 1 second after page load
    }
  }
}