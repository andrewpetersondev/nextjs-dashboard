import "server-only";
import type { UserRole } from "@/shared/domain/user/user-role.schema";

/**
 * Application-layer session token claims.
 *
 * This represents the application's view of session data after it has been
 * decoded and validated from the infrastructure transport (e.g., JWT).
 */
export type SessionTokenClaimsDto = {
  /** Expiration time (UNIX timestamp in seconds) */
  readonly exp: number;
  /** Issued-at time (UNIX timestamp in seconds) */
  readonly iat: number;
  /** JWT ID (unique token identifier) */
  readonly jti: string;
  /** Not-before time (UNIX timestamp in seconds) */
  readonly nbf: number;
  /** User role - strongly typed for application layer */
  readonly role: UserRole;
  /** Session ID (stable identifier for the session) */
  readonly sid: string;
  /** Subject: User identifier (UUID string) */
  readonly sub: string;
};
