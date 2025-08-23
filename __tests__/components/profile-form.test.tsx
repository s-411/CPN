import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { ProfileForm } from '@/components/forms/profile-form'
import { OnboardingProvider } from '@/contexts/onboarding-context'
import { ETHNICITY_OPTIONS, RATING_OPTIONS } from '@/lib/validations/profile'

// Mock localStorage
const mockLocalStorage = (() => {
  let store: { [key: string]: string } = {}
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
    })
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

// Test wrapper with OnboardingProvider
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingProvider>
      {children}
    </OnboardingProvider>
  )
}

describe('ProfileForm', () => {
  const mockOnSubmit = jest.fn()
  const mockOnBack = jest.fn()

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onBack: mockOnBack,
    showBackButton: false,
    isLoading: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.clear()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Component Structure', () => {
    it('renders all required form fields', () => {
      render(
        <TestWrapper>
          <ProfileForm {...defaultProps} />
        </TestWrapper>
      )

      // Check for all form fields
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/age/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/ethnicity/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/rating/i)).toBeInTheDocument()

      // Check for submit button
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
    })

    it('applies CPN design system classes', () => {
      render(<ProfileForm {...defaultProps} />)

      const form = screen.getByRole('form', { name: /add profile/i })
      expect(form).toHaveClass('bg-cpn-dark')

      const submitButton = screen.getByRole('button', { name: /continue/i })
      expect(submitButton).toHaveClass('btn-cpn')
    })

    it('shows back button when showBackButton is true', () => {
      render(<ProfileForm {...defaultProps} showBackButton={true} />)

      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
    })

    it('does not show back button by default', () => {
      render(<ProfileForm {...defaultProps} />)

      expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('shows validation errors for empty required fields', async () => {
      const user = userEvent.setup()
      render(<ProfileForm {...defaultProps} />)

      const submitButton = screen.getByRole('button', { name: /continue/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/first name must be at least 2 characters/i)).toBeInTheDocument()
        expect(screen.getByText(/must be at least 18 years old/i)).toBeInTheDocument()
        expect(screen.getByText(/rating must be at least 5.0/i)).toBeInTheDocument()
      })

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('validates first name length and format', async () => {
      const user = userEvent.setup()
      render(<ProfileForm {...defaultProps} />)

      const firstNameInput = screen.getByLabelText(/first name/i)

      // Test too short
      await user.type(firstNameInput, 'A')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/first name must be at least 2 characters/i)).toBeInTheDocument()
      })

      // Test invalid characters
      await user.clear(firstNameInput)
      await user.type(firstNameInput, 'John123')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/can only contain letters/i)).toBeInTheDocument()
      })
    })

    it('validates age range', async () => {
      const user = userEvent.setup()
      render(<ProfileForm {...defaultProps} />)

      const ageInput = screen.getByLabelText(/age/i)

      // Test too young
      await user.type(ageInput, '17')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/must be at least 18 years old/i)).toBeInTheDocument()
      })

      // Test too old
      await user.clear(ageInput)
      await user.type(ageInput, '100')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/age must be less than 100/i)).toBeInTheDocument()
      })
    })

    it('validates rating increments', async () => {
      const user = userEvent.setup()
      render(<ProfileForm {...defaultProps} />)

      const ratingSlider = screen.getByLabelText(/rating/i)

      // Set invalid rating (not 0.5 increment)
      fireEvent.change(ratingSlider, { target: { value: '7.3' } })
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/rating must be in 0.5 increments/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('submits valid form data', async () => {
      const user = userEvent.setup()
      render(<ProfileForm {...defaultProps} />)

      // Fill out form with valid data
      await user.type(screen.getByLabelText(/first name/i), 'John')
      await user.type(screen.getByLabelText(/age/i), '25')
      
      // Select ethnicity
      const ethnicitySelect = screen.getByLabelText(/ethnicity/i)
      await user.selectOptions(ethnicitySelect, 'european')
      
      // Set rating
      const ratingSlider = screen.getByLabelText(/rating/i)
      fireEvent.change(ratingSlider, { target: { value: '8.5' } })

      // Submit form
      const submitButton = screen.getByRole('button', { name: /continue/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          firstName: 'John',
          age: 25,
          ethnicity: 'european',
          rating: 8.5
        })
      })
    })

    it('formats first name to title case on submission', async () => {
      const user = userEvent.setup()
      render(<ProfileForm {...defaultProps} />)

      // Fill form with lowercase name
      await user.type(screen.getByLabelText(/first name/i), 'john doe')
      await user.type(screen.getByLabelText(/age/i), '25')
      
      const ratingSlider = screen.getByLabelText(/rating/i)
      fireEvent.change(ratingSlider, { target: { value: '7.5' } })

      const submitButton = screen.getByRole('button', { name: /continue/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: 'John Doe'
          })
        )
      })
    })

    it('handles optional ethnicity field', async () => {
      const user = userEvent.setup()
      render(<ProfileForm {...defaultProps} />)

      // Fill required fields only
      await user.type(screen.getByLabelText(/first name/i), 'John')
      await user.type(screen.getByLabelText(/age/i), '25')
      
      const ratingSlider = screen.getByLabelText(/rating/i)
      fireEvent.change(ratingSlider, { target: { value: '7.5' } })

      const submitButton = screen.getByRole('button', { name: /continue/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            ethnicity: ''
          })
        )
      })
    })
  })

  describe('Session Storage Integration', () => {
    it('saves form data to session storage on input', async () => {
      const user = userEvent.setup()
      render(<ProfileForm {...defaultProps} />)

      await user.type(screen.getByLabelText(/first name/i), 'John')

      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'cpn_onboarding_profile',
          expect.stringContaining('John')
        )
      })
    })

    it('loads existing data from session storage', () => {
      const existingData = {
        firstName: 'Jane',
        age: 30,
        ethnicity: 'asian',
        rating: 9.0
      }

      mockLocalStorage.setItem('cpn_onboarding_profile', JSON.stringify(existingData))

      render(<ProfileForm {...defaultProps} />)

      expect(screen.getByDisplayValue('Jane')).toBeInTheDocument()
      expect(screen.getByDisplayValue('30')).toBeInTheDocument()
      expect(screen.getByDisplayValue('asian')).toBeInTheDocument()
      expect(screen.getByDisplayValue('9')).toBeInTheDocument()
    })

    it('clears session storage on successful submission', async () => {
      const user = userEvent.setup()
      render(<ProfileForm {...defaultProps} />)

      // Fill and submit form
      await user.type(screen.getByLabelText(/first name/i), 'John')
      await user.type(screen.getByLabelText(/age/i), '25')
      
      const ratingSlider = screen.getByLabelText(/rating/i)
      fireEvent.change(ratingSlider, { target: { value: '7.5' } })

      const submitButton = screen.getByRole('button', { name: /continue/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('cpn_onboarding_profile')
      })
    })
  })

  describe('Loading States', () => {
    it('disables form when loading', () => {
      render(<ProfileForm {...defaultProps} isLoading={true} />)

      expect(screen.getByLabelText(/first name/i)).toBeDisabled()
      expect(screen.getByLabelText(/age/i)).toBeDisabled()
      expect(screen.getByLabelText(/ethnicity/i)).toBeDisabled()
      expect(screen.getByLabelText(/rating/i)).toBeDisabled()
      expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled()
    })

    it('shows loading spinner when submitting', () => {
      render(<ProfileForm {...defaultProps} isLoading={true} />)

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<ProfileForm {...defaultProps} />)

      const form = screen.getByRole('form')
      expect(form).toHaveAccessibleName(/add profile/i)

      // Check all form fields have labels
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/age/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/ethnicity/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/rating/i)).toBeInTheDocument()
    })

    it('has proper error announcements', async () => {
      const user = userEvent.setup()
      render(<ProfileForm {...defaultProps} />)

      const submitButton = screen.getByRole('button', { name: /continue/i })
      await user.click(submitButton)

      await waitFor(() => {
        const errorMessages = screen.getAllByRole('alert')
        expect(errorMessages.length).toBeGreaterThan(0)
      })
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<ProfileForm {...defaultProps} />)

      const firstNameInput = screen.getByLabelText(/first name/i)
      firstNameInput.focus()

      // Tab through all form elements
      await user.tab()
      expect(screen.getByLabelText(/age/i)).toHaveFocus()

      await user.tab()
      expect(screen.getByLabelText(/ethnicity/i)).toHaveFocus()

      await user.tab()
      expect(screen.getByLabelText(/rating/i)).toHaveFocus()

      await user.tab()
      expect(screen.getByRole('button', { name: /continue/i })).toHaveFocus()
    })
  })

  describe('Mobile Responsiveness', () => {
    it('has touch-friendly input sizes', () => {
      render(<ProfileForm {...defaultProps} />)

      const submitButton = screen.getByRole('button', { name: /continue/i })
      const styles = window.getComputedStyle(submitButton)
      
      // Button should have minimum 44px touch target
      expect(parseInt(styles.minHeight || '0')).toBeGreaterThanOrEqual(44)
    })

    it('uses appropriate input modes for mobile', () => {
      render(<ProfileForm {...defaultProps} />)

      const ageInput = screen.getByLabelText(/age/i)
      expect(ageInput).toHaveAttribute('inputMode', 'numeric')
    })
  })

  describe('Rating Component Integration', () => {
    it('displays all rating options', () => {
      render(<ProfileForm {...defaultProps} />)

      const ratingSlider = screen.getByLabelText(/rating/i)
      expect(ratingSlider).toHaveAttribute('min', '5')
      expect(ratingSlider).toHaveAttribute('max', '10')
      expect(ratingSlider).toHaveAttribute('step', '0.5')
    })

    it('formats rating display correctly', async () => {
      const user = userEvent.setup()
      render(<ProfileForm {...defaultProps} />)

      const ratingSlider = screen.getByLabelText(/rating/i)
      fireEvent.change(ratingSlider, { target: { value: '8.5' } })

      expect(screen.getByText('8.5/10')).toBeInTheDocument()
    })
  })

  describe('Ethnicity Dropdown Integration', () => {
    it('displays all ethnicity options', () => {
      render(<ProfileForm {...defaultProps} />)

      const ethnicitySelect = screen.getByLabelText(/ethnicity/i)
      
      ETHNICITY_OPTIONS.forEach(option => {
        expect(screen.getByRole('option', { name: option.label })).toBeInTheDocument()
      })
    })

    it('shows "Prefer not to say" as default option', () => {
      render(<ProfileForm {...defaultProps} />)

      const defaultOption = screen.getByRole('option', { name: /prefer not to say/i })
      expect(defaultOption).toHaveAttribute('selected')
    })
  })
})