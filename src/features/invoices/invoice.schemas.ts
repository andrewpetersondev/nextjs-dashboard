import "server-only";

import * as z from "zod";
import {
  INVOICE_STATUSES,
  type InvoiceActionResultGeneric,
  type InvoiceFieldName,
} from "@/features/invoices/invoice.types";
import type { FormState } from "@/lib/forms/form.types";

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
  InvoiceActionResultGeneric<
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
