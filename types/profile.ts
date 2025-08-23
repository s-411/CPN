import { ProfileFormData, ProfileSessionData, ETHNICITY_OPTIONS, RATING_OPTIONS } from '@/lib/validations/profile'

// Re-export validation types for consistent imports
export type { ProfileFormData, ProfileSessionData } from '@/lib/validations/profile'

// Form state and UI-specific types
export interface ProfileFormState {
  data: Partial<ProfileFormData>
  errors: Record<string, string>
  isSubmitting: boolean
  isDirty: boolean
  isValid: boolean
  touchedFields: Set<keyof ProfileFormData>
}

// Form field component props interface
export interface FormFieldProps {
  name: keyof ProfileFormData
  label: string
  required?: boolean
  error?: string
  disabled?: boolean
  className?: string
}

// Specific field component interfaces
export interface TextFieldProps extends FormFieldProps {
  type: 'text' | 'number'
  placeholder?: string
  maxLength?: number
  inputMode?: 'text' | 'numeric'
  autoComplete?: string
}

export interface SelectFieldProps extends FormFieldProps {
  options: readonly { value: string; label: string }[]
  placeholder?: string
  defaultValue?: string
}

export interface RatingFieldProps extends FormFieldProps {
  min: number
  max: number
  step: number
  options: readonly number[]
  displayFormat?: (value: number) => string
}

// Session storage interface
export interface ProfileSessionManager {
  save: (data: Partial<ProfileSessionData>) => void
  load: () => ProfileSessionData | null
  clear: () => void
  exists: () => boolean
  merge: (data: Partial<ProfileSessionData>) => void
}

// Onboarding flow context types
export interface OnboardingFlowState {
  currentStep: OnboardingStep
  profile: ProfileSessionData | null
  completedSteps: Set<OnboardingStep>
  canProceed: boolean
}

export enum OnboardingStep {
  ADD_PROFILE = 'add-profile',
  DATA_ENTRY = 'data-entry',
  ACCOUNT_CREATION = 'account-creation',
  CPN_RESULT = 'cpn-result',
  UPGRADE_PROMPT = 'upgrade-prompt'
}

export interface OnboardingFlowActions {
  setProfile: (profile: ProfileSessionData) => void
  nextStep: () => void
  previousStep: () => void
  completeStep: (step: OnboardingStep) => void
  resetFlow: () => void
}

// Form submission and navigation types
export interface ProfileFormSubmitResult {
  success: boolean
  data?: ProfileFormData
  errors?: Record<string, string>
  redirect?: string
}

export interface FormNavigation {
  canGoBack: boolean
  canProceed: boolean
  onBack?: () => void
  onNext?: (data: ProfileFormData) => void | Promise<void>
  nextLabel?: string
  backLabel?: string
}

// Analytics and tracking types
export interface ProfileFormAnalytics {
  formStarted: (timestamp: Date) => void
  fieldInteraction: (field: keyof ProfileFormData, action: 'focus' | 'blur' | 'change') => void
  validationError: (field: keyof ProfileFormData, error: string) => void
  formSubmitted: (data: ProfileFormData, timeToComplete: number) => void
  formAbandoned: (lastField: keyof ProfileFormData, timeSpent: number) => void
}

// Utility type helpers
export type EthnicityOption = typeof ETHNICITY_OPTIONS[number]
export type RatingOption = typeof RATING_OPTIONS[number]

// Form component configuration
export interface ProfileFormConfig {
  enableAnalytics: boolean
  enableAutoSave: boolean
  autoSaveInterval: number
  showProgressIndicator: boolean
  allowBack: boolean
  customValidationRules?: Partial<Record<keyof ProfileFormData, (value: any) => string | null>>
}

// Error handling types
export interface ProfileFormError extends Error {
  field?: keyof ProfileFormData
  code: 'VALIDATION_ERROR' | 'SESSION_ERROR' | 'NETWORK_ERROR' | 'UNKNOWN_ERROR'
  details?: Record<string, any>
}

// Default configuration values
export const DEFAULT_FORM_CONFIG: ProfileFormConfig = {
  enableAnalytics: true,
  enableAutoSave: true,
  autoSaveInterval: 2000, // 2 seconds
  showProgressIndicator: true,
  allowBack: false, // No back from onboarding entry point
}

// Form field validation state
export interface FieldValidationState {
  isValid: boolean
  error: string | null
  isDirty: boolean
  isTouched: boolean
  isValidating: boolean
}

// Complete form state for advanced state management
export interface CompleteProfileFormState extends ProfileFormState {
  config: ProfileFormConfig
  navigation: FormNavigation
  sessionManager: ProfileSessionManager
  analytics?: ProfileFormAnalytics
  fieldStates: Record<keyof ProfileFormData, FieldValidationState>
}