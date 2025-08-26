'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, Target } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold text-cpn-white">
          Analytics Dashboard
        </h1>
        <p className="text-cpn-gray mt-1">
          Detailed insights into your CPN performance and trends
        </p>
      </div>

      {/* Analytics content will be implemented in future iterations */}
      <Card className="bg-cpn-dark border-cpn-gray/20">
        <CardHeader>
          <CardTitle className="text-cpn-white flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 text-cpn-yellow" />
            Analytics Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-cpn-gray">
            Advanced analytics and detailed performance metrics will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}