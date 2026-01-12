import "server-only";

import type { UserRole } from "@/shared/domain/user/user-role.types";

// todo: I think SessionPrincipalClaims (domain layer) is sort of mixed up with SessionTokenClaims
//  (application layer) and SessionJwtClaims (infrastructure layer). Maybe I should have a clear mapping between these.

/**
 * Application-layer session token claims.
 *
 * This represents the application's view of session data after it has been
 * decoded and validated from the infrastructure transport (e.g., JWT).
 *
 */
export type SessionTokenClaimsDto = {
  /** Expiration time (UNIX timestamp in seconds) */
  readonly exp: number;
  /** Issued-at time (UNIX timestamp in seconds) */
  readonly iat: number;
  /** User role - strongly typed for application layer */
  readonly role: UserRole;
  /** Subject: User identifier (UUID string) */
  readonly sub: string;
};
