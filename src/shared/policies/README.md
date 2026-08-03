# Policies

## Purpose

Cross-feature validation policy: what counts as a valid email, password,
username, and user role — one owner per rule so auth and users can't drift
apart.

## Boundaries

One folder per policy, each pairing a Zod schema with its helpers:

- `email/` — schema + `normalize.email.ts` (canonical form before storage).
- `password/` — policy + schema (strength rules).
- `username/` — policy + schema + normalization.
- `user-role/` — `USER_ROLES` constants, parser, and schema (the role enum the
  DB schema and guards share).
- `zod/` — Zod guard helpers (`isZodErrorInstance`, schema shape guards).

## Import Rules

- MAY import from `@/shared/core/**`
- MUST NOT import from `@/modules/**`
