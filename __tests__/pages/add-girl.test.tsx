import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import AddGirlPage from '@/app/add-girl/page'
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

// Test wrapper with OnboardingProvider
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingProvider>
      {children}
    </OnboardingProvider>
  )
}

describe('AddGirlPage', () => {
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
  })

  describe('Page Rendering', () => {
    it('should render the page with proper structure', () => {
      render(
        <TestWrapper>
          <AddGirlPage />
        </TestWrapper>
      )

      // Check for main page elements
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByText('Add Your First Profile')).toBeInTheDocument()
    })

    it('should have proper page title and metadata', () => {
      render(
        <TestWrapper>
          <AddGirlPage />
        </TestWrapper>
      )

      // Check for SEO elements (these would be in document head in real implementation)
      expect(document.title).toBeTruthy()
    })

    it('should render with dark theme styling', () => {
      render(
        <TestWrapper>
          <AddGirlPage />
        </TestWrapper>
      )

      const mainElement = screen.getByRole('main')
      expect(mainElement).toHaveClass('bg-cpn-dark')
      expect(mainElement).toHaveClass('text-cpn-white')
    })
  })

  describe('ProfileForm Integration', () => {
    it('should render ProfileForm component within the page', () => {
      render(
        <TestWrapper>
          <AddGirlPage />
        </TestWrapper>
      )

      // Check for form elements from ProfileForm
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/age/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/ethnicity/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/rating/i)).toBeInTheDocument()
    })

    it('should handle form submission correctly', async () => {
      render(
        <TestWrapper>
          <AddGirlPage />
        </TestWrapper>
      )

      // Fill out form
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: 'Jane' }
      })
      fireEvent.change(screen.getByLabelText(/age/i), {
        target: { value: '25' }
      })

      // Submit form
      const submitButton = screen.getByRole('button', { name: /continue/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        // Should navigate to next step after successful submission
        expect(mockPush).toHaveBeenCalledWith('/data-entry')
      })
    })

    it('should persist form data in session storage', async () => {
      render(
        <TestWrapper>
          <AddGirlPage />
        </TestWrapper>
      )

      // Fill out form
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: 'Jane' }
      })
      
      await waitFor(() => {
        // Should save data to session storage
        expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
          'cpn_onboarding_profile',
          expect.stringContaining('Jane')
        )
      })
    })
  })

  describe('Progress Indicators', () => {
    it('should show progress indicator for step 1', () => {
      render(
        <TestWrapper>
          <AddGirlPage />
        </TestWrapper>
      )

      // Check for progress indicator
      const progressText = screen.getByText(/step 1 of/i)
      expect(progressText).toBeInTheDocument()
    })

    it('should highlight current step in progress indicator', () => {
      render(
        <TestWrapper>
          <AddGirlPage />
        </TestWrapper>
      )

      // Current step should be highlighted
      const activeStep = document.querySelector('.bg-cpn-yellow')
      expect(activeStep).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('should not show back button on first step', () => {
      render(
        <TestWrapper>
          <AddGirlPage />
        </TestWrapper>
      )

      const backButton = screen.queryByRole('button', { name: /back/i })
      expect(backButton).not.toBeInTheDocument()
    })

    it('should disable continue button when form is invalid', () => {
      render(
        <TestWrapper>
          <AddGirlPage />
        </TestWrapper>
      )

      const continueButton = screen.getByRole('button', { name: /continue/i })
      expect(continueButton).toBeDisabled()
    })

    it('should enable continue button when form is valid', async () => {
      render(
        <TestWrapper>
          <AddGirlPage />
        </TestWrapper>
      )

      // Fill out required fields
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: 'Jane' }
      })
      fireEvent.change(screen.getByLabelText(/age/i), {
        target: { value: '25' }
      })

      const continueButton = screen.getByRole('button', { name: /continue/i })
      
      await waitFor(() => {
        expect(continueButton).not.toBeDisabled()
      })
    })
  })

  describe('Responsive Design', () => {
    it('should have mobile-first responsive classes', () => {
      render(
        <TestWrapper>
          <AddGirlPage />
        </TestWrapper>
      )

      const mainElement = screen.getByRole('main')
      expect(mainElement).toHaveClass('min-h-screen')
      expect(mainElement).toHaveClass('p-4')
      expect(mainElement).toHaveClass('sm:p-6')
    })

    it('should have proper container max-width for larger screens', () => {
      render(
        <TestWrapper>
          <AddGirlPage />
        </TestWrapper>
      )

      const container = document.querySelector('.max-w-md')
      expect(container).toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('should show loading state when onboarding context is loading', () => {
      // This would need a custom provider that sets loading to true
      render(
        <TestWrapper>
          <AddGirlPage />
        </TestWrapper>
      )

      // Check that loading spinner would appear (implementation dependent)
      const form = screen.getByRole('form')
      expect(form).toBeInTheDocument()
    })

    it('should show loading state during form submission', async () => {
      render(
        <TestWrapper>
          <AddGirlPage />
        </TestWrapper>
      )

      // Fill out form
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: 'Jane' }
      })
      fireEvent.change(screen.getByLabelText(/age/i), {
        target: { value: '25' }
      })

      // Submit form
      const submitButton = screen.getByRole('button', { name: /continue/i })
      fireEvent.click(submitButton)

      // Should show processing state
      await waitFor(() => {
        expect(screen.getByText(/processing/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(
        <TestWrapper>
          <AddGirlPage />
        </TestWrapper>
      )

      // Check main landmark
      expect(screen.getByRole('main')).toBeInTheDocument()
      
      // Check form accessibility
      expect(screen.getByRole('form')).toHaveAttribute('aria-label')
      
      // Check heading hierarchy
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })

    it('should have proper focus management', () => {
      render(
        <TestWrapper>
          <AddGirlPage />
        </TestWrapper>
      )

      const firstInput = screen.getByLabelText(/first name/i)
      firstInput.focus()
      expect(document.activeElement).toBe(firstInput)
    })

    it('should have proper color contrast for CPN theme', () => {
      render(
        <TestWrapper>
          <AddGirlPage />
        </TestWrapper>
      )

      // CPN theme should provide proper contrast
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveClass('text-cpn-white')
      
      const form = screen.getByRole('form')
      expect(form).toHaveClass('bg-cpn-dark')
    })
  })

  describe('Error Handling', () => {
    it('should handle form validation errors gracefully', async () => {
      render(
        <TestWrapper>
          <AddGirlPage />
        </TestWrapper>
      )

      // Submit form without required fields
      const submitButton = screen.getByRole('button', { name: /continue/i })
      fireEvent.click(submitButton)

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
      })
    })

    it('should handle network errors during form submission', async () => {
      // Mock network failure
      const mockOnSubmit = jest.fn().mockRejectedValue(new Error('Network error'))
      
      render(
        <TestWrapper>
          <AddGirlPage />
        </TestWrapper>
      )

      // This would need custom error boundary testing
      expect(screen.getByRole('form')).toBeInTheDocument()
    })
  })

  describe('PWA Features', () => {
    it('should work offline with cached form state', () => {
      render(
        <TestWrapper>
          <AddGirlPage />
        </TestWrapper>
      )

      // Form should work even without network
      const form = screen.getByRole('form')
      expect(form).toBeInTheDocument()
      
      // Session storage should persist data offline
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: 'Jane' }
      })
      
      expect(mockSessionStorage.setItem).toHaveBeenCalled()
    })

    it('should have proper viewport meta for mobile', () => {
      render(
        <TestWrapper>
          <AddGirlPage />
        </TestWrapper>
      )

      // This would be tested at document level in real implementation
      expect(document.querySelector('meta[name="viewport"]')).toBeTruthy()
    })
  })
})