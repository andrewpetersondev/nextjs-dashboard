# Phase 1: Foundation Infrastructure ( Result Pattern, Error Handling, & Validation ) (Days 1-3)

Start with the absolute core utilities that everything else depends on.

## 1.1 Result Pattern (`src/lib/core/`)

~~~typescript
// src/lib/core/result.ts

export type Result<T, E = Error> =
    | { readonly success: true; readonly data: T }
    | { readonly success: false; readonly error: E };

export const Ok = <T>(data: T): Result<T, never> =>
    ({ success: true, data }) as const;

export const Err = <E>(error: E): Result<never, E> =>
    ({ success: false, error }) as const;

export const unwrap = <T, E>(r: Result<T, E>): T => {
    if (r.success) return r.data;
    throw r.error;
};

// Type guards
export const isOk = <T, E>(r: Result<T, E>): r is { success: true; data: T } => r.success;
export const isErr = <T, E>(r: Result<T, E>): r is { success: false; error: E } => !r.success;

// Transformations
export const map =
    <T, U, E>(fn: (v: T) => U) =>
        (r: Result<T, E>): Result<U, E> =>
            r.success ? Ok(fn(r.data)) : r;

export const chain =
    <T, U, E1, E2>(fn: (v: T) => Result<U, E2>) =>
        (r: Result<T, E1>): Result<U, E1 | E2> =>
            r.success ? fn(r.data) : r;

export const mapError =
    <T, E1, E2>(fn: (e: E1) => E2) =>
        (r: Result<T, E1>): Result<T, E2> =>
            r.success ? r : Err(fn(r.error));

export const bimap =
    <T, U, E1, E2>(onOk: (v: T) => U, onErr: (e: E1) => E2) =>
        (r: Result<T, E1>): Result<U, E2> =>
            r.success ? Ok(onOk(r.data)) : Err(onErr(r.error));

// Matching
export const match = <T, E, U>(
    r: Result<T, E>,
    onOk: (v: T) => U,
    onErr: (e: E) => U,
): U => (r.success ? onOk(r.data) : onErr(r.error));
export const fold = match;

// Async helpers
export const tryCatch = <T, E = Error>(fn: () => T, mapError?: (e: unknown) => E): Result<T, E> => {
    try {
        return Ok(fn());
    } catch (e) {
        return Err(mapError ? mapError(e) : (e as E));
    }
};

export const fromPromise = async <T, E = Error>(
    p: Promise<T>,
    mapError?: (e: unknown) => E,
): Promise<Result<T, E>> => {
    try {
        return Ok(await p);
    } catch (e) {
        return Err(mapError ? mapError(e) : (e as E));
    }
};

// Utilities
export const tap =
    <T, E>(fn: (v: T) => void) =>
        (r: Result<T, E>): Result<T, E> => {
            if (r.success) fn(r.data);
            return r;
        };

export const tapError =
    <T, E>(fn: (e: E) => void) =>
        (r: Result<T, E>): Result<T, E> => {
            if (!r.success) fn(r.error);
            return r;
        };

export const all = <T, E>(results: Result<T, E>[]): Result<T[], E> => {
    const acc: T[] = [];
    for (const r of results) {
        if (!r.success) return r;
        acc.push(r.data);
    }
    return Ok(acc);
};
~~~

### 1.1.1 Adapter to my ActionResult

- Use this at boundaries (e.g., server actions) to present a consistent shape:

~~~typescript
import type { ActionResult } from "@/lib/user.types";

export const toActionResult = <T>(
    r: Result<T, unknown>,
    successMessage = "OK",
    errorMessage = "Request failed",
): ActionResult<T> =>
    r.success
        ? { success: true, message: successMessage, errors: {}, data: r.data }
        : {
            success: false,
            message: errorMessage,
            errors: { _root: [r.error instanceof Error ? r.error.message : String(r.error)] },
        };
~~~

## 1.2 Enhanced Error System (`src/lib/errors/`)

```typescript
// src/lib/errors/base.error.ts
/**
 * Base class for all application errors.
 * Provides structured error handling with context and HTTP status codes.
 */
export abstract class BaseError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  public readonly timestamp: Date;

  constructor(
    message: string,
    public readonly context: Record<string, unknown> = {},
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Serializes error for logging/API responses.
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      ...(this.cause && { cause: this.cause.message }),
    };
  }
}

// src/lib/errors/domain.errors.ts
export class ValidationError extends BaseError {
  readonly code = "VALIDATION_ERROR";
  readonly statusCode = 400;
}

export class NotFoundError extends BaseError {
  readonly code = "NOT_FOUND";
  readonly statusCode = 404;
}

export class UnauthorizedError extends BaseError {
  readonly code = "UNAUTHORIZED";
  readonly statusCode = 401;
}

export class DatabaseError extends BaseError {
  readonly code = "DATABASE_ERROR";
  readonly statusCode = 500;
}

export class CacheError extends BaseError {
  readonly code = "CACHE_ERROR";
  readonly statusCode = 500;
}

export class CryptoError extends BaseError {
  readonly code = "CRYPTO_ERROR";
  readonly statusCode = 500;
}
```

## 1.3 Validation Framework (`src/lib/validation/`)

```typescript
// src/lib/validation/validator.interface.ts
import { Result } from "../core/result";
import { ValidationError } from "../errors/domain.errors";

export interface Validator<T> {
  validate(value: unknown): Result<T, ValidationError>;
}

export interface ValidationRule<T> {
  test(value: T): boolean;
  message: string;
}

// src/lib/validation/common.validators.ts
export class StringValidator implements Validator<string> {
  constructor(private readonly rules: ValidationRule<string>[] = []) {}

  static required(): ValidationRule<string> {
    return {
      test: (value) => value.trim().length > 0,
      message: "Field is required",
    };
  }

  static minLength(min: number): ValidationRule<string> {
    return {
      test: (value) => value.length >= min,
      message: `Must be at least ${min} characters`,
    };
  }

  static maxLength(max: number): ValidationRule<string> {
    return {
      test: (value) => value.length <= max,
      message: `Must not exceed ${max} characters`,
    };
  }

  validate(value: unknown): Result<string, ValidationError> {
    if (typeof value !== "string") {
      return Err(new ValidationError("Value must be a string"));
    }

    for (const rule of this.rules) {
      if (!rule.test(value)) {
        return Err(new ValidationError(rule.message, { value }));
      }
    }

    return Ok(value);
  }
}
```
