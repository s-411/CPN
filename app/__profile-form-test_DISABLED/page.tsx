'use client';
import { ProfileForm } from '@/components/forms/profile-form'
import type { ProfileFormData } from '@/types/profile'

export default function ProfileFormTestPage() {
  const handleSubmit = (data: ProfileFormData) => {
    console.log('Form submitted:', data)
    alert(`Profile created:\nName: ${data.firstName}\nAge: ${data.age}\nEthnicity: ${data.ethnicity || 'Not specified'}\nRating: ${data.rating}`)
  }

  const handleBack = () => {
    console.log('Back button clicked')
    alert('Back button clicked')
  }

  return (
    <div className="min-h-screen bg-cpn-dark py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-cpn-white mb-2">
              Profile Form Test
            </h1>
            <p className="text-cpn-gray">
              Testing the CPN profile creation form with all components
            </p>
          </div>
          
          <ProfileForm
            onSubmit={handleSubmit}
            onBack={handleBack}
            showBackButton={true}
            isLoading={false}
          />
          
          <div className="mt-8 p-4 bg-cpn-dark border border-cpn-gray rounded-lg">
            <h2 className="text-lg font-bold text-cpn-white mb-2">Test Instructions:</h2>
            <ul className="text-sm text-cpn-gray space-y-1">
              <li>• Fill out all form fields</li>
              <li>• Test validation by submitting empty form</li>
              <li>• Test session storage by refreshing page</li>
              <li>• Test rating selector with mouse and keyboard</li>
              <li>• Test ethnicity dropdown accessibility</li>
              <li>• Verify mobile responsiveness</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}