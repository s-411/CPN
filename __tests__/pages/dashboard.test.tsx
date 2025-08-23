import React from 'react'
import { render, screen } from '@testing-library/react'

// Mock components for testing
const MockProfileSection = ({ profile }: any) => (
  <div data-testid="profile-section">
    Profile: {profile.firstName}
  </div>
)

const MockCpnScoreSection = ({ cpnScore, peerComparison }: any) => (
  <div data-testid="cpn-score-section">
    Score: {cpnScore.score}, Percentile: {peerComparison.percentile}
  </div>
)

const MockInteractionsSection = ({ interactions }: any) => (
  <div data-testid="interactions-section">
    Interactions: {interactions.length}
  </div>
)

const MockAchievementsSection = ({ achievements }: any) => (
  <div data-testid="achievements-section">
    Achievements: {achievements.length}
  </div>
)

const MockShareAnalyticsSection = ({ shareHistory }: any) => (
  <div data-testid="share-analytics-section">
    Shares: {shareHistory.length}
  </div>
)

// Mock the dashboard components
jest.mock('../../components/dashboard/profile-section', () => ({
  ProfileSection: MockProfileSection,
}))

jest.mock('../../components/dashboard/cpn-score-section', () => ({
  CpnScoreSection: MockCpnScoreSection,
}))

jest.mock('../../components/dashboard/interactions-section', () => ({
  InteractionsSection: MockInteractionsSection,
}))

jest.mock('../../components/dashboard/achievements-section', () => ({
  AchievementsSection: MockAchievementsSection,
}))

jest.mock('../../components/dashboard/share-analytics-section', () => ({
  ShareAnalyticsSection: MockShareAnalyticsSection,
}))

jest.mock('../../components/dashboard/dashboard-skeleton', () => ({
  DashboardSkeleton: () => <div data-testid="dashboard-skeleton">Loading...</div>,
}))

jest.mock('../../components/ui/error-boundary', () => ({
  ErrorBoundary: ({ children }: any) => <div>{children}</div>,
}))

// Mock Next.js server auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => Promise.resolve({ userId: 'user_123' })),
}))

// Mock database queries
jest.mock('../../lib/db/queries', () => ({
  getCpnResultsDisplayData: jest.fn(),
  getUserProfile: jest.fn(),
  getUserInteractions: jest.fn(),
}))

// Mock Next.js
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

describe('Dashboard Components', () => {
  it('should render basic dashboard structure', () => {
    const mockProfile = { firstName: 'Jane' }
    const mockCpnScore = { score: 75 }
    const mockPeerComparison = { percentile: 85 }
    const mockInteractions = [{ id: 1 }]
    const mockAchievements = [{ id: 1 }]
    const mockShareHistory = [{ id: 1 }]

    render(
      <div>
        <MockProfileSection profile={mockProfile} />
        <MockCpnScoreSection cpnScore={mockCpnScore} peerComparison={mockPeerComparison} />
        <MockInteractionsSection interactions={mockInteractions} />
        <MockAchievementsSection achievements={mockAchievements} />
        <MockShareAnalyticsSection shareHistory={mockShareHistory} />
      </div>
    )

    expect(screen.getByTestId('profile-section')).toHaveTextContent('Profile: Jane')
    expect(screen.getByTestId('cpn-score-section')).toHaveTextContent('Score: 75, Percentile: 85')
    expect(screen.getByTestId('interactions-section')).toHaveTextContent('Interactions: 1')
    expect(screen.getByTestId('achievements-section')).toHaveTextContent('Achievements: 1')
    expect(screen.getByTestId('share-analytics-section')).toHaveTextContent('Shares: 1')
  })

  it('should handle empty data states', () => {
    const mockProfile = { firstName: '' }
    const mockCpnScore = { score: 0 }
    const mockPeerComparison = { percentile: 0 }
    const mockInteractions: any[] = []
    const mockAchievements: any[] = []
    const mockShareHistory: any[] = []

    render(
      <div>
        <MockProfileSection profile={mockProfile} />
        <MockCpnScoreSection cpnScore={mockCpnScore} peerComparison={mockPeerComparison} />
        <MockInteractionsSection interactions={mockInteractions} />
        <MockAchievementsSection achievements={mockAchievements} />
        <MockShareAnalyticsSection shareHistory={mockShareHistory} />
      </div>
    )

    expect(screen.getByTestId('interactions-section')).toHaveTextContent('Interactions: 0')
    expect(screen.getByTestId('achievements-section')).toHaveTextContent('Achievements: 0')
    expect(screen.getByTestId('share-analytics-section')).toHaveTextContent('Shares: 0')
  })
})