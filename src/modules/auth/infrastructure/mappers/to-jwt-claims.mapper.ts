import "server-only";

import type { IssueTokenRequestDto } from "@/modules/auth/application/dtos/issue-token-request.dto";
import { userIdCodec } from "@/modules/auth/domain/schemas/auth-session.schema";
import type { SessionJwtClaims } from "@/modules/auth/infrastructure/serialization/session-jwt-claims.schema";
import type { UserRole } from "@/shared/domain/user/user-role.types";

/**
 * Maps an IssueTokenRequestDto to JWT claims for encoding.
 *
 * Infrastructure mapper: Prepares domain data for JWT serialization.
 *
 * @param input - Token request with branded UserId
 * @param expiresAtSec - Expiration timestamp in seconds
 * @param iatSec - Issued-at timestamp in seconds
 * @returns JWT claims ready for JOSE encoding
 */
export function toJwtClaims(
  input: IssueTokenRequestDto,
  expiresAtSec: number,
  iatSec: number,
): SessionJwtClaims<UserRole> {
  return {
    expiresAt: expiresAtSec,
    iat: iatSec,
    role: input.role,
    sessionStart: input.sessionStart,
    userId: userIdCodec.encode(input.userId),
  };
}
