import { z } from "zod";
import {
  MAX_INVOICE_AMOUNT_USD,
  MAX_SENSITIVE_DATA_LENGTH,
  MIN_SENSITIVE_DATA_LENGTH,
} from "@/features/invoices/constants";
import { INVOICE_STATUSES } from "@/features/invoices/dto/types";

// Transport-safe primitives (no brands, no server-only)
const amountSchema = z.coerce.number().positive().max(MAX_INVOICE_AMOUNT_USD);
const isoDateSchema = z.iso.date();
const sensitiveDataSchema = z
  .string()
  .min(MIN_SENSITIVE_DATA_LENGTH)
  .max(MAX_SENSITIVE_DATA_LENGTH)
  .trim();
const invoiceStatusSchema = z.enum(INVOICE_STATUSES);
const customerIdSchema = z.uuid(); // no brand in shared schema

// Shared transport schema (single source of truth for UI and API)
export const InvoiceBaseSchema = z.object({
  amount: amountSchema,
  customerId: customerIdSchema,
  date: isoDateSchema,
  sensitiveData: sensitiveDataSchema,
  status: invoiceStatusSchema,
});

export const CreateInvoiceSchema = InvoiceBaseSchema;

// Updates are partial at the API boundary (PATCH semantics)
export const UpdateInvoiceSchema = InvoiceBaseSchema.partial();

// UI/view-model types derived from the shared schema
export type CreateInvoiceInput = z.input<typeof CreateInvoiceSchema>;
export type CreateInvoiceFieldNames = keyof CreateInvoiceInput;
export type UpdateInvoiceInput = z.input<typeof UpdateInvoiceSchema>;
export type UpdateInvoiceFieldNames = keyof UpdateInvoiceInput;

export type EditInvoiceViewModel = z.output<typeof CreateInvoiceSchema> & {
  id: string;
};
