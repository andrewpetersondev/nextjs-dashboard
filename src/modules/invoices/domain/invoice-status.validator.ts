import { INVOICE_STATUSES } from "@/modules/invoices/domain/statuses/invoice.statuses";
import { createEnumValidator } from "@/shared/branding/factories/enum-factory";

/**
 * Validates and converts a value to an InvoiceStatus.
 * @param status - The status value to validate
 * @returns Result<InvoiceStatus, AppError>
 */
export const validateInvoiceStatus = createEnumValidator(
  "InvoiceStatus",
  INVOICE_STATUSES,
);
