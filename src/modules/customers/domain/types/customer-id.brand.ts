import type { Brand } from "@/shared/branding/brand";

/**
 * Brand symbol for customer identifiers.
 */
export const CUSTOMER_ID_BRAND: unique symbol = Symbol("CustomerId");

/**
 * Branded customer identifier (UUID string).
 */
export type CustomerId = Brand<string, typeof CUSTOMER_ID_BRAND>;
