# Tasks: TeamDex — Pokedex with Team Builder

**Input**: Design documents from `specs/001-pokedex-team-builder/`

**Prerequisites**: `plan.md`, `spec.md`

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Initialize Vite + React + TypeScript project in `frontend/` with basic `package.json` and `tsconfig.json` (frontend root)
- [ ] T002 Install dependencies: `react`, `react-dom`, `vite`, `typescript`, `tailwindcss`, `shadcn/ui`, `@radix-ui/react-*`, `@tanstack/react-query`, `zod`, `clsx` and dev tools (postcss, autoprefixer) (frontend root)
- [ ] T003 Configure Tailwind: `tailwind.config.ts` and `src/styles/tailwind.css`, add Light and High Contrast theme tokens (frontend/src)
- [ ] T004 Create base app scaffolding: `src/main.tsx`, `src/App.tsx`, `src/index.css` and provider setup for React Query (frontend/src)
- [ ] T005 Add project README with run and build instructions (README.md)

---

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T006 [P] Implement `src/lib/api.ts` fetch helpers and wrappers for PokeAPI endpoints (`/pokemon?limit=2000&offset=0` and `/pokemon/{id or name}`) with basic error handling (frontend/src/lib)
- [ ] T007 [P] Configure TanStack Query client with default `staleTime=10m`, `cacheTime` policy, and request dedupe; add QueryClient provider in `src/main.tsx` (frontend/src)
- [ ] T008 [P] Add simple caching layer for name index and detail responses (leveraging TanStack Query + optional localStorage fallback) (`frontend/src/lib/cache.ts`)
- [ ] T009 [P] Implement `src/hooks/useDebouncedValue.ts` (300ms) and `src/hooks/useTeam.ts` (team state, localStorage persistence, add/remove, compute totals) (frontend/src/hooks)
- [ ] T010 Setup basic routing/layout and keyboard focus management utilities (`frontend/src/lib/keyboard.ts`)

**Checkpoint**: Foundation ready — UI and story work can begin

---

## Phase 3: User Story 1 - Quick search (Priority: P1) 🎯 MVP

**Goal**: Search Pokémon by name/ID with suggestions, view detail drawer, and add to team.

**Independent Test**: Type a name, select suggestion, open detail, add to team, verify Team panel updates immediately and persists after reload.

- [ ] T011 [P] [US1] Create `src/components/SearchBox.tsx` with keyboard navigation, ARIA attributes, and debounced suggestions using the name-index (`frontend/src/components`)
- [ ] T012 [US1] Create `src/components/ResultsGrid.tsx` and `src/components/PokemonCard.tsx` for paginated result listing and artwork preview (frontend/src/components)
- [ ] T013 [US1] Create `src/components/DetailDrawer.tsx` that fetches full data via `api.getPokemon` and shows artwork, types, base stats, and Add to Team button (frontend/src/components)
- [ ] T014 [US1] Wire `DetailDrawer` Add to Team button to `useTeam.add()` so that Team panel receives immediate update (frontend/src/hooks + frontend/src/components)
- [ ] T015 [US1] Add loading skeletons and error states for search and detail views (frontend/src/components)
- [ ] T016 [US1] Add integration test task: `tests/integration/test_search_add_team.spec.tsx` to verify search→detail→add→persistence (optional but recommended) (tests/)

---

## Phase 4: User Story 2 - Browse paginated list (Priority: P1)

**Goal**: Browse the paginated list, open detail view, add multiple Pokémon to team.

**Independent Test**: Navigate pages, open cards, add to team, verify per-stat totals.

- [ ] T017 [P] [US2] Implement paginated listing using the PokeAPI list endpoint (ResultsGrid pagination controls) (frontend/src/components)
- [ ] T018 [US2] Ensure cards link to `DetailDrawer` and use cached detail responses when available (frontend/src/components)
- [ ] T019 [US2] Add accessibility labels and keyboard navigation for paging controls (frontend/src/components)

---

## Phase 5: User Story 3 - Team management (Priority: P1)

**Goal**: Team panel shows members, allows remove, computes per-stat totals and bars, persists to localStorage.

**Independent Test**: Add multiple Pokémon, verify totals update, remove a member and verify totals adjust, reload page to confirm persistence.

- [ ] T020 [US3] Create `src/components/TeamPanel.tsx` to render team list, per-stat bars, totals, and empty state (frontend/src/components)
- [ ] T021 [US3] Implement visual per-stat bars and numeric totals; ensure ARIA live regions announce changes when team updates (frontend/src/components)
- [ ] T022 [US3] Enforce team size limit (6) in `useTeam` and show accessible message when limit reached (frontend/src/hooks + frontend/src/components)
- [ ] T023 [US3] Implement Remove action wired to `useTeam.remove()` with immediate UI refresh (frontend/src/components)
- [ ] T024 [US3] Add tests: `tests/integration/test_team_management.spec.tsx` (add/remove/persistence) (tests/)

---

## Phase 6: Polish & Cross-Cutting Concerns (P2)

- [ ] T025 Accessibility audit: verify keyboard navigation, focus rings, and WCAG AA contrast; update styles as needed (frontend/)
- [ ] T026 Theme toggles: implement Light and High Contrast theme switch and ensure focus visibility (frontend/src/components)
- [ ] T027 Handle missing artwork fallbacks and sprite fallbacks in UI (frontend/src/components)
- [ ] T028 Implement error toasts with retry for network failures and use cached data where possible (frontend/src/components)
- [ ] T029 Performance tuning: preload first page of results on app load and measure first-detail load time (frontend/src)

---

## Phase 7: Finalize & Handoff (P3)

- [ ] T030 Update `README.md` with run instructions and acceptance test steps
- [ ] T031 Add simple E2E script or npm script to run the app locally (`npm run dev`) and run integration tests
- [ ] T032 Commit all changes and open PR for review

---

## Dependencies & Execution Order

- Phase 1 must complete before Phase 2 begins.
- Phase 2 foundational tasks (T006..T010) must complete before user story implementation (Phase 3..5).
- User story tasks may be worked in parallel after foundation is ready; within a story, implement components before integration tests.

## Parallel Opportunities

- Install and config tasks (T002, T003, T007, T008) can run in parallel.
- Component implementations across different user stories (T011..T013 vs T017..T019 vs T020..T023) can be parallelized by multiple devs.

## Implementation Map

- Spec: `specs/001-pokedex-team-builder/spec.md`
- Checklist: `specs/001-pokedex-team-builder/checklists/requirements.md`

**MVP scope suggestion**: Complete Phase 1, Phase 2, Phase 3, and Phase 5 (Team management). Phase 4 (full browse pagination) can be simplified initially by loading first page only and adding pagination later.

**Total task count:** 32

**Suggested first steps**
1. Run `npm init vite@latest frontend -- --template react-ts` and `cd frontend && npm install` (or `yarn`) to scaffold (T001/T002).
2. Implement `useTeam` hook (T009) and `TeamPanel` UI (T020) so you can validate immediate UI updates early.
3. Implement `api.getPokemon` and `DetailDrawer` (T006/T013) to complete the search→detail→add flow.

***

Generated by speckit.tasks for feature: TeamDex — Pokedex with Team Builder
