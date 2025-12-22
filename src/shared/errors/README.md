# `src/shared/errors`

Canonical error modeling for the app (Ports & Adapters friendly).

This package exists to make failures:

- **traceable** (DB → adapter → `AppError` → HTTP/UI),
- **deterministic** (stable shapes; minimal branching),
- **low cognitive load** (clear responsibilities by folder).

---

## Architectural intent (Hexagonal)

This folder is structured like a small hexagon:

- **Core (inside)**: canonical error type + stable boundary shape
- **Registry (meaning)**: transport-agnostic error codes and their semantics
- **Factories**: explicit helpers for constructing canonical `AppError` instances
- **Adapters (outside)**: translate foreign failures into/from `AppError`
- **Guards/Utilities**: helpers for safe narrowing, inspection, and serialization

**Dependency direction**:

- `adapters/` → may depend on `core/`, `catalog/`, `factories/`, `utils/`
- `factories/`, `guards/`, `utils/` → may depend on `core/`, `catalog/`
- `core/`, `catalog/` → must **never** depend on `adapters/`

---

## The contract (3 invariants)

### 1) Registry defines meaning (transport-agnostic)

Source of truth:

- `catalog/app-error.codes.ts` (code definitions grouped by concern)
- `catalog/app-error.registry.ts` (merged registry + lookup helpers)
- `catalog/pg-conditions.ts` (stable "condition keys" used as messages)

Defines:

- `AppErrorKey`
- `layer`, `severity`, `retryable`, `description`

**Never** put HTTP status codes or Postgres codes into the registry.

---

### 2) Adapters translate foreign failures into `AppError`

Adapters are translation-only and located in `src/server/db/errors/postgres/`:

- `to-pg-error.ts`: normalize raw Postgres errors into a standard shape
- `normalize-pg-error.ts`: translate normalized Postgres errors into canonical `AppError`
- `is-pg-error-metadata.guard.ts`: safely narrow metadata to Postgres\-specific shape
- `pg-codes.ts`: mapping of Postgres error codes to app error semantics
- `pg-error.metadata.ts`: type definitions for Postgres error metadata

Adapters must preserve traceability by attaching metadata (no silent fallbacks).

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
- `condition` (message key; e.g. `"pg_unique_violation"`)
- `appCode` (canonical code; e.g. `"conflict"`)

Pipeline:

1. Postgres throws an error containing `code`.
2. `toPgError()` maps `pgCode → { appCode, condition, pgMetadata }`.
3. `normalizePgError()` produces the canonical `AppError`:

- `code = appCode`
- `message = condition`
- `metadata` includes `pgCode` plus optional operation context attached at the DAL boundary

4. HTTP/UI serializes via `AppError.toJson()` and (optionally) maps to transport semantics.

---

## Folder map (where to look)

- `src/shared/errors/core/`: canonical types + `AppError` (framework\-agnostic core)
- `src/shared/errors/catalog/`: transport\-agnostic registry (codes, definitions, condition keys)
- `src/shared/errors/factories/`: `AppError` construction helpers (small and explicit)
- `src/server/db/errors/postgres/`: Postgres adapter (translate Postgres errors → `AppError`)
- `src/shared/errors/guards/`: safe narrowers for error and metadata patterns
  - e.g. `isPgErrorMetadata` (narrow `metadata` to Postgres\-specific shape)
  - e.g. `isValidationError` (narrow `AppError` to validation failures)
- `src/shared/errors/utils/`: error\-chain + serialization helpers

---

## Rules of thumb

- Prefer **one canonical error type** (`AppError`) over subclasses.
- Keep **`message = condition key`** for standardization over time.
- Keep adapters **pure translators**: map in/out, preserve metadata, avoid business logic.
- Attach operation context at the **DAL boundary** so it survives to UI.
- Use guards (`guards/`) at the edges to branch on **capabilities** (e.g. "has PG metadata", "is validation error") instead of ad\-hoc `typeof` checks.
