import "server-only";

/**
 * JWT payload schema for session tokens (infrastructure-only).
 *
 * Contains JWT-standard claims plus minimal application data needed for performance.
 * This structure balances clean architecture with practical performance requirements.
 *
 * **Standard JWT Claims:**
 * - `sub`: Subject (user identifier as UUID string)
 * - `iat`: Issued-at time (UNIX timestamp in seconds)
 * - `exp`: Expiration time (UNIX timestamp in seconds)
 *
 * **Performance Optimization (Denormalized Data):**
 * - `role`: User role (string) - Cached from user record at token issuance.
 *   This avoids database lookups on every request. Role changes require re-authentication.
 *
 * Note: While `role` is application-specific, storing it in JWT is a pragmatic
 * tradeoff between architectural purity and performance. The JWT infrastructure
 * remains decoupled as role is treated as an opaque string at this layer.
 *
 *
 * // todo: I think SessionPrincipalClaims (domain layer) is sort of mixed up with SessionTokenClaims (application
 * //  layer) and SessionJwtClaims (infrastructure layer). Maybe I should have a clear mapping between these.
 */
export type SessionJwtClaims = {
  /** Expiration time (UNIX timestamp in seconds) - JWT standard */
  exp: number;
  /** Issued-at time (UNIX timestamp in seconds) - JWT standard */
  iat: number;
  /** User role (cached for performance) - string at infrastructure layer */
  role: string;
  /** Subject: User identifier (UUID string) - JWT standard */
  sub: string;
};
