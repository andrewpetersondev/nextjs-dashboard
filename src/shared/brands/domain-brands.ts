import type { ValidationError } from "@/errors/errors";
import { ValidationError_New } from "@/errors/errors-domain";
import { mapNewToLegacyError } from "@/errors/errors-mapper";
import { type Brand, createBrand } from "@/shared/brands/brands";
import { Err, Ok, type Result } from "@/shared/result/result-base";
import { validatePeriodResult } from "@/shared/validation/period";
import { brandWith } from "@/shared/validation/types";
import { isUuid, validateUuidResult } from "@/shared/validation/uuid";

// Unique symbols for each domain concept
const CUSTOMER_ID_BRAND = Symbol("CustomerId");
const USER_ID_BRAND = Symbol("UserId");
const INVOICE_ID_BRAND = Symbol("InvoiceId");
const REVENUE_ID_BRAND = Symbol("RevenueId");
const SESSION_ID_BRAND = Symbol("SessionId");
const PERIOD_BRAND = Symbol("Period");

// Symbol-constrained branded types
export type CustomerId = Brand<string, typeof CUSTOMER_ID_BRAND>;
export type UserId = Brand<string, typeof USER_ID_BRAND>;
export type InvoiceId = Brand<string, typeof INVOICE_ID_BRAND>;
export type RevenueId = Brand<string, typeof REVENUE_ID_BRAND>;
export type SessionId = Brand<string, typeof SESSION_ID_BRAND>;
export type Period = Brand<Date, typeof PERIOD_BRAND>;

/**
 * Create a UUID validator for a specific label (Result-based).
 */
export const uuidValidatorFor =
  (label: string) =>
  (value: unknown): Result<string, ValidationError_New> => {
    const r = validateUuidResult(value, label);
    return r.success
      ? Ok(r.data)
      : Err(new ValidationError_New(r.error.message));
  };

/**
 * Validate and transform a period value (Result-based).
 */
export const periodValidator = (
  value: unknown,
): Result<Date, ValidationError_New> => {
  const r = validatePeriodResult(value);
  return r.success ? Ok(r.data) : Err(new ValidationError_New(r.error.message));
};

// --- Factories ---

/**
 * Generic factory for creating branded ID validators (Result-based).
 */
export const createBrandedIdValidator = <
  B extends symbol,
  T extends Brand<string, B>,
>(
  brandSymbol: B,
  label: string,
) => {
  const brandFn = createBrand<string, B>(brandSymbol);
  const validator = uuidValidatorFor(label);
  const internalCreator = brandWith<string, T>(
    validator,
    ((value: string) => brandFn(value) as T) as (value: string) => T,
  );

  return (value: unknown): Result<T, ValidationError> =>
    mapNewToLegacyError(internalCreator(value));
};

/**
 * Generic factory for creating branded period validators (Result-based).
 */
export const createBrandedPeriodValidator = <
  B extends symbol,
  T extends Brand<Date, B>,
>(
  brandSymbol: B,
) => {
  const brandFn = createBrand<Date, B>(brandSymbol);
  const internalCreator = brandWith<Date, T>(
    periodValidator,
    ((value: Date) => brandFn(value) as T) as (value: Date) => T,
  );

  return (value: unknown): Result<T, ValidationError> =>
    mapNewToLegacyError(internalCreator(value));
};

export const createCustomerId = createBrandedIdValidator<
  typeof CUSTOMER_ID_BRAND,
  CustomerId
>(CUSTOMER_ID_BRAND, "CustomerId");

export const createUserId = createBrandedIdValidator<
  typeof USER_ID_BRAND,
  UserId
>(USER_ID_BRAND, "UserId");

export const createInvoiceId = createBrandedIdValidator<
  typeof INVOICE_ID_BRAND,
  InvoiceId
>(INVOICE_ID_BRAND, "InvoiceId");

export const createRevenueId = createBrandedIdValidator<
  typeof REVENUE_ID_BRAND,
  RevenueId
>(REVENUE_ID_BRAND, "RevenueId");

export const createSessionId = createBrandedIdValidator<
  typeof SESSION_ID_BRAND,
  SessionId
>(SESSION_ID_BRAND, "SessionId");

export const createPeriod = createBrandedPeriodValidator<
  typeof PERIOD_BRAND,
  Period
>(PERIOD_BRAND);

// --- New: Result-returning converters (thin wrappers over factories) ---

export const toCustomerIdResult = (
  value: unknown,
): Result<CustomerId, ValidationError> => createCustomerId(value);

export const toUserIdResult = (
  value: unknown,
): Result<UserId, ValidationError> => createUserId(value);

export const toInvoiceIdResult = (
  value: unknown,
): Result<InvoiceId, ValidationError> => createInvoiceId(value);

export const toRevenueIdResult = (
  value: unknown,
): Result<RevenueId, ValidationError> => createRevenueId(value);

export const toSessionIdResult = (
  value: unknown,
): Result<SessionId, ValidationError> => createSessionId(value);

export const toPeriodResult = (
  value: unknown,
): Result<Period, ValidationError> => createPeriod(value);

// --- Existing throw-based APIs preserved (now implemented via Result) ---

/**
 * Validates and converts a string to a branded CustomerId (throws on error)
 */
export const toCustomerId = (id: string): CustomerId => {
  const r = toCustomerIdResult(id);
  if (r.success) return r.data;
  throw r.error;
};
/**
 * Validates and converts a string to a branded UserId (throws on error)
 */
export const toUserId = (id: string): UserId => {
  const r = toUserIdResult(id);
  if (r.success) return r.data;
  throw r.error;
};

/**
 * Validates and converts a string to a branded InvoiceId (throws on error)
 */
export const toInvoiceId = (id: string): InvoiceId => {
  const r = toInvoiceIdResult(id);
  if (r.success) return r.data;
  throw r.error;
};

/**
 * Validates and converts a string to a branded RevenueId (throws on error)
 */
export const toRevenueId = (id: string): RevenueId => {
  const r = toRevenueIdResult(id);
  if (r.success) return r.data;
  throw r.error;
};

/**
 * Validates and converts a string to a branded SessionId (throws on error)
 */
export const toSessionId = (id: string): SessionId => {
  const r = toSessionIdResult(id);
  if (r.success) return r.data;
  throw r.error;
};

/**
 * Normalizes an input into a branded Period (throws on error)
 */
export function toPeriod(input: Date | string): Period {
  const r = toPeriodResult(input);
  if (r.success) return r.data;
  throw r.error;
}

// --- Type guards ---

/**
 * Generic factory to build UUID-based branded type guards.
 * Narrowing is based solely on UUID shape at runtime and brand at compile time.
 */
const createUuidBrandGuard = <
  B extends symbol,
  T extends Brand<string, B>,
>(): ((value: unknown) => value is T) => {
  return (value: unknown): value is T => isUuid(value);
};

export const isCustomerId = createUuidBrandGuard<
  typeof CUSTOMER_ID_BRAND,
  CustomerId
>();

export const isUserId = createUuidBrandGuard<typeof USER_ID_BRAND, UserId>();

export const isInvoiceId = createUuidBrandGuard<
  typeof INVOICE_ID_BRAND,
  InvoiceId
>();

export const isRevenueId = createUuidBrandGuard<
  typeof REVENUE_ID_BRAND,
  RevenueId
>();

export const isSessionId = createUuidBrandGuard<
  typeof SESSION_ID_BRAND,
  SessionId
>();

export function isPeriod(value: unknown): value is Period {
  return value instanceof Date && value.getUTCDate() === 1;
}

// Back-compat convenience guard retained
export const isUserIdSafe = isUserId;
