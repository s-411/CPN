'use client';

import { useState } from 'react';
import { LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

interface UserProfileProps {
  variant?: 'cpn' | 'default';
  showSignUp?: boolean;
}

export function UserProfile({ variant = 'default', showSignUp = true }: UserProfileProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isLoaded, isSignedIn, signOut, email, firstName, lastName, fullName, imageUrl } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  if (!isLoaded) {
    return <div className="h-9 w-9 animate-pulse bg-gray-200 rounded-full" />;
  }

  if (!isSignedIn || !user) {
    if (!showSignUp) return null;
    
    const buttonClass = variant === 'cpn' 
      ? "bg-cpn-yellow hover:bg-cpn-yellow/90 text-cpn-dark rounded-full"
      : "rounded-full";
    
    return (
      <Button asChild className={buttonClass}>
        <Link href="/sign-up">Sign Up</Link>
      </Button>
    );
  }

  const initials = firstName && lastName 
    ? `${firstName[0]}${lastName[0]}`
    : email?.slice(0, 2).toUpperCase() || 'U';

  const menuContentClass = variant === 'cpn'
    ? "bg-cpn-dark border border-cpn-gray text-cpn-white"
    : "";

  const menuItemClass = variant === 'cpn'
    ? "text-cpn-white hover:bg-cpn-gray/20 focus:bg-cpn-gray/20"
    : "";

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer size-9">
          <AvatarImage src={imageUrl} alt={fullName || email || ''} />
          <AvatarFallback className={variant === 'cpn' ? "bg-cpn-yellow text-cpn-dark" : ""}>
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={`flex flex-col gap-1 ${menuContentClass}`}>
        <DropdownMenuItem className={`cursor-pointer ${menuItemClass}`}>
          <Link href="/add-girl" className="flex w-full items-center">
            <User className="mr-2 h-4 w-4" />
            <span>CPN Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className={`cursor-pointer ${menuItemClass}`} onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}