/* Pomodoro Studio service worker: offline-first app shell.
   Bump CACHE_VERSION whenever you change any file so installed copies update. */
const CACHE_VERSION = "v3";
const CACHE = "pomodoro-studio-" + CACHE_VERSION;
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/shortcut-add.png",
  "./icons/shortcut-start.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("pomodoro-studio-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;          // never touch GitHub API / other origins

  // Page loads (incl. ?action=… shortcut URLs): network first with a short timeout, else the cached shell.
  if (req.mode === "navigate") {
    e.respondWith((async () => {
      try {
        const ctl = new AbortController();
        const t = setTimeout(() => ctl.abort(), 3000);
        const res = await fetch(req, { signal: ctl.signal });
        clearTimeout(t);
        if (res.ok) { const c = await caches.open(CACHE); c.put("./index.html", res.clone()); }
        return res;
      } catch (_) {
        return (await caches.match("./index.html")) || (await caches.match("./")) || Response.error();
      }
    })());
    return;
  }

  // Everything else: cache first, refresh in the background.
  e.respondWith((async () => {
    const cached = await caches.match(req, { ignoreSearch: true });
    const refresh = fetch(req).then(async (res) => {
      if (res && res.ok) { const c = await caches.open(CACHE); c.put(req, res.clone()); }
      return res;
    }).catch(() => null);
    return cached || (await refresh) || Response.error();
  })());
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    if (all.length) return all[0].focus();
    return self.clients.openWindow("./");
  })());
});
