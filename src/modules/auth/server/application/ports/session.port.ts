import "server-only";
import type { AuthEncryptPayload } from "@/modules/auth/domain/sessions/session-payload.types";
import type { AppError } from "@/shared/errors/core/app-error.class";
import type { Result } from "@/shared/result/result.types";

export interface SessionPort {
  delete(): Promise<void>;
  get(): Promise<string | undefined>;
  set(value: string, expiresAtMs: number): Promise<void>;
}

export interface SessionTokenCodecPort {
  decode(token: string): Promise<Result<AuthEncryptPayload, AppError>>;
  encode(claims: AuthEncryptPayload, expiresAtMs: number): Promise<string>;
}
