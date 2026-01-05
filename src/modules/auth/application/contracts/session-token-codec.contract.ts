import "server-only";

import type { AuthJwtTransport } from "@/modules/auth/infrastructure/serialization/auth-jwt.transport";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

export interface SessionTokenCodecContract {
  decode(token: string): Promise<Result<AuthJwtTransport, AppError>>;
  encode(
    claims: AuthJwtTransport,
    expiresAtMs: number,
  ): Promise<Result<string, AppError>>;
}
