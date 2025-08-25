import type {
  CustomerId,
  InvoiceId,
  Period,
} from "@/shared/brands/domain-brands";

export const INVOICE_STATUSES = ["pending", "paid"] as const;
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
