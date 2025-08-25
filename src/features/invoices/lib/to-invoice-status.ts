import { INVOICE_STATUSES, type InvoiceStatus } from "@/shared/types/invoices";
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
