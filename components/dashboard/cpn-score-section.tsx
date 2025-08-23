import { CpnScore } from '@/lib/db/schema'

interface CpnScoreSectionProps {
  cpnScore: CpnScore
  peerComparison: {
    averageScore: number
    totalUsers: number
    userRank: number
    percentile: number
  }
}

export function CpnScoreSection({ cpnScore, peerComparison }: CpnScoreSectionProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  const categoryScores = cpnScore.categoryScores as Record<string, number>

  return (
    <div className="bg-cpn-card border border-cpn-gray/30 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-cpn-white mb-4">CPN Score</h2>
      
      {/* Main Score Display */}
      <div className="text-center mb-6">
        <div 
          data-testid="cpn-score"
          className={`text-4xl font-bold ${getScoreColor(cpnScore.score)} mb-2`}
        >
          {cpnScore.score}
        </div>
        <p className="text-cpn-gray">
          {peerComparison.percentile}th percentile
        </p>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-3 mb-6">
        <h3 className="text-lg font-semibold text-cpn-white">Category Scores</h3>
        {Object.entries(categoryScores).map(([category, score]) => (
          <div key={category} className="flex items-center justify-between">
            <span className="text-cpn-gray capitalize">{category}</span>
            <div className="flex items-center space-x-2">
              <div className="w-20 h-2 bg-cpn-gray/30 rounded-full">
                <div 
                  className="h-full bg-cpn-yellow rounded-full transition-all duration-300"
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className={`text-sm font-semibold ${getScoreColor(score)}`}>
                {score}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Peer Comparison */}
      <div className="pt-4 border-t border-cpn-gray/20">
        <h3 className="text-lg font-semibold text-cpn-white mb-3">Peer Comparison</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-cpn-gray">Average Score</p>
            <p className="text-cpn-white font-semibold">{peerComparison.averageScore}</p>
          </div>
          <div>
            <p className="text-cpn-gray">Your Rank</p>
            <p className="text-cpn-white font-semibold">#{peerComparison.userRank}</p>
          </div>
          <div>
            <p className="text-cpn-gray">Total Users</p>
            <p className="text-cpn-white font-semibold">{peerComparison.totalUsers}</p>
          </div>
          <div>
            <p className="text-cpn-gray">Percentile</p>
            <p className="text-cpn-white font-semibold">{peerComparison.percentile}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}