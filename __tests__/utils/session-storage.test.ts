import { 
  createOnboardingSessionManager,
  OnboardingStep,
  OnboardingData 
} from '@/lib/utils/session-storage'

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

// Replace global sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
})

describe('OnboardingSessionManager', () => {
  let sessionManager: ReturnType<typeof createOnboardingSessionManager>

  beforeEach(() => {
    mockSessionStorage.clear()
    sessionManager = createOnboardingSessionManager()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('saveStep', () => {
    it('should save onboarding step data to session storage', () => {
      const stepData = {
        profile: {
          firstName: 'Jane',
          age: 25,
          ethnicity: 'hispanic',
          rating: 7.5
        }
      }

      sessionManager.saveStep('profile', stepData.profile)

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'cpn_onboarding_profile',
        JSON.stringify(stepData.profile)
      )
    })

    it('should handle empty data gracefully', () => {
      sessionManager.saveStep('profile', {})

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'cpn_onboarding_profile',
        JSON.stringify({})
      )
    })

    it('should overwrite existing step data', () => {
      const initialData = { firstName: 'Jane', age: 25 }
      const updatedData = { firstName: 'John', age: 30 }

      sessionManager.saveStep('profile', initialData)
      sessionManager.saveStep('profile', updatedData)

      expect(mockSessionStorage.setItem).toHaveBeenCalledTimes(2)
      expect(mockSessionStorage.setItem).toHaveBeenLastCalledWith(
        'cpn_onboarding_profile',
        JSON.stringify(updatedData)
      )
    })
  })

  describe('loadStep', () => {
    it('should load onboarding step data from session storage', () => {
      const profileData = {
        firstName: 'Jane',
        age: 25,
        ethnicity: 'hispanic',
        rating: 7.5
      }

      mockSessionStorage.setItem('cpn_onboarding_profile', JSON.stringify(profileData))

      const result = sessionManager.loadStep('profile')

      expect(result).toEqual(profileData)
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('cpn_onboarding_profile')
    })

    it('should return null when no data exists', () => {
      const result = sessionManager.loadStep('profile')

      expect(result).toBeNull()
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('cpn_onboarding_profile')
    })

    it('should return null when data is invalid JSON', () => {
      mockSessionStorage.setItem('cpn_onboarding_profile', 'invalid-json')

      const result = sessionManager.loadStep('profile')

      expect(result).toBeNull()
    })
  })

  describe('getAllSteps', () => {
    it('should return all saved onboarding steps', () => {
      const profileData = { firstName: 'Jane', age: 25 }
      const dataEntryData = { date: '2025-01-01', cost: 100 }

      mockSessionStorage.setItem('cpn_onboarding_profile', JSON.stringify(profileData))
      mockSessionStorage.setItem('cpn_onboarding_dataEntry', JSON.stringify(dataEntryData))

      const result = sessionManager.getAllSteps()

      expect(result).toEqual({
        profile: profileData,
        dataEntry: dataEntryData,
        result: null
      })
    })

    it('should return empty object when no steps are saved', () => {
      const result = sessionManager.getAllSteps()

      expect(result).toEqual({
        profile: null,
        dataEntry: null,
        result: null
      })
    })
  })

  describe('clearStep', () => {
    it('should remove specific step from session storage', () => {
      const profileData = { firstName: 'Jane', age: 25 }
      mockSessionStorage.setItem('cpn_onboarding_profile', JSON.stringify(profileData))

      sessionManager.clearStep('profile')

      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('cpn_onboarding_profile')
    })
  })

  describe('clearAll', () => {
    it('should remove all onboarding data from session storage', () => {
      mockSessionStorage.setItem('cpn_onboarding_profile', '{}')
      mockSessionStorage.setItem('cpn_onboarding_dataEntry', '{}')
      mockSessionStorage.setItem('cpn_onboarding_result', '{}')
      mockSessionStorage.setItem('other_data', '{}')

      sessionManager.clearAll()

      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('cpn_onboarding_profile')
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('cpn_onboarding_dataEntry')
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('cpn_onboarding_result')
      expect(mockSessionStorage.removeItem).not.toHaveBeenCalledWith('other_data')
    })
  })

  describe('getCurrentStep', () => {
    it('should return the current active step', () => {
      sessionManager.setCurrentStep('dataEntry')

      const result = sessionManager.getCurrentStep()

      expect(result).toBe('dataEntry')
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'cpn_onboarding_currentStep',
        'dataEntry'
      )
    })

    it('should return profile as default step', () => {
      const result = sessionManager.getCurrentStep()

      expect(result).toBe('profile')
    })
  })

  describe('setCurrentStep', () => {
    it('should save current step to session storage', () => {
      sessionManager.setCurrentStep('result')

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'cpn_onboarding_currentStep',
        'result'
      )
    })
  })

  describe('getProgress', () => {
    it('should calculate progress based on completed steps', () => {
      mockSessionStorage.setItem('cpn_onboarding_profile', JSON.stringify({ firstName: 'Jane' }))
      mockSessionStorage.setItem('cpn_onboarding_dataEntry', JSON.stringify({ date: '2025-01-01' }))

      const progress = sessionManager.getProgress()

      expect(progress).toEqual({
        currentStep: 'profile',
        completedSteps: ['profile', 'dataEntry'],
        totalSteps: 3,
        percentComplete: 67
      })
    })

    it('should return 0% progress when no steps completed', () => {
      const progress = sessionManager.getProgress()

      expect(progress).toEqual({
        currentStep: 'profile',
        completedSteps: [],
        totalSteps: 3,
        percentComplete: 0
      })
    })
  })

  describe('isStepComplete', () => {
    it('should return true when step has data', () => {
      mockSessionStorage.setItem('cpn_onboarding_profile', JSON.stringify({ firstName: 'Jane' }))

      const result = sessionManager.isStepComplete('profile')

      expect(result).toBe(true)
    })

    it('should return false when step has no data', () => {
      const result = sessionManager.isStepComplete('profile')

      expect(result).toBe(false)
    })
  })
})