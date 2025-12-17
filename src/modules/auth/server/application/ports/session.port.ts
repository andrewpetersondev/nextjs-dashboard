import "server-only";

import type { AuthEncryptPayload } from "@/modules/auth/shared/domain/session/session.codec";
import type { AppError } from "@/shared/errors/core/app-error";
import type { Result } from "@/shared/result/result.types";

export interface SessionPort {
  delete(): Promise<void>;
  get(): Promise<string | undefined>;
  set(value: string, expiresAtMs: number): Promise<void>;
}

export interface SessionTokenCodecPort {
  decode(token: string): Promise<Result<AuthEncryptPayload, AppError>>;
  encode(
    claims: AuthEncryptPayload,
    expiresAtMs: number,
  ): Promise<Result<string, AppError>>;
}
