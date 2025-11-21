import { type Brand, createBrand } from "@/shared/branding/brand";
import { BaseError } from "@/shared/errors/core/base-error";
import { Err, Ok, type Result } from "@/shared/result/result";
import { brandWith } from "@/shared/validation/composition/brand";
import { validatePeriodResult } from "@/shared/validation/domain/period";
import { validateUuidResult } from "@/shared/validation/primitives/uuid";

// Unique symbols for each domain concept
export const CUSTOMER_ID_BRAND = Symbol("CustomerId");
export const USER_ID_BRAND = Symbol("UserId");
export const INVOICE_ID_BRAND = Symbol("InvoiceId");
export const REVENUE_ID_BRAND = Symbol("RevenueId");
export const SESSION_ID_BRAND = Symbol("SessionId");
export const PERIOD_BRAND = Symbol("Period");

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
  (value: unknown): Result<string, BaseError> => {
    const r = validateUuidResult(value, label);
    return r.ok
      ? Ok(r.value)
      : Err(new BaseError("validation", { message: r.error.message }));
  };

/**
 * Validate and transform a period value (Result-based).
 */
export const periodValidator = (value: unknown): Result<Date, BaseError> => {
  const r = validatePeriodResult(value);
  return r.ok
    ? Ok(r.value)
    : Err(new BaseError("validation", { message: r.error.message }));
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

  return (value: unknown): Result<T, BaseError> => internalCreator(value);
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

  return (value: unknown): Result<T, BaseError> => internalCreator(value);
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
