'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ETHNICITY_OPTIONS } from '@/lib/validations/profile'
import { formatEthnicityDisplay } from '@/lib/utils/profile-form'
import { FormField } from './form-field'
import { ChevronDownIcon } from 'lucide-react'

interface EthnicitySelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  required?: boolean
  className?: string
}

export function EthnicitySelect({
  label,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  className = ''
}: EthnicitySelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // Find the current option
  const currentOption = ETHNICITY_OPTIONS.find(opt => opt.value === value) || ETHNICITY_OPTIONS[0]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setFocusedIndex(-1)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listRef.current) {
      const focusedElement = listRef.current.children[focusedIndex] as HTMLElement
      focusedElement?.focus()
    }
  }, [focusedIndex, isOpen])

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
      if (!isOpen) {
        // When opening, set focus to current option or first option
        const currentIndex = ETHNICITY_OPTIONS.findIndex(opt => opt.value === value)
        setFocusedIndex(currentIndex >= 0 ? currentIndex : 0)
      }
    }
  }

  const handleSelect = (option: typeof ETHNICITY_OPTIONS[number]) => {
    onChange(option.value)
    setIsOpen(false)
    setFocusedIndex(-1)
    triggerRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (!isOpen) {
          handleToggle()
        } else if (focusedIndex >= 0) {
          handleSelect(ETHNICITY_OPTIONS[focusedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setFocusedIndex(-1)
        triggerRef.current?.focus()
        break
      case 'ArrowDown':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
          setFocusedIndex(0)
        } else {
          setFocusedIndex(prev => 
            prev < ETHNICITY_OPTIONS.length - 1 ? prev + 1 : 0
          )
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
          setFocusedIndex(ETHNICITY_OPTIONS.length - 1)
        } else {
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : ETHNICITY_OPTIONS.length - 1
          )
        }
        break
      case 'Home':
        if (isOpen) {
          e.preventDefault()
          setFocusedIndex(0)
        }
        break
      case 'End':
        if (isOpen) {
          e.preventDefault()
          setFocusedIndex(ETHNICITY_OPTIONS.length - 1)
        }
        break
      default:
        // Type-ahead search
        if (isOpen && e.key.length === 1) {
          e.preventDefault()
          const searchChar = e.key.toLowerCase()
          const startIndex = focusedIndex + 1
          let matchIndex = ETHNICITY_OPTIONS.findIndex((opt, idx) => 
            idx >= startIndex && opt.label.toLowerCase().startsWith(searchChar)
          )
          
          if (matchIndex === -1) {
            matchIndex = ETHNICITY_OPTIONS.findIndex(opt => 
              opt.label.toLowerCase().startsWith(searchChar)
            )
          }
          
          if (matchIndex >= 0) {
            setFocusedIndex(matchIndex)
          }
        }
        break
    }
  }

  const handleOptionKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleSelect(ETHNICITY_OPTIONS[index])
    }
  }

  return (
    <FormField
      label={label}
      required={required}
      error={error}
      className={className}
      description="This information is optional and helps with analytics"
    >
      <div 
        ref={dropdownRef}
        className="relative"
      >
        {/* Trigger Button */}
        <button
          ref={triggerRef}
          type="button"
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`
            w-full min-h-[44px] p-3 rounded-lg border transition-all duration-200
            bg-cpn-dark text-cpn-white text-left
            focus:ring-2 focus:ring-cpn-yellow focus:border-cpn-yellow outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error 
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
              : 'border-cpn-gray hover:border-cpn-white'
            }
            ${isOpen ? 'border-cpn-yellow ring-2 ring-cpn-yellow' : ''}
          `}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={`${label.replace(/\s+/g, '-').toLowerCase()}-label`}
          aria-describedby={error ? `${label.replace(/\s+/g, '-').toLowerCase()}-error` : undefined}
        >
          <div className="flex items-center justify-between">
            <span className={currentOption.value === '' ? 'text-cpn-gray' : 'text-cpn-white'}>
              {currentOption.label}
            </span>
            <ChevronDownIcon 
              className={`
                w-4 h-4 text-cpn-gray transition-transform duration-200
                ${isOpen ? 'rotate-180' : ''}
              `}
            />
          </div>
        </button>

        {/* Dropdown List */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-cpn-dark border border-cpn-gray rounded-lg shadow-xl max-h-60 overflow-auto animate-slide-up">
            <ul
              ref={listRef}
              role="listbox"
              aria-labelledby={`${label.replace(/\s+/g, '-').toLowerCase()}-label`}
              className="py-1"
            >
              {ETHNICITY_OPTIONS.map((option, index) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={option.value === value}
                  className={`
                    px-3 py-3 cursor-pointer transition-colors duration-150
                    ${option.value === value 
                      ? 'bg-cpn-yellow text-cpn-dark font-medium' 
                      : 'text-cpn-white hover:bg-cpn-gray/20'
                    }
                    ${index === focusedIndex ? 'bg-cpn-gray/30' : ''}
                    focus:outline-none focus:bg-cpn-yellow focus:text-cpn-dark
                  `}
                  tabIndex={-1}
                  onClick={() => handleSelect(option)}
                  onKeyDown={(e) => handleOptionKeyDown(e, index)}
                  onMouseEnter={() => setFocusedIndex(index)}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.label}</span>
                    {option.value === value && (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Hidden select for form compatibility */}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          disabled={disabled}
        >
          {ETHNICITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </FormField>
  )
}