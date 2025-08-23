'use client'

import React, { useState } from 'react'
import { RATING_OPTIONS } from '@/lib/validations/profile'
import { formatRatingDisplay } from '@/lib/utils/profile-form'
import { FormField } from './form-field'

interface RatingSelectorProps {
  label: string
  value: number
  onChange: (value: number) => void
  error?: string
  disabled?: boolean
  required?: boolean
  className?: string
}

export function RatingSelector({
  label,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  className = ''
}: RatingSelectorProps) {
  const [isDragging, setIsDragging] = useState(false)

  // Find the current rating index
  const currentIndex = RATING_OPTIONS.findIndex(rating => rating === value)
  const validIndex = currentIndex >= 0 ? currentIndex : 0

  // Calculate percentage for slider position
  const percentage = (validIndex / (RATING_OPTIONS.length - 1)) * 100

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sliderValue = parseFloat(e.target.value)
    const index = Math.round(sliderValue)
    const rating = RATING_OPTIONS[index] || RATING_OPTIONS[0]
    onChange(rating)
  }

  const handleRatingClick = (rating: number) => {
    if (!disabled) {
      onChange(rating)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    let newIndex = validIndex
    
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault()
        newIndex = Math.max(0, validIndex - 1)
        break
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault()
        newIndex = Math.min(RATING_OPTIONS.length - 1, validIndex + 1)
        break
      case 'Home':
        e.preventDefault()
        newIndex = 0
        break
      case 'End':
        e.preventDefault()
        newIndex = RATING_OPTIONS.length - 1
        break
      default:
        return
    }
    
    onChange(RATING_OPTIONS[newIndex])
  }

  return (
    <FormField
      label={label}
      required={required}
      error={error}
      className={className}
      description="Rate from 5.0 to 10.0 in half-point increments"
    >
      <div className="space-y-4">
        {/* Current Rating Display */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-12 bg-cpn-yellow text-cpn-dark font-bold text-lg rounded-lg">
            {formatRatingDisplay(value)}
          </div>
        </div>

        {/* Custom Slider */}
        <div className="relative">
          <input
            type="range"
            min="0"
            max={RATING_OPTIONS.length - 1}
            step="1"
            value={validIndex}
            onChange={handleSliderChange}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className="sr-only" // Hide the default slider, we'll style our own
            aria-label={`Rating: ${formatRatingDisplay(value)}`}
            aria-valuemin={5.0}
            aria-valuemax={10.0}
            aria-valuenow={value}
            aria-valuetext={formatRatingDisplay(value)}
          />
          
          {/* Custom Slider Track */}
          <div className="relative h-2 bg-cpn-gray rounded-full overflow-hidden">
            {/* Progress Track */}
            <div 
              className="h-full bg-cpn-yellow transition-all duration-200 rounded-full"
              style={{ width: `${percentage}%` }}
            />
            
            {/* Slider Thumb */}
            <div 
              className={`
                absolute top-1/2 w-6 h-6 -mt-3 -ml-3 bg-cpn-yellow border-2 border-cpn-white
                rounded-full shadow-lg cursor-pointer transition-all duration-200
                ${isDragging ? 'scale-110 shadow-xl' : 'hover:scale-105'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                focus:ring-2 focus:ring-cpn-yellow focus:ring-offset-2 focus:ring-offset-cpn-dark
              `}
              style={{ left: `${percentage}%` }}
              tabIndex={disabled ? -1 : 0}
              role="slider"
              aria-label={`Rating slider: ${formatRatingDisplay(value)}`}
              aria-valuemin={5.0}
              aria-valuemax={10.0}
              aria-valuenow={value}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Tick Marks */}
          <div className="flex justify-between mt-2 px-3">
            {RATING_OPTIONS.map((rating, index) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleRatingClick(rating)}
                disabled={disabled}
                className={`
                  relative w-2 h-2 rounded-full transition-all duration-200
                  ${rating === value 
                    ? 'bg-cpn-yellow scale-125' 
                    : 'bg-cpn-gray hover:bg-cpn-white'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  focus:ring-2 focus:ring-cpn-yellow focus:ring-offset-1 focus:ring-offset-cpn-dark
                `}
                aria-label={`Set rating to ${formatRatingDisplay(rating)}`}
              />
            ))}
          </div>

          {/* Rating Labels */}
          <div className="flex justify-between mt-1 px-1 text-xs text-cpn-gray">
            <span>5.0</span>
            <span>7.5</span>
            <span>10.0</span>
          </div>
        </div>

        {/* Quick Rating Buttons */}
        <div className="grid grid-cols-6 gap-2 mt-4">
          {RATING_OPTIONS.map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => handleRatingClick(rating)}
              disabled={disabled}
              className={`
                min-h-[44px] py-2 px-1 rounded-lg text-sm font-medium transition-all duration-200
                ${rating === value
                  ? 'bg-cpn-yellow text-cpn-dark scale-105'
                  : 'bg-cpn-dark border border-cpn-gray text-cpn-white hover:border-cpn-white hover:bg-cpn-gray hover:bg-opacity-20'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                focus:ring-2 focus:ring-cpn-yellow focus:ring-offset-2 focus:ring-offset-cpn-dark focus:outline-none
              `}
              aria-label={`Set rating to ${formatRatingDisplay(rating)}`}
              aria-pressed={rating === value}
            >
              {rating.toFixed(1)}
            </button>
          ))}
        </div>

        {/* Rating Guide */}
        <div className="text-xs text-cpn-gray space-y-1">
          <div className="flex justify-between">
            <span>5.0-6.0: Below Average</span>
            <span>8.5-10.0: Exceptional</span>
          </div>
          <div className="flex justify-center">
            <span>6.5-8.0: Good to Very Good</span>
          </div>
        </div>
      </div>
    </FormField>
  )
}