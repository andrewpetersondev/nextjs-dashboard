import "server-only";

import * as z from "zod";
import type { InvoiceEntity } from "@/db/models/invoice.entity";
import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import type { CustomerId, InvoiceId } from "@/lib/definitions/brands";
import type { FormState } from "@/lib/forms/form.types";

/**
 * Allowed invoice statuses.
 * Use for validation and UI options.
 */
export const INVOICE_STATUSES = ["pending", "paid"] as const;

/**
 * Invoice status type.
 * @example "pending" | "paid"
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
export type InvoiceErrorMap = Partial<Record<InvoiceFieldName, string[]>>;

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
  errors?: InvoiceErrorMap;
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
  status: InvoiceStatus;
}

/**
 * @template TFieldNames - Valid field names for error mapping.
 * @template TData - The data type returned by the action (e.g., InvoiceDto, form data).
 * @remarks
 * Use for all invoice CRUD actions to ensure uniformity and reduce duplication.
 */
export interface InvoiceActionResult<
  TFieldNames extends string,
  TData = unknown,
> {
  readonly data?: TData;
  readonly errors?: Partial<Record<TFieldNames, string[]>>;
  readonly message?: string;
  readonly success: boolean;
}

/**
 * Form state for creating a new invoice.
 * Used in UI for create-invoice-form.
 */
export type InvoiceFormStateCreate = FormState<
  InvoiceFieldName,
  z.output<typeof CreateInvoiceSchema>
>;

/**
 * Important type!
 * Allows partial data for sticky fields in the create invoice form.
 * Used when validation fails but we want to keep user input.
 */
export type CreateInvoicePartial = Promise<
  InvoiceActionResult<
    InvoiceFieldName,
    Partial<z.output<typeof CreateInvoiceSchema>>
  >
>;

/**
 * Partial output type for CreateInvoiceSchema.
 * Used for form state and validation feedback.
 * Allows partial data to keep user input on validation errors.
 */
export type PartialInvoiceSchema = Partial<
  z.output<typeof CreateInvoiceSchema>
>;

/**
 * Zod schema for validating invoice creation input.
 * Exported for reuse in validation and tests.
 */
const amountSchema = z.coerce
  .number()
  .gt(0, { error: "Amount must be greater than $0." })
  .lt(10000, { error: "Amount must be less than $10,000." });

const customerIdSchema = z.string({
  error: (issue) =>
    issue.input === undefined
      ? "Customer ID is required."
      : "Customer ID must be a string.",
});

const statusSchema = z.enum(INVOICE_STATUSES, {
  error: (issue) =>
    issue.input === undefined
      ? "Invoice status is required"
      : "Invalid invoice status",
});

/* Optional Properties */

const dateSchema = z.iso.date({});

const invoiceIdSchema = z.uuid({});

/**
 * Zod schema for invoice creation.
 * Validates amount, customerId, and status.
 *
 * @remarks
 * Attempting to implement for all CRUD operations.
 * Optional properties like date and id are included for flexibility.
 */
export const CreateInvoiceSchema = z.object({
  amount: amountSchema,
  customerId: customerIdSchema,
  date: dateSchema,
  id: invoiceIdSchema.optional(),
  status: statusSchema,
});
