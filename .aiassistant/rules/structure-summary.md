---
apply: always
---

# Structure & Architecture Summary

## Purpose

Define and enforce consistent, scalable structure, import boundaries, and layering in this Next.js + TypeScript app.  
Attach for refactors, file moves, or architecture reviews.

---

## Directory Structure

```

src/
├─ app/        → Next.js App Router (layouts, pages, routes)
├─ features/   → Domain logic, components, and types per feature
├─ server/     → Server-only logic: auth, db, repos, services, actions
├─ shared/     → Cross-cutting utilities, domain types, constants
├─ ui/         → Reusable UI primitives and client-only code
└─ shell/      → Dashboard and UI composition shells

```

---

## Layer Responsibilities

- **App:** Routing, layouts, top-level error and boundary handling.
- **Action:** Server actions, input validation (Zod), and controlled side-effects.
- **Service:** Business logic; orchestrates repos and domain operations.
- **Repo:** Abstracts data persistence using DAL or ORM.
- **DAL:** Low-level database or API access.
- **Server:** Config, logging, error handling, and infrastructure modules.
- **Shared:** Pure utilities, domain types, config, and constants.
- **UI:** Client-side only; no server or DB logic.

---

## Import & Boundary Rules

- Strict upward dependency flow only:

```

app → action → service → repo → dal → server → shared

```

`ui` is isolated for client-only imports.

- Lower layers **must not import** from higher ones.
- `shared` may be imported by any layer.
- Server-only modules must never appear in client components.
- Enforce via lint rules or import restrictions.

---

## Component & File Conventions

- Organize by **feature/domain**, not technical type.
- Avoid “dumping ground” files like `utils.ts`; create focused modules.
- No barrel files unless for pure type re-exports.
- File length ≤200 lines; functions ≤50 lines.
- Prefer small, composable modules with explicit public APIs.

---

## Next.js App Router Guidance

- Default to **Server Components** for data fetching and logic.
- Keep **Client Components** light, isolated, and free of server-only imports.
- Pass only serializable props across RSC boundaries.
- Use `fetch({ next: { revalidate } })` for cache control and typed keys.

---

## Performance & Review

- JS bundle target ≤200 KB gzip per route.
- Validate Lighthouse, LCP ≤2.5 s, CLS < 0.1, TBT < 300 ms.
- Verify import boundaries and immutability on each PR.

_Last updated: 2025-10-06_
