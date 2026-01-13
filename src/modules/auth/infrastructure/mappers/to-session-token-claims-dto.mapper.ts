import "server-only";
import type { SessionTokenClaimsDto } from "@/modules/auth/application/dtos/session-token-claims.dto";
import type { SessionJwtClaimsTransport } from "@/modules/auth/infrastructure/types/session-jwt-claims.transport";
import type { UserRole } from "@/shared/domain/user/user-role.types";

/**
 * Converts infrastructure JWT claims to application-layer session token claims.
 *
 * This mapper bridges infrastructure (JWT with role as string) and application
 * layers (SessionTokenClaims with role as UserRole enum).
 *
 * @param jwtClaims - Raw JWT claims from token decode
 * @returns Application-layer claims
 */
export function toSessionTokenClaimsDto(
  jwtClaims: SessionJwtClaimsTransport,
): SessionTokenClaimsDto {
  return {
    exp: jwtClaims.exp,
    iat: jwtClaims.iat,
    role: jwtClaims.role as UserRole,
    sub: jwtClaims.sub,
  };
}
