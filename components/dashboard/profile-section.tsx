import { UserProfile } from '@/lib/db/schema'

interface ProfileSectionProps {
  profile: UserProfile
}

export function ProfileSection({ profile }: ProfileSectionProps) {
  return (
    <div className="bg-cpn-card border border-cpn-gray/30 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-cpn-white mb-4">Profile</h2>
      
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-16 h-16 bg-cpn-yellow rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-cpn-dark">
            {profile.firstName?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-cpn-white">
            {profile.firstName || 'User'}
          </h3>
          <p className="text-cpn-gray">
            Age: {profile.age} • Ethnicity: {profile.ethnicity}
          </p>
        </div>
      </div>

      {profile.rating && (
        <div className="flex items-center space-x-2">
          <span className="text-cpn-gray">Rating:</span>
          <span className="text-cpn-yellow font-semibold">{profile.rating}/10</span>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-cpn-gray/20">
        <p className="text-sm text-cpn-gray">
          Member since {new Date(profile.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}