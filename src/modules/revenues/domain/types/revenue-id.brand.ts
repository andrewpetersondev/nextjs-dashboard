import type { Brand } from "@/shared/core/branding/brand";

/**
 * Brand symbol for revenue identifiers.
 */
export const REVENUE_ID_BRAND: unique symbol = Symbol("RevenueId");

/**
 * Branded revenue identifier (UUID string).
 */
export type RevenueId = Brand<string, typeof REVENUE_ID_BRAND>;
