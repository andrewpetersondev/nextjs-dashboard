import "server-only";

import type { SessionTokenClaimsDto } from "@/modules/auth/application/dtos/session-token-claims.dto";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

/**
 * Port for token serialization/deserialization.
 *
 * Clean Architecture: This contract belongs to the Application layer and
 * speaks only in Application DTOs (SessionTokenClaims).
 */
export interface SessionTokenCodecContract {
  decode(token: string): Promise<Result<SessionTokenClaimsDto, AppError>>;
  encode(claims: SessionTokenClaimsDto): Promise<Result<string, AppError>>;
}
