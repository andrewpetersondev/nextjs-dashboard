import type { Brand } from "@/shared/branding/brand";

export const HASH_BRAND: unique symbol = Symbol("Hash");

/**
 * Branded hash string (e.g., for passwords or tokens).
 */
export type Hash = Brand<string, typeof HASH_BRAND>;

/**
 * Pure mapping to brand a trusted hash string.
 * Use this only for values already hashed by the system or retrieved from DB.
 */
export const toHash = (value: string): Hash => value as unknown as Hash;
