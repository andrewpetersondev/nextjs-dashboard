import { z } from "zod";
import { INVOICE_STATUSES } from "@/modules/invoices/domain/statuses/invoice.statuses";

const MAX_INVOICE_AMOUNT_USD = 10_000; // $10,000
const MIN_SENSITIVE_DATA_LENGTH = 2;
const MAX_SENSITIVE_DATA_LENGTH = 100;

const amountCodec = z.codec(
  z.string(),
  z.number().positive().max(MAX_INVOICE_AMOUNT_USD),
  {
    decode: (val) => Number(val),
    encode: (val) => val.toString(),
  },
);

const isoDateCodec = z.codec(z.string(), z.iso.date(), {
  decode: (value) => value,
  encode: (value) => value.toString(),
});

const sensitiveDataSchema = z
  .string()
  .min(MIN_SENSITIVE_DATA_LENGTH)
  .max(MAX_SENSITIVE_DATA_LENGTH)
  .trim();

const invoiceStatusSchema = z.enum(INVOICE_STATUSES);

const customerIdSchema = z.uuid();

export const InvoiceBaseSchema = z.object({
  amount: amountCodec,
  customerId: customerIdSchema,
  date: isoDateCodec,
  sensitiveData: sensitiveDataSchema,
  status: invoiceStatusSchema,
});

export const CreateInvoiceSchema = InvoiceBaseSchema;

export const UpdateInvoiceSchema = InvoiceBaseSchema.partial();

export type CreateInvoiceInput = z.input<typeof CreateInvoiceSchema>;
export type UpdateInvoiceInput = z.input<typeof UpdateInvoiceSchema>;

export type CreateInvoicePayload = z.output<typeof CreateInvoiceSchema>;
export type UpdateInvoicePayload = z.output<typeof UpdateInvoiceSchema>;

export type CreateInvoiceFieldNames = keyof CreateInvoiceInput;
export type UpdateInvoiceFieldNames = keyof UpdateInvoiceInput;

export type EditInvoiceViewModel = z.output<typeof CreateInvoiceSchema> & {
  id: string;
};
