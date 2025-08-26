'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Crown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SubscriptionPage() {
  const handleUpgrade = () => {
    window.location.href = '/api/stripe/checkout';
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold text-cpn-white">
          Subscription
        </h1>
        <p className="text-cpn-gray mt-1">
          Manage your subscription and billing settings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Plan */}
        <Card className="bg-cpn-dark border-cpn-gray/20">
          <CardHeader>
            <CardTitle className="text-cpn-white flex items-center">
              <CreditCard className="mr-2 h-5 w-5 text-cpn-yellow" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-cpn-white">Free Plan</h3>
                <p className="text-cpn-gray">Basic CPN tracking features</p>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center text-cpn-gray">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  Basic CPN calculations
                </li>
                <li className="flex items-center text-cpn-gray">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  Limited profile tracking
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Premium Plan */}
        <Card className="bg-cpn-yellow/10 border-cpn-yellow/20">
          <CardHeader>
            <CardTitle className="text-cpn-white flex items-center">
              <Crown className="mr-2 h-5 w-5 text-cpn-yellow" />
              Premium Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-cpn-white">$9.99/month</h3>
                <p className="text-cpn-gray">Advanced analytics and unlimited tracking</p>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center text-cpn-gray">
                  <Check className="mr-2 h-4 w-4 text-cpn-yellow" />
                  Unlimited profile tracking
                </li>
                <li className="flex items-center text-cpn-gray">
                  <Check className="mr-2 h-4 w-4 text-cpn-yellow" />
                  Advanced analytics
                </li>
                <li className="flex items-center text-cpn-gray">
                  <Check className="mr-2 h-4 w-4 text-cpn-yellow" />
                  Export reports
                </li>
                <li className="flex items-center text-cpn-gray">
                  <Check className="mr-2 h-4 w-4 text-cpn-yellow" />
                  Priority support
                </li>
              </ul>
              <Button 
                onClick={handleUpgrade}
                className="w-full"
              >
                Upgrade to Premium
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}