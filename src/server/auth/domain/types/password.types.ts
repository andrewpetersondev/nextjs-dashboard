import "server-only";
import type { Brand } from "@/shared/core/branding/brand";

export const PASSWORD_HASH_BRAND: unique symbol = Symbol("PasswordHash");

/**
 * Branded hashed password. Only after hashing and only on server.
 */
export type PasswordHash = Brand<string, typeof PASSWORD_HASH_BRAND>;

/**
 * Factory: apply PasswordHash brand in one place.
 * @param value - result of a trusted hashing function
 */
export const asPasswordHash = (value: string): PasswordHash =>
  value as unknown as PasswordHash;
