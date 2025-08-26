'use client';

import { NavigationSidebar } from './navigation-sidebar';
import { BottomTabNavigation } from './bottom-tab-navigation';

interface ResponsiveNavigationProps {
  children: React.ReactNode;
}

export function ResponsiveNavigation({ children }: ResponsiveNavigationProps) {
  return (
    <>
      {/* Desktop Sidebar Navigation - Hidden on mobile (md:hidden) */}
      <NavigationSidebar />
      
      {/* Mobile Bottom Navigation - Hidden on desktop (hidden md:flex) */}
      <BottomTabNavigation />
      
      {/* Main Content Area */}
      <div className="flex-1 md:ml-64">
        {children}
      </div>
    </>
  );
}

export default ResponsiveNavigation;