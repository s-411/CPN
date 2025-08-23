import { profileSchema, profileSessionSchema, ETHNICITY_OPTIONS, RATING_OPTIONS } from '@/lib/validations/profile'
import type { 
  ProfileFormData, 
  ProfileSessionData, 
  ProfileSessionManager,
  ProfileFormError,
  FieldValidationState
} from '@/types/profile'

// Session storage key for profile data
const PROFILE_SESSION_KEY = 'cpn_onboarding_profile'

/**
 * Session storage manager for profile data during onboarding
 */
export function createProfileSessionManager(): ProfileSessionManager {
  return {
    save(data: Partial<ProfileSessionData>): void {
      try {
        const existing = this.load() || {}
        const merged = { ...existing, ...data }
        
        // Validate data before saving
        const validatedData = profileSessionSchema.parse(merged)
        localStorage.setItem(PROFILE_SESSION_KEY, JSON.stringify(validatedData))
      } catch (error) {
        console.warn('Failed to save profile session data:', error)
        // Don't throw - graceful degradation
      }
    },

    load(): ProfileSessionData | null {
      try {
        const stored = localStorage.getItem(PROFILE_SESSION_KEY)
        if (!stored) return null
        
        const parsed = JSON.parse(stored)
        return profileSessionSchema.parse(parsed)
      } catch (error) {
        console.warn('Failed to load profile session data:', error)
        this.clear() // Clear corrupted data
        return null
      }
    },

    clear(): void {
      localStorage.removeItem(PROFILE_SESSION_KEY)
    },

    exists(): boolean {
      return localStorage.getItem(PROFILE_SESSION_KEY) !== null
    },

    merge(data: Partial<ProfileSessionData>): void {
      const existing = this.load() || {}
      this.save({ ...existing, ...data })
    }
  }
}

/**
 * Format rating for display (e.g., 8.5 → "8.5/10")
 */
export function formatRatingDisplay(rating: number): string {
  return `${rating.toFixed(1)}/10`
}

/**
 * Format ethnicity value to display label
 */
export function formatEthnicityDisplay(value: string): string {
  const option = ETHNICITY_OPTIONS.find(opt => opt.value === value)
  return option?.label || 'Prefer not to say'
}

/**
 * Validate a single form field
 */
export function validateField(
  field: keyof ProfileFormData, 
  value: any
): FieldValidationState {
  try {
    const fieldSchema = profileSchema.shape[field]
    fieldSchema.parse(value)
    
    return {
      isValid: true,
      error: null,
      isDirty: true,
      isTouched: true,
      isValidating: false
    }
  } catch (error: any) {
    const errorMessage = error.errors?.[0]?.message || 'Invalid value'
    
    return {
      isValid: false,
      error: errorMessage,
      isDirty: true,
      isTouched: true,
      isValidating: false
    }
  }
}

/**
 * Validate entire form data
 */
export function validateProfileForm(data: Partial<ProfileFormData>): {
  isValid: boolean
  errors: Record<string, string>
  validatedData?: ProfileFormData
} {
  try {
    const validatedData = profileSchema.parse(data)
    return {
      isValid: true,
      errors: {},
      validatedData
    }
  } catch (error: any) {
    const errors: Record<string, string> = {}
    
    if (error.errors) {
      error.errors.forEach((err: any) => {
        if (err.path && err.path.length > 0) {
          errors[err.path[0]] = err.message
        }
      })
    }
    
    return {
      isValid: false,
      errors
    }
  }
}

/**
 * Convert form data to session data format
 */
export function formDataToSessionData(formData: ProfileFormData): ProfileSessionData {
  return {
    firstName: formData.firstName,
    age: formData.age,
    ethnicity: formData.ethnicity || '',
    rating: formData.rating
  }
}

/**
 * Convert session data to form data format
 */
export function sessionDataToFormData(sessionData: ProfileSessionData): Partial<ProfileFormData> {
  return {
    firstName: sessionData.firstName,
    age: sessionData.age,
    ethnicity: sessionData.ethnicity || '',
    rating: sessionData.rating
  }
}

/**
 * Get the next valid rating from current value
 */
export function getNextRating(current: number, direction: 'up' | 'down'): number {
  const currentIndex = RATING_OPTIONS.findIndex(rating => rating === current)
  
  if (currentIndex === -1) return RATING_OPTIONS[0] // Default to 5.0
  
  if (direction === 'up') {
    return currentIndex < RATING_OPTIONS.length - 1 
      ? RATING_OPTIONS[currentIndex + 1] 
      : current
  } else {
    return currentIndex > 0 
      ? RATING_OPTIONS[currentIndex - 1] 
      : current
  }
}

/**
 * Create a profile form error with proper typing
 */
export function createProfileFormError(
  message: string,
  code: ProfileFormError['code'] = 'UNKNOWN_ERROR',
  field?: keyof ProfileFormData,
  details?: Record<string, any>
): ProfileFormError {
  const error = new Error(message) as ProfileFormError
  error.code = code
  error.field = field
  error.details = details
  return error
}

/**
 * Debounce function for validation
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * Check if form data is complete for submission
 */
export function isFormComplete(data: Partial<ProfileFormData>): boolean {
  return !!(
    data.firstName && 
    data.firstName.trim().length >= 2 &&
    data.age && 
    data.age >= 18 && 
    data.age <= 99 &&
    data.rating && 
    data.rating >= 5.0 && 
    data.rating <= 10.0 &&
    RATING_OPTIONS.includes(data.rating as any)
  )
}

/**
 * Generate form analytics data
 */
export function generateFormAnalytics(
  startTime: Date,
  endTime: Date,
  data: ProfileFormData,
  errors: Record<string, string>
): {
  timeToComplete: number
  fieldInteractions: number
  errorCount: number
  completionRate: number
} {
  const timeToComplete = endTime.getTime() - startTime.getTime()
  const totalFields = Object.keys(profileSchema.shape).length
  const completedFields = Object.values(data).filter(v => v !== undefined && v !== '').length
  
  return {
    timeToComplete,
    fieldInteractions: completedFields,
    errorCount: Object.keys(errors).length,
    completionRate: (completedFields / totalFields) * 100
  }
}

/**
 * Sanitize form data for storage/transmission
 */
export function sanitizeFormData(data: Partial<ProfileFormData>): Partial<ProfileFormData> {
  const sanitized: Partial<ProfileFormData> = {}
  
  if (data.firstName) {
    sanitized.firstName = data.firstName.trim()
  }
  
  if (data.age !== undefined) {
    sanitized.age = Math.floor(Number(data.age))
  }
  
  if (data.ethnicity !== undefined) {
    sanitized.ethnicity = data.ethnicity.trim()
  }
  
  if (data.rating !== undefined) {
    sanitized.rating = Math.round(Number(data.rating) * 2) / 2 // Ensure 0.5 increments
  }
  
  return sanitized
}