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
  /**
   * Decodes an encoded session token into its constituent claims.
   *
   * @param token - The encoded session token string.
   * @returns A Result containing the decoded session token claims or an AppError.
   */
  decode(token: string): Promise<Result<SessionTokenClaimsDto, AppError>>;

  /**
   * Encodes session token claims into a secure token string.
   *
   * @param claims - The session token claims to encode.
   * @returns A Result containing the encoded token string or an AppError.
   */
  encode(claims: SessionTokenClaimsDto): Promise<Result<string, AppError>>;
}
