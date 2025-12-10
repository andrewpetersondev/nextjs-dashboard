import { z } from "zod";
import {
  MAX_INVOICE_AMOUNT_USD,
  MAX_SENSITIVE_DATA_LENGTH,
  MIN_SENSITIVE_DATA_LENGTH,
} from "@/modules/invoices/domain/constants";
import { INVOICE_STATUSES } from "@/modules/invoices/domain/statuses/invoice.statuses";

const amountCodec = z.codec(
  z.string(), // input schema: expects a string (from formData)
  z
    .number()
    .positive()
    .max(MAX_INVOICE_AMOUNT_USD), // output schema: expects a number
  {
    decode: (val) => Number(val), // string to number
    encode: (val) => val.toString(), // number to string
  },
);

const isoDateCodec = z.codec(
  z.string(), // input schema: expects a string (from formData)
  z.iso.date(), // output schema: expects an isodate
  {
    decode: (value) => value,
    encode: (value) => value.toString(),
  },
);

const sensitiveDataSchema = z
  .string()
  .min(MIN_SENSITIVE_DATA_LENGTH)
  .max(MAX_SENSITIVE_DATA_LENGTH)
  .trim();
const invoiceStatusSchema = z.enum(INVOICE_STATUSES);
const customerIdSchema = z.uuid(); // no brand in shared schema

// Shared transport schema (single source of truth for UI and API)
export const InvoiceBaseSchema = z.object({
  amount: amountCodec,
  customerId: customerIdSchema,
  date: isoDateCodec,
  sensitiveData: sensitiveDataSchema,
  status: invoiceStatusSchema,
});

export const CreateInvoiceSchema = InvoiceBaseSchema;

// Updates are partial at the API boundary (PATCH semantics)
export const UpdateInvoiceSchema = InvoiceBaseSchema.partial();

// Inputs
export type CreateInvoiceInput = z.input<typeof CreateInvoiceSchema>;
export type UpdateInvoiceInput = z.input<typeof UpdateInvoiceSchema>;
// Outputs
export type CreateInvoiceOutput = z.output<typeof CreateInvoiceSchema>;
export type UpdateInvoiceOutput = z.output<typeof UpdateInvoiceSchema>;
// Keys
export type CreateInvoiceFieldNames = keyof CreateInvoiceInput;
export type UpdateInvoiceFieldNames = keyof UpdateInvoiceInput;

// UI/view-model types derived from the shared schema
export type EditInvoiceViewModel = z.output<typeof CreateInvoiceSchema> & {
  id: string;
};
