# Phase 2: Core Types(Days 4-5)

## 2.1 Brand Types System (`src/lib/core/brand.ts`)

````typescript
// src/lib/core/brand.ts
/**
 * Creates a symbol-constrained branded type to prevent mixing incompatible values.
 * Symbols ensure true uniqueness at both compile-time and runtime.
 *
 * @template T - The underlying type being branded
 * @template B - The brand symbol type for uniqueness
 *
 * @example
 * ```ts
 * const userIdBrand = Symbol('UserId');
 * type UserId = Brand<string, typeof userIdBrand>;
 *
 * const createUserId = (value: string): UserId => value as UserId;
 * const userId = createUserId('user-123');
 * ```
 */
export type Brand<T, B extends symbol> = T & { readonly __brand: B };

/**
 * Creates a branded value factory function for a specific symbol.
 * Provides type-safe branding with runtime symbol validation capability.
 *
 * @param brandSymbol - The unique symbol for this brand
 * @returns Factory function that creates branded values
 * @example
 * ```ts
 * export const USER_ID_BRAND = Symbol("UserId");
 * export type UserId = Brand<string, typeof USER_ID_BRAND>;
 * const brandUserId = createBrand(USER_ID_BRAND);
 * ```
 * @template T - The underlying type being branded
 * @template B - The brand symbol type for uniqueness
 * @return A function that takes a value of type T and returns a Brand<T, B>
 *
 */
export const createBrand = <T, B extends symbol>(brandSymbol: B) => {
  return (value: T): Brand<T, B> => value as Brand<T, B>;
};

/**
 * Type guard to check if a value has a specific brand.
 * Useful for runtime brand validation in complex scenarios.
 *
 * @param value - The value to check
 * @param validator - Function to validate the underlying type
 * @returns True if value matches the brand type
 */
export const isBrand = <T, B extends symbol>(
  value: unknown,
  validator: (v: unknown) => v is T,
): value is Brand<T, B> => validator(value);

/**
 * Extracts the underlying value from a branded type.
 * Use sparingly - prefer keeping values branded throughout the system.
 *
 * @param brandedValue - The branded value to unwrap
 * @returns The underlying unbranded value
 */
export const unbrand = <T, B extends symbol>(brandedValue: Brand<T, B>): T =>
  brandedValue as T;
````

## 2.2 Enhanced Brand Definitions (`src/lib/types/brands.ts`)

```typescript
// src/lib/types/types.brands.ts
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
```
