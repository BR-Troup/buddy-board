const CACHE = 'buddy-board-v4';
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll([
    './icon-180.png', './icon-192.png', './manifest.webmanifest'
  ])));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  const path = url.pathname;
  const networkFirst = path.endsWith('/') || path.endsWith('index.html') || path.endsWith('todos.json') || path.endsWith('sw.js');
  if (networkFirst) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' }).then((r) => {
        const copy = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return r;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
});
