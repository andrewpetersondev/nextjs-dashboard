import type { SessionTokenClaimsDto } from "@/modules/auth/application/session/dtos/responses/session-token-claims.dto";
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
   * Decodes and cryptographically verifies an encoded session token.
   *
   * Contract: this returns the decoded payload as-is (untrusted). Callers must
   * validate/transform it into application-level claims separately.
   *
   * @param token - The encoded session token string.
   * @returns A Result containing the decoded token payload or an AppError.
   */
  decode(token: string): Promise<Result<unknown, AppError>>;

  /**
   * Encodes session token claims into a secure token string.
   *
   * @param claims - The session token claims to encode.
   * @returns A Result containing the encoded token string or an AppError.
   */
  encode(claims: SessionTokenClaimsDto): Promise<Result<string, AppError>>;
}
