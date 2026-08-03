# HTTP

## Purpose

Small HTTP primitives shared across features: typed header-name/value
constants and server-only request metadata.

## Boundaries

- Universal code lives in `core/` — `http-headers.ts` (header names plus
  cache-control values such as `CACHE_CONTROL_NO_STORE`).
- Server-only code lives in `server/` — `request-metadata.ts` (derives
  per-request metadata such as the client IP for logging/auth composition).

## Import Rules

- MAY import from `@/shared/core/**`
- MUST NOT import from `@/modules/**`
