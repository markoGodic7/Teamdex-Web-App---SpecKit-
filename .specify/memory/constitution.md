# PokéTeam Builder Constitution

## Core Principles

### I. Library-First (Frontend Focus)
Every feature is built as a reusable component or hook. Components must be self-contained, props-driven, and independently testable. Avoid monolithic page components.

### II. Type Safety
All code must be written in TypeScript with strict mode enabled. Use `zod` for runtime validation at API boundaries. No `any` unless absolutely necessary (and documented).

### III. Test-First (NON-NEGOTIABLE)
TDD mandatory for new features: write tests → get approval → watch them fail → implement. Red-Green-Refactor cycle strictly enforced. Unit tests for hooks and utilities; integration tests for data fetching.

### IV. Accessibility & Theming
All UI must support Light and High Contrast themes (as per FR-009). Use semantic HTML, ARIA labels where needed, and test with keyboard navigation. No UI may lock to a single visual mode.

### V. Performance & Caching
Respect PokeAPI fair-use: staleTime ≥ 10 minutes for detail queries (FR-008). Avoid unnecessary refetches. Use React Query’s caching and deduplication; implement client-side caching for the name index.

## Additional Constraints

- **Technology Stack**: React 18+, Vite, Tailwind CSS, shadcn/ui, TanStack Query, Zod. No class components, no Redux.
- **State Management**: Team state must be persisted to localStorage and recoverable across sessions.
- **Error Handling**: All API calls must have user-friendly error handling; network failures should degrade gracefully.

## Development Workflow

- **Branching**: Feature branches off `main`; PRs require passing CI (lint, type‑check, tests) and at least one review.
- **Code Quality**: ESLint + Prettier enforced; all comments in English.
- **Documentation**: Each hook and component must have a JSDoc description of its purpose and props.

## Governance

This constitution supersedes all other practices. Amendments require a PR with rationale, team approval, and migration plan. All PRs must verify compliance with these principles. Complexity must be justified – YAGNI.

**Version**: 1.0.0 | **Ratified**: 2025-06-01 | **Last Amended**: 2025-06-01