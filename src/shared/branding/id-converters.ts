import {
  type CustomerId,
  createCustomerId,
  createInvoiceId,
  createPeriod,
  createRevenueId,
  createSessionId,
  createUserId,
  type InvoiceId,
  type Period,
  type RevenueId,
  type SessionId,
  type UserId,
} from "@/shared/branding/domain-brands";
import type { AppError } from "@/shared/errors/core/app-error.class";

import type { Result } from "@/shared/result/result.types";

// --- New: Result-returning converters (thin wrappers over factories) ---

export const toCustomerIdResult = (
  value: unknown,
): Result<CustomerId, AppError> => createCustomerId(value);

export const toUserIdResult = (value: unknown): Result<UserId, AppError> =>
  createUserId(value);

export const toInvoiceIdResult = (
  value: unknown,
): Result<InvoiceId, AppError> => createInvoiceId(value);

export const toRevenueIdResult = (
  value: unknown,
): Result<RevenueId, AppError> => createRevenueId(value);

export const toSessionIdResult = (
  value: unknown,
): Result<SessionId, AppError> => createSessionId(value);

export const toPeriodResult = (value: unknown): Result<Period, AppError> =>
  createPeriod(value);

// --- Existing throw-based APIs preserved (now implemented via Result) ---

/**
 * Validates and converts a string to a branded CustomerId (throws on error)
 */
export const toCustomerId = (id: string): CustomerId => {
  const r = toCustomerIdResult(id);
  if (r.ok) {
    return r.value;
  }
  throw r.error;
};
/**
 * Validates and converts a string to a branded UserId (throws on error)
 */
export const toUserId = (id: string): UserId => {
  const r = toUserIdResult(id);
  if (r.ok) {
    return r.value;
  }
  throw r.error;
};
/**
 * Validates and converts a string to a branded InvoiceId (throws on error)
 */
export const toInvoiceId = (id: string): InvoiceId => {
  const r = toInvoiceIdResult(id);
  if (r.ok) {
    return r.value;
  }
  throw r.error;
};
/**
 * Validates and converts a string to a branded RevenueId (throws on error)
 */
export const toRevenueId = (id: string): RevenueId => {
  const r = toRevenueIdResult(id);
  if (r.ok) {
    return r.value;
  }
  throw r.error;
};

/**
 * Normalizes an input into a branded Period (throws on error)
 */
export function toPeriod(input: Date | string): Period {
  const r = toPeriodResult(input);
  if (r.ok) {
    return r.value;
  }
  throw r.error;
}
