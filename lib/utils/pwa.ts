'use client'

// PWA utilities for service worker registration and management

export interface PWAInstallPrompt {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export interface PWACapabilities {
  isStandalone: boolean
  canInstall: boolean
  hasServiceWorker: boolean
  isOnline: boolean
  supportsBackgroundSync: boolean
  supportsNotifications: boolean
}

let deferredPrompt: PWAInstallPrompt | null = null

/**
 * Register service worker for PWA functionality
 */
export async function registerServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('PWA: Service worker not supported')
    return false
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    })

    console.log('PWA: Service worker registered:', registration.scope)

    // Handle updates
    registration.addEventListener('updatefound', () => {
      console.log('PWA: Service worker update found')
      const newWorker = registration.installing

      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('PWA: New service worker installed, refresh recommended')
            // Could show update notification to user here
            showUpdateAvailable()
          }
        })
      }
    })

    // Check for waiting service worker
    if (registration.waiting) {
      console.log('PWA: Service worker waiting, update available')
      showUpdateAvailable()
    }

    return true
  } catch (error) {
    console.error('PWA: Service worker registration failed:', error)
    return false
  }
}

/**
 * Show update available notification
 */
function showUpdateAvailable(): void {
  // Create a custom event for the app to listen to
  window.dispatchEvent(
    new CustomEvent('sw-update-available', {
      detail: {
        message: 'A new version of CPN Tracker is available!',
        action: 'refresh',
      },
    })
  )
}

/**
 * Skip waiting and activate new service worker
 */
export async function skipWaiting(): Promise<void> {
  if (!navigator.serviceWorker.controller) return

  const registration = await navigator.serviceWorker.getRegistration()
  if (registration?.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
  }
}

/**
 * Check PWA capabilities
 */
export function getPWACapabilities(): PWACapabilities {
  const isStandalone = 
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')

  const canInstall = deferredPrompt !== null

  const hasServiceWorker = 'serviceWorker' in navigator

  const isOnline = navigator.onLine

  const supportsBackgroundSync = 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype

  const supportsNotifications = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window

  return {
    isStandalone,
    canInstall,
    hasServiceWorker,
    isOnline,
    supportsBackgroundSync,
    supportsNotifications,
  }
}

/**
 * Setup PWA install prompt handling
 */
export function setupInstallPrompt(): void {
  // Listen for the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (event) => {
    console.log('PWA: Install prompt available')
    
    // Prevent the default mini-infobar from appearing
    event.preventDefault()
    
    // Save the event for later use
    deferredPrompt = event as any

    // Dispatch custom event for UI to show install button
    window.dispatchEvent(
      new CustomEvent('pwa-install-available', {
        detail: { canInstall: true },
      })
    )
  })

  // Listen for app installed event
  window.addEventListener('appinstalled', () => {
    console.log('PWA: App installed successfully')
    deferredPrompt = null

    // Dispatch custom event
    window.dispatchEvent(
      new CustomEvent('pwa-installed', {
        detail: { installed: true },
      })
    )

    // Track installation analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'pwa_install', {
        event_category: 'engagement',
        event_label: 'PWA Installation',
      })
    }
  })
}

/**
 * Prompt user to install PWA
 */
export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) {
    console.log('PWA: No install prompt available')
    return false
  }

  try {
    // Show the install prompt
    await deferredPrompt.prompt()

    // Wait for user choice
    const choiceResult = await deferredPrompt.userChoice

    console.log('PWA: User choice:', choiceResult.outcome)

    if (choiceResult.outcome === 'accepted') {
      console.log('PWA: User accepted install')
    } else {
      console.log('PWA: User dismissed install')
    }

    // Clean up
    deferredPrompt = null

    return choiceResult.outcome === 'accepted'
  } catch (error) {
    console.error('PWA: Install prompt failed:', error)
    return false
  }
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.log('PWA: Notifications not supported')
    return 'denied'
  }

  if (Notification.permission === 'granted') {
    return 'granted'
  }

  if (Notification.permission === 'denied') {
    return 'denied'
  }

  try {
    const permission = await Notification.requestPermission()
    console.log('PWA: Notification permission:', permission)

    // Track permission analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'notification_permission', {
        event_category: 'engagement',
        event_label: permission,
      })
    }

    return permission
  } catch (error) {
    console.error('PWA: Notification permission request failed:', error)
    return 'denied'
  }
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('PWA: Push notifications not supported')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration()
    if (!registration) {
      console.error('PWA: No service worker registration found')
      return null
    }

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription()
    if (subscription) {
      console.log('PWA: Already subscribed to push notifications')
      return subscription
    }

    // Subscribe to push notifications
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    })

    console.log('PWA: Subscribed to push notifications')

    // Send subscription to server (implement this API endpoint)
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      })
    } catch (error) {
      console.error('PWA: Failed to send subscription to server:', error)
    }

    return subscription
  } catch (error) {
    console.error('PWA: Push subscription failed:', error)
    return null
  }
}

/**
 * Queue form data for background sync when offline
 */
export async function queueForSync(data: any, syncTag: string): Promise<void> {
  if (!('serviceWorker' in navigator) || !('sync' in window.ServiceWorkerRegistration.prototype)) {
    console.log('PWA: Background sync not supported')
    return
  }

  try {
    // Store data in IndexedDB for background sync
    const db = await openDatabase()
    const tx = db.transaction(['submissions'], 'readwrite')
    const store = tx.objectStore('submissions')
    
    await store.add({
      data,
      timestamp: Date.now(),
      syncTag,
    })

    // Register background sync
    const registration = await navigator.serviceWorker.ready
    if ('sync' in registration) {
      await (registration as any).sync.register(syncTag)
    }

    console.log('PWA: Queued for background sync:', syncTag)
  } catch (error) {
    console.error('PWA: Failed to queue for sync:', error)
    throw error
  }
}

/**
 * Open IndexedDB database
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('cpn-tracker', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('submissions')) {
        db.createObjectStore('submissions', { keyPath: 'id', autoIncrement: true })
      }
    }
  })
}

/**
 * Check if app is running in PWA mode
 */
export function isPWA(): boolean {
  const capabilities = getPWACapabilities()
  return capabilities.isStandalone
}

/**
 * Initialize PWA functionality
 */
export async function initializePWA(): Promise<void> {
  if (typeof window === 'undefined') return

  console.log('PWA: Initializing...')

  // Register service worker
  const swRegistered = await registerServiceWorker()
  
  // Setup install prompt
  setupInstallPrompt()

  // Log PWA capabilities
  const capabilities = getPWACapabilities()
  console.log('PWA: Capabilities:', capabilities)

  // Dispatch ready event
  window.dispatchEvent(
    new CustomEvent('pwa-ready', {
      detail: {
        registered: swRegistered,
        capabilities,
      },
    })
  )
}

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: Record<string, any>) => void
  }
}