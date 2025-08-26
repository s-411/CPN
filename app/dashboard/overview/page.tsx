'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';


export default function OverviewPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold text-cpn-white">
          Overview
        </h1>
        <p className="text-cpn-gray mt-1">
          Compare all girls and their statistics
        </p>
      </div>

      {/* Overview content will be implemented in future iterations */}
      <Card className="bg-cpn-dark border-cpn-gray/20">
        <CardHeader>
          <CardTitle className="text-cpn-white flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 text-cpn-yellow" />
            Girl Statistics Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-cpn-gray">
            Detailed statistics and comparisons for all your tracked girls will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}