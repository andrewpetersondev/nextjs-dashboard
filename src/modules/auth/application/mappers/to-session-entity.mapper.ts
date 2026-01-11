import type { SessionTokenClaims } from "@/modules/auth/application/dtos/session-token.claims";
import type { SessionEntity } from "@/modules/auth/domain/entities/session.entity";
import { userIdCodec } from "@/modules/auth/domain/schemas/auth-session.schema";

export function toSessionEntity(
  tokenClaims: SessionTokenClaims,
): SessionEntity {
  return {
    expiresAt: tokenClaims.exp,
    issuedAt: tokenClaims.iat,
    role: tokenClaims.role,
    sessionStart: tokenClaims.sessionStart,
    userId: userIdCodec.decode(tokenClaims.userId),
  };
}
