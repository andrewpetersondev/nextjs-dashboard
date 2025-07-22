import "server-only";

import type {
  CreateInvoiceDto,
  InvoiceDto,
} from "@/features/invoices/invoice.dto";
import type { CustomerId, InvoiceId } from "@/lib/definitions/brands";

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
export type InvoiceTableRow = Readonly<{
  amount: number;
  customerId: CustomerId;
  date: string;
  email: string;
  id: InvoiceId;
  imageUrl: string;
  name: string;
  sensitiveData: string;
  status: InvoiceStatus;
}>;

/**
 * Type for invoice list filters.
 * used in new repository.ts
 */
export type InvoiceListFilter = InvoiceTableRow;

/**
 * @deprecated
 * Phasing out and replacing with InvoiceActionResult
 *
 * Generic.
 * Use InvoiceActionResultGeneric instead for consistency.
 *
 * @template TFieldNames - Valid field names for error mapping.
 * @template TData - The data type returned by the action (e.g., InvoiceDto, form data).
 * @remarks
 * Use for all invoice CRUD actions to ensure uniformity and reduce duplication.
 */
export interface InvoiceActionResultGeneric<
  TFieldNames extends string,
  TData = unknown,
> {
  readonly data?: TData;
  readonly errors?: Partial<Record<TFieldNames, string[]>>;
  readonly message?: string;
  readonly success: boolean;
}

// types below are part of the refactor to  simplify types. DO NOT REMOVE

export type InvoiceActionResult = {
  data?: InvoiceDto;
  errors?: Record<string, string[]>;
  message?: string;
  success: boolean;
};

export type InvoiceFieldName = keyof CreateInvoiceDto;
