import "server-only";

import { z } from "zod";
import { InvoiceBaseSchema as TransportInvoiceBaseSchema } from "@/features/invoices/schema/shared";
import { toCustomerId } from "@/shared/domain/id-converters";

// Server-only schema: compose the shared transport schema and apply server transforms/brands.
export const ServerInvoiceBaseSchema = TransportInvoiceBaseSchema.extend({
  customerId: z.uuid().transform((id) => toCustomerId(id)),
  // Keep `date` as YYYY-MM-DD string here; convert to Date in codecs/mappers.
});

export const ServerCreateInvoiceSchema = ServerInvoiceBaseSchema;

// Keep partial for PATCH semantics
export const ServerUpdateInvoiceSchema = ServerInvoiceBaseSchema.partial();

// Optional server-side input types
export type ServerCreateInvoiceInput = z.input<
  typeof ServerCreateInvoiceSchema
>;
export type ServerUpdateInvoiceInput = z.input<
  typeof ServerUpdateInvoiceSchema
>;
