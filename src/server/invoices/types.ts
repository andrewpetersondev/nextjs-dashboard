import "server-only";

import type { InvoiceDto } from "@/shared/invoices/dto";

/**
 * Result type for invoice actions (create, read, update, delete).
 * Used in Server Actions.
 */
export type InvoiceActionResult = {
  data?: InvoiceDto;
  errors?: Record<string, string[]>;
  message?: string;
  success: boolean;
};
