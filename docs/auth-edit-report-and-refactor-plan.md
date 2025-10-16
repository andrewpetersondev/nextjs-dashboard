# Auth Audit Report and Refactor Plan

Scope: `src/server/auth` (application, domain, policy, session). Confirm `src/features/auth` remains UI-only or absent.

## Summary

Auth is well-structured with clear layers (actions, services, adapters, mappers, policy, session). Plan focuses on security hardening, explicit typing, boundary enforcement, and transaction correctness.

## Strengths

1. Clear layering and separation of concerns.
2. Server actions exist for auth flows.
3. DI-friendly service factory and adapters.
4. Repository contract with transaction support.
5. Domain mappers for UI-safe transport and errors.
6. Session isolated (codec, options, helpers).
7. Central policy module.

## Weaknesses (prioritized)

- Security
  1. Centralize constant-time password verify; avoid any plaintext comparisons.
  2. Enforce secure cookie defaults and rotation on auth events.
  3. Validate env secrets; forbid weak defaults.
  4. Sanitize error surfaces; no internal causes to clients.

- Correctness 5. Ensure withTransaction binds a tx-scoped repo; rollback on error. 6. Session verification handles expiration/skew safely. 7. Signup uniqueness and creation are atomic.

- Boundary 8. Keep `features/auth` UI-only; no server-only imports. 9. Avoid lateral cross-feature imports.

- Typing 10. Explicit Promise return types on all exports. 11. No `any` or non-null assertions; use discriminated unions. 12. Consistent Zod `z.input`/`z.output` aliases.

- Structure/Tooling 13. No barrel files; split oversized files. 14. Add type-level tests for schemas/contracts. 15. Add Cypress + axe happy-path checks.

## Refactor Plan

### Phase 0 — Safety Net (Tests)

- Add unit tests:
  1. Auth service: signup/login success/fail paths.
  2. Session codec/helpers: encode/decode, expiration, rotation.
  3. Error mappers: internal → UI-safe.
  4. Repo withTransaction: success, rollback.
- Add type-level tests for schema I/O and repo interface.
- Test fixtures with deterministic hashing cost in test env.

### Phase 1 — Security

- Centralize password hashing/verify via adapter with constant-time compare.
- Cookie policy: `httpOnly`, `secure` (prod), strict/lax `sameSite`, explicit `path`/`domain`, short `maxAge`, sliding renewal.
- Session rotation on login, privilege change, periodic renewal; invalidate old sessions.
- Centralized env validation; redact logs; no weak defaults.
- Map all external errors to safe shapes.

### Phase 2 — Boundary & Typing

- Actions: `use server`, validate with `z.input`, return typed discriminated unions; no thrown raw errors.
- Add explicit types to all exports; remove `any`/non-null assertions.
- Normalize `XxxInput` = `z.input`, `XxxData` = `z.output` across domain.

### Phase 3 — Repos & Transactions

- Ensure `withTransaction` provides a tx-scoped repo; document behavior; nested tx policy.
- Atomic signup (uniqueness + create within tx); add integration tests for conflicts/rollbacks.

### Phase 4 — Structure & Tooling

- Split files >200 lines; keep modules single-purpose.
- Enforce import boundaries with ESLint rules.
- Add Cypress happy-path for login/signup/logout; include `cypress-axe`.

## Findings Format (for ongoing audits)

- Category: Security | Correctness | Boundary | Typing | Structure | Testing
- Location: file/folder and symbol(s)
- Evidence: brief description (no sensitive code)
- Recommendation: concrete fix aligned with rules
- Effort: S | M | L

## Risks

- Session rotation may log users out: feature-flag and communicate.
- Stricter validation may reject legacy inputs: migration and UX messaging.
- Transactional signup may surface DB constraints: map to user-friendly errors.

## Next Steps

1. Implement Phase 0 tests.
2. Apply Phase 1 cookie/verify/env hardening.
3. Type/Boundary cleanup in actions and services.
4. Transaction correctness and repo tests.
