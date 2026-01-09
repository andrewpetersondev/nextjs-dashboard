import "server-only";

import type { SessionTokenCodecContract } from "@/modules/auth/application/contracts/session-token-codec.contract";
import type { SessionTokenServiceContract } from "@/modules/auth/application/contracts/session-token-service.contract";
import type {
  IssuedToken,
  IssueTokenInput,
} from "@/modules/auth/application/dtos/issue-token.dto";
import type { SessionTokenClaims } from "@/modules/auth/application/dtos/session-token.claims";
import {
  makeSessionClaimsPolicy,
  SESSION_DURATION_MS,
} from "@/modules/auth/domain/policies/session.policy";
import { DecryptPayloadSchema } from "@/modules/auth/domain/schemas/auth-session.schema";
import { createSessionJwtAdapter } from "@/modules/auth/infrastructure/adapters/session-jwt.adapter";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * Handles token-specific operations (encode, decode, validate).
 * Separates crypto/JWT concerns from session lifecycle.
 */
export class SessionTokenAdapter implements SessionTokenServiceContract {
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

    const claims = makeSessionClaimsPolicy({
      expiresAtMs,
      iatMs: now,
      role: input.role,
      sessionStart: input.sessionStart,
      userId: input.userId,
    });

    const encodedResult = await this.codec.encode(claims, expiresAtMs);

    if (!encodedResult.ok) {
      return Err(encodedResult.error);
    }

    return Ok({ expiresAtMs, token: encodedResult.value });
  }

  /**
   * Decodes a token and returns the raw payload.
   */
  decode(token: string): Promise<Result<SessionTokenClaims, AppError>> {
    return this.codec.decode(token);
  }

  /**
   * Validates decoded claims against the schema.
   */
  validate(claims: unknown): Result<SessionTokenClaims, AppError> {
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

/**
 * Factory function for creating SessionTokenAdapter instances.
 */
export function createSessionTokenAdapter(): SessionTokenServiceContract {
  return new SessionTokenAdapter(createSessionJwtAdapter());
}
