import {
  INVOICE_STATUSES,
  type InvoiceStatus,
} from "@/features/invoices/lib/types";
import type { AppError } from "@/shared/errors/core/app-error.class";
import type { Result } from "@/shared/result/result.types";
import { validateEnumResult } from "@/shared/validation/validate-enum-result";

/**
 * Validates and converts a value to an InvoiceStatus
 * @param status - The status value to validate
 * @returns Result<InvoiceStatus, AppError>
 */
export const toInvoiceStatus = (
  status: unknown,
): Result<InvoiceStatus, AppError> => {
  return validateEnumResult(status, INVOICE_STATUSES, "InvoiceStatus");
};
