'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { 
  createOnboardingSessionManager, 
  OnboardingStep, 
  OnboardingData, 
  OnboardingProgress,
  DataEntryData,
  ResultData
} from '@/lib/utils/session-storage'
import { createOnboardingCleanupManager } from '@/lib/utils/onboarding-cleanup'
import type { ProfileFormData } from '@/types/profile'

interface OnboardingContextType {
  // Data state
  data: OnboardingData
  progress: OnboardingProgress
  currentStep: OnboardingStep
  
  // Actions
  saveProfileData: (data: ProfileFormData) => void
  saveDataEntryData: (data: DataEntryData) => void
  saveResultData: (data: ResultData) => void
  
  // Navigation
  goToStep: (step: OnboardingStep) => void
  goToNextStep: () => void
  goToPreviousStep: () => void
  canNavigateToStep: (step: OnboardingStep) => boolean
  
  // Utility
  isStepComplete: (step: OnboardingStep) => boolean
  resetOnboarding: () => void
  
  // Loading state
  isLoading: boolean
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

interface OnboardingProviderProps {
  children: React.ReactNode
  initialStep?: OnboardingStep
}

export function OnboardingProvider({ 
  children, 
  initialStep = 'profile' 
}: OnboardingProviderProps) {
  const [sessionManager] = useState(() => createOnboardingSessionManager())
  const [cleanupManager] = useState(() => createOnboardingCleanupManager())
  const [data, setData] = useState<OnboardingData>(() => ({
    profile: null,
    dataEntry: null,
    result: null
  }))
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(initialStep)
  const [progress, setProgress] = useState<OnboardingProgress>(() => ({
    currentStep: initialStep,
    completedSteps: [],
    totalSteps: 3,
    percentComplete: 0
  }))
  const [isLoading, setIsLoading] = useState(true)

  // Load data from session storage on mount and initialize cleanup
  useEffect(() => {
    setIsLoading(true)
    
    try {
      // Initialize cleanup manager
      cleanupManager.autoInit()
      
      // Check if cleanup is needed and perform if necessary
      const cleanupResult = cleanupManager.cleanup({
        onlyIncomplete: true,
        preserveCurrentSession: true
      })
      
      if (cleanupResult.cleaned) {
        console.log('Onboarding session cleanup performed:', cleanupResult.reason)
      }
      
      const savedData = sessionManager.getAllSteps()
      const savedCurrentStep = sessionManager.getCurrentStep()
      const savedProgress = sessionManager.getProgress()
      
      setData(savedData)
      setCurrentStep(savedCurrentStep)
      setProgress(savedProgress)
    } catch (error) {
      console.error('Failed to load onboarding data from session storage:', error)
    } finally {
      setIsLoading(false)
    }
  }, [sessionManager, cleanupManager])

  // Update progress when data changes
  useEffect(() => {
    if (!isLoading) {
      const newProgress = sessionManager.getProgress()
      setProgress(newProgress)
    }
  }, [data, currentStep, sessionManager, isLoading])

  const saveProfileData = useCallback((profileData: ProfileFormData) => {
    try {
      sessionManager.saveStep('profile', profileData)
      setData(prev => ({ ...prev, profile: profileData }))
    } catch (error) {
      console.error('Failed to save profile data:', error)
    }
  }, [sessionManager])

  const saveDataEntryData = useCallback((dataEntryData: DataEntryData) => {
    try {
      sessionManager.saveStep('dataEntry', dataEntryData)
      setData(prev => ({ ...prev, dataEntry: dataEntryData }))
    } catch (error) {
      console.error('Failed to save data entry data:', error)
    }
  }, [sessionManager])

  const saveResultData = useCallback((resultData: ResultData) => {
    try {
      sessionManager.saveStep('result', resultData)
      setData(prev => ({ ...prev, result: resultData }))
    } catch (error) {
      console.error('Failed to save result data:', error)
    }
  }, [sessionManager])

  const goToStep = useCallback((step: OnboardingStep) => {
    if (sessionManager.canNavigateToStep(step)) {
      sessionManager.setCurrentStep(step)
      setCurrentStep(step)
    } else {
      console.warn(`Cannot navigate to step ${step}: prerequisites not met`)
    }
  }, [sessionManager])

  const goToNextStep = useCallback(() => {
    const nextStep = sessionManager.getNextStep()
    if (nextStep && sessionManager.canNavigateToStep(nextStep)) {
      goToStep(nextStep)
    }
  }, [sessionManager, goToStep])

  const goToPreviousStep = useCallback(() => {
    const prevStep = sessionManager.getPreviousStep()
    if (prevStep) {
      goToStep(prevStep)
    }
  }, [sessionManager, goToStep])

  const canNavigateToStep = useCallback((step: OnboardingStep) => {
    return sessionManager.canNavigateToStep(step)
  }, [sessionManager])

  const isStepComplete = useCallback((step: OnboardingStep) => {
    return sessionManager.isStepComplete(step)
  }, [sessionManager])

  const resetOnboarding = useCallback(() => {
    try {
      cleanupManager.forceCleanup()
      setData({
        profile: null,
        dataEntry: null,
        result: null
      })
      setCurrentStep('profile')
      sessionManager.setCurrentStep('profile')
    } catch (error) {
      console.error('Failed to reset onboarding:', error)
    }
  }, [sessionManager, cleanupManager])

  const contextValue: OnboardingContextType = {
    data,
    progress,
    currentStep,
    saveProfileData,
    saveDataEntryData,
    saveResultData,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    canNavigateToStep,
    isStepComplete,
    resetOnboarding,
    isLoading
  }

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}

// Hook for step-specific data access
export function useOnboardingStep<T extends OnboardingStep>(
  step: T
): OnboardingData[T] | null {
  const { data } = useOnboarding()
  return data[step]
}

// Hook for navigation helpers
export function useOnboardingNavigation() {
  const {
    currentStep,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    canNavigateToStep,
    progress
  } = useOnboarding()

  return {
    currentStep,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    canNavigateToStep,
    progress,
    canGoNext: progress.currentStep !== 'result',
    canGoBack: progress.currentStep !== 'profile'
  }
}