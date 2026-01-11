import "server-only";

import type { IssueTokenRequestDto } from "@/modules/auth/application/dtos/issue-token-request.dto";
import { userIdCodec } from "@/modules/auth/domain/schemas/auth-session.schema";
import type { SessionJwtClaims } from "@/modules/auth/infrastructure/serialization/session-jwt.claims";

/**
 * Maps an IssueTokenRequestDto to JWT claims for encoding.
 *
 * Infrastructure mapper: Prepares domain data for JWT serialization.
 * Includes role as a denormalized cached value for performance.
 *
 * @param input - Token request with branded UserId and role
 * @param expiresAtSec - Expiration timestamp in seconds
 * @param iatSec - Issued-at timestamp in seconds
 * @returns JWT claims ready for JOSE encoding
 */
export function toJwtClaims(
  input: IssueTokenRequestDto,
  expiresAtSec: number,
  iatSec: number,
): SessionJwtClaims {
  return {
    exp: expiresAtSec,
    iat: iatSec,
    role: input.role,
    sub: userIdCodec.encode(input.userId),
  };
}
