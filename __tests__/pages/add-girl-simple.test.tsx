import React from 'react'
import { render, screen } from '@testing-library/react'
import { AddGirlPageClient } from '@/app/add-girl/page-client'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  })),
}))

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store: Record<string, string> = {}
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
    }),
    get length() {
      return Object.keys(store).length
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null)
  }
})()

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
})

// Mock PWA utilities to avoid service worker issues in tests
jest.mock('@/lib/utils/pwa', () => ({
  initializePWA: jest.fn().mockResolvedValue(undefined),
  queueForSync: jest.fn().mockResolvedValue(undefined),
  getPWACapabilities: jest.fn().mockReturnValue({
    isStandalone: false,
    canInstall: false,
    hasServiceWorker: false,
    isOnline: true,
    supportsBackgroundSync: false,
    supportsNotifications: false,
  }),
}))

describe('Add Girl Page', () => {
  beforeEach(() => {
    mockSessionStorage.clear()
    jest.clearAllMocks()
  })

  it('renders the page without crashing', () => {
    render(<AddGirlPageClient />)
    
    // Check that the main page elements are present
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByText('Add Your First Profile')).toBeInTheDocument()
  })

  it('has proper page structure with form', () => {
    render(<AddGirlPageClient />)
    
    // Check for form presence
    expect(screen.getByRole('form')).toBeInTheDocument()
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/age/i)).toBeInTheDocument()
  })

  it('has proper CPN branding and styling', () => {
    render(<AddGirlPageClient />)
    
    // Check for CPN logo
    expect(screen.getByText('CPN')).toBeInTheDocument()
    
    // Check for proper ARIA structure
    expect(screen.getByRole('main')).toHaveAttribute('aria-labelledby', 'page-title')
  })

  it('has proper progress indicator', () => {
    render(<AddGirlPageClient />)
    
    // Check for progress text
    expect(screen.getByText(/step 1 of 3/i)).toBeInTheDocument()
    expect(screen.getByText(/0% complete/i)).toBeInTheDocument()
  })

  it('has proper security and help information', () => {
    render(<AddGirlPageClient />)
    
    // Check for security messaging
    expect(screen.getByText(/your data is encrypted/i)).toBeInTheDocument()
    expect(screen.getByText(/auto-saved as you type/i)).toBeInTheDocument()
  })
})