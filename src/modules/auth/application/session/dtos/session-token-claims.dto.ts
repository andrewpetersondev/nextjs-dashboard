import type { UserRole } from "@/shared/domain/user/user-role.schema";

/**
 * Application-layer session token claims.
 *
 * This represents the application's view of session data after it has been
 * decoded and validated from the infrastructure transport (e.g., JWT).
 */
export type SessionTokenClaimsDto = Readonly<{
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
