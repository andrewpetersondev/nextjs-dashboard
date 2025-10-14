---
apply: off
---

# Form Handling Rules

## Critical Files

1. src/server/forms/validate-form.ts

## Forms

1. References:

- src/shared/forms/types/form-result.types.ts
- src/server/forms/validate-form.ts

2. Contract:

- Always return dense field error maps to UI (key exists; value is readonly string[]; may be empty).
- Echo values using display-safe selectors with redaction.
- validateFormGeneric unifies validation/transform/normalize; prefer using it over ad‑hoc parsing.

3. Error adaptation:

- Convert AppError to FormResult via a single adapter per feature/domain.
- Detect targeted conflicts (e.g., email) and emit field‑specific messages; otherwise generic message + dense empty arrays.

---

## Unified Adapter APIs

1. Adapters are the only place to cross tiers:

- AppError → Result/FormResult

2. Guidelines:

- Strict inputs/outputs; readonly data; JSON‑safe.

3. Actions:

- Audit adapters for unsafe casts; replace with predicates/normalizers.
- Consolidate duplicate mappers; introduce shared helpers per layer boundary.

---

## Implementation Checklist

1. Adapters

- AppError → FormResult: dense map, targeted conflict handling, safe value echo.

2. Forms

- validateFormGeneric used in actions; ensure dense output and value redaction.

---

Last updated: 2025-10-13
