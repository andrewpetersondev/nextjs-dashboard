import "server-only";
import type { InvoiceDto } from "@/modules/invoices/domain/dto";
import type { DenseFieldErrorMap } from "@/shared/forms/domain/types/error-maps.types";

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
