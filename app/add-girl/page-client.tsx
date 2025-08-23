'use client'

import { useRouter } from 'next/navigation'
import { OnboardingProvider, useOnboarding } from '@/contexts/onboarding-context'
import { ProfileForm } from '@/components/forms/profile-form'
import type { ProfileFormData } from '@/types/profile'
import { useEffect } from 'react'
import { initializePWA, queueForSync, getPWACapabilities } from '@/lib/utils/pwa'

function AddGirlContent() {
  const router = useRouter()
  const { saveProfileData, goToNextStep, progress } = useOnboarding()

  const handleProfileSubmit = async (data: ProfileFormData) => {
    try {
      // Save the profile data to context
      saveProfileData(data)
      
      // Navigate to the next step in the onboarding flow
      goToNextStep()
      
      // Check if offline and queue for background sync if needed
      const capabilities = getPWACapabilities()
      if (!capabilities.isOnline && capabilities.supportsBackgroundSync) {
        await queueForSync(data, 'profile-submission')
        console.log('Profile queued for background sync (offline)')
      }
      
      // Navigate to data entry page
      router.push('/data-entry')
    } catch (error) {
      console.error('Failed to submit profile:', error)
      // Error is handled by the ProfileForm component
    }
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
        page_title: 'Add Profile',
        page_location: '/add-girl',
        page_path: '/add-girl',
        content_group1: 'Onboarding',
        content_group2: 'Profile Creation',
      })
    }
  }, [])

  return (
    <main
      className="min-h-screen bg-cpn-dark text-cpn-white p-4 sm:p-6 lg:p-8"
      role="main"
      aria-labelledby="page-title"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-cpn-dark via-cpn-dark to-gray-900 opacity-50" />
      
      {/* Page container */}
      <div className="relative max-w-md mx-auto">
        {/* Page header */}
        <header className="text-center mb-8">
          <div className="mb-4">
            {/* CPN Logo */}
            <div className="w-16 h-16 mx-auto mb-4 bg-cpn-yellow rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-cpn-dark">CPN</span>
            </div>
            
            <h1 
              id="page-title"
              className="text-3xl font-bold text-cpn-white mb-2 font-national"
            >
              Add Your First Profile
            </h1>
            
            <p className="text-cpn-gray text-lg leading-relaxed font-klarheit">
              Start tracking your dating efficiency by adding your first profile. 
              We'll help you measure what matters.
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-3 h-3 bg-cpn-yellow rounded-full" aria-label="Current step" />
            <div className="w-8 h-1 bg-cpn-gray rounded" />
            <div className="w-3 h-3 bg-cpn-gray rounded-full" aria-label="Step 2" />
            <div className="w-8 h-1 bg-cpn-gray rounded" />
            <div className="w-3 h-3 bg-cpn-gray rounded-full" aria-label="Step 3" />
          </div>

          <div className="text-sm text-cpn-gray mb-8">
            Step {progress.currentStep === 'profile' ? 1 : 2} of 3 • {progress.percentComplete}% Complete
          </div>
        </header>

        {/* Profile form */}
        <section aria-labelledby="form-section-title" className="mb-8">
          <h2 id="form-section-title" className="sr-only">
            Profile Information Form
          </h2>
          
          <ProfileForm
            onSubmit={handleProfileSubmit}
            showBackButton={false}
            className="animate-fade-in"
          />
        </section>

        {/* Help section */}
        <aside className="text-center" aria-labelledby="help-title">
          <h3 id="help-title" className="sr-only">Help and Information</h3>
          
          <div className="p-4 bg-cpn-dark border border-cpn-gray/20 rounded-lg">
            <p className="text-xs text-cpn-gray mb-2 font-klarheit">
              🔒 Your data is encrypted and stored securely
            </p>
            <p className="text-xs text-cpn-gray font-klarheit">
              ✨ Auto-saved as you type • Never lose your progress
            </p>
          </div>
        </aside>

        {/* Navigation hint for screen readers */}
        <div className="sr-only" aria-live="polite">
          Fill out the form above to continue to the next step of profile creation.
          All fields marked with an asterisk are required.
        </div>
      </div>

      {/* Mobile-specific optimizations */}
      <style jsx>{`
        @media (max-width: 640px) {
          main {
            padding-top: env(safe-area-inset-top);
            padding-bottom: env(safe-area-inset-bottom);
            padding-left: env(safe-area-inset-left);
            padding-right: env(safe-area-inset-right);
          }
        }
      `}</style>
    </main>
  )
}

export function AddGirlPageClient() {
  return (
    <OnboardingProvider initialStep="profile">
      <AddGirlContent />
    </OnboardingProvider>
  )
}

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: Record<string, any>) => void
  }
}