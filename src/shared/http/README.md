# HTTP

## Purpose

Small HTTP primitives shared across features: typed header-name/value
constants, server-only request metadata, and the app's security headers.

## Boundaries

- Universal code lives in `core/` — `http-headers.ts` (header names plus
  cache-control values such as `CACHE_CONTROL_NO_STORE`).
- Server-only code lives in `server/` — `request-metadata.ts` (derives
  per-request metadata such as the client IP for logging/auth composition) and
  `security-headers.ts`.

## Security headers

`security-headers.ts` owns both halves of the app's header policy, split by how
they are delivered:

- `STATIC_SECURITY_HEADERS` are request-independent, so they ship from
  `next.config.ts`'s `headers()` and cover **every** response, including the
  static assets the proxy matcher skips.
- `buildContentSecurityPolicy()` / `generateCspNonce()` are per-request — the
  CSP carries a fresh nonce — so they can only run in `src/proxy.ts`.

The module is deliberately dependency-free (no `server-only`, no `@/` imports)
because `next.config.ts` imports it from outside the app's module graph.

Why the whole app is dynamically rendered, and why that was the only working
option, is [ADR 001](notes/adr/001-nonce-based-csp-requires-dynamic-rendering.md).
`pnpm csp:guard:build` enforces the invariant; a prerendered page under this CSP
never hydrates and still looks correct in a screenshot.

## Import Rules

- MAY import from `@/shared/core/**`
- MUST NOT import from `@/modules/**`
