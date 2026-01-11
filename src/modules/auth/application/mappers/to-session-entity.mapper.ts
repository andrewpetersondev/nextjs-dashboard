import type { SessionTokenClaims } from "@/modules/auth/application/dtos/session-token.claims";
import type { SessionEntity } from "@/modules/auth/domain/entities/session.entity";
import { userIdCodec } from "@/modules/auth/domain/schemas/auth-session.schema";

/**
 * Maps JWT token claims to SessionEntity.
 *
 * Converts infrastructure JWT claims to domain entity:
 * - Decodes userId from string to branded UserId
 * - All timestamps remain in seconds (JWT standard)
 */
export function toSessionEntity(
  tokenClaims: SessionTokenClaims,
): SessionEntity {
  return {
    expiresAt: tokenClaims.expiresAt,
    issuedAt: tokenClaims.iat,
    role: tokenClaims.role,
    sessionStart: tokenClaims.sessionStart,
    userId: userIdCodec.decode(tokenClaims.userId),
  };
}
