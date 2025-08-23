import { UserAchievement, Achievement } from '@/lib/db/schema'

interface AchievementsSectionProps {
  achievements: (UserAchievement & { achievement: Achievement })[]
}

export function AchievementsSection({ achievements }: AchievementsSectionProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (achievements.length === 0) {
    return (
      <div className="bg-cpn-card border border-cpn-gray/30 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-cpn-white mb-4">Achievements</h2>
        <div className="text-center py-6">
          <p className="text-cpn-gray mb-4">No achievements yet</p>
          <p className="text-sm text-cpn-gray">
            Complete interactions to unlock achievements and track your progress!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-cpn-card border border-cpn-gray/30 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-cpn-white mb-4">
        Achievements ({achievements.length})
      </h2>
      
      <div className="space-y-4">
        {achievements.map((userAchievement) => (
          <div 
            key={userAchievement.id} 
            className="flex items-start space-x-3 p-3 bg-cpn-gray/10 rounded-lg border border-cpn-yellow/20"
          >
            {/* Achievement Icon */}
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: userAchievement.achievement.badgeColor || '#f2f661' }}
            >
              <span className="text-lg">🏆</span>
            </div>
            
            {/* Achievement Details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-cpn-white">
                {userAchievement.achievement.name}
              </h3>
              <p className="text-sm text-cpn-gray mb-1">
                {userAchievement.achievement.description}
              </p>
              <p className="text-xs text-cpn-yellow">
                Earned on {formatDate(userAchievement.earnedAt)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Available Achievements Preview */}
      <div className="mt-4 pt-4 border-t border-cpn-gray/20">
        <a 
          href="/achievements"
          className="text-cpn-yellow hover:text-cpn-yellow/80 text-sm font-medium"
        >
          View All Achievements →
        </a>
      </div>
    </div>
  )
}