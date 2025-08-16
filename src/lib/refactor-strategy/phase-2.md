### Phase 2: Error Handling & Validation (Days 4-5)

#### 2.1 Enhanced Error System (`src/lib/errors/`)

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

#### 2.2 Enhanced Brand Definitions (`src/lib/types/brands.ts`)

~~~typescript
// src/lib/types/brands.ts
import { Brand, createBrand } from "../core/brand";
import { Result, Ok, Err } from "../core/result";
import { ValidationError } from "../errors/domain.errors";

// Unique symbols for each domain concept
export const USER_ID_BRAND = Symbol("UserId");
export const EMAIL_BRAND = Symbol("Email");
export const INVOICE_ID_BRAND = Symbol("InvoiceId");
export const TASK_ID_BRAND = Symbol("TaskId");
export const CUSTOMER_ID_BRAND = Symbol("CustomerId");
export const SESSION_ID_BRAND = Symbol("SessionId");

// Symbol-constrained branded types
export type UserId = Brand<string, typeof USER_ID_BRAND>;
export type Email = Brand<string, typeof EMAIL_BRAND>;
export type InvoiceId = Brand<string, typeof INVOICE_ID_BRAND>;
export type TaskId = Brand<string, typeof TASK_ID_BRAND>;
export type CustomerId = Brand<string, typeof CUSTOMER_ID_BRAND>;
export type SessionId = Brand<string, typeof SESSION_ID_BRAND>;

// Factory functions using symbols
const brandUserId = createBrand(USER_ID_BRAND);
const brandEmail = createBrand(EMAIL_BRAND);
const brandInvoiceId = createBrand(INVOICE_ID_BRAND);
const brandTaskId = createBrand(TASK_ID_BRAND);
const brandCustomerId = createBrand(CUSTOMER_ID_BRAND);
const brandSessionId = createBrand(SESSION_ID_BRAND);

// Validation with symbol-based branding
export const createUserId = (
  value: string,
): Result<UserId, ValidationError> => {
  if (!value?.trim()) {
    return Err(new ValidationError("UserId cannot be empty"));
  }
  return Ok(brandUserId(value.trim()));
};

export const createEmail = (value: string): Result<Email, ValidationError> => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return Err(new ValidationError("Invalid email format"));
  }
  return Ok(brandEmail(value.toLowerCase()));
};

export const createInvoiceId = (
  value: string,
): Result<InvoiceId, ValidationError> => {
  if (!value?.trim() || !value.startsWith("inv-")) {
    return Err(new ValidationError("InvoiceId must start with 'inv-'"));
  }
  return Ok(brandInvoiceId(value.trim()));
};
~~~

#### 2.3 Validation Framework (`src/lib/validation/`)

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
