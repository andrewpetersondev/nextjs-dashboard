import "server-only";

import type { InvoiceStatus } from "@/features/invoices/types";
import type { InvoiceDto } from "@/server/invoices/dto";
import type {
  CustomerId,
  InvoiceId,
  Period,
} from "@/shared/brands/domain-brands";

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
