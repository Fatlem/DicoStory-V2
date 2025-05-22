importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

const CACHE_NAME = 'dicostory-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/badge-96x96.png',
];

if (workbox) {
  console.log('Workbox berhasil dimuat');
  
  workbox.precaching.precacheAndRoute([
    { url: './', revision: '1' },
    { url: './index.html', revision: '1' },
    { url: './manifest.json', revision: '1' },
    { url: './icons/icon-192x192.png', revision: '1' },
    { url: './icons/icon-512x512.png', revision: '1' },
    { url: './icons/badge-96x96.png', revision: '1' },
  ]);

  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'document',
    new workbox.strategies.NetworkFirst({
      cacheName: 'pages-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, 
        }),
      ],
    })
  );

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
          maxAgeSeconds: 30 * 24 * 60 * 60,
        }),
      ],
    })
  );

  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: 'images-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        }),
      ],
    })
  );

  workbox.routing.registerRoute(
    ({ url }) => url.origin === 'https://story-api.dicoding.dev',
    new workbox.strategies.NetworkFirst({
      cacheName: 'api-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 5 * 60,
        }),
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    })
  );
  
  workbox.routing.setCatchHandler(({ event }) => {
    if (event.request.destination === 'document') {
      return caches.match('./index.html');
    }
    return Response.error();
  });

} else {
  console.log('Workbox gagal dimuat, menggunakan cache manual');
  
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => {
          return cache.addAll(urlsToCache);
        })
    );
  });

  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request);
        })
    );
  });
}

self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');

  let notification = {
    title: 'DicoStory',
    options: {
      body: 'Ada pembaruan baru di DicoStory!',
      icon: './icons/icon-192x192.png',
      badge: './icons/badge-96x96.png',
      vibrate: [100, 50, 100],
      data: { url: './' },
      actions: [
        {
          action: 'open',
          title: 'Buka App',
          icon: './icons/icon-192x192.png'
        },
        {
          action: 'close',
          title: 'Tutup',
        }
      ]
    }
  };

  if (event.data) {
    try {
      const dataJson = event.data.json();
      notification = { ...notification, ...dataJson };
    } catch (e) {
      console.error('Error parsing push data:', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notification.title, notification.options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data && event.notification.data.url
    ? event.notification.data.url
    : './';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes('index.html') || client.url === urlToOpen) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  
  event.waitUntil(
    Promise.all([
      clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('dicostory-') && cacheName !== CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
    ])
  );
});
