import React from 'react'
import { render, screen, act, waitFor } from '@testing-library/react'
import { OnboardingProvider, useOnboarding, useOnboardingNavigation } from '@/contexts/onboarding-context'
import type { ProfileFormData } from '@/types/profile'
import type { DataEntryData, ResultData } from '@/lib/utils/session-storage'

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

// Test component to access context
function TestComponent() {
  const context = useOnboarding()
  const navigation = useOnboardingNavigation()
  
  return (
    <div>
      <div data-testid="current-step">{context.currentStep}</div>
      <div data-testid="progress-percent">{context.progress.percentComplete}</div>
      <div data-testid="can-go-next">{navigation.canGoNext.toString()}</div>
      <div data-testid="can-go-back">{navigation.canGoBack.toString()}</div>
      <div data-testid="loading">{context.isLoading.toString()}</div>
      
      <button 
        data-testid="save-profile"
        onClick={() => context.saveProfileData({
          firstName: 'John',
          age: 25,
          ethnicity: 'white',
          rating: 7.5
        })}
      >
        Save Profile
      </button>
      
      <button 
        data-testid="save-data-entry"
        onClick={() => context.saveDataEntryData({
          date: '2025-01-01',
          cost: 100,
          time: 60,
          outcome: 'success'
        })}
      >
        Save Data Entry
      </button>
      
      <button 
        data-testid="go-next"
        onClick={() => navigation.goToNextStep()}
      >
        Next Step
      </button>
      
      <button 
        data-testid="go-back"
        onClick={() => navigation.goToPreviousStep()}
      >
        Previous Step
      </button>
      
      <button 
        data-testid="reset"
        onClick={() => context.resetOnboarding()}
      >
        Reset
      </button>
    </div>
  )
}

describe('OnboardingContext', () => {
  beforeEach(() => {
    mockSessionStorage.clear()
    jest.clearAllMocks()
  })

  it('should provide initial state correctly', async () => {
    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    expect(screen.getByTestId('current-step')).toHaveTextContent('profile')
    expect(screen.getByTestId('progress-percent')).toHaveTextContent('0')
    expect(screen.getByTestId('can-go-next')).toHaveTextContent('true')
    expect(screen.getByTestId('can-go-back')).toHaveTextContent('false')
  })

  it('should save profile data and update progress', async () => {
    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    await act(async () => {
      screen.getByTestId('save-profile').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('progress-percent')).toHaveTextContent('33')
    })

    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      'cpn_onboarding_profile',
      JSON.stringify({
        firstName: 'John',
        age: 25,
        ethnicity: 'white',
        rating: 7.5
      })
    )
  })

  it('should handle navigation between steps', async () => {
    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    // Save profile data first to enable navigation
    await act(async () => {
      screen.getByTestId('save-profile').click()
    })

    await act(async () => {
      screen.getByTestId('go-next').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('current-step')).toHaveTextContent('dataEntry')
    })

    await act(async () => {
      screen.getByTestId('go-back').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('current-step')).toHaveTextContent('profile')
    })
  })

  it('should prevent navigation to incomplete steps', async () => {
    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    // Try to go next without completing profile
    await act(async () => {
      screen.getByTestId('go-next').click()
    })

    // Should still be on profile step
    expect(screen.getByTestId('current-step')).toHaveTextContent('profile')
  })

  it('should reset onboarding data', async () => {
    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    // Save some data
    await act(async () => {
      screen.getByTestId('save-profile').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('progress-percent')).toHaveTextContent('33')
    })

    // Reset
    await act(async () => {
      screen.getByTestId('reset').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('progress-percent')).toHaveTextContent('0')
      expect(screen.getByTestId('current-step')).toHaveTextContent('profile')
    })
  })

  it('should load existing data from session storage', async () => {
    // Pre-populate session storage
    const profileData = {
      firstName: 'Jane',
      age: 28,
      ethnicity: 'hispanic',
      rating: 8.0
    }

    mockSessionStorage.setItem('cpn_onboarding_profile', JSON.stringify(profileData))
    mockSessionStorage.setItem('cpn_onboarding_currentStep', 'dataEntry')

    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    expect(screen.getByTestId('current-step')).toHaveTextContent('dataEntry')
    expect(screen.getByTestId('progress-percent')).toHaveTextContent('33')
  })

  it('should handle multiple step completion', async () => {
    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    // Complete profile step
    await act(async () => {
      screen.getByTestId('save-profile').click()
    })

    // Complete data entry step
    await act(async () => {
      screen.getByTestId('save-data-entry').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('progress-percent')).toHaveTextContent('67')
    })
  })
})

describe('useOnboarding hook', () => {
  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error
    console.error = jest.fn()

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useOnboarding must be used within an OnboardingProvider')

    console.error = originalError
  })
})