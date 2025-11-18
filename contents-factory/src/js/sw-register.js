// Photo Factory - Service Worker Registration
// Registers service worker and handles updates

/**
 * Register service worker
 */
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        '/public/service-worker.js',
        { scope: '/' }
      );

      console.log('✅ Service Worker registered:', registration.scope);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available
            showUpdateNotification();
          }
        });
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SYNC_COMPLETE') {
          console.log('🔄 Background sync completed');

          // Refresh UI if needed
          if (typeof window.onSyncComplete === 'function') {
            window.onSyncComplete();
          }
        }
      });

      return registration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  } else {
    console.warn('⚠️ Service Worker not supported');
  }
}

/**
 * Show update notification
 */
function showUpdateNotification() {
  const notification = document.createElement('div');
  notification.className = 'update-notification';
  notification.innerHTML = `
    <div class="alert alert-info d-flex justify-content-between align-items-center" role="alert">
      <span>🔄 새로운 버전이 있습니다!</span>
      <button class="btn btn-sm btn-primary" onclick="window.location.reload()">
        새로고침
      </button>
    </div>
  `;

  document.body.appendChild(notification);
}

/**
 * Request background sync
 */
export async function requestBackgroundSync() {
  if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-photos');
      console.log('📡 Background sync registered');
    } catch (error) {
      console.error('❌ Background sync registration failed:', error);
    }
  } else {
    console.warn('⚠️ Background sync not supported');
  }
}

/**
 * Check if online
 */
export function isOnline() {
  return navigator.onLine;
}

/**
 * Listen for online/offline events
 */
export function setupNetworkListeners() {
  window.addEventListener('online', async () => {
    console.log('📡 Network: Online');
    showNetworkStatus('온라인', 'success');

    // Trigger sync
    await requestBackgroundSync();
  });

  window.addEventListener('offline', () => {
    console.log('📴 Network: Offline');
    showNetworkStatus('오프라인', 'warning');
  });
}

/**
 * Show network status
 */
function showNetworkStatus(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `alert alert-${type} position-fixed bottom-0 end-0 m-3`;
  toast.style.zIndex = '9999';
  toast.textContent = `📡 ${message}`;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Auto-register on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', registerServiceWorker);
} else {
  registerServiceWorker();
}

// Setup network listeners
setupNetworkListeners();

console.log('📡 Service Worker registration module loaded');
