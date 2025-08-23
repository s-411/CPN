# CPN App Technical Stack - Mobile-First PWA

## Core Platform & Deployment
- **DigitalOcean App Platform** for production hosting and deployment
- **Automatic deployments** from Git repository
- **Environment-based scaling** and configuration
- **Built-in load balancing** and SSL certificates

## Application Framework
- **Next.js 14+** with App Router for full-stack React development
- **TypeScript** for type safety and better developer experience
- **React 18** with Server Components and Suspense for optimal loading
- **Edge Runtime** for faster cold starts and global performance

## Progressive Web App (PWA) Core
- **Service Workers** for offline functionality and caching
- **App Shell Architecture** for instant loading
- **Web App Manifest** for native app-like installation
- **Background Sync** for data entry when offline
- **Push Notifications** for streak reminders and challenges
- **Cache-First Strategy** for critical app shell resources

## Authentication & Payments
- **Clerk.com** for unified authentication and payment processing
- **Magic Link authentication** for passwordless sign-in
- **Subscription management** with tiered pricing ($0 → $2.99 → $5.99+ weekly)
- **Customer portal** for billing management
- **Webhook integration** for subscription status updates

## Database System
- **PostgreSQL** as primary database
- **Supabase** for database hosting and real-time subscriptions
- **Connection pooling** for optimal performance under load
- **Database indexes** optimized for mobile query patterns
- **Drizzle ORM** for type-safe queries with excellent tree-shaking

## Mobile Performance Optimization
- **Image optimization** with Next.js Image component and WebP format
- **Code splitting** at route and component level
- **Bundle analysis** to keep JavaScript payloads minimal (<100KB initial)
- **Prefetching** for anticipated user navigation
- **Lazy loading** for non-critical components and images
- **Resource hints** (preload, prefetch, preconnect)

## CSS Framework & UI
- **Tailwind CSS** with JIT compilation for minimal bundle size
- **CSS-in-JS elimination** in favor of compile-time styles
- **Critical CSS inlining** for above-the-fold content
- **shadcn/ui** components optimized for mobile touch interfaces
- **Custom CSS properties** for dynamic theming

## Touch-Optimized Interface Design
- **Large touch targets** (minimum 44px tap areas)
- **Gesture support** for swipe navigation and data entry
- **Haptic feedback** via Vibration API for user actions
- **Pull-to-refresh** functionality for data updates
- **Smooth animations** with CSS transforms and will-change
- **Touch-friendly form inputs** with proper input modes

## Referral/Affiliate System
- **Rewardful** for automatic affiliate enrollment and tracking
- **Custom referral codes** embedded in shareable content
- **30% commission rate** on subscription revenue
- **Mobile-optimized sharing** with native share API
- **Ambassador tier system** with progressive rewards

## Content Delivery & Caching
- **DigitalOcean Spaces** for static asset storage with CDN
- **Edge caching** via DigitalOcean's built-in CDN
- **Aggressive caching strategies** for mobile performance
- **Service Worker caching** for offline-first experience
- **Image optimization** with multiple formats and sizes

## Shareable Graphics Engine (Mobile-Optimized)
- **Canvas API** with hardware acceleration
- **WebGL fallbacks** for complex graphics
- **9:16 aspect ratio** templates for TikTok/Instagram Stories
- **1:1 square format** for Instagram posts
- **Compressed image export** optimized for mobile sharing
- **Native sharing** with Web Share API
- **Embedded referral codes** in all generated content

## Mobile-Specific Features
- **App-like navigation** with bottom tab bar
- **Swipe gestures** for quick data entry and navigation
- **Voice input** for hands-free data entry (Web Speech API)
- **Camera integration** for photo capture (if needed)
- **Device orientation** handling for optimal UX
- **Network-aware** features with online/offline states

## Email Services
- **Resend** for transactional emails optimized for mobile
- **ConvertKit** for marketing automation and retention campaigns
- **Mobile-responsive email templates**
- **Deep linking** from emails back to PWA

## Performance Targets (Mobile)
- **First Contentful Paint**: <1.2s on 3G
- **Largest Contentful Paint**: <2.5s
- **Time to Interactive**: <3.5s on mid-tier mobile devices
- **Cumulative Layout Shift**: <0.1
- **Bundle Size**: Initial JS <100KB gzipped
- **PWA Install Rate**: >15% of repeat users

## Security Features
- **Content Security Policy** with strict rules
- **Input validation** and sanitization
- **Rate limiting** for API endpoints
- **Secure session management** via Clerk
- **HTTPS enforcement** with HSTS headers
- **XSS and CSRF protection**

## Offline Capabilities
- **Core app functionality** available offline
- **Data entry queuing** with background sync
- **Cached statistics** for immediate access
- **Offline notifications** for streak tracking
- **Graceful degradation** when network unavailable

## Development Workflow
- **Git-based deployments** to DigitalOcean
- **Environment separation** (dev/staging/production)
- **Feature flags** for gradual rollouts
- **Mobile-first testing** with device emulation
- **Performance budgets** in CI pipeline

## Viral Growth Features (Mobile-Optimized)
- **Streak mechanics** with push notifications
- **Achievement badge system** (25+ mobile-friendly badges)
- **Challenge system** for friend competitions
- **Auto-generated social media templates**
- **Native sharing** via Web Share API
- **Global statistics** dashboard
- **Real-time leaderboards**

## Environment Configuration
- **Environment variables** for all external service keys
- **Separate configs** for development, staging, and production
- **Secure secret management** via DigitalOcean App Platform
- **Feature flags** for mobile-specific functionality

## Monitoring & Alerts
- **DigitalOcean monitoring** for uptime and performance
- **Database performance tracking** via Supabase
- **Clerk webhook monitoring** for authentication/payment issues
- **Mobile crash reporting** and error tracking
- **PWA analytics** (install rates, usage patterns)

## Scalability & Performance
- **Horizontal scaling** via DigitalOcean App Platform
- **Database connection pooling** and read replicas
- **Edge caching** for global performance
- **Asset optimization** pipeline
- **Mobile-first infrastructure** decisions