import type { InvoiceStatus } from "@/modules/invoices/domain/statuses/invoice.statuses";
import type { CustomerId, InvoiceId, Period } from "@/shared/branding/brands";

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
