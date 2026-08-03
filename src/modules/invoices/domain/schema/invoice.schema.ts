import { type ZodString, type ZodUUID, z } from "zod";
import {
	CREATABLE_INVOICE_STATUSES,
	INVOICE_STATUSES,
} from "@/modules/invoices/domain/statuses/invoice.statuses";
import { toSchemaKeys } from "@/shared/forms/logic/inspectors/zod-schema.inspector";

// Must stay at or above the seed range (maxLargeAmountCents = $50k) and
// include $0 (the zero seed tier): the edit form round-trips stored amounts
// through this schema, so any seeded amount outside it can never save a
// field edit. The seed contract test in devtools/seed locks this.
const MAX_INVOICE_AMOUNT_USD = 100_000; // $100,000
const MIN_SENSITIVE_DATA_LENGTH = 2;
const MAX_SENSITIVE_DATA_LENGTH = 100;

const AMOUNT_NEGATIVE_ERROR = "Amount cannot be negative.";
const AMOUNT_MAX_ERROR = `Amount cannot exceed $${MAX_INVOICE_AMOUNT_USD.toLocaleString("en-US")}.`;

const amountCodec = z.codec(
	z.string(),
	z
		.number()
		.nonnegative({ error: AMOUNT_NEGATIVE_ERROR })
		.max(MAX_INVOICE_AMOUNT_USD, { error: AMOUNT_MAX_ERROR }),
	{
		decode: (val: string) => Number(val),
		encode: (val: number) => val.toString(),
	},
);

const isoDateCodec = z.codec(z.string(), z.iso.date(), {
	decode: (value: string) => value,
	encode: (value: string) => value.toString(),
});

const sensitiveDataSchema: ZodString = z
	.string()
	.min(MIN_SENSITIVE_DATA_LENGTH)
	.max(MAX_SENSITIVE_DATA_LENGTH)
	.trim();

const invoiceStatusSchema = z.enum(INVOICE_STATUSES);

const customerIdSchema: ZodUUID = z.uuid();

const InvoiceBaseSchema = z.object({
	amount: amountCodec,
	customerId: customerIdSchema,
	date: isoDateCodec,
	sensitiveData: sensitiveDataSchema,
	status: invoiceStatusSchema,
});

type CreateInvoiceInput = z.input<typeof CreateInvoiceSchema>;
type UpdateInvoiceInput = z.input<typeof UpdateInvoiceSchema>;

// Create narrows status to the creatable subset: "void" is transition-only,
// and the shared base enum would otherwise let a hand-crafted POST create a
// void invoice (the radio group hiding it is UI, not enforcement).
export const CreateInvoiceSchema = InvoiceBaseSchema.extend({
	status: z.enum(CREATABLE_INVOICE_STATUSES),
});

export const UpdateInvoiceSchema = InvoiceBaseSchema.partial();

export type CreateInvoicePayload = z.output<typeof CreateInvoiceSchema>;
export type UpdateInvoicePayload = z.output<typeof UpdateInvoiceSchema>;

export type CreateInvoiceFieldNames = keyof CreateInvoiceInput;
export type UpdateInvoiceFieldNames = keyof UpdateInvoiceInput;

// Base (not Create) output: an EXISTING invoice may hold any stored status,
// including the transition-only "void" the create schema excludes.
export type EditInvoiceViewModel = z.output<typeof InvoiceBaseSchema> & {
	id: string;
};

export const CREATE_INVOICE_FIELDS_LIST = toSchemaKeys(CreateInvoiceSchema);

export const UPDATE_INVOICE_FIELDS_LIST = toSchemaKeys(UpdateInvoiceSchema);
