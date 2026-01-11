import "server-only";

import type { SessionTokenClaims } from "@/modules/auth/application/dtos/session-token.claims";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

/**
 * Codec for encoding/decoding session tokens.
 *
 * All timestamps are in UNIX seconds.
 */
export interface SessionTokenCodecContract {
  decode(token: string): Promise<Result<SessionTokenClaims, AppError>>;
  encode(
    claims: SessionTokenClaims,
    expiresAtSec: number,
  ): Promise<Result<string, AppError>>;
}
