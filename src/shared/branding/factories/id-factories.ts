import { type Brand, createBrand } from "@/shared/branding/brand";
import {
  CUSTOMER_ID_BRAND,
  type CustomerId,
  INVOICE_ID_BRAND,
  type InvoiceId,
  REVENUE_ID_BRAND,
  type RevenueId,
  SESSION_ID_BRAND,
  type SessionId,
  USER_ID_BRAND,
  type UserId,
} from "@/shared/branding/brands";
import { uuidValidatorFor } from "@/shared/branding/validators/uuid-validator";
import { brandWith } from "@/shared/branding/validators/validator-combinators";
import type { AppError } from "@/shared/errors/core/app-error.class";
import type { Result } from "@/shared/result/result.types";

/**
 * Create a validator that produces branded ID values from UUID input.
 *
 * @typeParam B - The brand symbol.
 * @typeParam T - The branded type extending `Brand<string, B>`.
 * @param brandSymbol - The unique symbol for this brand.
 * @param label - Human-readable label used in error messages.
 * @returns A validator function that accepts `unknown` and returns `Result<T, AppError>`.
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

  return (value: unknown): Result<T, AppError> => internalCreator(value);
};

/**
 * Validate and create a branded `CustomerId` from unknown input.
 *
 * @param value - The input value (expected to be a UUID string).
 * @returns `Result<CustomerId, AppError>` on success or validation failure.
 */
export const createCustomerId = createBrandedIdValidator<
  typeof CUSTOMER_ID_BRAND,
  CustomerId
>(CUSTOMER_ID_BRAND, "CustomerId");

/**
 * Validate and create a branded `InvoiceId` from unknown input.
 *
 * @param value - The input value (expected to be a UUID string).
 * @returns `Result<InvoiceId, AppError>` on success or validation failure.
 */
export const createInvoiceId = createBrandedIdValidator<
  typeof INVOICE_ID_BRAND,
  InvoiceId
>(INVOICE_ID_BRAND, "InvoiceId");

/**
 * Validate and create a branded `RevenueId` from unknown input.
 *
 * @param value - The input value (expected to be a UUID string).
 * @returns `Result<RevenueId, AppError>` on success or validation failure.
 */
export const createRevenueId = createBrandedIdValidator<
  typeof REVENUE_ID_BRAND,
  RevenueId
>(REVENUE_ID_BRAND, "RevenueId");

/**
 * Validate and create a branded `SessionId` from unknown input.
 *
 * @param value - The input value (expected to be a UUID string).
 * @returns `Result<SessionId, AppError>` on success or validation failure.
 */
export const createSessionId = createBrandedIdValidator<
  typeof SESSION_ID_BRAND,
  SessionId
>(SESSION_ID_BRAND, "SessionId");

/**
 * Validate and create a branded `UserId` from unknown input.
 *
 * @param value - The input value (expected to be a UUID string).
 * @returns `Result<UserId, AppError>` on success or validation failure.
 */
export const createUserId = createBrandedIdValidator<
  typeof USER_ID_BRAND,
  UserId
>(USER_ID_BRAND, "UserId");
