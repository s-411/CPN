import { z } from 'zod'

export const dataEntrySchema = z.object({
  date: z.string()
    .min(1, 'Date is required')
    .refine((date) => {
      const parsedDate = new Date(date)
      const today = new Date()
      const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
      return parsedDate <= today && parsedDate >= oneYearAgo
    }, 'Date must be within the last year'),
    
  cost: z.number()
    .min(0, 'Cost must be $0 or more')
    .max(10000, 'Cost must be less than $10,000')
    .refine((val) => Number.isFinite(val), 'Cost must be a valid number'),
    
  time: z.number()
    .min(0.25, 'Time must be at least 0.25 hours (15 minutes)')
    .max(24, 'Time must be less than 24 hours')
    .refine((val) => Number.isFinite(val), 'Time must be a valid number'),
    
  nuts: z.number()
    .min(0, 'Number of nuts must be 0 or more')
    .max(5, 'Number of nuts must be 5 or less')
    .int('Number of nuts must be a whole number'),
  
  notes: z.string()
    .max(500, 'Notes must be 500 characters or less')
    .optional()
})

export type DataEntryFormData = z.infer<typeof dataEntrySchema>

export const NUTS_OPTIONS = [
  { value: 0, label: '0', description: 'No nuts' },
  { value: 1, label: '1', description: '1 nut' },
  { value: 2, label: '2', description: '2 nuts' },
  { value: 3, label: '3', description: '3 nuts' },
  { value: 4, label: '4', description: '4 nuts' },
  { value: 5, label: '5', description: '5 nuts' }
] as const

export const TIME_SUGGESTIONS = [
  { value: 0.5, label: '0.5 hours', description: 'Quick coffee/drink' },
  { value: 1, label: '1 hour', description: 'Standard coffee date' },
  { value: 2, label: '2 hours', description: 'Dinner or activity' },
  { value: 3, label: '3 hours', description: 'Extended date' },
  { value: 4, label: '4+ hours', description: 'Full day activity' }
] as const

export const COST_SUGGESTIONS = [
  { value: 15, label: '$15', description: 'Coffee/drinks' },
  { value: 50, label: '$50', description: 'Casual dining' },
  { value: 100, label: '$100', description: 'Nice dinner' },
  { value: 150, label: '$150', description: 'Premium experience' },
  { value: 200, label: '$200+', description: 'High-end venue' }
] as const

// Validation helpers
export function validateCurrency(value: string): number | null {
  // Remove currency symbols and spaces
  const cleaned = value.replace(/[$,\s]/g, '')
  const parsed = parseFloat(cleaned)
  
  if (isNaN(parsed) || !isFinite(parsed)) {
    return null
  }
  
  return Math.round(parsed * 100) / 100 // Round to 2 decimal places
}

export function validateTime(value: string): number | null {
  const parsed = parseFloat(value)
  
  if (isNaN(parsed) || !isFinite(parsed)) {
    return null
  }
  
  return parsed
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value)
}

export function formatTime(hours: number): string {
  if (hours === 1) {
    return '1 hour'
  }
  
  if (hours % 1 === 0) {
    return `${hours} hours`
  }
  
  return `${hours} hours`
}

export function calculateEfficiencyMetrics(cost: number, time: number, nuts: number) {
  const timeInHours = time // time is now already in hours
  const costPerNut = nuts > 0 ? cost / nuts : cost
  
  return {
    costPerHour: cost / timeInHours,
    costPerNut: costPerNut,
    nutsPerHour: nuts / timeInHours,
    totalInvestment: cost + (timeInHours * 25), // Assuming $25/hour opportunity cost
    efficiency: nuts > 0 ? nuts / (cost + timeInHours * 25) : 0 // Nuts per dollar invested
  }
}