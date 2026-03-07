// Clarion Service Worker
// Handles: app shell caching, offline fallback, future push notifications

const CACHE_NAME = "clarion-v1";
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes for news content

// App shell — these files are cached on install so the app loads offline
const APP_SHELL = [
  "/",
  "/index.html",
  "/icon-192.png",
  "/icon-512.png",
  "/manifest.json",
];

// ── INSTALL: cache app shell ──
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Clarion SW] Caching app shell");
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// ── ACTIVATE: clean up old caches ──
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log("[Clarion SW] Deleting old cache:", key);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

// ── FETCH: network-first for API calls, cache-first for assets ──
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Always go to network for API/proxy calls
  if (
    url.hostname.includes("vercel.app") ||
    url.hostname.includes("supabase.co") ||
    url.hostname.includes("anthropic.com") ||
    url.hostname.includes("mapbox.com") ||
    url.pathname.startsWith("/api/")
  ) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // If offline and it's an API call, return empty articles gracefully
        if (url.pathname.includes("gnews")) {
          return new Response(
            JSON.stringify({ articles: [], offline: true }),
            { headers: { "Content-Type": "application/json" } }
          );
        }
        return new Response("Offline", { status: 503 });
      })
    );
    return;
  }

  // Cache-first for static assets (JS, CSS, fonts, images)
  if (
    event.request.destination === "script" ||
    event.request.destination === "style" ||
    event.request.destination === "font" ||
    event.request.destination === "image"
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Network-first with offline fallback for navigation (HTML)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match("/index.html").then((cached) => {
          if (cached) return cached;
          return new Response(
            `<!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Clarion — Offline</title>
                <style>
                  body { font-family: -apple-system, sans-serif; display:flex; align-items:center;
                    justify-content:center; min-height:100vh; margin:0; background:#fff; flex-direction:column; }
                  h1 { font-size:48px; font-weight:700; letter-spacing:-0.07em; margin:0 0 8px; }
                  p { color:#9A9689; font-size:14px; margin:0; }
                </style>
              </head>
              <body>
                <h1>Clarion.</h1>
                <p>You're offline. Connect to load the latest news.</p>
              </body>
            </html>`,
            { headers: { "Content-Type": "text/html" } }
          );
        })
      )
    );
    return;
  }
});

// ── PUSH NOTIFICATIONS (ready for future use) ──
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || "Clarion.", {
      body: data.body || "New stories are ready.",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: data.tag || "clarion-news",
      data: { url: data.url || "/" },
      actions: [
        { action: "open", title: "Read Now" },
        { action: "dismiss", title: "Dismiss" },
      ],
    })
  );
});

// ── NOTIFICATION CLICK ──
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url === url && "focus" in client) return client.focus();
      }
      // Otherwise open new window
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
