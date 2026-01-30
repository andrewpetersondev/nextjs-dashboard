import type { SessionTokenClaimsDto } from "@/modules/auth/application/dtos/session-token-claims.dto";
import { UserIdSchema } from "@/modules/auth/application/schemas/session-token-claims.schema";
import type { SessionEntity } from "@/modules/auth/domain/entities/session.entity";
import { toUnixSeconds } from "@/modules/auth/domain/values/time.value";

/**
 * Maps session token claims to a session domain entity.
 *
 * This function converts the application-layer claims DTO (typically decoded from a JWT)
 * into a branded domain entity, handling the decoding of identifiers.
 *
 * @param tokenClaims - The decoded session token claims.
 * @returns The session domain entity.
 */
export function toSessionEntity(
  tokenClaims: SessionTokenClaimsDto,
): SessionEntity {
  return {
    expiresAt: toUnixSeconds(tokenClaims.exp),
    issuedAt: toUnixSeconds(tokenClaims.iat),
    role: tokenClaims.role,
    userId: UserIdSchema.decode(tokenClaims.sub),
  };
}
