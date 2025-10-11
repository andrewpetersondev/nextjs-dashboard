---
apply: off
---

# Structure & Architecture Summary

## Purpose

Define and enforce consistent, scalable structure, import boundaries, and layering in this Next.js + TypeScript app.  
Attach for refactors, file moves, or architecture reviews.

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

- `ui` is isolated for client-only imports.
- Lower layers **must not import** from higher ones.
- `shared` may be imported by any layer.
- Server-only modules must never appear in client components.
- Enforce via lint rules or import restrictions.

---

## Component & File Conventions

- See always-on.md 'Coding & Style' for file size limits, function granularity, and organization guidance.

---

## React

- Use functional components, explicit props/return types, typed event handlers.

## Next.js App Router Guidance

- Default to **Server Components** for data fetching and logic.
- Keep **Client Components** light, isolated, and free of server-only imports.
- Pass only serializable props across RSC boundaries.
- Use `fetch({ next: { revalidate } })` for cache control and typed keys.

---

_Last updated: 2025-10-11_
