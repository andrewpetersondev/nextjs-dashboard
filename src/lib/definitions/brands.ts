import "server-only";

import * as z from "zod";
import { ValidationError } from "@/errors/errors";
import {
  INVOICE_STATUSES,
  type InvoiceStatus,
} from "@/features/invoices/invoice.types";
import { USER_ROLES, type UserRole } from "@/features/users/user.types";

const uuidSchema = z.uuid();

export type Brand<T, B extends symbol> = T & { readonly __brand: B };

// Centralize all brand symbols
export const customerIdBrand = Symbol("CustomerId");
export const userIdBrand = Symbol("UserId");
export const invoiceIdBrand = Symbol("InvoiceId");
export const sessionIdBrand = Symbol("SessionId");

// Branded types
export type CustomerId = Brand<string, typeof customerIdBrand>;
export type UserId = Brand<string, typeof userIdBrand>;
export type InvoiceId = Brand<string, typeof invoiceIdBrand>;
export type SessionId = Brand<string, typeof sessionIdBrand>;

// Consistent validation for all UUID-based IDs
const validateUuid = (id: string, brandName: string): void => {
  if (!uuidSchema.safeParse(id).success) {
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

/**
 * Database is not being used for sessions yet
 */
export const _toSessionId = (id: string): SessionId => {
  validateUuid(id, "SessionId");
  return id as SessionId;
};

// Enum validation functions using the generic validateEnum
export const toUserRole = (role: string): UserRole => {
  return validateEnum(role, USER_ROLES, "UserRole");
};

export const toInvoiceStatus = (status: string): InvoiceStatus => {
  return validateEnum(status, INVOICE_STATUSES, "InvoiceStatus");
};
