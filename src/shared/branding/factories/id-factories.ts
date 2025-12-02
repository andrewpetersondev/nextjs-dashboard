import { createBrand } from "@/shared/branding/brand";
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
import { AppError } from "@/shared/errors/core/app-error.class";
import { Err, Ok } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const validateUuid = (
  value: unknown,
  label: string,
): Result<string, AppError> => {
  if (typeof value !== "string") {
    return Err(
      new AppError("validation", {
        message: `Invalid ${label}: expected string, got ${typeof value}`,
      }),
    );
  }
  const v = value.trim();
  if (v.length === 0) {
    return Err(
      new AppError("validation", { message: `${label} cannot be empty` }),
    );
  }
  if (!UUID_REGEX.test(v)) {
    return Err(
      new AppError("validation", {
        message: `Invalid ${label}: "${value}". Must be a valid UUID.`,
      }),
    );
  }
  return Ok(v);
};

export const createCustomerId = (
  value: unknown,
): Result<CustomerId, AppError> => {
  const result = validateUuid(value, "CustomerId");
  if (!result.ok) {
    return result;
  }
  return Ok(
    createBrand<string, typeof CUSTOMER_ID_BRAND>(CUSTOMER_ID_BRAND)(
      result.value,
    ),
  );
};

export const createInvoiceId = (
  value: unknown,
): Result<InvoiceId, AppError> => {
  const result = validateUuid(value, "InvoiceId");
  if (!result.ok) {
    return result;
  }
  return Ok(
    createBrand<string, typeof INVOICE_ID_BRAND>(INVOICE_ID_BRAND)(
      result.value,
    ),
  );
};

export const createRevenueId = (
  value: unknown,
): Result<RevenueId, AppError> => {
  const result = validateUuid(value, "RevenueId");
  if (!result.ok) {
    return result;
  }
  return Ok(
    createBrand<string, typeof REVENUE_ID_BRAND>(REVENUE_ID_BRAND)(
      result.value,
    ),
  );
};

export const createSessionId = (
  value: unknown,
): Result<SessionId, AppError> => {
  const result = validateUuid(value, "SessionId");
  if (!result.ok) {
    return result;
  }
  return Ok(
    createBrand<string, typeof SESSION_ID_BRAND>(SESSION_ID_BRAND)(
      result.value,
    ),
  );
};

export const createUserId = (value: unknown): Result<UserId, AppError> => {
  const result = validateUuid(value, "UserId");
  if (!result.ok) {
    return result;
  }
  return Ok(
    createBrand<string, typeof USER_ID_BRAND>(USER_ID_BRAND)(result.value),
  );
};
