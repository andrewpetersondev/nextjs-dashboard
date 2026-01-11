import "server-only";

import type { SessionJwtClaims } from "@/modules/auth/infrastructure/serialization/session-jwt.claims";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

/**
 * Codec for encoding/decoding session tokens.
 *
 * Works with infrastructure-level JWT claims (sub, iat, exp).
 * All timestamps are in UNIX seconds.
 */
export interface SessionTokenCodecContract {
  decode(token: string): Promise<Result<SessionJwtClaims, AppError>>;
  encode(
    claims: SessionJwtClaims,
    expiresAtSec: number,
  ): Promise<Result<string, AppError>>;
}
