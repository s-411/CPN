'use client'

import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileSchema, ETHNICITY_OPTIONS } from '@/lib/validations/profile'
import { validateField, sanitizeFormData } from '@/lib/utils/profile-form'
import type { ProfileFormData } from '@/types/profile'
import { useOnboarding, useOnboardingStep } from '@/contexts/onboarding-context'
import { RatingSelector } from './rating-selector'
import { EthnicitySelect } from './ethnicity-select'
import { FormField } from './form-field'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface ProfileFormProps {
  onSubmit: (data: ProfileFormData) => void | Promise<void>
  onBack?: () => void
  showBackButton?: boolean
  isLoading?: boolean
  className?: string
}

export function ProfileForm({
  onSubmit,
  onBack,
  showBackButton = false,
  isLoading = false,
  className = ''
}: ProfileFormProps) {
  const { saveProfileData, isLoading: contextLoading } = useOnboarding()
  const existingProfileData = useOnboardingStep('profile')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
 const {
  control,
  handleSubmit,
  watch,
  setValue,
  formState: { errors, isDirty, isValid }
} = useForm<ProfileFormData>({
  resolver: zodResolver(profileSchema),
  mode: 'onBlur',
  reValidateMode: 'onBlur',
  defaultValues: {
    firstName: '',
    age: 22,            // ← change from undefined to 22
    ethnicity: '',
    rating: 6.0
  }
})


  // Load data from onboarding context on mount
  useEffect(() => {
    if (existingProfileData && !contextLoading) {
      setValue('firstName', existingProfileData.firstName || '', { shouldDirty: false })
      setValue('age', existingProfileData.age, { shouldDirty: false })
      setValue('ethnicity', existingProfileData.ethnicity || '', { shouldDirty: false })
      setValue('rating', existingProfileData.rating || 5.0, { shouldDirty: false })
    }
  }, [existingProfileData, contextLoading, setValue])

  // Auto-save to onboarding context when form data changes
  const watchedFields = watch()
  useEffect(() => {
    // Only auto-save if form is dirty and we're not loading initial data
    if (isDirty && !contextLoading && !isSubmitting) {
      const sanitized = sanitizeFormData(watchedFields)
      if (sanitized.firstName || sanitized.age || sanitized.rating) {
        const timeoutId = setTimeout(() => {
          saveProfileData({
            firstName: sanitized.firstName || '',
            age: sanitized.age || 0,
            ethnicity: sanitized.ethnicity || '',
            rating: sanitized.rating || 5.0
          })
        }, 500) // Debounce auto-save by 500ms
        
        return () => clearTimeout(timeoutId)
      }
    }
  }, [watchedFields, isDirty, saveProfileData, contextLoading, isSubmitting])

  const handleFormSubmit = async (data: ProfileFormData) => {
    if (isSubmitting || isLoading || contextLoading) return

    try {
      setIsSubmitting(true)
      // Save to context before submitting
      saveProfileData(data)
      await onSubmit(data)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackClick = () => {
    if (onBack && !isSubmitting && !isLoading && !contextLoading) {
      onBack()
    }
  }

  const isFormDisabled = isLoading || isSubmitting || contextLoading

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="bg-cpn-dark p-6 rounded-lg space-y-6 animate-fade-in"
        role="form"
        aria-label="Add Profile Form"
        noValidate
      >
        {/* Form Header */}

        {/* First Name Field */}
        <Controller
          name="firstName"
          control={control}
          render={({ field }) => (
            <FormField
              label="First Name"
              required
              error={errors.firstName?.message}
              className="space-y-2"
            >
              <input
                {...field}
                type="text"
                placeholder="Enter first name"
                maxLength={50}
                autoComplete="given-name"
                disabled={isFormDisabled}
                className={`
                  w-full min-h-[44px] p-3 rounded-lg border transition-all duration-200
                  bg-cpn-dark text-cpn-white placeholder-cpn-gray
                  focus:ring-2 focus:ring-cpn-yellow focus:border-cpn-yellow outline-none
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${errors.firstName 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-cpn-gray hover:border-cpn-white'
                  }
                `}
                aria-describedby={errors.firstName ? 'firstName-error' : undefined}
              />
            </FormField>
          )}
        />

        {/* Age Field */}
        <Controller
          name="age"
          control={control}
          render={({ field: { value, onChange, ...field } }) => (
            <FormField
              label="Age"
              required
              error={errors.age?.message}
              className="space-y-2"
            >
              <input
                {...field}
                type="number"
                inputMode="numeric"
                placeholder="25"
                min={18}
                max={99}
                value={value ?? 18}
                onChange={(e) => {
                  const num = parseInt(e.target.value)
                  onChange(isNaN(num) ? undefined : num)
                }}
                disabled={isFormDisabled}
                className={`
                  w-full min-h-[44px] p-3 rounded-lg border transition-all duration-200
                  bg-cpn-dark text-cpn-white placeholder-cpn-gray
                  focus:ring-2 focus:ring-cpn-yellow focus:border-cpn-yellow outline-none
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${errors.age 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-cpn-gray hover:border-cpn-white'
                  }
                `}
                aria-describedby={errors.age ? 'age-error' : undefined}
              />
            </FormField>
          )}
        />

        {/* Ethnicity Field */}
        <Controller
          name="ethnicity"
          control={control}
          render={({ field }) => (
            <EthnicitySelect
              label="Ethnicity (Optional)"
              value={field.value || ''}
              onChange={field.onChange}
              error={errors.ethnicity?.message}
              disabled={isFormDisabled}
            />
          )}
        />

        {/* Rating Field */}
        <Controller
          name="rating"
          control={control}
          render={({ field }) => (
            <RatingSelector
              label="Hotness Rating"
              value={field.value || 5.0}
              onChange={field.onChange}
              error={errors.rating?.message}
              disabled={isFormDisabled}
              required
            />
          )}
        />

        {/* Form Actions */}
        <div className="space-y-4 pt-4">
          {showBackButton && (
            <button
              type="button"
              onClick={handleBackClick}
              disabled={isFormDisabled}
              className="
                w-full min-h-[44px] py-3 px-6 rounded-cpn
                bg-transparent border border-cpn-gray text-cpn-gray
                hover:border-cpn-white hover:text-cpn-white
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
                focus:ring-2 focus:ring-cpn-yellow focus:outline-none
              "
            >
              Back
            </button>
          )}
          
          <button
            type="submit"
            disabled={isFormDisabled || !isValid}
            className={`
              btn-cpn w-full min-h-[44px] flex items-center justify-center space-x-2
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:ring-2 focus:ring-cpn-yellow focus:ring-offset-2 focus:ring-offset-cpn-dark focus:outline-none
              ${!isValid ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isSubmitting || isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Continue</span>
            )}
          </button>
        </div>

        {/* Form Footer */}
      </form>
    </div>
  )
}