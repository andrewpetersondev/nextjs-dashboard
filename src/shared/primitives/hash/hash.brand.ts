import type { Brand } from "@/shared/core/branding/brand";

export const HASH_BRAND: unique symbol = Symbol("Hash");

/**
 * Branded hash string (e.g., for passwords or tokens).
 */
export type Hash = Brand<string, typeof HASH_BRAND>;
