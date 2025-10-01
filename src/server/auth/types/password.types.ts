import "server-only";

/**
 * Branded raw password. Never persist.
 */
export type PasswordRaw = string & { readonly __brand: "PasswordRaw" };
/**
 * Branded hashed password. Only after hashing and only on server.
 */
export type PasswordHash = string & { readonly __brand: "PasswordHash" };
/**
 * Factory: apply PasswordRaw brand in one place.
 * @param value - untrusted user input (raw string)
 */
export const asPasswordRaw = (value: string): PasswordRaw =>
  value as PasswordRaw;
/**
 * Factory: apply PasswordHash brand in one place.
 * @param value - result of a trusted hashing function
 */
export const asPasswordHash = (value: string): PasswordHash =>
  value as PasswordHash;
