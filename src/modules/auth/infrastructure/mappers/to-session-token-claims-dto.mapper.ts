import "server-only";

import type { IssueTokenRequestDto } from "@/modules/auth/application/dtos/issue-token-request.dto";
import type { SessionTokenClaimsDto } from "@/modules/auth/application/dtos/session-token-claims.dto";
import { userIdTransformer } from "@/modules/auth/application/schemas/session-token-claims.schema";
import type { SessionJwtClaimsTransport } from "@/modules/auth/infrastructure/types/session-jwt-claims.transport";
import type { UserRole } from "@/shared/domain/user/user-role.types";

/**
 * Maps a token issuance request to the application-level claims DTO.
 * Encapsulates the transformation of branded types to transport strings.
 */
export function toSessionTokenClaimsDtoFromRequest(
  input: IssueTokenRequestDto,
  iat: number,
  exp: number,
): SessionTokenClaimsDto {
  return {
    exp,
    iat,
    role: input.role,
    sub: userIdTransformer.encode(input.userId),
  };
}

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
