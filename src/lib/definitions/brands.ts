import {
  INVOICE_STATUSES,
  type InvoiceStatus,
} from "@/lib/definitions/invoices.types";
import { USER_ROLES, type UserRole } from "@/lib/definitions/users.types";

/**
 * Utility type for creating branded types.
 * Prevents accidental assignment between different branded types.
 */
export type Brand<T, B extends symbol> = T & { readonly __brand: B };

/**
 * Unique symbols for each brand.
 */
export const customerIdBrand = Symbol("CustomerId");
export const invoiceIdBrand = Symbol("InvoiceId");
export const userIdBrand = Symbol("UserId");

/**
 * Branded ID types for for domain entities.
 */
export type CustomerId = Brand<string, typeof customerIdBrand>;
export type InvoiceId = Brand<string, typeof invoiceIdBrand>;
export type UserId = Brand<string, typeof userIdBrand>;

/**
 * Branding helpers for runtime conversion.
 * Use these when mapping from raw DB values to branded types.
 */
export const toCustomerId = (id: string): CustomerId => id as CustomerId;
export const toInvoiceId = (id: string): InvoiceId => id as InvoiceId;
export const toUserId = (id: string): UserId => id as UserId;

/**
 * Brands a string as InvoiceStatus after validating against allowed statuses.
 * Throws if the value is not a valid InvoiceStatus.
 */
export const toInvoiceStatusBrand = (status: string): InvoiceStatus => {
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
 */
export const toUserRoleBrand = (role: string): UserRole => {
  if ((USER_ROLES as readonly string[]).includes(role)) {
    return role as UserRole;
  }
  throw new Error(
    `Invalid UserRole: "${role}". Allowed values: ${USER_ROLES.join(", ")}`,
  );
};
