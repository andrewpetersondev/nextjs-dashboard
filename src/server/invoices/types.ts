import "server-only";
import type { InvoiceDto } from "@/features/invoices/lib/dto";
import type { DenseFieldErrorMap } from "@/shared/application/forms/domain/types/error-maps.types";

/**
 * Result type for invoice actions (create, read, update, delete).
 * Used in Server Actions.
 */
export type InvoiceActionResult = {
  data?: InvoiceDto;
  errors?: DenseFieldErrorMap<string, string>;
  message?: string;
  success: boolean;
};
