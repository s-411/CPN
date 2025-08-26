import { z } from 'zod';

// Common nationality options
export const NATIONALITY_OPTIONS = [
  { value: 'American', label: 'American' },
  { value: 'British', label: 'British' },
  { value: 'Canadian', label: 'Canadian' },
  { value: 'Australian', label: 'Australian' },
  { value: 'German', label: 'German' },
  { value: 'French', label: 'French' },
  { value: 'Italian', label: 'Italian' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'Swedish', label: 'Swedish' },
  { value: 'Norwegian', label: 'Norwegian' },
  { value: 'Danish', label: 'Danish' },
  { value: 'Finnish', label: 'Finnish' },
  { value: 'Dutch', label: 'Dutch' },
  { value: 'Belgian', label: 'Belgian' },
  { value: 'Swiss', label: 'Swiss' },
  { value: 'Austrian', label: 'Austrian' },
  { value: 'Polish', label: 'Polish' },
  { value: 'Czech', label: 'Czech' },
  { value: 'Hungarian', label: 'Hungarian' },
  { value: 'Romanian', label: 'Romanian' },
  { value: 'Bulgarian', label: 'Bulgarian' },
  { value: 'Croatian', label: 'Croatian' },
  { value: 'Serbian', label: 'Serbian' },
  { value: 'Slovenian', label: 'Slovenian' },
  { value: 'Slovak', label: 'Slovak' },
  { value: 'Estonian', label: 'Estonian' },
  { value: 'Latvian', label: 'Latvian' },
  { value: 'Lithuanian', label: 'Lithuanian' },
  { value: 'Russian', label: 'Russian' },
  { value: 'Ukrainian', label: 'Ukrainian' },
  { value: 'Belarusian', label: 'Belarusian' },
  { value: 'Portuguese', label: 'Portuguese' },
  { value: 'Brazilian', label: 'Brazilian' },
  { value: 'Mexican', label: 'Mexican' },
  { value: 'Colombian', label: 'Colombian' },
  { value: 'Argentine', label: 'Argentine' },
  { value: 'Chilean', label: 'Chilean' },
  { value: 'Peruvian', label: 'Peruvian' },
  { value: 'Venezuelan', label: 'Venezuelan' },
  { value: 'Japanese', label: 'Japanese' },
  { value: 'Korean', label: 'Korean' },
  { value: 'Chinese', label: 'Chinese' },
  { value: 'Thai', label: 'Thai' },
  { value: 'Vietnamese', label: 'Vietnamese' },
  { value: 'Filipino', label: 'Filipino' },
  { value: 'Indonesian', label: 'Indonesian' },
  { value: 'Malaysian', label: 'Malaysian' },
  { value: 'Singaporean', label: 'Singaporean' },
  { value: 'Indian', label: 'Indian' },
  { value: 'Pakistani', label: 'Pakistani' },
  { value: 'Bangladeshi', label: 'Bangladeshi' },
  { value: 'Sri Lankan', label: 'Sri Lankan' },
  { value: 'Israeli', label: 'Israeli' },
  { value: 'Lebanese', label: 'Lebanese' },
  { value: 'Turkish', label: 'Turkish' },
  { value: 'Greek', label: 'Greek' },
  { value: 'South African', label: 'South African' },
  { value: 'Egyptian', label: 'Egyptian' },
  { value: 'Moroccan', label: 'Moroccan' },
  { value: 'Tunisian', label: 'Tunisian' },
  { value: 'Algerian', label: 'Algerian' },
  { value: 'Other', label: 'Other' },
] as const;

// Extract nationality values for validation
const nationalityValues = NATIONALITY_OPTIONS.map(option => option.value) as [string, ...string[]];

// Status options
export const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'archived', label: 'Archived' },
] as const;

const statusValues = STATUS_OPTIONS.map(option => option.value) as [string, ...string[]];

// Helper function to format name
const formatName = (name: string): string => {
  return name.trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Main girl validation schema for forms
export const girlSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
    .transform(formatName),
  
  age: z.number()
    .int('Age must be a whole number')
    .min(18, 'Age must be at least 18')
    .max(120, 'Age must be less than 120'),
  
  nationality: z.string()
    .min(1, 'Nationality is required')
    .max(50, 'Nationality must be less than 50 characters'),
  
  rating: z.number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(10, 'Rating must be no more than 10'),
  
  status: z.enum(statusValues).optional().default('active'),
});

// Schema for creating a new girl (excludes system fields)
export const createGirlSchema = girlSchema.omit({ status: true });

// Schema for updating a girl (all fields optional except id)
export const updateGirlSchema = girlSchema.partial();

// Infer TypeScript types
export type GirlFormData = z.infer<typeof girlSchema>;
export type CreateGirlFormData = z.infer<typeof createGirlSchema>;
export type UpdateGirlFormData = z.infer<typeof updateGirlSchema>;

// Form field configurations for UI components
export const GIRL_FORM_CONFIG = {
  name: {
    type: 'text' as const,
    label: 'Name',
    placeholder: 'Enter girl\'s name',
    maxLength: 100,
    required: true,
    autoComplete: 'name',
  },
  age: {
    type: 'number' as const,
    label: 'Age',
    placeholder: '25',
    min: 18,
    max: 120,
    required: true,
    inputMode: 'numeric' as const,
  },
  nationality: {
    type: 'select' as const,
    label: 'Nationality',
    placeholder: 'Select nationality',
    required: true,
    options: NATIONALITY_OPTIONS,
    allowCustom: true,
  },
  rating: {
    type: 'number' as const,
    label: 'Rating (1-10)',
    placeholder: '8',
    min: 1,
    max: 10,
    required: true,
    inputMode: 'numeric' as const,
  },
  status: {
    type: 'select' as const,
    label: 'Status',
    placeholder: 'Select status',
    required: false,
    options: STATUS_OPTIONS,
    default: 'active',
  },
} as const;

// Validation error helper type
export type GirlValidationError = {
  field: keyof GirlFormData;
  message: string;
};

// Helper functions
export const validateGirlForm = (data: unknown): { success: boolean; data?: CreateGirlFormData; errors?: GirlValidationError[] } => {
  const result = createGirlSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: GirlValidationError[] = result.error.errors.map(err => ({
    field: err.path[0] as keyof GirlFormData,
    message: err.message,
  }));
  
  return { success: false, errors };
};

export const isValidNationality = (nationality: string): boolean => {
  return nationalityValues.includes(nationality) || nationality.length > 0;
};

export const isValidRating = (rating: number): boolean => {
  return Number.isInteger(rating) && rating >= 1 && rating <= 10;
};

export const isValidAge = (age: number): boolean => {
  return Number.isInteger(age) && age >= 18 && age <= 120;
};