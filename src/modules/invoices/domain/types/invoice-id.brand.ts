import type { Brand } from "@/shared/branding/brand";

/**
 * Brand symbol for invoice identifiers.
 */
export const INVOICE_ID_BRAND: unique symbol = Symbol("InvoiceId");

/**
 * Branded invoice identifier (UUID string).
 */
export type InvoiceId = Brand<string, typeof INVOICE_ID_BRAND>;
