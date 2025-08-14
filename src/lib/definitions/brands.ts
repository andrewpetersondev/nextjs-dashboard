import "server-only";

import { format, isValid, parse } from "date-fns";
import { ValidationError } from "@/errors/errors";
import {
  INVOICE_STATUSES,
  type InvoiceStatus,
} from "@/features/invoices/invoice.types";
import {
  INTERVAL_DURATIONS,
  type IntervalDuration,
} from "@/features/revenues/core/revenue.types";
import { USER_ROLES, type UserRole } from "@/features/users/user.types";

const relaxedUuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type Brand<T, B extends symbol> = T & { readonly __brand: B };

// Centralize all brand symbols
export const customerIdBrand = Symbol("CustomerId");
export const userIdBrand = Symbol("UserId");
export const invoiceIdBrand = Symbol("InvoiceId");
export const revenueIdBrand = Symbol("RevenueId");
export const sessionIdBrand = Symbol("SessionId");
export const periodBrand = Symbol("Period");

// Branded types
export type CustomerId = Brand<string, typeof customerIdBrand>;
export type UserId = Brand<string, typeof userIdBrand>;
export type InvoiceId = Brand<string, typeof invoiceIdBrand>;
export type RevenueId = Brand<string, typeof revenueIdBrand>;
export type SessionId = Brand<string, typeof sessionIdBrand>;
export type Period = Brand<Date, typeof periodBrand>;

// Consistent validation for all UUID-based IDs
const validateUuid = (id: string, brandName: string): void => {
  if (!relaxedUuidRegex.test(id)) {
    throw new ValidationError(
      `Invalid ${brandName}: "${id}". Must be a valid UUID.`,
    );
  }
};

// Generic enum validation function
const validateEnum = <T extends string>(
  value: string,
  enumValues: readonly T[],
  enumName: string,
): T => {
  if (enumValues.includes(value as T)) {
    return value as T;
  }
  throw new ValidationError(
    `Invalid ${enumName}: "${value}". Allowed values: ${enumValues.join(", ")}`,
  );
};

// ID validation functions
export const toCustomerId = (id: string): CustomerId => {
  validateUuid(id, "CustomerId");
  return id as CustomerId;
};

export const toUserId = (id: string): UserId => {
  validateUuid(id, "UserId");
  return id as UserId;
};

export const toInvoiceId = (id: string): InvoiceId => {
  validateUuid(id, "InvoiceId");
  return id as InvoiceId;
};

export const toRevenueId = (id: string): RevenueId => {
  validateUuid(id, "RevenueId");
  return id as RevenueId;
};

/**
 * Database is not being used for sessions yet
 */
export const _toSessionId = (id: string): SessionId => {
  validateUuid(id, "SessionId");
  return id as SessionId;
};

// Enum branding functions using the generic validateEnum
export const toUserRole = (role: string): UserRole => {
  return validateEnum(role, USER_ROLES, "UserRole");
};

export const toInvoiceStatus = (status: string): InvoiceStatus => {
  return validateEnum(status, INVOICE_STATUSES, "InvoiceStatus");
};

export const toIntervalDuration = (duration: string): IntervalDuration => {
  return validateEnum(duration, INTERVAL_DURATIONS, "IntervalDuration");
};

// Other branding functions

/**
 * Normalize an input into a branded Period (first-of-month Date)
 * Accepted inputs:
 * - Date: returns first day of its month
 * - string: "yyyy-MM" or "yyyy-MM-01"; normalized to first-of-month Date
 * todo: will i ever need "yyyy-MM"? can i just pass in date objects? does this actually brand by casting?
 */
export function toPeriod(input: Date | string): Period {
  if (input instanceof Date) {
    if (!isValid(input)) throw new ValidationError("Invalid Date for period");
    const normalized = new Date(
      Date.UTC(input.getUTCFullYear(), input.getUTCMonth(), 1),
    );
    return normalized as Period;
  }

  if (typeof input === "string") {
    // Try yyyy-MM first
    let parsed = parse(input, "yyyy-MM", new Date());
    if (!isValid(parsed) || format(parsed, "yyyy-MM") !== input) {
      // Try yyyy-MM-dd (must be first day)
      parsed = parse(input, "yyyy-MM-dd", new Date());
      if (!isValid(parsed) || format(parsed, "yyyy-MM-dd") !== input) {
        throw new ValidationError(`Invalid period: "${input}"`);
      }
    }
    const normalized = new Date(
      Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), 1),
    );
    return normalized as Period;
  }

  throw new ValidationError("Unsupported period input type");
}

/**
 * Non-throwing branded type guards and helpers
 *
 * These are useful in UI and API layers where you want to narrow types safely
 * without exceptions. They only check shape/format and do not hit the DB.
 */

// Reusable UUID guard
export function isUuid(value: unknown): value is string {
  return typeof value === "string" && relaxedUuidRegex.test(value);
}

// ID type guards
export function isCustomerId(value: unknown): value is CustomerId {
  return isUuid(value);
}

export function isUserId(value: unknown): value is UserId {
  return isUuid(value);
}

export function isInvoiceId(value: unknown): value is InvoiceId {
  return isUuid(value);
}

export function isRevenueId(value: unknown): value is RevenueId {
  return isUuid(value);
}

export function isSessionId(value: unknown): value is SessionId {
  return isUuid(value);
}

// Period guard: first-of-month Date
export function isPeriod(value: unknown): value is Period {
  return (
    value instanceof Date &&
    !Number.isNaN(value.getTime()) &&
    value.getUTCDate() === 1
  );
}
