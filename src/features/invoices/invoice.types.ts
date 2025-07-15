import * as z from "zod";
import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import type { CustomerId, InvoiceId } from "@/lib/definitions/brands";
import type { FormState } from "@/lib/forms/form.types";

/**
 * Allowed invoice statuses.
 * Use this constant for validation and UI options.
 */
export const INVOICE_STATUSES = ["pending", "paid"] as const;

/**
 * Type for invoice status.
 *
 * String literal Union type based on INVOICE_STATUSES.
 */
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

/**
 * Field names for invoice forms and error maps.
 */
export const INVOICE_FIELD_NAMES = ["amount", "customerId", "status"] as const;

/**
 * Type for invoice field names. (Intended for UI forms and error handling)
 *
 * - Intended for use in forms, error messages, and validation.
 * - UI only
 * String literal Union type based on INVOICE_FIELD_NAMES.
 */
export type InvoiceFieldName = (typeof INVOICE_FIELD_NAMES)[number];

/**
 * Error map for invoice actions.
 */
export type InvoiceErrorMap = Partial<Record<InvoiceFieldName, string[]>>;

/**
 * Row for invoice table queries (with customer info).
 *
 * Combines invoice data with customer details for display in tables.
 * This type is used in invoice list views and table components.
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

export type InvoiceEditState = Readonly<{
  invoice: InvoiceDto;
  errors?: InvoiceErrorMap;
  message?: string;
  success?: boolean;
}>;

/**
 * Form state for creating a new invoice.
 * This is used to manage the form state in the UI for create-invoice-form.tsx.
 * It includes validation errors, success,  messages, and the created invoice DTO (optional).
 */
export type InvoiceFormStateCreate = FormState<
  InvoiceFieldName,
  z.output<typeof CreateInvoiceSchema>
>;

/**
 * Zod validation schema for invoice creation.
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
 * Zod schema for validating invoice creation input.
 */
export const CreateInvoiceSchema = z.object({
  amount: amountSchema,
  customerId: customerIdSchema,
  status: statusSchema,
});
