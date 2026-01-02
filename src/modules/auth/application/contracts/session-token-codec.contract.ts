import "server-only";

import type { AuthEncryptPayload } from "@/modules/auth/infrastructure/serialization/session.codec";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

export interface SessionTokenCodecContract {
  decode(token: string): Promise<Result<AuthEncryptPayload, AppError>>;
  encode(
    claims: AuthEncryptPayload,
    expiresAtMs: number,
  ): Promise<Result<string, AppError>>;
}
