import { z } from 'zod'

// Ethnicity options as defined in the original requirements
export const ETHNICITY_OPTIONS = [
  { value: '', label: 'Prefer not to say' },
  { value: 'us-uk-can-aus-nz', label: 'US, UK, Canada, Aus, NZ etc.' },
  { value: 'scandinavian', label: 'Scandinavian' },
  { value: 'european', label: 'European' },
  { value: 'eastern-european', label: 'Eastern European/Russian' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'south-american', label: 'South American' },
  { value: 'latin-american', label: 'Latin American' },
  { value: 'asian', label: 'Asian (China, Korea, Japan etc.)' },
  { value: 'southeast-asian', label: 'Southeast Asian' },
  { value: 'middle-eastern', label: 'Middle Eastern' },
  { value: 'black', label: 'Black' },
  { value: 'mixed-other', label: 'Mixed/Other' },
] as const

// Extract the ethnicity values for the schema
const ethnicityValues = ETHNICITY_OPTIONS.map(option => option.value) as [string, ...string[]]

// Rating options (5.0 to 10.0 in 0.5 increments)
export const RATING_OPTIONS = [
  5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0
] as const

// Custom validation functions
const isValidRating = (rating: number): boolean => {
  return RATING_OPTIONS.includes(rating as any)
}

const formatName = (name: string): string => {
  return name.trim()
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Main profile validation schema
export const profileSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes')
    .transform(formatName),
  
  age: z.number()
    .int('Age must be a whole number')
    .min(18, 'Must be at least 18 years old')
    .max(99, 'Age must be less than 100'),
  
  ethnicity: z.enum(ethnicityValues)
    .optional()
    .default(''),
  
  rating: z.number()
    .min(5.0, 'Rating must be at least 5.0')
    .max(10.0, 'Rating must be no more than 10.0')
    .refine(isValidRating, 'Rating must be in 0.5 increments (5.0, 5.5, 6.0, etc.)')
})

// Infer the TypeScript type from the schema
export type ProfileFormData = z.infer<typeof profileSchema>

// Schema for session storage (before transformation)
export const profileSessionSchema = z.object({
  firstName: z.string().min(1),
  age: z.number().int().min(18).max(99),
  ethnicity: z.string().optional().default(''),
  rating: z.number().min(5.0).max(10.0).refine(isValidRating)
})

export type ProfileSessionData = z.infer<typeof profileSessionSchema>

// Validation error helper type
export type ProfileValidationError = {
  field: keyof ProfileFormData
  message: string
}

// Form field configurations for UI components
export const FORM_FIELD_CONFIG = {
  firstName: {
    type: 'text',
    placeholder: 'Enter first name',
    maxLength: 50,
    required: true,
    autoComplete: 'given-name',
  },
  age: {
    type: 'number',
    placeholder: '25',
    min: 18,
    max: 99,
    required: true,
    inputMode: 'numeric' as const,
  },
  ethnicity: {
    type: 'select',
    placeholder: 'Select ethnicity (optional)',
    required: false,
    options: ETHNICITY_OPTIONS,
  },
  rating: {
    type: 'range',
    min: 5.0,
    max: 10.0,
    step: 0.5,
    required: true,
    options: RATING_OPTIONS,
  },
} as const