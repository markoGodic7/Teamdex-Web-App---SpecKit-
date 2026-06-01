# Implementation Plan: TeamDex — Pokedex with Team Builder

**Goal**: Deliver an MVP single-page app (React + Vite + TypeScript) that allows guest users to search Pokémon, view details from PokeAPI v2, add/remove up to 6 members to a local team, and view combined team stats updated immediately and persisted to localStorage.

## Milestones

1. Foundation (complete): repository scaffolding, frontend skeleton, Tailwind config, React Query provider. (T001-T005)
2. Data Layer (P1): implement `api.getPokemon`, name-index prefetch, TanStack Query configuration, caching strategy (T006-T009).
3. Core UI (P1): SearchBox, ResultsGrid, DetailDrawer, TeamPanel, wiring add/remove to `useTeam` for immediate updates (T011-T015, T020-T023).
4. Accessibility & Themes (P2): keyboard navigation, ARIA, Light + High Contrast themes, WCAG AA verification (T025-T026).
5. Polish & Tests (P2-P3): loading skeletons, error handling, integration tests, README, performance tuning (T015, T024, T028-T031).

## Implementation Map (files)

- `frontend/src/main.tsx` — app entry + QueryClient provider
- `frontend/src/lib/api.ts` — `getPokemon(idOrName)`, `listPokemon()` wrapper
- `frontend/src/hooks/useDebouncedValue.ts` — 300ms debounce
- `frontend/src/hooks/useTeam.ts` — team state, localStorage persistence, add/remove, computeTotals
- `frontend/src/components/SearchBox.tsx` — suggestions, keyboard nav
- `frontend/src/components/ResultsGrid.tsx` / `PokemonCard.tsx` — paginated grid and previews
- `frontend/src/components/DetailDrawer.tsx` — detailed view, Add/Remove
- `frontend/src/components/TeamPanel.tsx` — team list, per-stat bars, totals, empty state

## Key Decisions

- Use TanStack Query for caching and dedupe; set `staleTime` to 10 minutes for detail queries.
- Debounce search input 300ms.
- Persist team to `localStorage` under key `teamdex.team` with a recorded `persistedAt`.
- Prevent duplicate team members by Pokémon `id` and enforce max size 6.
- Provide fallbacks when `sprites.other['official-artwork'].front_default` is missing.

## Acceptance Mapping

- See `specs/001-pokedex-team-builder/spec.md` and checklist at `specs/001-pokedex-team-builder/checklists/requirements.md` for AC mapping. Primary ACs covered: AC-001..AC-005.

## Next Immediate Tasks

1. Implement data helpers: `frontend/src/lib/api.ts` and QueryClient defaults (T006, T007).
2. Implement `useTeam` hook (T009) and `TeamPanel` UI (T020) to validate immediate add/remove behavior early.
3. Implement `DetailDrawer` (T013) and connect add action to `useTeam.add()` (T014).

## Risks & Mitigations

- PokeAPI rate limits: use client cache + debounce; if limits block testing, consider a lightweight proxy or mock responses for tests.
- Accessibility gaps: run an automated axe audit and manual keyboard tests during P2.


Generated on 2026-06-01
