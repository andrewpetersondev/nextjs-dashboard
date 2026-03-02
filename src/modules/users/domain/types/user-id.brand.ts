import type { Brand } from "@/shared/branding/brand";

/**
 * Brand symbol for user identifiers.
 */
export const USER_ID_BRAND: unique symbol = Symbol("UserId");

/**
 * Branded user identifier (UUID string).
 */
export type UserId = Brand<string, typeof USER_ID_BRAND>;
