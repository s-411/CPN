import { Metadata } from 'next'
import DataEntryPageClient from './page-client'

export const metadata: Metadata = {
  title: 'Track Your Experience | CPN - Cost Per Nut Calculator',
  description: 'Enter the details of your dating experience to calculate your cost per interaction and efficiency metrics. Track date costs, time spent, and outcomes.',
  keywords: [
    'dating cost calculator',
    'cost per nut',
    'dating efficiency',
    'date tracking',
    'relationship metrics',
    'dating analytics',
    'cost analysis',
    'dating budget'
  ],
  authors: [{ name: 'CPN Team' }],
  creator: 'CPN',
  publisher: 'CPN',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.BASE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/data-entry',
  },
  openGraph: {
    title: 'Track Your Experience | CPN Calculator',
    description: 'Enter your dating experience details to calculate cost per interaction and efficiency metrics.',
    url: '/data-entry',
    siteName: 'CPN - Cost Per Nut Calculator',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/og-data-entry.jpg',
        width: 1200,
        height: 630,
        alt: 'CPN Data Entry - Track your dating experience',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Track Your Experience | CPN Calculator',
    description: 'Enter your dating experience details to calculate cost per interaction and efficiency metrics.',
    creator: '@cpn_calculator',
    images: ['/images/twitter-data-entry.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  category: 'lifestyle',
  classification: 'Dating Analytics Tool',
  referrer: 'origin-when-cross-origin',
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f2f661' },
    { media: '(prefers-color-scheme: dark)', color: '#1f1f1f' },
  ],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CPN Data Entry',
    startupImage: [
      {
        url: '/images/apple-splash-2048-2732.jpg',
        media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/images/apple-splash-1668-2388.jpg',
        media: '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/images/apple-splash-1536-2048.jpg',
        media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/images/apple-splash-1125-2436.jpg',
        media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/images/apple-splash-1242-2208.jpg',
        media: '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/images/apple-splash-750-1334.jpg',
        media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/images/apple-splash-640-1136.jpg',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: ['/favicon-16x16.png'],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/apple-touch-icon-precomposed.png',
      },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'application-name': 'CPN Data Entry',
    'apple-mobile-web-app-title': 'CPN Data Entry',
    'theme-color': '#1f1f1f',
    'msapplication-navbutton-color': '#1f1f1f',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'msapplication-starturl': '/data-entry',
    'viewport': 'width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover',
  },
}

export default function DataEntryPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'CPN Data Entry',
    description: 'Track your dating experience details to calculate cost per interaction and efficiency metrics.',
    url: `${process.env.BASE_URL || 'http://localhost:3000'}/data-entry`,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Any',
    permissions: 'browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      category: 'free'
    },
    featureList: [
      'Date cost tracking',
      'Time efficiency analysis',
      'Outcome recording',
      'Real-time validation',
      'Offline support',
      'Data persistence',
      'Privacy focused',
      'Mobile optimized'
    ],
    screenshot: `${process.env.BASE_URL || 'http://localhost:3000'}/images/screenshot-data-entry.jpg`,
    softwareVersion: '1.0',
    dateCreated: '2025-01-01',
    dateModified: new Date().toISOString().split('T')[0],
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    creator: {
      '@type': 'Organization',
      name: 'CPN Team',
      url: process.env.BASE_URL || 'http://localhost:3000'
    },
    publisher: {
      '@type': 'Organization',
      name: 'CPN',
      url: process.env.BASE_URL || 'http://localhost:3000'
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DataEntryPageClient />
    </>
  )
}