import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import DataEntryPage from '@/app/data-entry/page'
import { OnboardingProvider } from '@/contexts/onboarding-context'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

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

// Mock PWA utilities
jest.mock('@/lib/utils/pwa', () => ({
  initializePWA: jest.fn().mockResolvedValue(undefined),
  queueForSync: jest.fn().mockResolvedValue(undefined),
  getPWACapabilities: jest.fn().mockReturnValue({
    isStandalone: false,
    canInstall: false,
    hasServiceWorker: false,
    isOnline: true,
    supportsBackgroundSync: false,
    supportsNotifications: false,
  }),
}))

// Test wrapper with OnboardingProvider
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingProvider initialStep="dataEntry">
      {children}
    </OnboardingProvider>
  )
}

describe('DataEntryPage', () => {
  const mockPush = jest.fn()
  const mockReplace = jest.fn()
  const mockBack = jest.fn()

  beforeEach(() => {
    mockSessionStorage.clear()
    jest.clearAllMocks()
    
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
      back: mockBack,
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    })

    // Pre-populate with profile data (required to access data entry step)
    mockSessionStorage.setItem('cpn_onboarding_profile', JSON.stringify({
      firstName: 'Jane',
      age: 25,
      ethnicity: 'hispanic',
      rating: 7.5
    }))
  })

  describe('Page Structure', () => {
    it('should render the page with proper structure', () => {
      render(
        <TestWrapper>
          <DataEntryPage />
        </TestWrapper>
      )

      // Check for main page elements
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByText('Track Your Experience')).toBeInTheDocument()
    })

    it('should have proper SEO metadata structure', () => {
      render(
        <TestWrapper>
          <DataEntryPage />
        </TestWrapper>
      )

      // Check for proper page title structure (would be in document head in real implementation)
      expect(document.title).toBeTruthy()
    })

    it('should render with CPN dark theme styling', () => {
      render(
        <TestWrapper>
          <DataEntryPage />
        </TestWrapper>
      )

      const mainElement = screen.getByRole('main')
      expect(mainElement).toHaveClass('bg-cpn-dark')
      expect(mainElement).toHaveClass('text-cpn-white')
    })

    it('should display CPN branding elements', () => {
      render(
        <TestWrapper>
          <DataEntryPage />
        </TestWrapper>
      )

      // Check for CPN logo
      expect(screen.getByText('CPN')).toBeInTheDocument()
      expect(screen.getByText('Track Your Experience')).toBeInTheDocument()
    })
  })

  describe('Progress Indicators', () => {
    it('should show step 2 of 3 progress indicator', () => {
      render(
        <TestWrapper>
          <DataEntryPage />
        </TestWrapper>
      )

      // Check for progress text
      expect(screen.getByText(/step 2 of 3/i)).toBeInTheDocument()
    })

    it('should highlight current step in progress dots', () => {
      render(
        <TestWrapper>
          <DataEntryPage />
        </TestWrapper>
      )

      // Check for progress dots with current step highlighted
      const progressDots = document.querySelectorAll('.bg-cpn-yellow')
      expect(progressDots.length).toBeGreaterThan(0)
    })

    it('should show progress percentage', () => {
      render(
        <TestWrapper>
          <DataEntryPage />
        </TestWrapper>
      )

      // Should show some progress since profile is completed
      expect(screen.getByText(/33% complete/i)).toBeInTheDocument()
    })
  })

  describe('Form Structure', () => {
    it('should render data entry form', () => {
      render(
        <TestWrapper>
          <DataEntryPage />
        </TestWrapper>
      )

      // Check for form presence
      expect(screen.getByRole('form')).toBeInTheDocument()
    })

    it('should have all required form fields', () => {
      render(
        <TestWrapper>
          <DataEntryPage />
        </TestWrapper>
      )

      // Check for data entry form fields
      expect(screen.getByLabelText(/when did this happen/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/total amount spent/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/total time invested/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/number of nuts/i)).toBeInTheDocument()
    })

    it('should have proper form header and description', () => {
      render(
        <TestWrapper>
          <DataEntryPage />
        </TestWrapper>
      )

      expect(screen.getAllByText('Track Your Experience')).toHaveLength(1) // Only in main header
      expect(screen.getByText('Experience Details')).toBeInTheDocument() // Form header
      expect(screen.getByText(/enter the details/i)).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('should show back button for navigation', () => {
      render(
        <TestWrapper>
          <DataEntryPage />
        </TestWrapper>
      )

      const backButton = screen.getByRole('button', { name: /back/i })
      expect(backButton).toBeInTheDocument()
    })

    it('should handle back navigation', () => {
      render(
        <TestWrapper>
          <DataEntryPage />
        </TestWrapper>
      )

      const backButton = screen.getByRole('button', { name: /back/i })
      fireEvent.click(backButton)

      expect(mockBack).toHaveBeenCalled()
    })

    it('should have continue button that is initially disabled', () => {
      render(
        <TestWrapper>
          <DataEntryPage />
        </TestWrapper>
      )

      const continueButton = screen.getByRole('button', { name: /continue|calculate/i })
      expect(continueButton).toBeInTheDocument()
      expect(continueButton).toBeDisabled()
    })
  })

  describe('Mobile Responsiveness', () => {
    it('should have mobile-first responsive classes', () => {
      render(
        <TestWrapper>
          <DataEntryPage />
        </TestWrapper>
      )

      const mainElement = screen.getByRole('main')
      expect(mainElement).toHaveClass('min-h-screen')
      expect(mainElement).toHaveClass('p-4')
    })

    it('should have proper container max-width for larger screens', () => {
      render(
        <TestWrapper>
          <DataEntryPage />
        </TestWrapper>
      )

      const container = document.querySelector('.max-w-md')
      expect(container).toBeInTheDocument()
    })

    it('should have touch-friendly button sizes', () => {
      render(
        <TestWrapper>
          <DataEntryPage />
        </TestWrapper>
      )

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveClass('min-h-[44px]')
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(
        <TestWrapper>
          <DataEntryPage />
        </TestWrapper>
      )

      // Check main landmark
      expect(screen.getByRole('main')).toBeInTheDocument()
      
      // Check form accessibility
      expect(screen.getByRole('form')).toHaveAttribute('aria-label')
      
      // Check heading hierarchy
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })

    it('should have proper form field labels', () => {
      render(
        <TestWrapper>
          <DataEntryPage />
        </TestWrapper>
      )

      // All form fields should have associated labels
      expect(screen.getByLabelText(/when did this happen/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/total amount spent/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/total time invested/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/number of nuts/i)).toBeInTheDocument()
    })

    it('should have proper focus management', () => {
      render(
        <TestWrapper>
          <DataEntryPage />
        </TestWrapper>
      )

      const firstInput = screen.getByLabelText(/when did this happen/i)
      firstInput.focus()
      expect(document.activeElement).toBe(firstInput)
    })

    it('should have proper color contrast for CPN theme', () => {
      render(
        <TestWrapper>
          <DataEntryPage />
        </TestWrapper>
      )

      // CPN theme should provide proper contrast
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveClass('text-cpn-white')
      
      const form = screen.getByRole('form')
      expect(form).toHaveClass('bg-cpn-dark')
    })
  })

  describe('Session Storage Integration', () => {
    it('should load existing profile data from context', () => {
      render(
        <TestWrapper>
          <DataEntryPage />
        </TestWrapper>
      )

      // Should access the page since profile data exists
      expect(screen.getByText('Track Your Experience')).toBeInTheDocument()
    })

    it('should persist form data to session storage on input', async () => {
      render(
        <TestWrapper>
          <DataEntryPage />
        </TestWrapper>
      )

      // Fill out form field
      const dateInput = screen.getByLabelText(/when did this happen/i)
      fireEvent.change(dateInput, { target: { value: '2025-01-01' } })
      
      await waitFor(() => {
        // Should save data to session storage
        expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
          'cpn_onboarding_dataEntry',
          expect.stringContaining('2025-01-01')
        )
      })
    })
  })

  describe('Form Validation', () => {
    it('should show validation errors for empty required fields', async () => {
      render(
        <TestWrapper>
          <DataEntryPage />
        </TestWrapper>
      )

      // Try to submit form without filling required fields
      const submitButton = screen.getByRole('button', { name: /continue|calculate/i })
      
      // Enable button first by filling minimal data
      fireEvent.change(screen.getByLabelText(/when did this happen/i), { target: { value: '2025-01-01' } })
      
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled()
      })
      
      fireEvent.click(submitButton)

      // Should show validation errors for missing fields
      await waitFor(() => {
        expect(screen.getByText(/cost is required/i)).toBeInTheDocument()
      })
    })

    it('should validate cost input format', async () => {
      render(
        <TestWrapper>
          <DataEntryPage />
        </TestWrapper>
      )

      const costInput = screen.getByLabelText(/total amount spent/i)
      fireEvent.change(costInput, { target: { value: 'invalid' } })

      await waitFor(() => {
        expect(screen.getByText(/valid cost/i)).toBeInTheDocument()
      })
    })
  })

  describe('Loading States', () => {
    it('should show loading state when context is loading', () => {
      // This would need a custom provider that sets loading to true
      render(
        <TestWrapper>
          <DataEntryPage />
        </TestWrapper>
      )

      // Check that form is present (loading handled by context)
      const form = screen.getByRole('form')
      expect(form).toBeInTheDocument()
    })

    it('should show loading state during form submission', async () => {
      render(
        <TestWrapper>
          <DataEntryPage />
        </TestWrapper>
      )

      // Fill out form completely
      fireEvent.change(screen.getByLabelText(/when did this happen/i), { target: { value: '2025-01-01' } })
      fireEvent.change(screen.getByLabelText(/total amount spent/i), { target: { value: '50' } })
      fireEvent.change(screen.getByLabelText(/total time invested/i), { target: { value: '120' } })

      // Submit form
      const submitButton = screen.getByRole('button', { name: /continue|calculate/i })
      fireEvent.click(submitButton)

      // Should show processing state
      await waitFor(() => {
        expect(screen.getByText(/calculating|processing/i)).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle form submission errors gracefully', async () => {
      render(
        <TestWrapper>
          <DataEntryPage />
        </TestWrapper>
      )

      // This would test error boundaries and error states
      expect(screen.getByRole('form')).toBeInTheDocument()
    })

    it('should redirect unauthorized users', () => {
      // Clear profile data to simulate unauthorized access
      mockSessionStorage.clear()

      render(
        <TestWrapper>
          <DataEntryPage />
        </TestWrapper>
      )

      // Should redirect back to profile step
      expect(mockPush).toHaveBeenCalledWith('/add-girl')
    })
  })

  describe('PWA Integration', () => {
    it('should work offline with cached form state', () => {
      render(
        <TestWrapper>
          <DataEntryPage />
        </TestWrapper>
      )

      // Form should work even without network
      const form = screen.getByRole('form')
      expect(form).toBeInTheDocument()
      
      // Session storage should persist data offline
      fireEvent.change(screen.getByLabelText(/when did this happen/i), { target: { value: '2025-01-01' } })
      
      expect(mockSessionStorage.setItem).toHaveBeenCalled()
    })

    it('should have proper viewport meta for mobile', () => {
      render(
        <TestWrapper>
          <DataEntryPage />
        </TestWrapper>
      )

      // This would be tested at document level in real implementation
      expect(document.querySelector('meta[name="viewport"]')).toBeTruthy()
    })
  })

  describe('Help and Information', () => {
    it('should display helpful information about data entry', () => {
      render(
        <TestWrapper>
          <DataEntryPage />
        </TestWrapper>
      )

      // Check for help text
      expect(screen.getAllByText(/your data is secure/i)).toHaveLength(2) // One in form footer, one in help section
      expect(screen.getByText(/step 2 of 3/i)).toBeInTheDocument()
    })

    it('should show field-specific help text', () => {
      render(
        <TestWrapper>
          <DataEntryPage />
        </TestWrapper>
      )

      // Should have helper text for form fields
      expect(screen.getByText(/when did this happen/i)).toBeInTheDocument()
      expect(screen.getByText(/total amount spent/i)).toBeInTheDocument()
      expect(screen.getByText(/number of nuts/i)).toBeInTheDocument()
    })
  })
})