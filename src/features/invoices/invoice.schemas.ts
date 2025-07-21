import "server-only";

import * as z from "zod";
import { INVOICE_STATUSES } from "@/features/invoices/invoice.types";

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
  sensitiveData: z.string(),
  status: statusSchema,
});
