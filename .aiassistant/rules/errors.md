---
apply: manually
---

# Error Modeling Rules

## Purpose

1. Define a consistent, type‑safe, JSON‑safe error model across layers.
2. Keep UI concerns (AppError) separate from internal/logging concerns (BaseError + variants).

## Precedence

- See: always-on.md (governance, coding/style)
- See: results.md (Result helpers and usage)
- See: forms.md (FormResult adaptation)

## Rules

1. Use a canonical BaseError with literal `code` and immutable instances (frozen); add type guards (e.g., `BaseError.is`).
2. Derive domain error variants from BaseError with a closed set of codes per domain.
3. Never leak BaseError beyond service boundaries; adapt to AppError at adapters.
4. AppError is lightweight and JSON‑safe: { code, kind, message, severity, details? } only.
5. Normalize unknown values to BaseError at boundaries; do not cast to `any`.
6. Preserve `cause` internally for logging; redact secrets in any `details`.
7. Centralize code→kind/severity mapping in a single adapter helper per boundary.

## Implementation Notes

- References:
  - src/shared/core/errors/base/base-error.ts
  - src/shared/core/errors/domain/\*
  - src/shared/core/errors/app/app-error.ts
- Adapters are the only tier-crossing points:
  - unknown/BaseError → AppError
  - AppError → Result/FormResult

## Changelog

- 2025-10-16: Extracted from results-forms-errors.md and added file-pattern activation (owner: Junie).

## Last updated

2025-10-16
