'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function LoginPage() {
  const { user, isLoaded, isSignedIn, signOut, email, firstName, lastName, fullName, imageUrl } = useAuth();

  if (!isLoaded) {
    return <div className="flex-1 p-4 md:p-6 lg:p-8">Loading...</div>;
  }

  if (!isSignedIn || !user) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
        <Card className="bg-cpn-dark border-cpn-gray/20">
          <CardHeader>
            <CardTitle className="text-cpn-white">Not Signed In</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-cpn-gray">Please sign in to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = firstName && lastName 
    ? `${firstName[0]}${lastName[0]}`
    : email?.slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold text-cpn-white">
          Profile
        </h1>
        <p className="text-cpn-gray mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* User Profile Card */}
      <Card className="bg-cpn-dark border-cpn-gray/20">
        <CardHeader>
          <CardTitle className="text-cpn-white flex items-center">
            <User className="mr-2 h-5 w-5 text-cpn-yellow" />
            User Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="size-16 border-2 border-cpn-yellow">
              <AvatarImage src={imageUrl} alt={fullName || email || ''} />
              <AvatarFallback className="bg-cpn-dark text-cpn-yellow text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold text-cpn-white">
                {fullName || 'User'}
              </h3>
              <p className="text-cpn-gray">{email}</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start border-cpn-gray/20 text-cpn-white hover:bg-cpn-yellow/10"
            >
              <Settings className="mr-2 h-4 w-4" />
              Account Settings
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => signOut()}
              className="w-full justify-start border-red-500/20 text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}