import "server-only";

import type { InvoiceDto } from "@/features/invoices/lib/dto";

import type { DenseFieldErrorMap } from "@/shared/forms/errors/types";

/**
 * Result type for invoice actions (create, read, update, delete).
 * Used in Server Actions.
 */
export type InvoiceActionResult = {
  data?: InvoiceDto;
  // biome-ignore lint/suspicious/noExplicitAny: <temp>
  errors?: DenseFieldErrorMap<any>;
  message?: string;
  success: boolean;
};
