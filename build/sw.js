// Simplified Service Worker for Performance Optimization
const CACHE_VERSION = '1.0.0'; // Use stable version
const CACHE_NAME = `luniby-cache-v${CACHE_VERSION}`;

// Simplified caching strategy
const FORCE_UPDATE = false;

// Assets to cache immediately (excluding specific JS/CSS files as they have hashes)
const STATIC_ASSETS = [
  '/',
  '/marketplace',
  '/manifest.json'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/rest\/v1\/marketplace_listings/,
  /\/rest\/v1\/rpc\/get_filtered_marketplace_listings/
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker: Static assets cached');
        // Force immediate activation and skip waiting
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches and force refresh
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => 
              cacheName !== CACHE_NAME && 
              cacheName !== STATIC_CACHE_NAME
            )
            .map((cacheName) => {
              console.log('🗑️ Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activated and old caches cleared');
        // Force reload all clients to get fresh content
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'CACHE_UPDATED' });
          });
        });
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(
      caches.open(CACHE_NAME)
        .then((cache) => {
          return cache.match(request)
            .then((cachedResponse) => {
              // Return cached response if available and fresh (5 minutes)
              if (cachedResponse) {
                const cacheDate = new Date(cachedResponse.headers.get('sw-cache-date') || 0);
                const isExpired = Date.now() - cacheDate.getTime() > 5 * 60 * 1000; // 5 minutes
                
                if (!isExpired) {
                  console.log('📦 Service Worker: Serving cached API response');
                  return cachedResponse;
                }
              }

              // Fetch fresh data
              return fetch(request)
                .then((response) => {
                  if (response.ok) {
                    const responseToCache = response.clone();
                    responseToCache.headers.append('sw-cache-date', new Date().toISOString());
                    cache.put(request, responseToCache);
                    console.log('💾 Service Worker: Cached API response');
                  }
                  return response;
                })
                .catch(() => {
                  // Return cached response as fallback if network fails
                  return cachedResponse || new Response('Network error', { status: 503 });
                });
            });
        })
    );
    return;
  }

  // Handle static assets with improved caching strategy
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'document') {
    event.respondWith(
      // Always try network first for JavaScript and CSS to avoid stale code
      fetch(request)
        .then((response) => {
          if (response.ok) {
            // Only cache successful responses and avoid caching HTML for JS requests
            const shouldCache = request.destination !== 'script' || 
                               (request.url.includes('.js') && !request.url.includes('.html'));
            
            if (shouldCache) {
              const responseToCache = response.clone();
              caches.open(STATIC_CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseToCache);
                  console.log('💾 Service Worker: Cached static asset');
                });
            }
          }
          return response;
        })
        .catch((error) => {
          console.error('📦 Service Worker: Network error for static asset:', error);
          // Only fall back to cache for non-script requests to avoid HTML/JS confusion
          if (request.destination !== 'script') {
            return caches.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                console.log('📦 Service Worker: Serving cached static asset (fallback)');
                return cachedResponse;
              }
              return new Response('Network error', { 
                status: 503, 
                statusText: 'Service Unavailable' 
              });
            });
        })
    );
    return;
  }

  // Handle image requests with longer cache
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(request)
            .then((response) => {
              if (response.ok) {
                const responseToCache = response.clone();
                caches.open(STATIC_CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseToCache);
                  });
              }
              return response;
            })
            .catch(() => {
              // Return a placeholder image on network error
              return new Response('', { status: 200 });
            });
        })
    );
    return;
  }

  // Default: network first for everything else
  event.respondWith(fetch(request));
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('🗑️ Service Worker: Manually clearing cache', cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        console.log('✅ Service Worker: All caches cleared manually');
        // Notify the main thread
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});