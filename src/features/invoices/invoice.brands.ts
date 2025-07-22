import { ValidationError } from "@/errors/errors";
import { uuidSchema } from "@/features/invoices/invoice.schemas";
import {
  INVOICE_STATUSES,
  type InvoiceStatus,
} from "@/features/invoices/invoice.types";
import type { Brand } from "@/lib/definitions/brands";

export const invoiceIdBrand = Symbol("InvoiceId");

export type InvoiceId = Brand<string, typeof invoiceIdBrand>;

/**
 * Converts a string to a branded InvoiceId.
 * @param id - Raw invoice ID string.
 * @returns InvoiceId (branded).
 */
export const toInvoiceId = (id: string): InvoiceId => {
  if (uuidSchema.safeParse(id).success) {
    return id as InvoiceId;
  }
  throw new ValidationError(
    `Invalid InvoiceId: "${id}". Must be a valid UUID.`,
  );
};

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
  throw new ValidationError(
    `Invalid InvoiceStatus: "${status}". Allowed values: ${INVOICE_STATUSES.join(", ")}`,
  );
};
