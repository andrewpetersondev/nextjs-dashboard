# `src/shared/errors`

Canonical error modeling for the app.

This folder exists to make failures:

- **traceable** (DB → adapter → AppError → HTTP/UI),
- **deterministic** (stable shapes; minimal branching),
- **low cognitive load** (clear responsibilities by folder).

---

## The contract (3 invariants)

### 1) Registry defines meaning (transport-agnostic)

Source of truth:

- `definitions/error-codes.definitions.ts`
- `registries/error-code.registry.ts`

Defines:

- `AppErrorKey`
- `layer`, `severity`, `retryable`, `description`

**Never** put HTTP status codes or Postgres codes in the registry.

---

### 2) Adapters translate foreign failures into `AppError`

Adapters are translation-only:

- `adapters/postgres/*`: unknown DB error → canonical `AppError`
- `adapters/http/*`: canonical `AppError` → HTTP payload/status

Adapters must preserve traceability by attaching metadata.

---

### 3) Boundaries exchange one stable shape

The boundary shape is:

- `AppErrorJson` from `AppError.toJson()`

Contract at boundaries:

- `metadata` is **always present** (empty object is fine)
- `message` is a **condition key** (standardized identifier), not prose

---

## Postgres → UI traceability (what we preserve)

When a Postgres error occurs, we preserve:

- `pgCode` (database code; e.g. `"23505"`)
- `condition` (message key; e.g. `"db_unique_violation"`)
- `appCode` (canonical code; e.g. `"conflict"`)

Pipeline:

1. Postgres throws an error containing `code`.
2. `extractPgErrorMetadata()` extracts `pgCode` and related fields (even through `cause` chains).
3. `mapPgError()` maps `pgCode → { appCode, condition, pgMetadata }`.
4. `normalizePgError()` produces the canonical `AppError`:

- `code = appCode`
- `message = condition`
- `metadata` includes `pgCode` and any operation context we attach at the DAL boundary

5. HTTP/UI serializes via `AppError.toJson()` and (optionally) maps to transport semantics.

---

## Folder map (where to look)

- `core/`: canonical types + `AppError`
- `definitions/`: error code definitions by logical group
- `registries/`: code registry + lookup helpers
- `factories/`: `AppError` construction helpers (keep them small and explicit)
- `adapters/`: translation layers (postgres/http)
- `guards/`: safe narrowers for metadata patterns
- `utils/`: error-chain + serialization helpers

---

## Rules of thumb

- Prefer **one canonical error type** (`AppError`) over subclasses.
- Keep **message = condition key** for standardization over time.
- Avoid optional boundary fields; stability beats convenience.
- Attach operation context at the **DAL boundary** so it survives to UI.
