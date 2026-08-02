// Bèbè Moda Style — service worker
// Rôle : mettre en cache l'app-shell (HTML/CSS/JS/icônes) pour que l'app
// s'ouvre instantanément et reste utilisable même en cas de connexion
// instable. Les appels Supabase (produits, commandes...) ne sont JAMAIS
// mis en cache : ils passent toujours par le réseau pour rester à jour.

const CACHE_NAME = 'bebemoda-shell-v1';
const APP_SHELL = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never cache API/data calls (Supabase) — always fetch fresh.
  if (url.hostname.includes('supabase.co') || event.request.method !== 'GET') {
    return;
  }

  // Network-first for navigation requests (so users get the latest deploy),
  // falling back to cache when offline.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Cache-first for static assets (JS/CSS/images built by Vite).
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
