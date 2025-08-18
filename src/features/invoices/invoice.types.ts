import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import type { CustomerId, InvoiceId, Period } from "@/lib/types/types.brands";

/**
 * Allowed invoice statuses.
 * Use for validation and UI options.
 */
export const INVOICE_STATUSES = ["pending", "paid"] as const;

/**
 * Invoice status type.
 */
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

/**
 * Row for invoice table queries (with customer info).
 * Used in invoice list views and table components.
 */
export type InvoiceListFilter = Readonly<{
  amount: number;
  customerId: CustomerId;
  date: Date;
  email: string;
  id: InvoiceId;
  imageUrl: string;
  name: string;
  revenuePeriod: Period;
  sensitiveData: string;
  status: InvoiceStatus;
}>;

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
