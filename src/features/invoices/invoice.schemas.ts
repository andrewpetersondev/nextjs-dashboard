import "server-only";

import * as z from "zod";
import { INVOICE_STATUSES } from "@/features/invoices/invoice.types";
import { toCustomerId } from "@/lib/core/brands";

// const uuidSchema = z.uuid();
const amountSchema = z.coerce.number().positive().max(10000);
const isoDateSchema = z.iso.date();
const sensitiveDataSchema = z.string().min(2);
const statusSchema = z.enum(INVOICE_STATUSES);
const customerIdSchema = z.string().transform(toCustomerId);

// Base validation schema - single source of truth
export const InvoiceBaseSchema = z.object({
  amount: amountSchema,
  customerId: customerIdSchema,
  date: isoDateSchema,
  sensitiveData: sensitiveDataSchema,
  status: statusSchema,
});

// Schema for creation (no ID, auto-generated date)
export const CreateInvoiceSchema = InvoiceBaseSchema;

// Schema for updates (all fields optional)
export const UpdateInvoiceSchema = InvoiceBaseSchema.partial();
