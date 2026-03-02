import type { Brand } from "@/shared/core/branding/brand";

/**
 * Brand symbol for session identifiers.
 */
export const SESSION_ID_BRAND: unique symbol = Symbol("SessionId");

/**
 * Branded session identifier (UUID string).
 */
export type SessionId = Brand<string, typeof SESSION_ID_BRAND>;
