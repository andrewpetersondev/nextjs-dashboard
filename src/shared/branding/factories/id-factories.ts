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

  return (value: unknown): Result<T, AppError> => internalCreator(value);
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
