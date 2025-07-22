/**
 * @fileoverview
 * Domain branding utilities for type-safe IDs and enums.
 *
 * ## Purpose
 * - Prevents accidental assignment between domain IDs (e.g., CustomerId vs InvoiceId).
 * - Provides runtime helpers for safe conversion and validation.
 * - Centralizes branding logic for maintainability and traceability.
 *
 * ## Usage
 * - Use branded types for all database/entity IDs and domain enums.
 * - Use conversion helpers when mapping raw DB values to branded types.
 * - Never expose branded types to UI or external consumers.
 *
 * ## Example
 * ```typescript
 * const customerId: CustomerId = toCustomerId(rawId);
 * const invoiceStatus: InvoiceStatus = toInvoiceStatus(rawStatus);
 */

import {
  INVOICE_STATUSES,
  type InvoiceStatus,
} from "@/features/invoices/invoice.types";
import { USER_ROLES, type UserRole } from "@/features/users/user.types";

/**
 * Utility type for creating branded types.
 * Prevents accidental assignment between different branded types.
 */
export type Brand<T, B extends symbol> = T & { readonly __brand: B };

/**
 * Unique symbols for each brand.
 * Used to distinguish domain IDs and enums.
 */
export const customerIdBrand = Symbol("CustomerId");
export const invoiceIdBrand = Symbol("InvoiceId");
export const userIdBrand = Symbol("UserId");

/**
 * Branded ID types for domain entities.
 * Use for database, DAL, and server logic.
 */
export type CustomerId = Brand<string, typeof customerIdBrand>;
export type InvoiceId = Brand<string, typeof invoiceIdBrand>;
export type UserId = Brand<string, typeof userIdBrand>;

/**
 * Converts a string to a branded CustomerId.
 * @param id - Raw customer ID string.
 * @returns CustomerId (branded).
 */
export const toCustomerId = (id: string): CustomerId => id as CustomerId;

/**
 * Converts a string to a branded InvoiceId.
 * @param id - Raw invoice ID string.
 * @returns InvoiceId (branded).
 */
export const toInvoiceId = (id: string): InvoiceId => id as InvoiceId;

/**
 * Converts a string to a branded UserId.
 * @param id - Raw user ID string.
 * @returns UserId (branded).
 */
export const toUserId = (id: string): UserId => id as UserId;

/**
 * Brands a string as InvoiceStatus after validating against allowed statuses.
 * Throws if the value is not a valid InvoiceStatus.
 *
 * @param status - Raw status string.
 * @returns InvoiceStatus (branded).
 * @throws Error if status is not allowed.
 */
export const toInvoiceStatus = (status: string): InvoiceStatus => {
  if ((INVOICE_STATUSES as readonly string[]).includes(status)) {
    return status as InvoiceStatus;
  }
  throw new Error(
    `Invalid InvoiceStatus: "${status}". Allowed values: ${INVOICE_STATUSES.join(", ")}`,
  );
};

/**
 * Brands a string as UserRole after validating against allowed roles.
 * Throws if the value is not a valid UserRole.
 *
 * @param role - Raw role string.
 * @returns UserRole (branded).
 * @throws Error if role is not allowed.
 */
export const toUserRoleBrand = (role: string): UserRole => {
  if ((USER_ROLES as readonly string[]).includes(role)) {
    return role as UserRole;
  }
  throw new Error(
    `Invalid UserRole: "${role}". Allowed values: ${USER_ROLES.join(", ")}`,
  );
};
