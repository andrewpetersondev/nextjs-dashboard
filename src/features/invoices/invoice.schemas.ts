import * as z from "zod";
import { INVOICE_STATUSES } from "@/features/invoices/invoice.types";

// Base validation schema - single source of truth
export const InvoiceBaseSchema = z.object({
  amount: z.coerce.number().positive().max(10000),
  customerId: z.uuid(),
  date: z.iso.date(),
  sensitiveData: z.string().min(2),
  status: z.enum(INVOICE_STATUSES),
});

// Schema for creation (no ID, auto-generated date)
export const CreateInvoiceSchema = InvoiceBaseSchema;

// Schema for updates (all fields optional)
export const UpdateInvoiceSchema = InvoiceBaseSchema.partial();

// Schema for complete invoice (with ID and date)
export const InvoiceSchema = InvoiceBaseSchema.extend({
  id: z.uuid(),
});
