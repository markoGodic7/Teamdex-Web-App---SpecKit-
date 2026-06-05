/* Service Worker: teamdex SW
   - Caches detail responses from PokeAPI (/api/v2/pokemon/{id}) with a cache-first strategy
   - Adds a simple `sw-fetched-at` header on cached responses to implement TTL
   - TTL default: 1 hour
*/
(function () {
  'use strict';

  const CACHE_NAME = 'teamdex-pokemon-details-v1';
  const TTL_MS = 1000 * 60 * 60; // 1 hour

  self.addEventListener('install', (event) => {
    self.skipWaiting();
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
      if (self.clients && self.clients.claim) await self.clients.claim();
      // Optionally remove old caches here if you evolve CACHE_NAME
    })());
  });

  async function tryNetworkAndCache(request) {
    try {
      const resp = await fetch(request);
      if (!resp || resp.status >= 400) throw new Error('Network response not ok');
      const cloned = resp.clone();
      const body = await cloned.arrayBuffer();
      const headers = new Headers(cloned.headers);
      headers.set('sw-fetched-at', String(Date.now()));
      // Recreate response with the same status and body but with fetched timestamp header
      const wrapped = new Response(body, {
        status: cloned.status,
        statusText: cloned.statusText,
        headers,
      });
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, wrapped.clone());
      return resp;
    } catch (e) {
      throw e;
    }
  }

  self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    // Only handle PokeAPI pokemon details
    if (url.hostname === 'pokeapi.co' && url.pathname.startsWith('/api/v2/pokemon/')) {
      event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(req);
        if (cached) {
          // check TTL
          const fetchedAt = cached.headers.get('sw-fetched-at');
          if (fetchedAt && (Date.now() - Number(fetchedAt) < TTL_MS)) {
            return cached.clone();
          }
          // try network, fall back to cached if network fails
          try {
            const netResp = await tryNetworkAndCache(req);
            return netResp;
          } catch (e) {
            return cached.clone();
          }
        }
        // no cached response, try network and cache
        try {
          const netResp = await tryNetworkAndCache(req);
          return netResp;
        } catch (e) {
          return new Response(JSON.stringify({ error: 'offline' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
        }
      })());
    }
    // Let other requests pass through
  });
})();
