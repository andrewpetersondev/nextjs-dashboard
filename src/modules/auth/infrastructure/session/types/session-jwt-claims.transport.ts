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
 * - `nbf`: Not-before time (UNIX timestamp in seconds)
 * - `jti`: JWT ID (unique token identifier)
 *
 * **Session Lifecycle:**
 * - `sid`: Session ID (stable session identifier, useful for revocation/rotation)
 * - `auth_time`: original authentication time (OIDC standard claim). Unlike `iat`,
 *   this is **preserved across rotation**, so it is the only claim that can anchor
 *   the absolute session ceiling — `iat` slides forward on every rotated token.
 *   Optional on the wire: tokens issued before the claim existed omit it, and the
 *   infrastructure mapper falls back to `iat` for those.
 *
 * **Performance Optimization (Denormalized Data):**
 * - `role`: User role (string) - Cached from user record at token issuance.
 *   This avoids database lookups on every request. Role changes require re-authentication.
 *
 * Note: While `role` is application-specific, storing it in JWT is a pragmatic
 * tradeoff between architectural purity and performance. The JWT infrastructure
 * remains decoupled as role is treated as an opaque string at this layer.
 */
export type SessionJwtClaimsTransport = {
	/**
	 * Original authentication time (UNIX timestamp in seconds) - OIDC standard.
	 * Preserved across rotation. Absent on tokens issued before this claim existed.
	 */
	auth_time?: number;
	/** Expiration time (UNIX timestamp in seconds) - JWT standard */
	exp: number;
	/** Issued-at time (UNIX timestamp in seconds) - JWT standard */
	iat: number;
	/** JWT ID (unique token identifier) - JWT standard */
	jti: string;
	/** Not-before time (UNIX timestamp in seconds) - JWT standard */
	nbf: number;
	/** User role (cached for performance) - string at infrastructure layer */
	role: string;
	/** Session ID (stable identifier for a session) - application/session standard */
	sid: string;
	/** Subject: User identifier (UUID string) - JWT standard */
	sub: string;
};
