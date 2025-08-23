'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, X, AlertCircle } from 'lucide-react';
import { useUserSync } from '@/lib/hooks/use-user-sync';

interface MigrationPromptProps {
  onComplete?: () => void;
}

export function MigrationPrompt({ onComplete }: MigrationPromptProps) {
  const { 
    needsMigration, 
    isLoading, 
    error, 
    sessionData, 
    migrateSessionData, 
    skipMigration 
  } = useUserSync();
  
  const [isVisible, setIsVisible] = useState(true);

  const handleMigrate = async () => {
    await migrateSessionData();
    setIsVisible(false);
    onComplete?.();
  };

  const handleSkip = () => {
    skipMigration();
    setIsVisible(false);
    onComplete?.();
  };

  if (!needsMigration || !isVisible) {
    return null;
  }

  const hasProfile = !!sessionData?.profile;
  const hasInteractions = !!(sessionData?.interactions && sessionData.interactions.length > 0);
  const interactionCount = sessionData?.interactions?.length || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Transfer Your Data
          </CardTitle>
          <CardDescription>
            We found existing CPN data in your session. Would you like to transfer it to your account?
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <div className="space-y-2 text-sm">
            <h4 className="font-medium">Found data:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              {hasProfile && (
                <li>Profile information (name, age, ethnicity, rating)</li>
              )}
              {hasInteractions && (
                <li>{interactionCount} interaction{interactionCount !== 1 ? 's' : ''}</li>
              )}
            </ul>
          </div>
          
          <div className="p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              This data will be permanently linked to your account. You can always update or delete it later.
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isLoading}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Skip
          </Button>
          <Button
            onClick={handleMigrate}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Transfer Data
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}