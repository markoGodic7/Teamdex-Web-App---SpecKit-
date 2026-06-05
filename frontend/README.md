# TeamDex Frontend

Single-page React + Vite frontend for TeamDex — a lightweight Pokédex with a Team Builder.

Summary
- Purpose: Search and browse Pokémon (PokeAPI v2), view details, and build a local team (persisted to `localStorage`).
- Key UX: keyboard-accessible search, detail drawer, immediate team updates (no reload), Light and High Contrast themes, visible focus rings, and offline-cached Pokémon detail views (service worker).

Tech stack
- Vite + React 18 + TypeScript
- Tailwind CSS for styling
- TanStack Query for data fetching and caching
- Vitest + Testing Library for tests

Getting started (development)

```bash
cd frontend
npm install
npm run dev
```

Build & preview (production-like)

```bash
npm run build
npm run preview
# or run the bundled build + preview in one step:
npm run preview:prod
```

Tests
- Run all tests: `npm test`
- Run only integration tests: `npm run test:integration`

Service worker / offline
- A runtime service worker (`public/sw.js`) caches Pokémon detail responses (cache-first with TTL).
- SW is registered in `src/main.tsx`; the SW runs only when served over a secure context or via `vite preview`/production build.
- To verify offline behavior: build + preview, open DevTools → Application → Service Workers, fetch a detail while online, then toggle Network → Offline and re-open the detail (it should render from cache).

Project structure & important files
- Entry: `src/main.tsx` — QueryClient provider, startup prefetch, and SW registration
- API helpers: `src/lib/api.ts`
- Caching helpers: `src/lib/cache.ts`
- Hooks: `src/hooks/useTeam.ts`, `src/hooks/useDebouncedValue.ts`
- UI: `src/components/` (SearchBox, ResultsGrid, PokemonCard, DetailDrawer, TeamPanel, ThemeToggle, Toaster)
- Tests: `tests/integration/` contains Vitest integration tests

Specs, tasks, and speckit
- This workspace uses a Spec Kit (speckit) layout; feature specs, plans and task lists live under `specs/`.
- Feature plan and tasks for this work are in `specs/001-pokedex-team-builder/` (spec, plan, tasks, checklists).

Development notes
- Theme toggle persists to `localStorage` under the key `teamdex.theme` and toggles the `.hc` high-contrast class on the `documentElement`.
- Prefetching: `main.tsx` prefetches the name index and the first page of details to improve perceived performance.
- Team state: `useTeam` is a module-level pub/sub store to ensure immediate cross-component reactivity and localStorage persistence.

Contributing
- Make a feature branch from `main` and open a PR with linked task/spec references.
- Run `npm test` and ensure integration tests pass before requesting review.

Limitations
- SW caching is runtime-only and has a TTL; cached items will eventually expire.
- Some assets (sprites) are fetched from the PokeAPI CDN and may be subject to availability; fallbacks and inline SVGs are used where necessary.

Questions or next steps
- I can run the test suite and open a PR with these changes if you want — say the word and I'll create the branch and push the commit.


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

