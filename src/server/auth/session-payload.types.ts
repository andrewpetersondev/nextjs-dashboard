/**
 * @file Session payload types for server-side auth utilities.
 *
 * @remarks
 * These types are used exclusively on the server. They model the decrypted
 * session payload including standard temporal claims.
 */
import "server-only";
import type { EncryptPayload } from "@/features/auth/sessions/dto/types";

/**
 * Decrypted session payload including temporal claims.
 *
 * Extends the base {@link EncryptPayload} with:
 * - iat: Issued-at UNIX timestamp (seconds).
 * - exp: Expiration UNIX timestamp (seconds).
 */
export interface DecryptPayload extends EncryptPayload {
  /** Issued-at UNIX timestamp (in seconds). */
  iat: number;
  /** Expiration UNIX timestamp (in seconds). */
  exp: number;
}
