const CACHE_NAME = 'assistance-system-v1';
const urlsToCache = [
  '/app-asistencia/',
  '/app-asistencia/index.html',
  '/app-asistencia/manifest.webmanifest',
  '/app-asistencia/AS-Logo-192.png',
  '/app-asistencia/AS-Logo-512.png',
  // Agrega aquí otros recursos que quieras que estén disponibles offline
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Limpiar caches antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});