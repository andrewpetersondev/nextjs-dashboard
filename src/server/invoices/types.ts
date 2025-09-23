import "server-only";

import type { InvoiceDto } from "@/features/invoices/lib/dto";
import type { DenseErrorMap } from "@/shared/forms/form-types";

/**
 * Result type for invoice actions (create, read, update, delete).
 * Used in Server Actions.
 */
export type InvoiceActionResult = {
  data?: InvoiceDto;
  errors?: DenseErrorMap;
  message?: string;
  success: boolean;
};
