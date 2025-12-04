import type { InvoiceDto } from "@/modules/invoices/domain/dto";
import type { CustomerId, InvoiceId, Period } from "@/shared/branding/brands";
import type { DenseFieldErrorMap } from "@/shared/forms/types/error-maps.types";

/** Allowed invoice status values (immutable tuple for precise type inference). */
export const INVOICE_STATUSES = ["pending", "paid"] as const;
/** String-literal union of the allowed invoice statuses derived from INVOICE_STATUSES. */
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
  errors?: DenseFieldErrorMap<string, string>;
  message?: string;
  success: boolean;
};
