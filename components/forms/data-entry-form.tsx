'use client'

import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  dataEntrySchema, 
  NUTS_OPTIONS, 
  TIME_SUGGESTIONS, 
  COST_SUGGESTIONS,
  validateCurrency,
  validateTime,
  formatCurrency,
  formatTime
} from '@/lib/validations/data-entry'
import type { DataEntryFormData } from '@/lib/validations/data-entry'
import type { DataEntryData } from '@/lib/utils/session-storage'
import { useOnboarding, useOnboardingStep } from '@/contexts/onboarding-context'
import { FormField } from './form-field'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface DataEntryFormProps {
  onSubmit: (data: DataEntryData) => void | Promise<void>
  onBack?: () => void
  showBackButton?: boolean
  isLoading?: boolean
  className?: string
}

export function DataEntryForm({
  onSubmit,
  onBack,
  showBackButton = true,
  isLoading = false,
  className = ''
}: DataEntryFormProps) {
  const { saveDataEntryData, isLoading: contextLoading } = useOnboarding()
  const existingData = useOnboardingStep('dataEntry')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [costInput, setCostInput] = useState('')
  const [timeInput, setTimeInput] = useState('')
  const [dateInput, setDateInput] = useState('')
  
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty, isValid }
  } = useForm<DataEntryFormData>({
    resolver: zodResolver(dataEntrySchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {
      date: '',
      cost: 0,
      time: 1,
      nuts: 0,
      notes: ''
    }
  })

  // Load existing data on mount
  useEffect(() => {
    if (existingData && !contextLoading) {
      setValue('date', existingData.date || '', { shouldDirty: false })
      setValue('cost', existingData.cost || 0, { shouldDirty: false })
      setValue('time', existingData.time || 1, { shouldDirty: false })
      setValue('nuts', existingData.nuts || 0, { shouldDirty: false })
      setValue('notes', existingData.notes || '', { shouldDirty: false })
      
      // Set display inputs
      setCostInput(existingData.cost ? formatCurrency(existingData.cost) : '')
      setTimeInput(existingData.time ? existingData.time.toString() : '1')
      if (existingData.date) {
        // Convert YYYY-MM-DD to MM/DD/YYYY for display
        const [year, month, day] = existingData.date.split('-')
        setDateInput(`${month}/${day}/${year}`)
      }
    }
  }, [existingData, contextLoading, setValue])

  // Auto-save to context when form data changes
  const watchedFields = watch()
  useEffect(() => {
    if (isDirty && !contextLoading && !isSubmitting && watchedFields.date) {
      const timeoutId = setTimeout(() => {
        saveDataEntryData({
          date: watchedFields.date || '',
          cost: watchedFields.cost || 0,
          time: watchedFields.time || 1,
          nuts: watchedFields.nuts || 0,
          notes: watchedFields.notes || ''
        })
      }, 500)
      
      return () => clearTimeout(timeoutId)
    }
  }, [watchedFields, isDirty, saveDataEntryData, contextLoading, isSubmitting])

  const handleFormSubmit = async (data: DataEntryFormData) => {
    if (isSubmitting || isLoading || contextLoading) return

    try {
      setIsSubmitting(true)
      const submissionData: DataEntryData = {
        date: data.date,
        cost: data.cost,
        time: data.time,
        nuts: data.nuts,
        notes: data.notes
      }
      
      saveDataEntryData(submissionData)
      await onSubmit(submissionData)
    } catch (error) {
      console.error('Data entry form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackClick = () => {
    if (onBack && !isSubmitting && !isLoading && !contextLoading) {
      onBack()
    }
  }

  const handleCostChange = (value: string) => {
    setCostInput(value)
    const parsedCost = validateCurrency(value)
    if (parsedCost !== null) {
      setValue('cost', parsedCost, { shouldDirty: true })
    }
  }

  const handleTimeChange = (value: string) => {
    setTimeInput(value)
    const parsedTime = validateTime(value)
    if (parsedTime !== null) {
      setValue('time', parsedTime, { shouldDirty: true })
    }
  }

  const handleCostSuggestion = (cost: number) => {
    setCostInput(formatCurrency(cost))
    setValue('cost', cost, { shouldDirty: true })
  }

  const handleTimeSuggestion = (time: number) => {
    setTimeInput(time.toString())
    setValue('time', time, { shouldDirty: true })
  }

  const handleDateChange = (value: string) => {
    setDateInput(value)
    
    // Allow various formats while typing
    const cleaned = value.replace(/\D/g, '')
    
    // Auto-format as user types
    let formatted = ''
    if (cleaned.length >= 2) {
      formatted = cleaned.slice(0, 2) + '/'
      if (cleaned.length >= 4) {
        formatted += cleaned.slice(2, 4) + '/'
        if (cleaned.length >= 4) {
          formatted += cleaned.slice(4, 8)
        }
      } else if (cleaned.length > 2) {
        formatted += cleaned.slice(2)
      }
    } else {
      formatted = cleaned
    }
    
    // Update display if auto-formatting
    if (value !== formatted && cleaned.length > 0) {
      setDateInput(formatted)
    }
    
    // Validate and set the actual date value in YYYY-MM-DD format
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/
    const match = (formatted || value).match(dateRegex)
    if (match) {
      const [, month, day, year] = match
      const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      setValue('date', isoDate, { shouldDirty: true })
    }
  }

  const isFormDisabled = isLoading || isSubmitting || contextLoading
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="bg-cpn-dark p-6 rounded-lg space-y-6 animate-fade-in"
        role="form"
        aria-label="Data Entry Form"
        noValidate
      >
        {/* Form Header */}


        {/* Date Field */}
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <FormField
              label="What date was it?"
              required
              error={errors.date?.message}
              className="space-y-2"
            >
              <input
                type="text"
                placeholder="MM/DD/YYYY"
                value={dateInput}
                onChange={(e) => handleDateChange(e.target.value)}
                maxLength={10}
                disabled={isFormDisabled}
                className={`
                  w-full min-h-[44px] p-3 rounded-lg border transition-all duration-200
                  bg-cpn-dark text-cpn-white placeholder-cpn-gray
                  focus:ring-2 focus:ring-cpn-yellow focus:border-cpn-yellow outline-none
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${errors.date 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-cpn-gray hover:border-cpn-white'
                  }
                `}
                aria-describedby={errors.date ? 'date-error' : undefined}
              />
              <p className="text-xs text-cpn-gray">
                Enter the date in MM/DD/YYYY format
              </p>
            </FormField>
          )}
        />

        {/* Cost Field */}
        <FormField
          label="Total amount spent"
          required
          error={errors.cost?.message}
          className="space-y-2"
        >
          <div className="space-y-3">
            <input
              type="text"
              placeholder="$0.00"
              value={costInput}
              onChange={(e) => handleCostChange(e.target.value)}
              disabled={isFormDisabled}
              className={`
                w-full min-h-[44px] p-3 rounded-lg border transition-all duration-200
                bg-cpn-dark text-cpn-white placeholder-cpn-gray
                focus:ring-2 focus:ring-cpn-yellow focus:border-cpn-yellow outline-none
                disabled:opacity-50 disabled:cursor-not-allowed
                ${errors.cost 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-cpn-gray hover:border-cpn-white'
                }
              `}
              aria-describedby={errors.cost ? 'cost-error' : 'cost-help'}
            />
            
            {/* Cost Suggestions */}
            <div className="flex flex-wrap gap-2">
              {COST_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion.value}
                  type="button"
                  onClick={() => handleCostSuggestion(suggestion.value)}
                  disabled={isFormDisabled}
                  className="px-3 py-1 text-xs bg-cpn-gray/20 text-cpn-gray hover:bg-cpn-yellow/20 hover:text-cpn-yellow rounded-full transition-all duration-200 disabled:opacity-50"
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
            
            <p id="cost-help" className="text-xs text-cpn-gray">
              Include all expenses: food, drinks, activities, transportation
            </p>
          </div>
        </FormField>

        {/* Time Field */}
        <FormField
          label="Total time invested"
          required
          error={errors.time?.message}
          className="space-y-2"
        >
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                inputMode="decimal"
                placeholder="1"
                min={0.25}
                max={24}
                step={0.25}
                value={timeInput}
                onChange={(e) => handleTimeChange(e.target.value)}
                disabled={isFormDisabled}
                className={`
                  flex-1 min-h-[44px] p-3 rounded-lg border transition-all duration-200
                  bg-cpn-dark text-cpn-white placeholder-cpn-gray
                  focus:ring-2 focus:ring-cpn-yellow focus:border-cpn-yellow outline-none
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${errors.time 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-cpn-gray hover:border-cpn-white'
                  }
                `}
                aria-describedby={errors.time ? 'time-error' : 'time-help'}
              />
              <span className="text-cpn-gray text-sm">hours</span>
            </div>
            
            {/* Time Suggestions */}
            <div className="flex flex-wrap gap-2">
              {TIME_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion.value}
                  type="button"
                  onClick={() => handleTimeSuggestion(suggestion.value)}
                  disabled={isFormDisabled}
                  className="px-3 py-1 text-xs bg-cpn-gray/20 text-cpn-gray hover:bg-cpn-yellow/20 hover:text-cpn-yellow rounded-full transition-all duration-200 disabled:opacity-50"
                  title={suggestion.description}
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
            
            <p id="time-help" className="text-xs text-cpn-gray">
              Total time from start to finish, including travel
            </p>
          </div>
        </FormField>

        {/* Nuts Field */}
        <Controller
          name="nuts"
          control={control}
          render={({ field }) => (
            <FormField
              label="Number of Nuts"
              required
              error={errors.nuts?.message}
              className="space-y-2"
            >
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  {/* Top row: 0, 1, 2 */}
                  {NUTS_OPTIONS.slice(0, 3).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => field.onChange(option.value)}
                      disabled={isFormDisabled}
                      className={`
                        min-h-[60px] w-full p-3 rounded-lg border transition-all duration-200
                        focus:ring-2 focus:ring-cpn-yellow focus:outline-none
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${field.value === option.value
                          ? 'bg-cpn-yellow/20 border-cpn-yellow text-cpn-yellow'
                          : 'bg-cpn-dark border-cpn-gray text-cpn-gray hover:border-cpn-white hover:text-cpn-white'
                        }
                      `}
                      aria-pressed={field.value === option.value}
                      aria-describedby={errors.nuts ? 'nuts-error' : undefined}
                    >
                      <div className="text-2xl font-bold">{option.label}</div>
                    </button>
                  ))}
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {/* Bottom row: 3, 4, 5 */}
                  {NUTS_OPTIONS.slice(3, 6).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => field.onChange(option.value)}
                      disabled={isFormDisabled}
                      className={`
                        min-h-[60px] w-full p-3 rounded-lg border transition-all duration-200
                        focus:ring-2 focus:ring-cpn-yellow focus:outline-none
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${field.value === option.value
                          ? 'bg-cpn-yellow/20 border-cpn-yellow text-cpn-yellow'
                          : 'bg-cpn-dark border-cpn-gray text-cpn-gray hover:border-cpn-white hover:text-cpn-white'
                        }
                      `}
                      aria-pressed={field.value === option.value}
                      aria-describedby={errors.nuts ? 'nuts-error' : undefined}
                    >
                      <div className="text-2xl font-bold">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <p className="text-xs text-cpn-gray text-center">
                Select the number of nuts you bust (0-5)
              </p>
            </FormField>
          )}
        />

        {/* Notes Field */}

        {/* Form Actions */}
        <div className="space-y-4 pt-4">
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
                <span>Calculating...</span>
              </>
            ) : (
              <span>Calculate CPN</span>
            )}
          </button>
          
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
        </div>

        {/* Form Footer */}
      </form>
    </div>
  )
}