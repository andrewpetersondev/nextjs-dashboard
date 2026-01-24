import type { SessionJwtClaimsTransport } from "@/modules/auth/infrastructure/session-token/transports/session-jwt-claims.transport";
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
  sign(claims: SessionJwtClaimsTransport): Promise<Result<string, AppError>>;
  verify(token: string): Promise<Result<SessionJwtClaimsTransport, AppError>>;
}
