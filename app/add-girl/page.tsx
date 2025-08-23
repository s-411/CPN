import type { Metadata } from 'next'
import { AddGirlPageClient } from './page-client'

export const metadata: Metadata = {
  title: 'Add Profile - CPN Tracker',
  description: 'Create your first profile to start tracking your dating efficiency and cost per result with CPN.',
  keywords: ['dating tracker', 'efficiency', 'profile creation', 'CPN', 'dating analytics'],
  authors: [{ name: 'CPN Team' }],
  creator: 'CPN',
  publisher: 'CPN',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Add Your First Profile | CPN Tracker',
    description: 'Start tracking your dating efficiency by creating your first profile. Get insights into your cost per result and time investment.',
    url: '/add-girl',
    siteName: 'CPN Tracker',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-add-profile.png',
        width: 1200,
        height: 630,
        alt: 'CPN Profile Creation - Track Your Dating Efficiency',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Add Your First Profile | CPN Tracker',
    description: 'Start tracking your dating efficiency by creating your first profile.',
    images: ['/og-add-profile.png'],
    creator: '@cpntracker',
  },
  robots: {
    index: false, // Don't index private onboarding pages
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover',
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f2f661' },
    { media: '(prefers-color-scheme: dark)', color: '#1f1f1f' },
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CPN Tracker',
    startupImage: [
      {
        url: '/apple-touch-startup-image-768x1004.png',
        media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 1) and (orientation: portrait)',
      },
      {
        url: '/apple-touch-startup-image-1536x2008.png',
        media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'msapplication-TileColor': '#f2f661',
    'msapplication-config': '/browserconfig.xml',
  },
}

// Generate JSON-LD structured data for SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'CPN Profile Creation',
  applicationCategory: 'LifestyleApplication',
  description: 'Create your first dating profile to track efficiency and cost per result',
  url: process.env.NEXT_PUBLIC_BASE_URL + '/add-girl',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript. Requires HTML5.',
  softwareVersion: '1.0',
  author: {
    '@type': 'Organization',
    name: 'CPN',
  },
  offers: {
    '@type': 'Offer',
    category: 'Dating Analytics',
  },
}

export default function AddGirlPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AddGirlPageClient />
    </>
  )
}