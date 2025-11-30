# Error Handling System

This directory contains the application's standardized error handling system built around `BaseError`.

## Architecture Overview

```
┌─────────────┐
│   Actions   │ (HTTP boundary - formError() for client)
└──────┬──────┘
       │
┌──────▼──────┐
│  Services   │ (makeValidationError, makeUnexpectedError)
└──────┬──────┘
       │
┌──────▼──────┐
│ Repository  │ (normalizeToBaseError)
└──────┬──────┘
       │
┌──────▼──────┐
│     DAL     │ (normalizePgError - creates BaseError)
└──────┬──────┘
       │
┌──────▼──────┐
│  Database   │ (PostgreSQL errors)
└─────────────┘
```

## Core Concepts

### BaseError Class

The `BaseError` class is the foundation of our error system. It extends native `Error` and adds:

- **code**: Transport-agnostic error code (e.g., `"validation"`, `"database"`)
- **metadata**: Flexible key-value store for diagnostic information
- **originalCause**: Preserves the raw thrown value (e.g., PG error)
- **cause**: Sanitized Error instance for standard error chaining

### Error Preservation Flow

Errors are **never lost** as they cross layers:

1. **Database Layer**: PG error thrown
2. **DAL**: `normalizePgError()` wraps it as `BaseError` with `originalCause` = PG error
3. **Service**: Catches BaseError, re-throws or wraps with `normalizeToBaseError()`
4. **Action**: Maps to form-friendly structure with `mapBaseErrorToFormPayload()`

```typescript
// DAL: Preserve original PG error
catch (err) {
  const baseError = normalizePgError(err, {
    operation: "insertUser",
    table: "users"
  });
  // baseError.originalCause === original PG error
  // baseError.metadata === { operation, table, pgCode, constraint, ... }
  throw baseError;
}

// Service: Propagate without re-wrapping
catch (err) {
  const normalized = normalizeToBaseError(err, "unexpected");
  return Err(normalized); // Result pattern, no throw
}
```

## Metadata Organization

### All Layers

Common diagnostic metadata available everywhere:

- `diagnosticId`: Unique identifier for tracking
- `operation`: Operation name (e.g., `"signup"`, `"insertUser"`)
- `identifiers`: Business identifiers (e.g., `{ email, username }`)

### Form Validation Errors

Stored in `metadata` when error involves user input:

```typescript
{
  fieldErrors: {
    email: ["required", "invalid_format"],
    password: ["too_short"]
  },
  formErrors: ["Invalid credentials"],
  values: { email: "user@example.com" } // optional, for echoing
}
```

### Database Errors

Stored in `metadata` when error originates from database:

```typescript
{
  pgCode: "23505",
  constraint: "users_email_key",
  table: "users",
  column: "email",
  operation: "insertUser"
}
```

## Factory Functions

### Core Factories (`base-error.factory.ts`)

- **`makeBaseError(code, options)`**: Main factory for all errors
- **`makeValidationError(options)`**: Convenience for validation errors
- **`makeUnexpectedError(options)`**: Convenience for unexpected errors
- **`makeIntegrityError(options)`**: Convenience for data integrity violations

### Specialized Factories

- **`normalizePgError(err, metadata)`**: Convert PG errors to BaseError
- **`formError(params)`**: Create form-friendly validation errors
- **`normalizeToBaseError(err, fallbackCode)`**: Safely convert unknown values

## Type Guards (`base-error.guards.ts`)

Use these to safely access metadata:

```typescript
import {
  hasFieldErrors,
  hasFormErrors,
  hasPgMetadata,
} from "@/shared/errors/core/base-error.guards";

// Type-safe form error handling
if (hasFieldErrors(error)) {
  console.log(error.metadata.fieldErrors.email); // string[]
}

// Type-safe database error handling
if (hasPgMetadata(error)) {
  console.log(error.metadata.constraint); // string | undefined
}
```

## Common Patterns

### Pattern 1: DAL Error Handling

```typescript
export async function insertUserDal(db, input, logger) {
  return await executeDalOrThrow(
    async () => {
      const [row] = await db.insert(users).values(input).returning();
      if (!row) {
        throw makeIntegrityError({
          message: "Insert returned no row",
          metadata: { operation: "insertUser" },
        });
      }
      return row;
    },
    dalContext,
    logger,
  );
}
```

### Pattern 2: Service Error Handling

```typescript
async signup(input) {
  try {
    const user = await this.repo.signup(input);
    return Ok(user);
  } catch (err) {
    const baseError = normalizeToBaseError(err, "unexpected");
    return Err(baseError); // Preserve full error chain
  }
}
```

### Pattern 3: Action Error Handling

```typescript
export async function signupAction(formData) {
  const result = await service.signup(data);

  if (!result.ok) {
    const error = result.error;
    logger.operation("error", "Signup failed", {
      errorCode: error.code,
      errorMessage: error.message,
      ...(error.metadata?.fieldErrors && {
        errorDetails: { fieldErrors: error.metadata.fieldErrors },
      }),
    });

    return formError({
      message: error.message,
      fieldErrors: getFieldErrors(error) ?? {},
    });
  }

  redirect("/dashboard");
}
```

## Error Codes

Defined in `error-codes.ts`, organized by layer:

### CORE Layer

- `unexpected`: Unexpected server error
- `unknown`: Unknown error type
- `missingFields`: Required fields missing

### VALIDATION Layer

- `validation`: Generic validation failure

### AUTH Layer

- `unauthorized`: Authentication required
- `invalidCredentials`: Invalid login credentials

### HTTP Layer

- `notFound`: Resource not found
- `forbidden`: Permission denied
- `conflict`: Resource state conflict
- `parse`: Input parsing failed

### INFRA Layer

- `database`: Database operation failed
- `infrastructure`: Infrastructure failure
- `integrity`: Data integrity violation

## HTTP Mapping

The `http/` subdirectory maps error codes to HTTP responses:

```typescript
import { toHttpErrorPayload } from "@/shared/errors/http/http-error.serializer";

const httpPayload = toHttpErrorPayload(baseError);
// {
//   code: "validation",
//   statusCode: 422,
//   responsibility: "client",
//   message: "Validation failed",
//   metadata: { ... }
// }
```

## Best Practices

### ✅ DO

1. **Preserve original errors**: Always pass original error as `cause`
2. **Use specific codes**: Choose the most specific error code
3. **Include operation context**: Add `operation` to metadata
4. **Use type guards**: Check metadata shape before accessing
5. **Store form errors in metadata**: Use `fieldErrors` and `formErrors` in metadata

### ❌ DON'T

1. **Don't create custom Error subclasses**: Use error codes instead
2. **Don't change error codes across layers**: Keep original code, add to metadata
3. **Don't log in intermediate layers**: Log once at boundary (DAL or Action)
4. **Don't put top-level properties in metadata**: Use structured metadata patterns
5. **Don't lose the original cause**: Always preserve with `originalCause`

## Migration Notes

### Recent Changes (Nov 2024)

**Moved form errors to metadata:**

- `error.fieldErrors` → `error.metadata.fieldErrors`
- `error.formErrors` → `error.metadata.formErrors`

Use type guards for safe access:

```typescript
import {
  getFieldErrors,
  getFormErrors,
} from "@/shared/errors/core/base-error.guards";

const fieldErrors = getFieldErrors(error); // FieldErrors | undefined
const formErrors = getFormErrors(error); // FormErrors | undefined
```

**Removed unused methods:**

- `BaseError.wrap()` - Use `makeBaseError()` instead
- `BaseError.remap()` - Create new error instead of remapping

## Directory Structure

```
errors/
├── README.md (this file)
├── core/
│   ├── base-error.ts          # BaseError class
│   ├── base-error.types.ts    # Type definitions
│   ├── base-error.factory.ts  # Factory functions
│   ├── base-error.guards.ts   # Type guards
│   ├── error-codes.ts         # Error code registry
│   ├── error-helpers.ts       # Utility functions
│   └── error.utils.ts         # Convenience utilities
├── forms/
│   └── base-error.mappers.ts  # Form error extraction
├── http/
│   ├── http-error.map.ts      # HTTP status mapping
│   └── http-error.serializer.ts
└── infra/
    ├── pg-error-codes.ts      # Postgres error codes
    ├── pg-error.extractor.ts  # PG error extraction
    ├── pg-error.normalizer.ts    # PG → BaseError conversion
    └── pg-error.mapper.ts     # PG error mapping
```
