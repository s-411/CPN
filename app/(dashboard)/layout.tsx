'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Home, LogOut, Trophy, BarChart3, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isLoaded, isSignedIn, signOut, email, firstName, lastName, fullName, imageUrl } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  if (!isLoaded) {
    return <div className="h-9 w-9 animate-pulse bg-cpn-gray/20 rounded-full" />;
  }

  if (!isSignedIn || !user) {
    return (
      <Button asChild className="bg-cpn-yellow text-cpn-dark hover:bg-cpn-yellow/80 rounded-full px-6">
        <Link href="/sign-up">Sign Up</Link>
      </Button>
    );
  }

  const initials = firstName && lastName 
    ? `${firstName[0]}${lastName[0]}`
    : email?.slice(0, 2).toUpperCase() || 'U';

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer size-9 border-2 border-cpn-yellow">
          <AvatarImage src={imageUrl} alt={fullName || email || ''} />
          <AvatarFallback className="bg-cpn-dark text-cpn-yellow">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-cpn-dark border-cpn-gray/20 text-cpn-white">
        <DropdownMenuItem className="cursor-pointer hover:bg-cpn-gray/10">
          <Link href="/dashboard" className="flex w-full items-center">
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer hover:bg-cpn-gray/10">
          <Link href="/cpn-results" className="flex w-full items-center">
            <Trophy className="mr-2 h-4 w-4" />
            <span>CPN Results</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer hover:bg-cpn-gray/10" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Header() {
  return (
    <header className="bg-cpn-dark border-b border-cpn-gray/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-bold text-cpn-yellow">CPN</span>
          <span className="ml-2 text-lg text-cpn-white">Calculator</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Suspense fallback={<div className="h-9" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col min-h-screen bg-cpn-dark text-cpn-white">
      <Header />
      <main className="flex-1">
        {children}
      </main>
    </section>
  );
}
