/**
 * JWT payload schema for session tokens.
 *
 * Represents the raw claims stored in and decoded from JWT tokens.
 * This is a boundary/infrastructure type that bridges JWT (infrastructure)
 * and SessionEntity (domain).
 *
 * **Timestamp Fields Explained:**
 * - `exp`: JWT-standard expiration time in **seconds** (required by JWT spec)
 * - `iat`: JWT-standard issued-at time in **seconds** (required by JWT spec)
 * - `expiresAt`: Application-level expiration in **milliseconds** (for convenience)
 * - `sessionStart`: Application-level session start in **milliseconds**
 *
 * The redundancy between `exp`/`expiresAt` exists because:
 * 1. JWT spec mandates `exp` in seconds for standard verification
 * 2. JavaScript prefers milliseconds (`Date.now()`, `new Date()`)
 * 3. Having both avoids repeated conversions and simplifies domain logic
 *
 * @typeParam R - Role type (string for JWT, UserRole for typed usage)
 */
export type SessionClaimsSchema<R = string> = {
  /** JWT-standard expiration time (UNIX timestamp in seconds) */
  exp: number;
  /** Application-level expiration time (UNIX timestamp in milliseconds) */
  expiresAt: number;
  /** JWT-standard issued-at time (UNIX timestamp in seconds) */
  iat: number;
  /** User role (string in JWT, typed in application layer) */
  role: R;
  /** Session absolute start time (UNIX timestamp in milliseconds) */
  sessionStart: number;
  /** User identifier (UUID string, decoded to UserId in domain) */
  userId: string;
};

// todo: why do i need `exp` and `expiresAt`? they seem redundant and confusing. Also, should this type be an Entity
//  instead of a schema? If it should remain as a schema, then should `SessionTokenClaims` be an Entity instead of a
//  `DTO`? Also, some of these types come from infrastructure (e.g., JWT) and some are domain types, so should i
//  have an infrastructure type and a domain type and map between them, or maybe extend one from the other?
