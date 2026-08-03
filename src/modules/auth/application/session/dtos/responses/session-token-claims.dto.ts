import type { UserRole } from "@/shared/policies/user-role/user-role.constants";

/**
 * Application-layer session token claims.
 *
 * This represents the application's view of session data after it has been
 * decoded and validated from the infrastructure transport (e.g., JWT).
 */
export type SessionTokenClaimsDto = Readonly<{
	/**
	 * Original authentication time (UNIX timestamp in seconds).
	 *
	 * @remarks
	 * Required at this layer even though the wire claim is optional: infrastructure
	 * resolves the fallback (`iat`) when decoding legacy tokens, so the application
	 * never has to reason about its absence.
	 */
	authTime: number;
	/** Expiration time (UNIX timestamp in seconds) */
	exp: number;
	/** Issued-at time (UNIX timestamp in seconds) */
	iat: number;
	/** JWT ID (unique token identifier) */
	jti: string;
	/** Not-before time (UNIX timestamp in seconds) */
	nbf: number;
	/** User role - strongly typed for application layer */
	role: UserRole;
	/** Session ID (stable identifier for the session) */
	sid: string;
	/** Subject: User identifier (UUID string) */
	sub: string;
}>;
