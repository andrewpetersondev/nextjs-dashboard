---
apply: manually
---

# Form Handling Rules

## Purpose

1. Provide a consistent contract for form validation results and error mapping to UI.
2. Ensure dense, JSON‑safe field error maps and safe value echoing.

## Precedence

- See: always-on.md (governance, coding/style)
- See: results.md (Result helpers)
- See: errors.md (AppError/BaseError model and adapters)

## Rules

1. Return dense field error maps: every field key present; value is readonly string[] (may be empty).
2. Use a single adapter per feature/domain to convert AppError → FormResult.
3. Detect targeted conflicts (e.g., duplicate email) and attach field‑specific messages; otherwise provide a generic message and empty arrays for unaffected fields.
4. Echo values via display‑safe selectors with redaction; never include secrets/PII.
5. Prefer validateFormGeneric (validation → transform → normalize) instead of ad‑hoc parsing.

## References

- src/shared/forms/types/form-result.types.ts
- src/server/forms/validate-form.ts

## Changelog

- 2025-10-16: Extracted from results-forms-errors.md and added file-pattern activation (owner: Junie).

## Last updated

2025-10-16
