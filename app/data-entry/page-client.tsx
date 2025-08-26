'use client'

import { useRouter } from 'next/navigation'
import { OnboardingProvider, useOnboarding } from '@/contexts/onboarding-context'
import { DataEntryForm } from '@/components/forms/data-entry-form'
import type { DataEntryData } from '@/lib/utils/session-storage'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { initializePWA, queueForSync, getPWACapabilities } from '@/lib/utils/pwa'
import { saveUserInteraction, completeOnboarding } from '@/app/actions/onboarding-actions'
import { toast } from 'sonner'

function DataEntryContent() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const { 
    saveDataEntryData, 
    goToNextStep, 
    goToPreviousStep, 
    progress,
    data,
    canNavigateToStep 
  } = useOnboarding()
  const { user, isSignedIn } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Set client-side flag
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Check if user can access this step (profile must be completed)
  useEffect(() => {
    if (isClient && !canNavigateToStep('dataEntry')) {
      console.log('Redirecting to profile step - prerequisites not met')
      router.push('/add-girl')
      return
    }
  }, [isClient, canNavigateToStep, router])

  const handleDataEntrySubmit = async (data: DataEntryData) => {
    if (isSubmitting) return
    
    try {
      setIsSubmitting(true)
      
      // Save the data entry data to context
      saveDataEntryData(data)
      
      // If user is authenticated, also save to database and complete onboarding
      if (isSignedIn && user) {
        // Save interaction data
        for (const interaction of data.interactions || []) {
          const formData = new FormData()
          formData.append('date', interaction.date)
          formData.append('cost', interaction.cost.toString())
          formData.append('timeMinutes', interaction.timeMinutes.toString())
          formData.append('nuts', interaction.nuts.toString())
          formData.append('notes', interaction.notes || '')
          
          const result = await saveUserInteraction(formData)
          
          if (!result.success) {
            toast.error(result.error || 'Failed to save interaction data')
            return
          }
        }
        
        // Complete onboarding and calculate CPN score
        const completionResult = await completeOnboarding()
        
        if (!completionResult.success) {
          toast.error(completionResult.error || 'Failed to complete onboarding')
          return
        }
        
        toast.success(`Onboarding complete! Your CPN score: ${completionResult.cpnScore}`)
        
        // Navigate directly to results
        router.push('/cpn-results')
        return
      }
      
      // Navigate to the next step
      goToNextStep()
      
      // Check if offline and queue for background sync if needed
      const capabilities = getPWACapabilities()
      if (!capabilities.isOnline && capabilities.supportsBackgroundSync) {
        await queueForSync(data, 'data-entry-submission')
        console.log('Data entry queued for background sync (offline)')
      }
      
      // Navigate to sign up page after data entry (for unauthenticated users)
      router.push('/sign-up?redirect_url=/cpn-results')
    } catch (error) {
      console.error('Failed to submit data entry:', error)
      toast.error('Failed to submit data. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackNavigation = () => {
    goToPreviousStep()
    router.back()
  }

  // Initialize PWA and analytics
  useEffect(() => {
    // Initialize PWA functionality
    initializePWA().catch((error) => {
      console.error('PWA initialization failed:', error)
    })

    // Analytics tracking for page view
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: 'Data Entry',
        page_location: '/data-entry',
        page_path: '/data-entry',
        content_group1: 'Onboarding',
        content_group2: 'Data Collection',
      })
    }
  }, [])

  // Show loading only on client-side if we can't access this step yet
  if (!isClient) {
    // Return the main layout to prevent hydration mismatch
    return (
      <main
        className="min-h-screen bg-cpn-dark text-cpn-white p-4 sm:p-6 lg:p-8 pt-safe-top pb-safe-bottom pl-safe-left pr-safe-right sm:pt-4 sm:pb-6 sm:pl-6 sm:pr-6"
        role="main"
        aria-labelledby="page-title"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-cpn-dark via-cpn-dark to-gray-900 opacity-50" />
        
        {/* Page container */}
        <div className="relative max-w-md mx-auto">
          {/* Loading skeleton that matches the main layout */}
          <div className="animate-pulse">
            <div className="text-center mb-0">
              <div className="w-16 h-16 mx-auto mb-4 bg-cpn-yellow rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-cpn-dark">CPN</span>
              </div>
              <div className="h-8 bg-cpn-gray/20 rounded mb-2 w-48 mx-auto"></div>
              <div className="h-6 bg-cpn-gray/20 rounded mb-6 w-64 mx-auto"></div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Show loading if we can't access this step yet
  if (isClient && !canNavigateToStep('dataEntry')) {
    return (
      <main 
        className="min-h-screen bg-cpn-dark text-cpn-white flex items-center justify-center"
        role="main"
        aria-labelledby="loading-title"
      >
        <div className="text-center">
          <h1 id="loading-title" className="sr-only">Loading Data Entry</h1>
          <div className="w-8 h-8 border-2 border-cpn-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cpn-gray">Redirecting to profile setup...</p>
        </div>
      </main>
    )
  }

  return (
    <main
      className="min-h-screen bg-cpn-dark text-cpn-white p-4 sm:p-6 lg:p-8 pt-safe-top pb-safe-bottom pl-safe-left pr-safe-right sm:pt-4 sm:pb-6 sm:pl-6 sm:pr-6"
      role="main"
      aria-labelledby="page-title"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-cpn-dark via-cpn-dark to-gray-900 opacity-50" />
      
      {/* Page container */}
      <div className="relative max-w-md mx-auto">
        {/* Page header */}
        <header className="text-center mb-0">
          <div className="mb-4">
            {/* CPN Logo */}
            <div className="w-16 h-16 mx-auto mb-4 bg-cpn-yellow rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-cpn-dark">CPN</span>
            </div>
            
            <h1 
              id="page-title"
              className="text-3xl font-bold text-cpn-white mb-2 font-national"
            >
              Add Expenses
            </h1>
            
            <p className="text-cpn-gray text-lg leading-relaxed font-klarheit">
              Enter the details of a date/event with her.
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-3 h-3 bg-cpn-yellow rounded-full" aria-label="Step 1 completed" />
            <div className="w-8 h-1 bg-cpn-yellow rounded" />
            <div className="w-3 h-3 bg-cpn-yellow rounded-full" aria-label="Current step" />
            <div className="w-8 h-1 bg-cpn-gray rounded" />
            <div className="w-3 h-3 bg-cpn-gray rounded-full" aria-label="Step 3" />
          </div>

          <div className="text-sm text-cpn-gray mb-0">
            Step 2 of 3
          </div>
        </header>

        {/* Data entry form */}
        <section aria-labelledby="form-section-title" className="mb-8">
          <h2 id="form-section-title" className="sr-only">
            Dating Experience Data Entry Form
          </h2>
          
          <DataEntryForm
            onSubmit={handleDataEntrySubmit}
            onBack={handleBackNavigation}
            showBackButton={true}
            isLoading={isSubmitting}
            className="animate-fade-in"
          />
        </section>

        {/* Help section */}
        <aside className="text-center" aria-labelledby="help-title">
          <h3 id="help-title" className="sr-only">Help and Information</h3>
          
          <div className="p-4 bg-cpn-dark border border-cpn-gray/20 rounded-lg space-y-2">
            <p className="text-xs text-cpn-gray mb-2 font-klarheit">
              🔒 Your data is secure and stored locally
            </p>
            <p className="text-xs text-cpn-gray mb-2 font-klarheit">
              💾 Auto-saved as you type • Never lose your progress
            </p>
            <p className="text-xs text-cpn-gray font-klarheit">
              📊 Used only for your personal CPN calculations
            </p>
          </div>
        </aside>

        {/* Navigation hint for screen readers */}
        <div className="sr-only" aria-live="polite">
          Fill out the form above with details about your dating experience.
          All required fields must be completed to proceed to the results page.
          Use the back button to return to the previous step if needed.
        </div>
      </div>

    </main>
  )
}

export default function DataEntryPageClient() {
  return (
    <OnboardingProvider initialStep="dataEntry">
      <DataEntryContent />
    </OnboardingProvider>
  )
}

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: Record<string, any>) => void
  }
}