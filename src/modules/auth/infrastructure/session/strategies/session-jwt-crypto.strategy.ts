import type { SessionJwtClaimsTransport } from "@/modules/auth/infrastructure/session/types/session-jwt-claims.transport";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

/**
 * Strategy for JWT signing and verification.
 * Decouples "what we do" (sign/verify tokens) from "how we do it" (jose, algorithms, key handling).
 *
 * Clean Architecture: Infrastructure seam for swapping JWT implementations without affecting
 * application-facing token contracts.
 */
export interface SessionJwtCryptoStrategy {
  /**
   * Signs a set of claims into a JWT string.
   *
   * @param claims - The JWT claims to sign.
   * @returns A promise resolving to a {@link Result} containing the signed JWT or an {@link AppError}.
   */
  sign(claims: SessionJwtClaimsTransport): Promise<Result<string, AppError>>;

  /**
   * Verifies a JWT string and returns its claims.
   *
   * @param token - The JWT token to verify.
   * @returns A promise resolving to a {@link Result} containing the verified claims or an {@link AppError}.
   */
  verify(token: string): Promise<Result<SessionJwtClaimsTransport, AppError>>;
}
