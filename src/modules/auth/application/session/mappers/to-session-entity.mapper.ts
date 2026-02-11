import type { SessionTokenClaimsDto } from "@/modules/auth/application/session/dtos/responses/session-token-claims.dto";
import type { SessionEntity } from "@/modules/auth/domain/session/entities/session.entity";
import { toUnixSeconds } from "@/modules/auth/domain/session/value-objects/time.value";
import { UserIdSchema } from "@/shared/validation/user-id/user-id.schema";

/**
 * Maps session token claims to a session domain entity.
 *
 * This function converts the application-layer claims DTO (typically decoded from a JWT)
 * into a branded domain entity, handling the decoding of identifiers.
 *
 * @remarks
 * This mapping intentionally keeps only domain-relevant session state.
 * Token-specific claims like `sid` and `jti` are not part of `SessionEntity`.
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
