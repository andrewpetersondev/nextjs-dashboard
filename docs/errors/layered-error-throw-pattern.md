# Layered Error Handling Pattern

## Summary

Best practice: each layer handles and enriches errors, then rethrows upward; never skip layers or pass raw driver errors to upper layers.

## Roles and Responsibilities

- Data Access Layer (DAL)
  - Throw low-level errors mapped to a small, stable set of infra/domain error types (e.g., UniqueViolationError, TimeoutError).
  - Include DB context (table, constraint) only as metadata; do not leak secrets or PII.

- Repository
  - Catch DAL errors; add repository context (operation, identifiers).
  - Translate infra errors to domain errors when unambiguous (e.g., unique violation → BaseError).
  - Rethrow enriched error; do not swallow or convert to null/undefined.

- Service
  - Catch repository errors; make business decisions.
  - Convert to service-level Result/AppError shapes consumable by actions/UI.
  - Typically return Result or normalized error value; do not propagate raw exceptions to UI.

## Error Flow Policy

- DAL → throw BaseError/Variant (exceptions).
- Repository → catch, enrich/translate, rethrow (exceptions).
- Service → catch, adapt to AppError/Result; return value (no throw across service boundary).

## Benefits

- Clear ownership of translation and decisions (DB → domain → app).
- Rich, layered context in logs without leaking DB internals.
- Stable service API independent of DAL/repo specifics.

## Anti‑Patterns (Avoid)

- Swallowing errors and returning null/undefined.
- Converting everything to “unexpected” too early.
- Passing raw driver errors from DAL to service/UI.

## Logging & Security Notes

- Add minimal context: operation, identifiers; never secrets or tokens.
- Normalize outbound (service/action) errors to AppError with safe code/message.
