import './globals.css';
import type { Metadata, Viewport } from 'next';
// import { getUser, getTeamForUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'CPN - Cost Per Nut',
  description: 'Track and optimize your dating efficiency with comprehensive analytics and competitive features.'
};

export const viewport: Viewport = {
  maximumScale: 1
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className="dark"
      >
        <body className="min-h-[100dvh] bg-cpn-dark text-cpn-white font-body antialiased">
          <SWRConfig
            value={{
              fallback: {
                // Database calls temporarily disabled for component testing
                // '/api/user': getUser(),
                // '/api/team': getTeamForUser()
              }
            }}
          >
            {children}
          </SWRConfig>
        </body>
      </html>
    </ClerkProvider>
  );
}
