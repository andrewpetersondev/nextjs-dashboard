import type { Brand } from "@/shared/branding/brand";

/**
 * Brand symbol for period (first day of month) timestamps.
 */
export const PERIOD_BRAND: unique symbol = Symbol("Period");

/**
 * Branded period (first day of month, UTC Date).
 */
export type Period = Brand<Date, typeof PERIOD_BRAND>;
