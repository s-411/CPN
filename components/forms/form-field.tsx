'use client'

import React from 'react'

interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
  className?: string
  description?: string
}

export function FormField({
  label,
  required = false,
  error,
  children,
  className = '',
  description
}: FormFieldProps) {
  const fieldId = React.useId()
  const errorId = error ? `${fieldId}-error` : undefined
  const descriptionId = description ? `${fieldId}-description` : undefined

  return (
    <div className={className}>
      <label 
        htmlFor={fieldId}
        className="block text-sm font-medium text-cpn-white mb-2"
      >
        {label}
        {required && (
          <span className="text-cpn-yellow ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      
      {description && (
        <p 
          id={descriptionId}
          className="text-xs text-cpn-gray mb-2"
        >
          {description}
        </p>
      )}
      
      <div className="relative">
        {React.isValidElement(children) ? React.cloneElement(children, {
          id: fieldId,
          'aria-describedby': [errorId, descriptionId].filter(Boolean).join(' ') || undefined,
          'aria-invalid': !!error
        } as any) : children}
      </div>
      
      {error && (
        <p 
          id={errorId}
          role="alert"
          className="mt-2 text-xs text-red-400 animate-slide-up"
        >
          {error}
        </p>
      )}
    </div>
  )
}