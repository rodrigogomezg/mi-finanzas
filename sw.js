const CACHE = 'mi-finanzas-v32';
const OFFLINE_ASSETS = ['./'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(OFFLINE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first: siempre trae la versión más nueva cuando hay conexión.
// Si no hay red, sirve desde cache (funciona offline).
// cache:'no-cache' en recursos propios: fuerza revalidar contra el servidor,
// si no GitHub Pages (max-age=600) puede servir HTML viejo hasta 10 minutos
// después de un deploy aunque se refresque la app.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const propio = new URL(e.request.url).origin === self.location.origin;
  e.respondWith(
    fetch(e.request, propio ? { cache: 'no-cache' } : undefined)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
