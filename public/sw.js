// CPN Tracker Service Worker
// Handles offline functionality, caching, and background sync

const CACHE_NAME = 'cpn-tracker-v1.0.0'
const STATIC_CACHE = 'cpn-static-v1'
const DYNAMIC_CACHE = 'cpn-dynamic-v1'

// Define which files to cache for offline use
const STATIC_FILES = [
  '/',
  '/add-girl',
  '/manifest.json',
  '/offline',
  // Core CSS and JS will be automatically added by Next.js
]

// Define API endpoints that should be cached
const CACHEABLE_APIS = [
  '/api/profile',
  '/api/user/preferences',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('Service Worker: Caching static files')
      return cache.addAll(STATIC_FILES)
    }).catch((error) => {
      console.error('Service Worker: Failed to cache static files', error)
    })
  )
  
  // Skip waiting to activate immediately
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  
  // Claim all clients immediately
  self.clients.claim()
})

// Fetch event - handle network requests with cache-first strategy
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Only handle same-origin requests
  if (url.origin !== location.origin) {
    return
  }
  
  // Handle different types of requests
  if (request.destination === 'document') {
    // HTML requests - network first, fallback to cache
    event.respondWith(handleDocumentRequest(request))
  } else if (CACHEABLE_APIS.some(api => url.pathname.startsWith(api))) {
    // API requests - cache first with network fallback
    event.respondWith(handleApiRequest(request))
  } else if (isStaticAsset(request)) {
    // Static assets - cache first
    event.respondWith(handleStaticRequest(request))
  } else {
    // Default network first
    event.respondWith(handleNetworkFirst(request))
  }
})

// Handle document (HTML) requests
async function handleDocumentRequest(request) {
  try {
    // Try network first for fresh content
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
      return networkResponse
    }
    
    // For non-OK responses in development, just return them
    // This prevents the offline page from showing for 404s, 500s, etc.
    const url = new URL(request.url)
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      return networkResponse
    }
    
    throw new Error(`Network response not ok: ${networkResponse.status}`)
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache', error.message)
    
    // In development, don't show offline page - just fail the request
    const url = new URL(request.url)
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      // Return a network error response so the browser shows its default error
      return Response.error()
    }
    
    // Fallback to cache for production
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // If no cache, return offline page (production only)
    const offlineResponse = await caches.match('/offline')
    if (offlineResponse) {
      return offlineResponse
    }
    
    // Last resort - basic offline response
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Offline - CPN Tracker</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: system-ui, -apple-system, sans-serif;
              background: #1f1f1f;
              color: #ffffff;
              padding: 2rem;
              text-align: center;
            }
            .logo { 
              width: 4rem;
              height: 4rem;
              background: #f2f661;
              border-radius: 50%;
              margin: 0 auto 2rem;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              color: #1f1f1f;
            }
          </style>
        </head>
        <body>
          <div class="logo">CPN</div>
          <h1>You're Offline</h1>
          <p>Check your connection and try again.</p>
          <button onclick="location.reload()">Retry</button>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    )
  }
}

// Handle API requests
async function handleApiRequest(request) {
  try {
    // For form data, try cache first to prevent data loss
    if (request.method === 'POST' || request.method === 'PUT') {
      return await handleNetworkFirst(request)
    }
    
    // For GET requests, use cache first
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      // Check if cached response is still fresh (within 5 minutes)
      const dateHeader = cachedResponse.headers.get('date')
      if (dateHeader) {
        const cacheDate = new Date(dateHeader)
        const now = new Date()
        const fiveMinutes = 5 * 60 * 1000
        
        if (now - cacheDate < fiveMinutes) {
          return cachedResponse
        }
      }
    }
    
    // Try network
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
      return networkResponse
    }
    
    // Fallback to cache if network fails
    if (cachedResponse) {
      return cachedResponse
    }
    
    throw new Error('No cached response available')
  } catch (error) {
    console.error('Service Worker: API request failed', error)
    
    // Return error response for API calls
    return new Response(
      JSON.stringify({ 
        error: 'Offline - request will be retried when online',
        offline: true 
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Handle static asset requests
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
      return networkResponse
    }
    throw new Error(`Static asset fetch failed: ${networkResponse.status}`)
  } catch (error) {
    console.error('Service Worker: Static asset failed', error)
    throw error
  }
}

// Handle network first requests
async function handleNetworkFirst(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      return networkResponse
    }
    throw new Error(`Network request failed: ${networkResponse.status}`)
  } catch (error) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    throw error
  }
}

// Check if request is for a static asset
function isStaticAsset(request) {
  const url = new URL(request.url)
  return (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/images/')
  )
}

// Background sync for form submissions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag)
  
  if (event.tag === 'profile-submission') {
    event.waitUntil(handleProfileSync())
  }
})

// Handle background sync for profile submissions
async function handleProfileSync() {
  try {
    // Get queued form submissions from IndexedDB
    const db = await openDatabase()
    const tx = db.transaction(['submissions'], 'readonly')
    const store = tx.objectStore('submissions')
    const submissions = await getAll(store)
    
    for (const submission of submissions) {
      try {
        const response = await fetch('/api/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submission.data)
        })
        
        if (response.ok) {
          // Remove from queue after successful submission
          const deleteTx = db.transaction(['submissions'], 'readwrite')
          const deleteStore = deleteTx.objectStore('submissions')
          await deleteStore.delete(submission.id)
          
          console.log('Service Worker: Background sync completed for submission', submission.id)
        }
      } catch (error) {
        console.error('Service Worker: Background sync failed for submission', submission.id, error)
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync error', error)
  }
}

// IndexedDB helpers
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('cpn-tracker', 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('submissions')) {
        db.createObjectStore('submissions', { keyPath: 'id', autoIncrement: true })
      }
    }
  })
}

function getAll(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

// Push notifications (for future implementation)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received')
  
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'cpn-notification',
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icons/action-open.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/action-close.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('CPN Tracker', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event.action)
  
  event.notification.close()
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})