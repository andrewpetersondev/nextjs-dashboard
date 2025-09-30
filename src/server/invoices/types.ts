import "server-only";

import type { InvoiceDto } from "@/features/invoices/lib/dto";

import type { DenseFieldErrorMap } from "@/shared/forms/types/field-errors.type";

/**
 * Result type for invoice actions (create, read, update, delete).
 * Used in Server Actions.
 */
export type InvoiceActionResult = {
  data?: InvoiceDto;
  errors?: DenseFieldErrorMap<any>;
  message?: string;
  success: boolean;
};
