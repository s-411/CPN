'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, Crown } from 'lucide-react';

export default function LeaderboardsPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold text-cpn-white">
          Leaderboards
        </h1>
        <p className="text-cpn-gray mt-1">
          See how you rank against other CPN users
        </p>
      </div>

      {/* Leaderboards content will be implemented in future iterations */}
      <Card className="bg-cpn-dark border-cpn-gray/20">
        <CardHeader>
          <CardTitle className="text-cpn-white flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-cpn-yellow" />
            Leaderboards Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-cpn-gray mb-4">
            Competitive leaderboards and peer rankings will be available here.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-cpn-gray/10">
              <Crown className="h-5 w-5 text-yellow-500" />
              <span className="text-cpn-gray">Top CPN Performers</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-cpn-gray/10">
              <Medal className="h-5 w-5 text-silver" />
              <span className="text-cpn-gray">Weekly Champions</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-cpn-gray/10">
              <Trophy className="h-5 w-5 text-bronze" />
              <span className="text-cpn-gray">Monthly Rankings</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}