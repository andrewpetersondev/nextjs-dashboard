import "server-only";
import type { SessionTokenClaimsDto } from "@/modules/auth/application/session/dtos/responses/session-token-claims.dto";
import type { SessionJwtClaimsTransport } from "@/modules/auth/infrastructure/session/types/session-jwt-claims.transport";
import type { UserRole } from "@/shared/domain/user/user-role.schema";

/**
 * Converts infrastructure JWT claims to application-layer session token claims DTO.
 *
 * This mapper bridges infrastructure (JWT with role as string) and application
 * layers (SessionTokenClaims with role as {@link UserRole} enum).
 *
 * @param jwtClaims - Raw JWT claims from token decode.
 * @returns Application-layer session token claims DTO.
 */
export function jwtToSessionTokenClaimsDto(
  jwtClaims: SessionJwtClaimsTransport,
): SessionTokenClaimsDto {
  return {
    exp: jwtClaims.exp,
    iat: jwtClaims.iat,
    jti: jwtClaims.jti,
    nbf: jwtClaims.nbf,
    role: jwtClaims.role as UserRole,
    sid: jwtClaims.sid,
    sub: jwtClaims.sub,
  };
}
