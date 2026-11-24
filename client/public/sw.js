/**
 * GigCraft Service Worker
 * Enables PWA installability, asset caching, and offline support.
 */

const CACHE_NAME = "gigcraft-shell-v2";
const PRECACHE_ASSETS = [
  "/",
  "/favicon.svg",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET requests, API calls, and socket connections
  if (
    req.method !== "GET" ||
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/socket.io") ||
    url.protocol.startsWith("ws")
  ) {
    return;
  }

  // Navigation requests (HTML pages): Network first, fallback to cached index.html
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => {
        return caches.match("/index.html") || caches.match("/");
      })
    );
    return;
  }

  // Static assets (CSS, JS, local icons): Network-first with cache fallback
  if (
    url.pathname.startsWith("/assets/") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".png")
  ) {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(req))
    );
  }
});
