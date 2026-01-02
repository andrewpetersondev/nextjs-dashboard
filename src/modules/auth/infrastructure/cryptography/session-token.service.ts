import "server-only";

import type { SessionTokenCodecContract } from "@/modules/auth/application/contracts/session-token-codec.contract";
import {
  ONE_SECOND_MS,
  SESSION_DURATION_MS,
} from "@/modules/auth/domain/policies/session.policy";
import { DecryptPayloadSchema } from "@/modules/auth/domain/schemas/session.schemas";
import type { AuthEncryptPayload } from "@/modules/auth/infrastructure/serialization/session.codec";
import type { UserId } from "@/shared/branding/brands";
import type { UserRole } from "@/shared/domain/user/user-role.types";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

export type IssueTokenInput = Readonly<{
  role: UserRole;
  sessionStart: number;
  userId: UserId;
}>;

export type IssuedToken = Readonly<{
  expiresAtMs: number;
  token: string;
}>;

/**
 * Handles token-specific operations (encode, decode, validate).
 * Separates crypto/JWT concerns from session lifecycle.
 */
export class SessionTokenService {
  private readonly codec: SessionTokenCodecContract;

  constructor(codec: SessionTokenCodecContract) {
    this.codec = codec;
  }

  /**
   * Issues a new session token with the provided claims.
   */
  async issue(input: IssueTokenInput): Promise<Result<IssuedToken, AppError>> {
    const now = Date.now();
    const expiresAtMs = now + SESSION_DURATION_MS;

    const claims: AuthEncryptPayload = {
      exp: Math.floor(expiresAtMs / ONE_SECOND_MS),
      expiresAt: expiresAtMs,
      iat: Math.floor(now / ONE_SECOND_MS),
      role: input.role,
      sessionStart: input.sessionStart,
      userId: input.userId,
    };

    const encodedResult = await this.codec.encode(claims, expiresAtMs);

    if (!encodedResult.ok) {
      return Err(encodedResult.error);
    }

    return Ok({ expiresAtMs, token: encodedResult.value });
  }

  /**
   * Decodes a token and returns the raw payload.
   */
  decode(token: string): Promise<Result<AuthEncryptPayload, AppError>> {
    return this.codec.decode(token);
  }

  /**
   * Validates decoded claims against the schema.
   */
  validate(claims: unknown): Result<AuthEncryptPayload, AppError> {
    const parsed = DecryptPayloadSchema.safeParse(claims);

    if (!parsed.success) {
      return Err(
        makeAppError(APP_ERROR_KEYS.validation, {
          cause: parsed.error,
          message: "session.claims.invalid",
          metadata: {},
        }),
      );
    }

    return Ok(parsed.data);
  }
}
