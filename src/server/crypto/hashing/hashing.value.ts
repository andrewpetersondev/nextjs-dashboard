import "server-only";

import type { Hash } from "@/shared/branding/brands";

/**
 * Pure mapping to brand a trusted hash string.
 * Use this only for values already hashed by the system or retrieved from DB.
 */
export const toHash = (value: string): Hash => value as unknown as Hash;
