'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Users, 
  BarChart3, 
  CreditCard, 
  Plus,
  Share,
  Trophy,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navigationItems: NavigationItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Girls', href: '/profiles', icon: Users },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Data Entry', href: '/data-entry', icon: Plus },
  { label: 'Leaderboards', href: '/leaderboards', icon: Trophy },
  { label: 'Share', href: '/share', icon: Share },
  { label: 'Subscription', href: '/subscription', icon: CreditCard }
];

export function NavigationSidebar() {
  const pathname = usePathname();

  const handlePremiumUpgrade = () => {
    // Navigate to Stripe checkout
    window.location.href = '/api/stripe/checkout';
  };

  return (
    <aside 
      className="hidden md:block fixed left-0 top-0 z-50 h-screen w-64 bg-cpn-dark border-r border-cpn-gray/20"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex flex-col h-full">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-cpn-gray/20">
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-bold text-cpn-yellow">CPN</span>
          <span className="ml-2 text-lg text-cpn-white">Dashboard</span>
        </Link>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 py-6 px-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
                          (pathname.startsWith(item.href) && item.href !== '/dashboard');

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group relative",
                  "hover:bg-cpn-yellow/10 hover:text-cpn-yellow focus:outline-none focus:ring-2 focus:ring-cpn-yellow/50 focus:ring-offset-2 focus:ring-offset-cpn-dark",
                  isActive 
                    ? "bg-cpn-yellow/10 text-cpn-yellow border-r-2 border-cpn-yellow -mr-4" 
                    : "text-cpn-white hover:text-cpn-yellow"
                )}
                role="menuitem"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.currentTarget.click();
                  }
                }}
              >
                <Icon 
                  className={cn(
                    "mr-3 h-5 w-5 transition-colors",
                    isActive ? "text-cpn-yellow" : "text-cpn-gray group-hover:text-cpn-yellow"
                  )} 
                />
                <span>{item.label}</span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-cpn-yellow rounded-r" />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Premium Upgrade CTA */}
      <div className="p-4 border-t border-cpn-gray/20">
        <div className="bg-cpn-yellow rounded-full p-4 text-center">
          <p className="text-cpn-dark font-semibold text-sm">
            Upgrade to Premium — unlimited girls.
          </p>
        </div>
      </div>
      </div>
    </aside>
  );
}

export default NavigationSidebar;