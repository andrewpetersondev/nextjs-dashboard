import "server-only";

import * as z from "zod";
import { INVOICE_STATUSES } from "@/features/invoices/invoice.types";

const amountSchema = z.coerce.number().positive().max(10000);
export const uuidSchema = z.uuid();
const isoDateSchema = z.iso.date();
const sensitiveDataSchema = z.string().min(2);
const statusSchema = z.enum(INVOICE_STATUSES);

// Base validation schema - single source of truth
export const InvoiceBaseSchema = z.object({
  amount: amountSchema,
  customerId: uuidSchema,
  date: isoDateSchema,
  sensitiveData: sensitiveDataSchema,
  status: statusSchema,
});

// Schema for creation (no ID, auto-generated date)
export const CreateInvoiceSchema = InvoiceBaseSchema;

// Schema for updates (all fields optional)
export const UpdateInvoiceSchema = InvoiceBaseSchema.partial();

// Schema for complete invoice (with ID and date)
export const InvoiceSchema = InvoiceBaseSchema.extend({
  id: z.uuid(),
});
