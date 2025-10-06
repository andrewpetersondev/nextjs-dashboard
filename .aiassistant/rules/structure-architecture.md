---
apply: always
---

# Structure & Architecture Rules

## Purpose

Document and enforce the organization, layering, and architectural strategies for maintainability, scalability, and
clarity throughout the project.

## Scope & Audience

- Audience: maintainers, reviewers, and AI contributors.
- Applies to: repository structure, import boundaries, layering, and Next.js architecture decisions.
- Contexts: new modules, refactors, and ADRs; enforced during code review and linting.

## Directory Structure

- **src/app/**: Next.js App Router entry, layouts, pages, API routes.
- **src/features/**: Feature modules (auth, customers, invoices, revenues, users) containing domain logic, components,
  types, and libraries.
- **src/server/**: Server-side code (auth, configuration, db, errors, events, forms, logging, repositories, etc.).
- **src/shared/**: Shared utilities, domain types, config, forms, i18n, logging, money, routes, UI primitives.
- **src/shell/**: Shell components for dashboard and UI composition.
- **src/ui/**: UI primitives, atoms, molecules, navigation, styles, and documentation for organization.

## Layered Architecture

- **App Layer**: Routing, layout, top-level error handling (`src/app/`).
- **Feature Layer**: Domain-specific logic, components, types (`src/features/`).
- **Server Layer**: Data access, business logic, error handling, events (`src/server/`).
- **Shared Layer**: Cross-cutting concerns, utilities, and domain models (`src/shared/`).
- **UI Layer**: Reusable UI primitives and composition patterns (`src/ui/`).

## Strategies & Principles

- Organize modules strictly by feature/domain to maximize scalability.
- Enforce strict separation of server/client code: prefer server components for data logic.
- Use strict TypeScript with explicit types in all layers.
- Treat all mutable input as immutable; avoid any in-place mutation.
- Use discriminated unions for all error/result handling.
- Prefer small, focused modules; avoid dumping grounds and barrel files.
- Validate and parse inputs server-side (Zod recommended).
- Use biome for formatting and linting.

## Next.js & React 19 Guidance

- Components:
    - Prefer Server Components for data fetching and heavy logic.
    - Client Components only for interactivity; avoid bringing server-only deps client-side.
    - Never pass non-serializable values across the RSC boundary; only JSON-serializable props.
- Data Fetching & Caching:
    - Default to server-first fetching; pass typed data to clients.
    - Define revalidation via fetch({ next: { revalidate } }) or route segment config.
    - Provide stable, typed cache keys; prefer AbortController for cancelable requests.
- Streaming & Suspense:
    - Keep boundaries small; avoid waterfalls; colocate Suspense with the data consumer when possible.
- Mutations:
    - Use Server Actions for mutations; validate inputs with Zod; return safe, typed unions or perform redirects.
- Performance:
    - Avoid over-fetching; paginate long lists; virtualize when >100 rows.
    - Control bundle size by keeping shared code in server or shared layers; use type-only imports in client.

### Performance Budgets & Profiling

- Route/page JS budget (client): 200 KB gzip target; warn at 250 KB; fail at 300 KB.
- LCP target: ≤2.5s on Fast 3G emulation; CLS <0.1; TBT <300ms.
- Require Lighthouse runs for key routes in CI with thresholds; PR fails on regressions.
- Use React Profiler for interactions exceeding 50ms; document findings in PR when optimizations are applied.

## Import Boundaries Enforcement

- Lower layers must not import from higher layers:
    - shared may be imported by server/features/ui/app
    - server may not import from app or ui
    - features may not import from app
- Enforcement policy:
    - Use import restriction lint rules (e.g., no restricted paths) to codify boundaries.
    - Any exception requires an ADR documenting rationale, scope, and planned removal timeline.
    - PRs violating boundaries without an ADR are rejected.

## Review Checklist

- Directory/module organization follows feature/domain boundaries.
- Layer boundaries (app, feature, server, dal, repository, service, action, shared, UI) are maintained.
- Explicit strict TypeScript usage in all files.
- Immutability and error handling patterns are applied consistently.
- Tooling and configuration are validated and up-to-date.
- Import boundaries are enforced by lint rules; exceptions have ADRs.

_Last updated: 2025-10-05_
