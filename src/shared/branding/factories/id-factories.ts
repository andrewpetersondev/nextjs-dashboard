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

/**
 * Validates that a value is a non-empty string matching the UUID v4 format.
 *
 * @param value - The value to validate
 * @param label - A human-readable label for error messages
 * @returns A Result containing the trimmed UUID string or an AppError
 */
const validateUuid = (
  value: unknown,
  label: string,
): Result<string, AppError> => {
  if (typeof value !== "string") {
    return Err(
      new AppError("validation", {
        message: `Invalid ${label}: expected string, got ${typeof value}`,
        metadata: { expectedType: "string", label, receivedType: typeof value },
      }),
    );
  }
  const v = value.trim();
  if (v.length === 0) {
    return Err(
      new AppError("validation", {
        message: `${label} cannot be empty`,
        metadata: { label },
      }),
    );
  }
  if (!UUID_REGEX.test(v)) {
    return Err(
      new AppError("validation", {
        message: `Invalid ${label}: "${value}". Must be a valid UUID.`,
        metadata: { label, value },
      }),
    );
  }
  return Ok(v);
};

/**
 * Creates a factory function that validates and brands UUID strings.
 *
 * @param brand - The brand symbol to apply
 * @param label - A human-readable label for error messages
 * @typeParam S - The brand symbol type
 * @typeParam B - The branded ID type
 * @returns A factory function that creates branded IDs from unknown values
 */
const createIdFactory = <S extends symbol, B>(brand: S, label: string) => {
  return (value: unknown): Result<B, AppError> => {
    const result = validateUuid(value, label);
    if (!result.ok) {
      return result;
    }
    return Ok(createBrand<string, S>(brand)(result.value) as B);
  };
};

/**
 * Creates a validated and branded CustomerId from an unknown value.
 *
 * @param value - The value to convert (must be a valid UUID)
 * @returns A Result containing the branded CustomerId or an AppError
 */
export const createCustomerId = createIdFactory<
  typeof CUSTOMER_ID_BRAND,
  CustomerId
>(CUSTOMER_ID_BRAND, "CustomerId");

/**
 * Creates a validated and branded InvoiceId from an unknown value.
 *
 * @param value - The value to convert (must be a valid UUID)
 * @returns A Result containing the branded InvoiceId or an AppError
 */
export const createInvoiceId = createIdFactory<
  typeof INVOICE_ID_BRAND,
  InvoiceId
>(INVOICE_ID_BRAND, "InvoiceId");

/**
 * Creates a validated and branded RevenueId from an unknown value.
 *
 * @param value - The value to convert (must be a valid UUID)
 * @returns A Result containing the branded RevenueId or an AppError
 */
export const createRevenueId = createIdFactory<
  typeof REVENUE_ID_BRAND,
  RevenueId
>(REVENUE_ID_BRAND, "RevenueId");

/**
 * Creates a validated and branded SessionId from an unknown value.
 *
 * @param value - The value to convert (must be a valid UUID)
 * @returns A Result containing the branded SessionId or an AppError
 */
export const createSessionId = createIdFactory<
  typeof SESSION_ID_BRAND,
  SessionId
>(SESSION_ID_BRAND, "SessionId");

/**
 * Creates a validated and branded UserId from an unknown value.
 *
 * @param value - The value to convert (must be a valid UUID)
 * @returns A Result containing the branded UserId or an AppError
 */
export const createUserId = createIdFactory<typeof USER_ID_BRAND, UserId>(
  USER_ID_BRAND,
  "UserId",
);
