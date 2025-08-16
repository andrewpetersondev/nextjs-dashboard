## 1.2 Enhanced Error System (`src/lib/errors/`)

### 1.2.1 Base Errors (`src/lib/errors/base.error.ts`)

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
    cause?: Error,
  ) {
    // Use native cause when available
    // @ts-expect-error cause is not in some TS libs
    super(message, { cause });
    this.name = new.target.name;
    this.timestamp = new Date();
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, new.target);
    }
  }

  toJSON(): Record<string, unknown> {
    const causeMsg = (this as unknown as { cause?: unknown })?.cause instanceof Error
      ? (this as unknown as { cause: Error }).cause.message
      : undefined;

    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      ...(causeMsg && { cause: causeMsg }),
    };
  }
}
```

### 1.2.2 Domain Errors (`src/lib/errors/domain.errors.ts`)

```typescript
// src/lib/errors/domain.errors.ts
import { BaseError } from "./base.error";

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

export class ForbiddenError extends BaseError {
  readonly code = "FORBIDDEN";
  readonly statusCode = 403;
}

export class ConflictError extends BaseError {
  readonly code = "CONFLICT";
  readonly statusCode = 409;
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

### 1.2.3 Helpers (`src/lib/errors/error-helpers.ts`)

```typescript
// src/lib/errors/error-helpers.ts
import { Err, Ok, type Result } from "../core/result";
import { BaseError } from "./base.error";
import { DatabaseError } from "./domain.errors";

export type HttpErrorBody = {
  error: {
    code: string;
    message: string;
    context?: Record<string, unknown>;
  };
};

export const asAppError = (e: unknown): BaseError => {
  if (e instanceof BaseError) return e;
  if (e instanceof Error) {
    return new DatabaseError(e.message, {}, e); // choose a safe default or map upstream
  }
  return new DatabaseError("Unknown error", { value: String(e) });
};

export const errorToResult = <T = never>(e: unknown): Result<T, BaseError> =>
  Err(asAppError(e));

export const safeTry = <T>(fn: () => T): Result<T, BaseError> => {
  try {
    return Ok(fn());
  } catch (e) {
    return errorToResult<T>(e);
  }
};

export const safeFromPromise = async <T>(
  p: Promise<T>,
): Promise<Result<T, BaseError>> => {
  try {
    return Ok(await p);
  } catch (e) {
    return errorToResult<T>(e);
  }
};

export const errorToHttp = (e: unknown): { status: number; body: HttpErrorBody } => {
  const err = asAppError(e);
  return {
    status: err.statusCode,
    body: { error: { code: err.code, message: err.message, context: err.context } },
  };
};
```

Usage patterns
- Throw domain errors in business logic when you want short-circuit flow with stack traces.
- At boundaries (Next.js route handlers and server actions), wrap with safeFromPromise or errorToHttp to avoid leaking raw exceptions and to convert to Result/HTTP consistently.
