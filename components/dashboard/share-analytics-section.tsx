import { ShareAnalytic } from '@/lib/db/schema'

interface ShareAnalyticsSectionProps {
  shareHistory: ShareAnalytic[]
}

export function ShareAnalyticsSection({ shareHistory }: ShareAnalyticsSectionProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return '🐦'
      case 'facebook':
        return '📘'
      case 'instagram':
        return '📸'
      case 'linkedin':
        return '💼'
      default:
        return '🔗'
    }
  }

  const getPlatformStats = () => {
    const stats = shareHistory.reduce((acc, share) => {
      acc[share.platform] = (acc[share.platform] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(stats).sort(([, a], [, b]) => b - a)
  }

  if (shareHistory.length === 0) {
    return (
      <div className="bg-cpn-card border border-cpn-gray/30 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-cpn-white mb-4">Share Analytics</h2>
        <div className="text-center py-6">
          <p className="text-cpn-gray mb-4">No shares yet</p>
          <p className="text-sm text-cpn-gray mb-4">
            Share your CPN results to track engagement and unlock achievements!
          </p>
          <button className="bg-cpn-yellow text-cpn-dark px-4 py-2 rounded-lg font-medium hover:bg-cpn-yellow/90 transition-colors">
            Share Your Results
          </button>
        </div>
      </div>
    )
  }

  const platformStats = getPlatformStats()

  return (
    <div className="bg-cpn-card border border-cpn-gray/30 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-cpn-white mb-4">Share Analytics</h2>
      
      {/* Platform Stats */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-cpn-white mb-3">Platform Breakdown</h3>
        <div className="grid grid-cols-2 gap-3">
          {platformStats.map(([platform, count]) => (
            <div key={platform} className="flex items-center space-x-2">
              <span className="text-lg">{getPlatformIcon(platform)}</span>
              <div>
                <p className="text-sm text-cpn-white capitalize">{platform}</p>
                <p className="text-xs text-cpn-gray">{count} shares</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Shares */}
      <div>
        <h3 className="text-sm font-semibold text-cpn-white mb-3">Recent Shares</h3>
        <div className="space-y-2">
          {shareHistory.slice(0, 3).map((share) => (
            <div key={share.id} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm">{getPlatformIcon(share.platform)}</span>
                <div>
                  <p className="text-sm text-cpn-white capitalize">{share.platform}</p>
                  <p className="text-xs text-cpn-gray">Code: {share.referralCode}</p>
                </div>
              </div>
              <p className="text-xs text-cpn-gray">
                {formatDate(share.sharedAt)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Total Stats */}
      <div className="mt-4 pt-4 border-t border-cpn-gray/20">
        <div className="flex justify-between items-center">
          <p className="text-sm text-cpn-gray">Total Shares</p>
          <p className="text-sm font-semibold text-cpn-white">{shareHistory.length}</p>
        </div>
      </div>
    </div>
  )
}