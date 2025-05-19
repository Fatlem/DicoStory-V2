importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

if (workbox) {
  console.log('Workbox berhasil dimuat');
  
  // Custom precaching
  workbox.precaching.precacheAndRoute([
    { url: './', revision: '1' },
    { url: './index.html', revision: '1' },
    { url: './src/app.js', revision: '1' },
    { url: './src/styles/styles.css', revision: '1' },
    { url: './src/styles/map-styles.css', revision: '1' },
    { url: './manifest.json', revision: '1' },
    { url: './src/public/fallback.jpg', revision: '1' },
    { url: './src/public/icons/favicon-16x16.png', revision: '1' },
    { url: './src/public/icons/favicon-32x32.png', revision: '1' },
    { url: './src/public/icons/apple-touch-icon.png', revision: '1' },
    { url: './src/public/note.png', revision: '1' },
  ]);

  // Cache halaman
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'document',
    new workbox.strategies.NetworkFirst({
      cacheName: 'pages-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
        }),
      ],
    })
  );

  // Cache assets statis (CSS, JS, dll)
  workbox.routing.registerRoute(
    ({ request }) => 
      request.destination === 'style' || 
      request.destination === 'script' ||
      request.destination === 'font',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'assets-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
        }),
      ],
    })
  );

  // Cache gambar
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: 'images-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
        }),
      ],
    })
  );

  // Cache API
  workbox.routing.registerRoute(
    ({ url }) => url.origin === 'https://story-api.dicoding.dev',
    new workbox.strategies.NetworkFirst({
      cacheName: 'api-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
        }),
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    })
  );
  
  // Fallback untuk halaman yang tidak ditemukan
  workbox.routing.setCatchHandler(({ event }) => {
    if (event.request.destination === 'document') {
      return caches.match('./src/views/pages/not-found.html')
        .then((response) => {
          return response || caches.match('./index.html');
        });
    }
    
    return Response.error();
  });
} else {
  console.log('Workbox gagal dimuat');
}

// Event Push Notification
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');

  let notification = {
    title: 'DicoStory',
    options: {
      body: 'Ada pembaruan baru!',
      icon: './src/public/icons/icon-192x192.png',
      badge: './src/public/icons/badge-96x96.png',
      vibrate: [100, 50, 100],
      data: {
        url: './'
      }
    }
  };

  if (event.data) {
    try {
      const dataJson = event.data.json();
      notification = dataJson;
    } catch (e) {
      console.error('Error parsing push data:', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notification.title, notification.options)
  );
});

// Event Notification Click
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();

  // Periksa apakah ada URL khusus di data notifikasi
  const urlToOpen = event.notification.data && event.notification.data.url
    ? event.notification.data.url
    : './';

  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        for (const client of clientList) {
          if ((client.url === urlToOpen || client.url.includes('index.html')) && 'focus' in client) {
            return client.focus();
          }
        }
        
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Event Ketika Service Worker Diinstal
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
  self.skipWaiting();
});

// Event Ketika Service Worker Diaktifkan
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  
  // Mengklaim kontrol halaman yang belum dikontrol service worker
  event.waitUntil(clients.claim());
  
  // Membersihkan cache lama
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Hapus cache lama yang tidak ada dalam daftar cache
            return cacheName.startsWith('dicostory-') && 
                  !['pages-cache', 'assets-cache', 'images-cache', 'api-cache'].includes(cacheName);
          })
          .map((cacheName) => {
            return caches.delete(cacheName);
          })
      );
    })
  );
});