# Naming conventions

This document standardizes naming across the project to keep code discoverable, consistent, and easy to refactor.

## Goals

- Make intent obvious from names (especially at boundaries).
- Keep imports predictable (deep imports are allowed).
- Reduce “synonym drift” (`map*` vs `to*` vs `convert*`).
- Make tests mirror the unit they validate.

---

## File and folder naming

### Files

- Use **kebab-case** for filenames:
  - ✅ `normalize-pg-error.ts`
  - ✅ `to-http-payload.ts`
  - ✅ `error-chain.ts`
  - ❌ `postgresErrorAdapter.ts`

- File name should match the **primary export**:
  - ✅ `to-pg-error.ts` exports `toPgError`
  - ✅ `app-error.ts` exports `AppError`
  - If a file exports multiple related utilities, name it by the **domain of utilities**:
    - ✅ `pg-metadata.ts` exports `extractPgErrorMetadata`, `isPgError`

### Folders

- Use **nouns** for folders: `catalog/`, `core/`, `factories/`, `guards/`, `integrations/`, `utils/`.
- Keep integration-specific code under `integrations/<integration>/`.

---

## Function naming: verb vocabulary (project-wide)

Standardize on a small set of verbs. Prefer these consistently.

### `toX(...)` — pure transformation

Use when:

- It’s a pure mapping/transformation (no side effects).
- Output is a _different representation_ of the input.

Examples:

- `toHttpErrorPayload(error: AppError)`
- `toPgError(err: unknown)`
- `toPeriod(period: PeriodLike)`

Notes:

- Prefer `toX` over `mapX` when the result is the “target representation”.
- If the function maps collections, still prefer `toX` if the semantics are “convert”:
  - `toRevenueEntity(row)` / `toRevenueEntities(rows)` (if you want plural forms)
  - or keep `toRevenueEntity` + `toRevenueEntities` for clarity.

### `normalizeX(...)` — canonicalization with fallback

Use when:

- Input may be foreign/unknown/unsafe.
- Output is your **canonical** project shape (often `AppError`).
- It may apply fallbacks/default classifications.

Examples:

- `normalizePgError(err: unknown, metadata?: ...) => AppError`
- `normalizeZodError(err: unknown) => AppError` (if you adopt this pattern)

### `extractX(...)` — best-effort extraction from unknown inputs

Use when:

- You’re pulling structured info out of an unknown value.
- It returns `undefined` when not recognized.

Examples:

- `extractPgErrorMetadata(err: unknown): PgErrorMetadata | undefined`

### `makeX(...)` — factories (construct canonical objects)

Use when:

- Constructing canonical domain objects with explicit inputs.
- The name signals “creation”, not conversion.

Examples:

- `makeAppError(code, options)`
- `makeValidationError(options)`

### `isX(...)`, `hasX(...)`, `getX(...)` — narrowing & safe access

- `isX(...)`: returns a boolean and acts as a type guard.
- `hasX(...)`: checks presence of a capability/property (often metadata-based).
- `getX(...)`: safe extraction; return `undefined` if missing.

Examples:

- `isAppError(value): value is AppError`
- `hasPgMetadata(error): error is AppError & { metadata: DatabaseErrorMetadata }`
- `getFieldErrors(error): FieldErrors | undefined`

### Avoid / reserve certain verbs

- Avoid `mapX` in new code unless you’re mapping _between two equal-status representations_ and `toX` reads awkwardly.
- Avoid `convertX` unless it’s part of a clearly established sub-domain (but prefer `toX`).

---

## Type naming conventions

### General rules

- Types/interfaces are **PascalCase**.
- Prefer **domain-scoped names** over generic names when the type is integration-owned.

Examples:

- ✅ `PgErrorMetadata`, `PgErrorMapping`
- ✅ `HttpErrorPayload`
- ✅ `AppErrorOptions`

### Integration-owned types should mention the integration when not truly generic

If a type lives under `integrations/postgres/` and is specific to Postgres, name it as such:

- Prefer:
  - `PgOperationMetadata`
- Avoid:
  - `DatabaseOperationMetadata` (sounds global, but is Postgres-specific)

If a type is truly shared across multiple DB integrations, move it to a shared location (e.g., `core/` or `catalog/`) and name it generically there.

---

## Test naming and placement

### Placement

- Integration-specific tests live next to the integration:
  - `src/shared/errors/integrations/postgres/__tests__/...`

- Cross-cutting tests (invariants across multiple folders) live at:
  - `src/shared/errors/__tests__/...` (if/when needed)

### File naming

- Use `.test.ts` suffix (Vitest default).
- Test filename should match the unit name:
  - `to-pg-error.test.ts` tests `toPgError`
  - `normalize-pg-error.test.ts` tests `normalizePgError`

### Describe blocks

- `describe()` title should match the exported unit:
  - ✅ `describe("toPgError", () => {})`
  - ✅ `describe("normalizePgError", () => {})`

---

## Errors package conventions (applies within `src/shared/errors`)

- Use:
  - `toX` for transport payload shaping (e.g., HTTP)
  - `normalizeX` for turning foreign failures into `AppError`
  - `extractX` for reading metadata from unknown errors
- Keep condition keys in the global catalog and treat them as stable identifiers.

---

## Quick consistency checklist

1. **File name matches primary export** (`to-pg-error.ts` exports `toPgError`).
2. **Verb signals responsibility** (`to` vs `normalize` vs `extract` vs `make`).
3. **Types are named by scope** (integration types mention the integration if not generic).
4. **Tests mirror the unit name** (file + `describe()`).
