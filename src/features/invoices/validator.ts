import {
  INVOICE_STATUSES,
  type InvoiceStatus,
} from "@/features/invoices/types";

import { validateEnum } from "@/shared/validation/enum";

/**
 * Validates and converts a value to an InvoiceStatus
 * @param status - The status value to validate
 * @returns A validated InvoiceStatus
 * @throws {ValidationError} If the status is invalid
 */
export const toInvoiceStatus = (status: unknown): InvoiceStatus => {
  return validateEnum(status, INVOICE_STATUSES, "InvoiceStatus");
};

/**
 * Type guard to check if a value is a valid InvoiceStatus
 * @param value - The value to check
 * @returns True if the value is a valid InvoiceStatus
 */
export function isInvoiceStatus(value: unknown): value is InvoiceStatus {
  return (
    typeof value === "string" &&
    INVOICE_STATUSES.includes(value as InvoiceStatus)
  );
}
