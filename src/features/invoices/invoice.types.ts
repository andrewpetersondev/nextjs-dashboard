import "server-only";
import * as z from "zod";
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
export const INVOICE_FIELD_NAMES = ["amount", "customerId", "status"] as const;

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
 * Input shape for creating a new invoice.
 * Excludes backend-generated fields.
 */
export interface InvoiceCreateInput {
  readonly amount: number;
  readonly customerId: CustomerId;
  readonly status: InvoiceStatus;
}

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
 * Form state for creating a new invoice.
 * Used in UI for create-invoice-form.
 */
export type InvoiceFormStateCreate = FormState<
  InvoiceFieldName,
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

/**
 * Zod schema for invoice creation.
 * Validates amount, customerId, and status.
 */
export const CreateInvoiceSchema = z.object({
  amount: amountSchema,
  customerId: customerIdSchema,
  status: statusSchema,
});
