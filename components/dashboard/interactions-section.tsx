import { UserInteraction } from '@/lib/db/schema'

interface InteractionsSectionProps {
  interactions: UserInteraction[]
}

export function InteractionsSection({ interactions }: InteractionsSectionProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Number(amount))
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  if (interactions.length === 0) {
    return (
      <div className="bg-cpn-card border border-cpn-gray/30 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-cpn-white mb-4">Recent Interactions</h2>
        <div className="text-center py-8">
          <p className="text-cpn-gray mb-4">No interactions yet</p>
          <a 
            href="/data-entry"
            className="bg-cpn-yellow text-cpn-dark px-4 py-2 rounded-lg font-medium hover:bg-cpn-yellow/90 transition-colors"
          >
            Add Your First Interaction
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-cpn-card border border-cpn-gray/30 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-cpn-white mb-4">Recent Interactions</h2>
      
      <div className="space-y-4">
        {interactions.map((interaction) => (
          <div key={interaction.id} className="border-b border-cpn-gray/20 pb-4 last:border-b-0 last:pb-0">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-cpn-white font-medium">
                  {formatDate(interaction.date)}
                </p>
                <p className="text-sm text-cpn-gray">
                  {formatTime(interaction.timeMinutes)} • {interaction.nuts} nuts
                </p>
              </div>
              <div className="text-right">
                <p className="text-cpn-white font-semibold">
                  {formatCurrency(interaction.cost)}
                </p>
                <p className="text-xs text-cpn-gray">
                  {(Number(interaction.cost) / interaction.nuts).toFixed(2)}/nut
                </p>
              </div>
            </div>
            
            {interaction.notes && (
              <p className="text-sm text-cpn-gray italic mt-2">
                "{interaction.notes}"
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-cpn-gray/20">
        <a 
          href="/data-entry"
          className="text-cpn-yellow hover:text-cpn-yellow/80 text-sm font-medium"
        >
          Add New Interaction →
        </a>
      </div>
    </div>
  )
}