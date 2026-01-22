import type { SessionJwtClaimsTransport } from "@/modules/auth/infrastructure/jwt/types/session-jwt-claims.transport";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

/**
 * Strategy for JWT token operations.
 * Decouples "what we do" (encode/decode tokens) from "how we do it" (jose, algorithms, etc).
 *
 * Clean Architecture: Infrastructure contract for JWT implementation details.
 *
 * TODO: is this an infrastructure contract or an application contract?
 */
export interface SessionJwtCryptoContract {
  sign(claims: SessionJwtClaimsTransport): Promise<Result<string, AppError>>;
  verify(token: string): Promise<Result<SessionJwtClaimsTransport, AppError>>;
}
