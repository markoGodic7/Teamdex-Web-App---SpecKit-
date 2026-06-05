# TeamDex Frontend

This folder contains the Vite + React + TypeScript frontend for TeamDex.

Quick start:

```bash
cd frontend
npm install
npm run dev
```

Build:

```bash
npm run build
npm run preview
```

Notes:
- Tailwind is configured via `tailwind.config.cjs` and `postcss.config.cjs`.
- Main entry: `src/main.tsx`.
- App root: `src/App.tsx`.

Offline verification (service worker + cached details)

1. Build and preview the production app (service worker only active in preview/build):

```bash
cd frontend
npm run build
npm run preview
```

2. In a browser, open the preview URL. Open DevTools → Application → Service Workers to confirm `/sw.js` is registered.

3. Ensure a detail is cached:
	- Open the app and open a Pokémon detail (e.g. Bulbasaur) so the service worker/runtime can cache the detail response.

4. Simulate offline:
	- In DevTools → Network, set `Offline` and try opening the same detail again or reload the page. The app should show the cached detail view even without network.

Limitations and notes:
- The service worker caches detail responses at runtime and uses a TTL (~1 hour). Cached items may be evicted after the TTL.
- Runtime caching only stores detail responses that have been fetched while the SW is active; prefetching in `main.tsx` primes some items but may be skipped in dev.
- To clear caches: open DevTools → Application → Clear storage (or unregister the service worker and delete site data).

