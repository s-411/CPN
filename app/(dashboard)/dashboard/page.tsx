'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, Users, Target, Calculator, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import useSWR from 'swr';
import { Suspense } from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function DashboardStats() {
  const { data: cpnData } = useSWR('/api/cpn/results/me', fetcher);
  
  const stats = [
    {
      title: 'CPN Score',
      value: cpnData?.score || '--',
      icon: Trophy,
      color: 'text-cpn-yellow',
      bgColor: 'bg-cpn-yellow/10'
    },
    {
      title: 'Peer Percentile',
      value: cpnData?.peerPercentile ? `${cpnData.peerPercentile}%` : '--',
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Achievements',
      value: cpnData?.achievements?.length || 0,
      icon: Target,
      color: 'text-cpn-yellow',
      bgColor: 'bg-cpn-yellow/10'
    },
    {
      title: 'Total Sessions',
      value: cpnData?.totalSessions || 0,
      icon: Calculator,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-cpn-dark border-cpn-gray/20 hover:border-cpn-yellow/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-cpn-gray">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cpn-white">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function QuickActions() {
  const actions = [
    {
      title: 'Start New Session',
      description: 'Track a new encounter',
      href: '/add-girl',
      icon: Calculator,
      color: 'bg-cpn-yellow text-cpn-dark hover:bg-cpn-yellow/80'
    },
    {
      title: 'View CPN Results',
      description: 'See your detailed analytics',
      href: '/cpn-results',
      icon: Trophy,
      color: 'bg-transparent border-2 border-cpn-yellow text-cpn-yellow hover:bg-cpn-yellow hover:text-cpn-dark'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {actions.map((action) => (
        <Link key={action.title} href={action.href}>
          <Card className="bg-cpn-dark border-cpn-gray/20 hover:border-cpn-yellow/50 transition-all cursor-pointer group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-cpn-white group-hover:text-cpn-yellow transition-colors">
                    {action.title}
                  </CardTitle>
                  <p className="text-sm text-cpn-gray mt-1">{action.description}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-cpn-gray group-hover:text-cpn-yellow transition-colors" />
              </div>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function RecentActivity() {
  // This would fetch recent activity data
  const activities = [
    { date: '2024-01-20', type: 'Session Completed', score: 82 },
    { date: '2024-01-19', type: 'Achievement Unlocked', achievement: 'First Timer' },
    { date: '2024-01-18', type: 'Session Completed', score: 75 }
  ];

  return (
    <Card className="bg-cpn-dark border-cpn-gray/20">
      <CardHeader>
        <CardTitle className="text-cpn-white">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-cpn-gray/10 last:border-0">
              <div>
                <p className="text-sm text-cpn-white">{activity.type}</p>
                <p className="text-xs text-cpn-gray">{activity.date}</p>
              </div>
              {activity.score && (
                <span className="text-cpn-yellow font-bold">{activity.score}</span>
              )}
              {activity.achievement && (
                <span className="text-xs bg-cpn-yellow/20 text-cpn-yellow px-2 py-1 rounded">
                  {activity.achievement}
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { fullName, email } = useAuth();
  const displayName = fullName || email?.split('@')[0] || 'User';

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold text-cpn-white">
          Welcome back, {displayName}
        </h1>
        <p className="text-cpn-gray mt-1">
          Track your performance and improve your CPN score
        </p>
      </div>

      <Suspense fallback={
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-cpn-dark border-cpn-gray/20 h-24 animate-pulse" />
          ))}
        </div>
      }>
        <DashboardStats />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-cpn-white">Quick Actions</h2>
          <QuickActions />
        </div>
        
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-cpn-white">Activity</h2>
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}