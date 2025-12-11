import type { Brand } from "@/shared/branding/brand";

export const HASH_BRAND: unique symbol = Symbol("Hash");

/**
 * Branded hash string (e.g., for passwords or tokens).
 */
export type Hash = Brand<string, typeof HASH_BRAND>;

/**
 * Factory to brand a hash string.
 * @param value - Result of a trusted hashing function.
 */
export const asHash = (value: string): Hash => value as unknown as Hash;
