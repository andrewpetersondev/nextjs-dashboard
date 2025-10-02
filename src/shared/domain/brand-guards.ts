import type { Brand } from "@/shared/core/branding/brand";
import { isUuid } from "@/shared/core/validation/primitives/uuid";
import type {
  CUSTOMER_ID_BRAND,
  CustomerId,
  INVOICE_ID_BRAND,
  InvoiceId,
  Period,
  REVENUE_ID_BRAND,
  RevenueId,
  SESSION_ID_BRAND,
  SessionId,
  USER_ID_BRAND,
  UserId,
} from "@/shared/domain/domain-brands";

/**
 * Generic factory to build UUID-based branded type guards.
 * Narrowing is based solely on UUID shape at runtime and brand at compile time.
 */
export const createUuidBrandGuard = <
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
