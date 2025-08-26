'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  BarChart3, 
  Plus, 
  Share, 
  Users, 
  Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabItem {
  label: string;
  href: string;
  icon: React.ElementType;
  isSpecial?: boolean;
}

const tabItems: TabItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Add', href: '/data-entry', icon: Plus, isSpecial: true },
  { label: 'Share', href: '/share', icon: Share },
  { label: 'Girls', href: '/profiles', icon: Users },
  { label: 'Leaderboards', href: '/leaderboards', icon: Trophy }
];

export function BottomTabNavigation() {
  const pathname = usePathname();

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-cpn-dark/95 backdrop-blur-lg border-t border-cpn-gray/20 pb-safe"
      role="tablist"
      aria-label="Main navigation tabs"
    >
      <div className="flex justify-around items-center px-2 py-2">
        {tabItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
                          (pathname.startsWith(item.href) && item.href !== '/dashboard');

          if (item.isSpecial) {
            // Special styling for Add button
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className="flex flex-col items-center justify-center p-2 min-h-[44px] min-w-[44px]"
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.currentTarget.click();
                    }
                  }}
                >
                  <div className="bg-cpn-yellow text-cpn-dark rounded-full h-12 w-12 flex items-center justify-center mb-1 shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cpn-yellow focus:ring-offset-2 focus:ring-offset-cpn-dark">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-medium text-cpn-yellow">
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          }

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex flex-col items-center justify-center p-2 min-h-[44px] min-w-[44px] transition-all duration-200 rounded-lg",
                  "hover:bg-cpn-yellow/10 focus:outline-none focus:ring-2 focus:ring-cpn-yellow/50 focus:ring-offset-2 focus:ring-offset-cpn-dark",
                  isActive 
                    ? "text-cpn-yellow bg-cpn-yellow/10" 
                    : "text-cpn-gray hover:text-cpn-yellow"
                )}
                role="tab"
                aria-selected={isActive}
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
                    "h-5 w-5 mb-1 transition-colors",
                    isActive ? "text-cpn-yellow" : "text-cpn-gray"
                  )} 
                />
                <span className={cn(
                  "text-xs font-medium transition-colors",
                  isActive ? "text-blue-500" : "text-cpn-gray"
                )}>
                  {item.label}
                </span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-px left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-cpn-yellow rounded-b" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomTabNavigation;