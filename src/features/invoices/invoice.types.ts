import "server-only";

import type { InvoiceEntity } from "@/db/models/invoice.entity";
import type { InvoiceDto } from "@/features/invoices/invoice.dto";
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
 * Invoice field names for forms and error maps.
 */
export const INVOICE_FIELD_NAMES = [
  "amount",
  "customerId",
  "date",
  "id",
  "status",
] as const;

/**
 * Invoice field name type.
 * Used for form validation and error handling.
 */
export type InvoiceFieldName = (typeof INVOICE_FIELD_NAMES)[number];

/**
 * Error map for invoice actions.
 * Maps field names to error messages.
 */
export type InvoiceErrorMap_old = Partial<Record<InvoiceFieldName, string[]>>;

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
  status: InvoiceStatus;
}>;

/**
 * Input type for creating an invoice in the DAL.
 * Omits fields not set by the user.
 */
export type InvoiceCreateInput = Omit<InvoiceEntity, "id" | "sensitiveData">;

/**
 * DTO for updating an invoice.
 * Only updatable fields are included.
 */
export interface InvoiceUpdateInput {
  readonly amount: number;
  readonly status: InvoiceStatus;
  readonly customerId: CustomerId;
}

/**
 * State for editing an invoice.
 * Includes current invoice, errors, message, and success flag.
 */
export type InvoiceEditState = Readonly<{
  invoice: InvoiceDto;
  errors?: InvoiceErrorMap_old;
  message?: string;
  success?: boolean;
}>;

/**
 * Strict input type for UI invoice form.
 * Used for client-side validation and transformation.
 */
export interface UiInvoiceInput {
  amount: number;
  customerId: string;
  date: string; // ISO date string
  status: InvoiceStatus;
}

/**
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

/**
 * Map of field names to error messages for form validation.
 */
export interface InvoiceErrorMap {
  readonly [field: string]: string | undefined;
}

/**
 * Uniform result shape for all invoice actions.
 * With exactOptionalPropertyTypes, properties are only present if set.
 */
export interface InvoiceActionResult {
  readonly data?: InvoiceDto | null;
  readonly errors?: InvoiceErrorMap; // present only if there are errors
  readonly message?: string;
  readonly success: boolean;
}
