export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column Skeletons */}
      <div className="space-y-6">
        {/* Profile Skeleton */}
        <div className="bg-cpn-card border border-cpn-gray/30 rounded-lg p-6 animate-pulse">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-cpn-gray/30 rounded-full" />
            <div className="space-y-2">
              <div className="h-6 w-32 bg-cpn-gray/30 rounded" />
              <div className="h-4 w-24 bg-cpn-gray/30 rounded" />
            </div>
          </div>
          <div className="h-4 w-48 bg-cpn-gray/30 rounded" />
        </div>

        {/* CPN Score Skeleton */}
        <div className="bg-cpn-card border border-cpn-gray/30 rounded-lg p-6 animate-pulse">
          <div className="h-6 w-40 bg-cpn-gray/30 rounded mb-4" />
          <div className="flex items-center justify-center mb-4">
            <div className="w-24 h-24 bg-cpn-gray/30 rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-cpn-gray/30 rounded" />
            <div className="h-4 w-3/4 bg-cpn-gray/30 rounded" />
          </div>
        </div>
      </div>

      {/* Right Column Skeletons */}
      <div className="space-y-6">
        {/* Interactions Skeleton */}
        <div className="bg-cpn-card border border-cpn-gray/30 rounded-lg p-6 animate-pulse">
          <div className="h-6 w-48 bg-cpn-gray/30 rounded mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="h-4 w-24 bg-cpn-gray/30 rounded" />
                  <div className="h-3 w-32 bg-cpn-gray/30 rounded" />
                </div>
                <div className="h-4 w-16 bg-cpn-gray/30 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Achievements Skeleton */}
        <div className="bg-cpn-card border border-cpn-gray/30 rounded-lg p-6 animate-pulse">
          <div className="h-6 w-36 bg-cpn-gray/30 rounded mb-4" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-cpn-gray/30 rounded-full" />
                <div className="h-4 w-20 bg-cpn-gray/30 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}