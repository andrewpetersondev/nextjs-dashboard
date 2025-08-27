// If server-only, import from invoice.schema.server.ts where branding/transforms are applied.
// Re-export server schemas only from server entry points to avoid leaking them to the client.

// import "server-only";
//
// import { z } from "zod";
// import { toCustomerId } from "@/shared/brands/mappers";
// import {
//   MAX_INVOICE_AMOUNT_USD,
//   MAX_SENSITIVE_DATA_LENGTH,
//   MIN_SENSITIVE_DATA_LENGTH,
// } from "@/shared/invoices/constants";
// import { INVOICE_STATUSES } from "@/shared/invoices/invoices";
//
// // Accept USD from forms and validate USD range; the service converts USD -> cents
// const amountSchema = z.coerce.number().positive().max(MAX_INVOICE_AMOUNT_USD);
// const isoDateSchema = z.iso.date();
// const sensitiveDataSchema = z
//   .string()
//   .min(MIN_SENSITIVE_DATA_LENGTH)
//   .max(MAX_SENSITIVE_DATA_LENGTH)
//   .trim();
// const invoiceStatusSchema = z.enum(INVOICE_STATUSES);
// const customerIdSchema = z.uuid().transform((id) => {
//   return toCustomerId(id);
// });
//
// // Base validation schema - single source of truth
// export const InvoiceBaseSchema = z.object({
//   amount: amountSchema,
//   customerId: customerIdSchema,
//   date: isoDateSchema,
//   sensitiveData: sensitiveDataSchema,
//   status: invoiceStatusSchema,
// });
//
// // Schema for creation (no ID, auto-generated date)
// export const CreateInvoiceSchema = InvoiceBaseSchema;
//
// // Schema for updates (all fields optional)
// export const UpdateInvoiceSchema = InvoiceBaseSchema.partial();
//
// // Derive UI and boundary types
// export type UpdateInvoiceInput = z.input<typeof UpdateInvoiceSchema>;
// export type UpdateInvoiceFieldNames = keyof UpdateInvoiceInput;
//
// /**
//  * Fully populated "view model" for the Edit form props
//  * - Required fields for rendering defaults (derived from Create schema)
//  * - Plus id
//  */
// export type EditInvoiceViewModel = z.output<typeof CreateInvoiceSchema> & {
//   id: string;
// };
