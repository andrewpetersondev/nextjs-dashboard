import "server-only";
import type { SessionTokenClaimsDto } from "@/modules/auth/application/session/dtos/responses/session-token-claims.dto";
import type { SessionJwtClaimsTransport } from "@/modules/auth/infrastructure/session/types/session-jwt-claims.transport";
import type { UserRole } from "@/shared/policies/user-role/user-role.constants";

/**
 * Converts infrastructure JWT claims to application-layer session token claims DTO.
 *
 * This mapper bridges infrastructure (JWT with role as string) and application
 * layers (SessionTokenClaims with role as {@link UserRole} enum).
 *
 * It also resolves the one optional claim: `auth_time` is absent on tokens issued
 * before the absolute-ceiling work, so it falls back to `iat`. That keeps live
 * sessions valid across the deploy, and the claim pins itself on their next
 * rotation (rotation carries `authTime` forward verbatim).
 *
 * @param jwtClaims - Raw JWT claims from token decode.
 * @returns Application-layer session token claims DTO.
 */
export function jwtToSessionTokenClaimsDto(
	jwtClaims: SessionJwtClaimsTransport,
): SessionTokenClaimsDto {
	return {
		authTime: jwtClaims.auth_time ?? jwtClaims.iat,
		exp: jwtClaims.exp,
		iat: jwtClaims.iat,
		jti: jwtClaims.jti,
		nbf: jwtClaims.nbf,
		role: jwtClaims.role as UserRole,
		sid: jwtClaims.sid,
		sub: jwtClaims.sub,
	};
}
