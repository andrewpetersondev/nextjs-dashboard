import {
  INVOICE_STATUSES,
  type InvoiceStatus,
} from "@/features/invoices/lib/types";
import { validateEnum } from "@/shared/validation/domain/enum";

/**
 * Validates and converts a value to an InvoiceStatus
 * @param status - The status value to validate
 * @returns A validated InvoiceStatus
 */
export const toInvoiceStatus = (status: unknown): InvoiceStatus => {
  return validateEnum(status, INVOICE_STATUSES, "InvoiceStatus");
};
