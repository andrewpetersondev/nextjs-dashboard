import type { SessionTokenClaimsDto } from "@/modules/auth/application/dtos/session-token-claims.dto";
import type { SessionEntity } from "@/modules/auth/domain/entities/session.entity";
import { userIdCodec } from "@/modules/auth/domain/schemas/auth-session.schema";

/**
 * Maps JWT token claims to SessionEntity.
 *
 * Converts infrastructure JWT claims to domain entity:
 * - Decodes userId from `sub` (string) to branded UserId
 * - Maps `exp` to expiresAt
 * - Maps `iat` to issuedAt
 * - All timestamps remain in seconds (JWT standard)
 */
export function toSessionEntity(
  tokenClaims: SessionTokenClaimsDto,
): SessionEntity {
  return {
    expiresAt: tokenClaims.exp,
    issuedAt: tokenClaims.iat,
    role: tokenClaims.role,
    userId: userIdCodec.decode(tokenClaims.sub),
  };
}
