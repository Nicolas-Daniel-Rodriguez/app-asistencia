const CACHE_NAME = 'assistance-system-v1';
const urlsToCache = [
  '/app-asistencia/',
  '/app-asistencia/index.html',
  '/app-asistencia/manifest.webmanifest',
  '/app-asistencia/AS-Logo-192.png',
  '/app-asistencia/AS-Logo-512.png',
  // Agregar los assets principales de la aplicación
  '/app-asistencia/assets/index.css',
  '/app-asistencia/assets/index.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  // Asegurarse de que las solicitudes siempre vayan al path correcto
  const url = new URL(event.request.url);
  if (url.origin === self.location.origin && !url.pathname.startsWith('/app-asistencia/')) {
    const newUrl = new URL('/app-asistencia' + url.pathname, url.origin);
    event.respondWith(fetch(newUrl));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
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