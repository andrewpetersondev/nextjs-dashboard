# Routing

## Purpose

The route map and route-classification rules the whole app shares — one place
that knows which paths exist, which are public, and which need admin.

## Boundaries

Two flat, universal files (no `core/`/`server/` split):

- `routes.ts` — the `ROUTES` object (single source for hrefs) plus
  `isPublicRoute` / `isProtectedRoute` / `isAdminRoute` used by the proxy and
  guards.
- `external-urls.ts` — external link constants (e.g. `GITHUB_REPO_URL`).

## Import Rules

- MAY import from `@/shared/core/**`
- MUST NOT import from `@/modules/**`
