# Auth Domain Errors Folder Examination

This folder contains the **error handling infrastructure for authentication**, bridging domain errors into a structured `AppError` format for consistent error handling across the application. Here's the breakdown:

## File Overview

### 1. **`app-error.metadata.ts`** — Configuration Hub

Centralized constants for auth error handling:

- **`DEFAULT_MISSING_FIELDS`**: Fields checked for signup (`email`, `password`, `username`)
- **`AUTH_CONFLICT_TARGETS`**: Fields that can have conflicts (`email`, `username`)
- **`AUTH_MESSAGES`**: Pre-defined user-facing error messages for UI display

```typescript
conflict: "Email or username already in use";
invalidCreds: "Invalid email or password";
missing: "Missing required fields";
unexpected: "Unexpected error occurred";
validation: "Invalid data";
```

### 2. **`app-error.factories.ts`** — Error Creation

Factory functions that **convert auth-specific error scenarios into typed `AppError`s**:

- **`createAuthAppError(kind)`**: Main factory that transforms legacy "AuthError kinds" into `AppError`:
  - `"missing_fields"` → VALIDATION code with fieldErrors for email/password/username
  - `"conflict"` → CONFLICT code with fieldErrors for email/username
  - `"invalid_credentials"` → UNAUTHORIZED code
  - `"validation"` / `"unexpected"` → VALIDATION / UNKNOWN codes

- **`toUnexpectedAppError(e)`**: Fallback converter for unknown exceptions

- **`getErrorMessage(e, fallback)`**: Safe extraction of error messages with fallback

**Key insight**: Pre-populates `fieldErrors` in details for immediate form consumption (no post-processing needed).

### 3. **`app-error.mapping.repo.ts`** — Repository Error Translation

**Maps infrastructure/domain errors from repositories into `AppError`s**:

Routes specific error types to appropriate codes:

- `UnauthorizedError` → `UNAUTHORIZED`
- `ValidationError` → `VALIDATION`
- `ConflictError` → `CONFLICT`
- `ForbiddenError` → `FORBIDDEN`
- `NotFoundError` → `NOT_FOUND`
- `DatabaseError` → `DATABASE`
- Unknown → `UNKNOWN` (logged for debugging)

Returns `Result<T, AppError>` for composable error handling.

### 4. **`form-errors.factory.ts`** — Form Normalization

Normalizes domain `AppError`s into **form-aware errors** for UI rendering:

Maps specific error codes to field-level messages:

- `email_conflict` → field: "email", message: "Email already in use"
- `invalid_credentials` → field: "email"
- `missing_fields` → field: "email"
- `username_conflict` → field: "username"

**Defensive design**: Gracefully handles unrecognized codes and mismatched fields.

---

## Architecture Pattern

```
Repository Error
       ↓
mapRepoErrorToAppResult() [app-error.mapping.repo.ts]
       ↓
AppError { code, message }
       ↓
createAuthAppError() [app-error.factories.ts]
       ↓
AppError { code, message, details: { fieldErrors } }
       ↓
toFormAwareError() [form-errors.factory.ts]
       ↓
AppError ready for form UI consumption
```

## Key Design Principles

| Principle                  | Benefit                                                                                       |
| -------------------------- | --------------------------------------------------------------------------------------------- |
| **Separation of concerns** | Metadata (constants), creation (factories), translation (mapping), normalization (form-aware) |
| **Type safety**            | Generic types (`TField extends string`) ensure field names match form requirements            |
| **Immutability**           | `Object.freeze()` prevents accidental mutations                                               |
| **Early enrichment**       | `fieldErrors` populated at creation time, avoiding late-stage conversions                     |
| **Defensive fallbacks**    | Unknown codes don't crash; they gracefully degrade                                            |
| **Server-only**            | `"server-only"` pragma ensures these run only on backend (auth validation)                    |
