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
- **Adapters (outside)**: translate foreign failures into/from `AppError`
- **Utilities/Guards**: helpers for safe narrowing and serialization

**Dependency direction**: adapters/utilities may depend on core/registry, never the other way around.

---

## The contract (3 invariants)

### 1) Registry defines meaning (transport-agnostic)

Source of truth:

- `catalog/definitions.ts` (code definitions grouped by concern)
- `catalog/registry.ts` (merged registry + lookup helpers)
- `catalog/conditions.ts` (stable “condition keys” used as messages)

Defines:

- `AppErrorKey`
- `layer`, `severity`, `retryable`, `description`

**Never** put HTTP status codes or Postgres codes into the registry.

---

### 2) Adapters translate foreign failures into `AppError`

Adapters are translation-only:

- `adapters/postgres/*`: unknown DB error → canonical `AppError`
- `adapters/http/*`: canonical `AppError` → HTTP payload/status

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
- `condition` (message key; e.g. `"db_unique_violation"`)
- `appCode` (canonical code; e.g. `"conflict"`)

Pipeline:

1. Postgres throws an error containing `code`.
2. `extractPgErrorMetadata()` extracts `pgCode` and related fields (even through `cause` chains).
3. `toPgError()` maps `pgCode → { appCode, condition, pgMetadata }`.
4. `normalizePgError()` produces the canonical `AppError`:

- `code = appCode`
- `message = condition`
- `metadata` includes `pgCode` plus optional operation context attached at the DAL boundary

5. HTTP/UI serializes via `AppError.toJson()` and (optionally) maps to transport semantics.

---

## Folder map (where to look)

- `core/`: canonical types + `AppError` (framework-agnostic core)
- `catalog/`: transport-agnostic registry (codes, definitions, condition keys)
- `factories/`: `AppError` construction helpers (small and explicit)
- `adapters/`: adapters/translation layers (e.g. Postgres, HTTP)
- `guards/`: safe narrowers for metadata patterns
- `utils/`: error-chain + serialization helpers

---

## Rules of thumb

- Prefer **one canonical error type** (`AppError`) over subclasses.
- Keep **`message = condition key`** for standardization over time.
- Keep adapters **pure translators**: map in/out, preserve metadata, avoid business logic.
- Attach operation context at the **DAL boundary** so it survives to UI.
