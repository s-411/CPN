'use client'

import type { ProfileFormData } from '@/types/profile'

export type OnboardingStep = 'profile' | 'dataEntry' | 'result'

export interface DataEntryData {
  date: string
  cost: number
  time: number
  nuts: number
  notes?: string
}

export interface ResultData {
  cpn: number
  timeEfficiency: number
  recommendations: string[]
  shareableGraphicUrl?: string
}

export interface OnboardingData {
  profile: ProfileFormData | null
  dataEntry: DataEntryData | null
  result: ResultData | null
}

export interface OnboardingProgress {
  currentStep: OnboardingStep
  completedSteps: OnboardingStep[]
  totalSteps: number
  percentComplete: number
}

const STORAGE_PREFIX = 'cpn_onboarding'
const CURRENT_STEP_KEY = `${STORAGE_PREFIX}_currentStep`
const STEP_KEYS: Record<OnboardingStep, string> = {
  profile: `${STORAGE_PREFIX}_profile`,
  dataEntry: `${STORAGE_PREFIX}_dataEntry`,
  result: `${STORAGE_PREFIX}_result`
}

const ALL_STEPS: OnboardingStep[] = ['profile', 'dataEntry', 'result']

function safeJSONParse<T>(value: string | null): T | null {
  if (!value) return null
  
  try {
    return JSON.parse(value) as T
  } catch (error) {
    console.warn('Failed to parse JSON from sessionStorage:', error)
    return null
  }
}

function safeSessionStorageAccess() {
  if (typeof window === 'undefined') {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {}
    }
  }
  
  return window.sessionStorage
}

export function createOnboardingSessionManager() {
  const storage = safeSessionStorageAccess()

  return {
    saveStep<T extends keyof OnboardingData>(
      step: T,
      data: OnboardingData[T]
    ): void {
      const key = STEP_KEYS[step]
      try {
        storage.setItem(key, JSON.stringify(data))
      } catch (error) {
        console.error(`Failed to save step ${step} to sessionStorage:`, error)
      }
    },

    loadStep<T extends keyof OnboardingData>(
      step: T
    ): OnboardingData[T] {
      const key = STEP_KEYS[step]
      try {
        const value = storage.getItem(key)
        return safeJSONParse<OnboardingData[T]>(value)
      } catch (error) {
        console.error(`Failed to load step ${step} from sessionStorage:`, error)
        return null as OnboardingData[T]
      }
    },

    getAllSteps(): OnboardingData {
      return {
        profile: this.loadStep('profile'),
        dataEntry: this.loadStep('dataEntry'),
        result: this.loadStep('result')
      }
    },

    clearStep(step: OnboardingStep): void {
      const key = STEP_KEYS[step]
      try {
        storage.removeItem(key)
      } catch (error) {
        console.error(`Failed to clear step ${step} from sessionStorage:`, error)
      }
    },

    clearAll(): void {
      ALL_STEPS.forEach(step => {
        this.clearStep(step)
      })
      
      try {
        storage.removeItem(CURRENT_STEP_KEY)
      } catch (error) {
        console.error('Failed to clear current step from sessionStorage:', error)
      }
    },

    getCurrentStep(): OnboardingStep {
      try {
        const currentStep = storage.getItem(CURRENT_STEP_KEY) as OnboardingStep
        return ALL_STEPS.includes(currentStep) ? currentStep : 'profile'
      } catch (error) {
        console.error('Failed to get current step from sessionStorage:', error)
        return 'profile'
      }
    },

    setCurrentStep(step: OnboardingStep): void {
      try {
        storage.setItem(CURRENT_STEP_KEY, step)
      } catch (error) {
        console.error('Failed to set current step in sessionStorage:', error)
      }
    },

    getProgress(): OnboardingProgress {
      const allData = this.getAllSteps()
      const completedSteps: OnboardingStep[] = []

      ALL_STEPS.forEach(step => {
        if (allData[step] && Object.keys(allData[step] as object).length > 0) {
          completedSteps.push(step)
        }
      })

      const percentComplete = Math.round((completedSteps.length / ALL_STEPS.length) * 100)

      return {
        currentStep: this.getCurrentStep(),
        completedSteps,
        totalSteps: ALL_STEPS.length,
        percentComplete
      }
    },

    isStepComplete(step: OnboardingStep): boolean {
      const data = this.loadStep(step)
      return data !== null && Object.keys(data as object).length > 0
    },

    getNextStep(): OnboardingStep | null {
      const currentStep = this.getCurrentStep()
      const currentIndex = ALL_STEPS.indexOf(currentStep)
      
      if (currentIndex === -1 || currentIndex === ALL_STEPS.length - 1) {
        return null
      }
      
      return ALL_STEPS[currentIndex + 1]
    },

    getPreviousStep(): OnboardingStep | null {
      const currentStep = this.getCurrentStep()
      const currentIndex = ALL_STEPS.indexOf(currentStep)
      
      if (currentIndex <= 0) {
        return null
      }
      
      return ALL_STEPS[currentIndex - 1]
    },

    canNavigateToStep(step: OnboardingStep): boolean {
      const stepIndex = ALL_STEPS.indexOf(step)
      
      if (stepIndex === 0) return true
      
      const previousSteps = ALL_STEPS.slice(0, stepIndex)
      return previousSteps.every(prevStep => this.isStepComplete(prevStep))
    },

    validateStepData<T extends keyof OnboardingData>(
      step: T,
      data: OnboardingData[T]
    ): boolean {
      if (!data) return false

      switch (step) {
        case 'profile':
          const profile = data as ProfileFormData
          return !!(profile.firstName && profile.age && profile.rating)
        
        case 'dataEntry':
          const dataEntry = data as DataEntryData
          return !!(dataEntry.date && dataEntry.cost >= 0 && dataEntry.time >= 0 && typeof dataEntry.nuts === 'number' && dataEntry.nuts >= 0)
        
        case 'result':
          const result = data as ResultData
          return !!(result.cpn >= 0 && result.timeEfficiency >= 0)
        
        default:
          return false
      }
    }
  }
}