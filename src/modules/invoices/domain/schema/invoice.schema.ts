import { type ZodString, type ZodUUID, z } from "zod";
import { INVOICE_STATUSES } from "@/modules/invoices/domain/statuses/invoice.statuses";
import { toSchemaKeys } from "@/shared/forms/logic/inspectors/zod-schema.inspector";

const MAX_INVOICE_AMOUNT_USD = 10_000; // $10,000
const MIN_SENSITIVE_DATA_LENGTH = 2;
const MAX_SENSITIVE_DATA_LENGTH = 100;

// biome-ignore lint/nursery/useExplicitType: fix
const amountCodec = z.codec(
  z.string(),
  z.number().positive().max(MAX_INVOICE_AMOUNT_USD),
  {
    decode: (val: string) => Number(val),
    encode: (val: number) => val.toString(),
  },
);

// biome-ignore lint/nursery/useExplicitType: fix
const isoDateCodec = z.codec(z.string(), z.iso.date(), {
  decode: (value: string) => value,
  encode: (value: string) => value.toString(),
});

const sensitiveDataSchema: ZodString = z
  .string()
  .min(MIN_SENSITIVE_DATA_LENGTH)
  .max(MAX_SENSITIVE_DATA_LENGTH)
  .trim();

// biome-ignore lint/nursery/useExplicitType: fix
const invoiceStatusSchema = z.enum(INVOICE_STATUSES);

const customerIdSchema: ZodUUID = z.uuid();

// biome-ignore lint/nursery/useExplicitType: fix
export const InvoiceBaseSchema = z.object({
  amount: amountCodec,
  customerId: customerIdSchema,
  date: isoDateCodec,
  sensitiveData: sensitiveDataSchema,
  status: invoiceStatusSchema,
});

// biome-ignore lint/nursery/useExplicitType: fix
export const CreateInvoiceSchema = InvoiceBaseSchema;

// biome-ignore lint/nursery/useExplicitType: fix
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

// biome-ignore lint/nursery/useExplicitType: fix
export const CREATE_INVOICE_FIELDS_LIST = toSchemaKeys(CreateInvoiceSchema);
