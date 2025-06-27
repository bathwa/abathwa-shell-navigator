/// <reference lib="webworker" />

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

declare const self: ServiceWorkerGlobalScope;

// Clean up outdated caches
cleanupOutdatedCaches();

// Precache all files
precacheAndRoute(self.__WB_MANIFEST);

// Take control of all clients immediately
self.skipWaiting();
clientsClaim();

// Cache API responses
registerRoute(
  ({ url }) => url.origin === 'https://bolzybkvyzhxbasgsofm.supabase.co',
  new NetworkFirst({
    cacheName: 'supabase-api',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 5 * 60, // 5 minutes
      }),
    ],
  })
);

// Cache static assets
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
);

// Cache Google Fonts
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets',
  })
);

registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      }),
    ],
  })
);

// Offline fallback handling
const FALLBACK_HTML_URL = '/offline.html';
const FALLBACK_IMAGE_URL = '/offline-image.svg';

// Cache the fallback resources during install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('offline-fallbacks').then((cache) => {
      return cache.addAll([
        FALLBACK_HTML_URL,
        FALLBACK_IMAGE_URL,
      ]);
    })
  );
});

// Handle fetch events for offline fallbacks
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(FALLBACK_HTML_URL);
      })
    );
  } else if (event.request.destination === 'image') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(FALLBACK_IMAGE_URL);
      })
    );
  }
});

// Handle background sync for offline actions
interface SyncData {
  type: string;
  data: any;
  timestamp: number;
}

// Queue for offline actions
let offlineQueue: SyncData[] = [];

// IndexedDB helper functions
const openDB = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('AbathwaCapitalDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('offlineQueue')) {
        db.createObjectStore('offlineQueue', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

const saveToIndexedDB = async (data: SyncData) => {
  try {
    const db = await openDB();
    const transaction = db.transaction(['offlineQueue'], 'readwrite');
    const store = transaction.objectStore('offlineQueue');
    await new Promise<void>((resolve, reject) => {
      const request = store.add(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error saving to IndexedDB:', error);
  }
};

const getFromIndexedDB = async (): Promise<SyncData[]> => {
  try {
    const db = await openDB();
    const transaction = db.transaction(['offlineQueue'], 'readonly');
    const store = transaction.objectStore('offlineQueue');
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting from IndexedDB:', error);
    return [];
  }
};

const clearIndexedDB = async () => {
  try {
    const db = await openDB();
    const transaction = db.transaction(['offlineQueue'], 'readwrite');
    const store = transaction.objectStore('offlineQueue');
    await new Promise<void>((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error clearing IndexedDB:', error);
  }
};

// Background sync event handler
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineData());
  }
});

const syncOfflineData = async () => {
  try {
    const queuedData = await getFromIndexedDB();
    
    for (const item of queuedData) {
      try {
        await processOfflineAction(item);
      } catch (error) {
        console.error('Error processing offline action:', error);
        // Keep failed items in queue for retry
        continue;
      }
    }
    
    // Clear successfully processed items
    await clearIndexedDB();
    
    // Notify all clients about sync completion
    const clientList = await self.clients.matchAll();
    clientList.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        data: { processedItems: queuedData.length }
      });
    });
    
  } catch (error) {
    console.error('Error during background sync:', error);
  }
};

const processOfflineAction = async (syncData: SyncData) => {
  const { type, data } = syncData;
  
  switch (type) {
    case 'CREATE_OPPORTUNITY':
      await fetch('https://bolzybkvyzhxbasgsofm.supabase.co/rest/v1/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbHp5Ymt2eXpoeGJhc2dzb2ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NDcwMzMsImV4cCI6MjA2NjUyMzAzM30.VqPb1P2-A79Tk9R8KLrqdfmoreCp8FKeGGb4ZxMef1o'
        },
        body: JSON.stringify(data)
      });
      break;
      
    case 'CREATE_OFFER':
      await fetch('https://bolzybkvyzhxbasgsofm.supabase.co/rest/v1/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbHp5Ymt2eXpoeGJhc2dzb2ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NDcwMzMsImV4cCI6MjA2NjUyMzAzM30.VqPb1P2-A79Tk9R8KLrqdfmoreCp8FKeGGb4ZxMef1o'
        },
        body: JSON.stringify(data)
      });
      break;
      
    case 'UPDATE_PROFILE':
      await fetch(`https://bolzybkvyzhxbasgsofm.supabase.co/rest/v1/profiles?id=eq.${data.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbHp5Ymt2eXpoeGJhc2dzb2ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NDcwMzMsImV4cCI6MjA2NjUyMzAzM30.VqPb1P2-A79Tk9R8KLrqdfmoreCp8FKeGGb4ZxMef1o'
        },
        body: JSON.stringify(data)
      });
      break;
      
    default:
      console.warn('Unknown sync action type:', type);
  }
};

// Message handler for offline actions
self.addEventListener('message', async (event) => {
  if (event.data && event.data.type === 'QUEUE_OFFLINE_ACTION') {
    const syncData: SyncData = {
      type: event.data.actionType,
      data: event.data.data,
      timestamp: Date.now()
    };
    
    // Add to memory queue
    offlineQueue.push(syncData);
    
    // Save to IndexedDB for persistence
    await saveToIndexedDB(syncData);
    
    // Register for background sync
    try {
      await self.registration.sync.register('background-sync');
    } catch (error) {
      console.error('Background sync registration failed:', error);
      // Fallback: try to sync immediately
      setTimeout(syncOfflineData, 1000);
    }
    
    // Send confirmation back to client
    event.ports[0]?.postMessage({ success: true });
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/logo-192.png',
    badge: '/logo-192.png',
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/logo-192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Abathwa Capital', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      self.clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// Periodic background sync for data updates
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-data') {
    event.waitUntil(updateCachedData());
  }
});

const updateCachedData = async () => {
  try {
    // Update critical data in background
    const endpoints = [
      '/rest/v1/opportunities',
      '/rest/v1/offers',
      '/rest/v1/payments'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`https://bolzybkvyzhxbasgsofm.supabase.co${endpoint}`, {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbHp5Ymt2eXpoeGJhc2dzb2ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NDcwMzMsImV4cCI6MjA2NjUyMzAzM30.VqPb1P2-A79Tk9R8KLrqdfmoreCp8FKeGGb4ZxMef1o'
          }
        });
        
        if (response.ok) {
          // Cache the updated data
          const cache = await caches.open('supabase-api');
          await cache.put(response.url, response.clone());
        }
      } catch (error) {
        console.error(`Error updating ${endpoint}:`, error);
      }
    }
  } catch (error) {
    console.error('Error during periodic sync:', error);
  }
};

// Export type for TypeScript
export type { SyncData };
