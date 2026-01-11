import "server-only";

/**
 * JWT payload schema for session tokens (infrastructure serialization detail).
 *
 * This represents the raw claims stored in and decoded from JWT tokens.
 * This is an infrastructure type specific to JWT/JOSE implementation.
 *
 * **Timestamp Fields:**
 * - `iat`: JWT-standard issued-at time in **seconds** (required by JWT spec)
 * - `expiresAt`: Application-level expiration in **seconds**
 * - `sessionStart`: Session absolute start time in **seconds**
 *
 * Note: `exp` (expiration) is computed by JOSE's `.setExpirationTime()` and
 * is not included in our schema as it's redundant with `expiresAt`.
 *
 * @typeParam R - Role type (string for raw JWT, UserRole for typed usage)
 */
export type SessionJwtClaims<R = string> = {
  /** Application-level expiration time (UNIX timestamp in seconds) */
  expiresAt: number;
  /** JWT-standard issued-at time (UNIX timestamp in seconds) */
  iat: number;
  /** User role (string in JWT, typed in application layer) */
  role: R;
  /** Session absolute start time (UNIX timestamp in seconds) */
  sessionStart: number;
  /** User identifier (UUID string, decoded to UserId in domain) */
  userId: string;
};
