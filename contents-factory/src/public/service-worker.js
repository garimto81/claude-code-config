// Photo Factory - Service Worker
// Provides offline support and background sync

const CACHE_NAME = 'photo-factory-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/public/index.html',
  '/public/upload.html',
  '/public/gallery.html',
  '/public/job-detail.html',
  '/js/rxdb.js',
  '/js/rxdb-schemas.js',
  '/js/rxdb-api.js',
  '/js/rxdb-sync.js',
  '/js/auth-local.js',
  '/js/upload.js',
  '/js/gallery.js',
  '/js/config.js',
  '/js/utils/errors.js',
  '/js/utils/retry.js',
  '/js/utils/state.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css'
];

/**
 * Install event - cache static files
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Service Worker] Caching static files');
      return cache.addAll(STATIC_FILES);
    })
  );

  self.skipWaiting();
});

/**
 * Activate event - clean old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );

  self.clients.claim();
});

/**
 * Fetch event - serve from cache, fallback to network
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Cloudinary and Supabase requests (always fetch fresh)
  if (
    request.url.includes('cloudinary.com') ||
    request.url.includes('supabase.co')
  ) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cacheResponse) => {
      // Return cached response if found
      if (cacheResponse) {
        return cacheResponse;
      }

      // Otherwise fetch from network
      return fetch(request)
        .then((networkResponse) => {
          // Cache dynamic responses
          if (networkResponse && networkResponse.status === 200) {
            return caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, networkResponse.clone());
              return networkResponse;
            });
          }

          return networkResponse;
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/public/offline.html');
          }
        });
    })
  );
});

/**
 * Background Sync - sync data when back online
 */
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync triggered:', event.tag);

  if (event.tag === 'sync-photos') {
    event.waitUntil(syncData());
  }
});

/**
 * Sync data with Supabase
 */
async function syncData() {
  try {
    console.log('[Service Worker] Syncing data...');

    // Import sync module
    const { syncWithSupabase } = await import('/js/rxdb-sync.js');
    const { getCurrentUser } = await import('/js/auth-local.js');

    const user = await getCurrentUser();
    if (user) {
      await syncWithSupabase(user.id);
      console.log('[Service Worker] Sync completed');

      // Notify all clients
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage({
          type: 'SYNC_COMPLETE',
          timestamp: Date.now()
        });
      });
    }
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
    throw error; // Retry sync
  }
}

/**
 * Push notification (for future use)
 */
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.body || 'New notification',
    icon: '/assets/icon-192.png',
    badge: '/assets/badge-72.png',
    tag: data.tag || 'default',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Photo Factory', options)
  );
});

/**
 * Notification click
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/public/gallery.html')
  );
});

console.log('[Service Worker] Loaded');
