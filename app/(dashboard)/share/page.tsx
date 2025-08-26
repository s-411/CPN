'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Share, Instagram, MessageSquare, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SharePage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold text-cpn-white">
          Share Results
        </h1>
        <p className="text-cpn-gray mt-1">
          Share your CPN achievements and results on social media
        </p>
      </div>

      {/* Share content will be implemented in future iterations */}
      <Card className="bg-cpn-dark border-cpn-gray/20">
        <CardHeader>
          <CardTitle className="text-cpn-white flex items-center">
            <Share className="mr-2 h-5 w-5 text-cpn-yellow" />
            Social Sharing Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-cpn-gray mb-4">
            Social sharing features and viral content generation will be available here.
          </p>
          <div className="flex gap-4">
            <Button disabled variant="secondary" className="cursor-not-allowed">
              Instagram Story
            </Button>
            <Button disabled variant="secondary" className="cursor-not-allowed">
              TikTok
            </Button>
            <Button disabled variant="secondary" className="cursor-not-allowed">
              Copy Link
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}