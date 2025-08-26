import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Removed experimental features for stable deployment
  i18n: {
    locales: ['en-US'],
    defaultLocale: 'en-US',
  },
};

export default nextConfig;
