Suggested additions for `shared/core/errors/` (keep each module single-purpose):

- `error-codes.ts` – central readonly map/object of canonical codes (source of truth for code literals).
- `error-types.ts` – exported union of code string literals; helps constrain switches.
- `http-status-map.ts` – maps error `code` → HTTP status (fallback for unknown); keeps status logic out of domain
  classes.
- `error-factory.ts` – safe creators (e.g. from persistence/lib errors → domain `BaseError` subclasses).
- `result.ts` – discriminated `Result<T, E extends BaseError>` union for service boundaries.
- `retry-classifier.ts` – predicates: `isRetryable(error)`, `isTransient(error)`.
- `error-redaction.ts` – redacts sensitive keys in `context` before logging/serialization.
- `error-logger.ts` – structured log helper: accepts `BaseError`, adds operation/context, applies redaction.
- `telemetry-adapter.ts` / `error-metrics.ts` – emit counters/spans (increment by `code`, `statusCode`).
- `react-error-boundary.tsx` (if used client-side) – wraps UI; normalizes to safe display model.
- `api-error-response.ts` – function `toApiError(e: unknown): { code; message; status; details? }` (no internal context
  leakage).
- `validation-error-adapter.ts` – helper to map Zod (or other) issues → `ValidationError` with structured context.
- `error-classification.ts` – centralized categorization: severity, domain, retry policy (consumed by logger &
  telemetry).
- `unknown-capture.test.ts` / other tests – explicit tests for mapper, guard narrowing, JSON stability.
- `index.ts` – curated exports (avoid leaking internals like factory helpers unless intentional).

Optional (if needs arise):

- `aggregate-error.ts` – wrap multiple `BaseError`s (task batches).
- `promise-guard.ts` – utility to wrap async fn → `Result`.
- `panic.ts` – hard-fail constructor for truly unrecoverable invariants (logged distinctly).

Rationale:

- Separates concerns: creation, mapping, classification, serialization, logging.
- Reduces duplication of code/status logic.
- Improves observability (metrics + structured logs).
- Enforces safe outward error shape.

Next step: Pick high-impact (codes map + API response + logger + retry classifier) and implement incrementally.
