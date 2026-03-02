import "server-only";

import type { Hash } from "@/shared/primitives/hash/hash.brand";

/**
 * Pure mapping to brand a trusted hash string.
 * Use this only for values already hashed by the system or retrieved from DB.
 */
export const toHash = (value: string): Hash => value as unknown as Hash;
