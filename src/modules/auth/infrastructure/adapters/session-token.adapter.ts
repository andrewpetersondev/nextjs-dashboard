import "server-only";

import type { SessionTokenCodecContract } from "@/modules/auth/application/contracts/session-token-codec.contract";
import type { SessionTokenServiceContract } from "@/modules/auth/application/contracts/session-token-service.contract";
import type { IssuedTokenDto } from "@/modules/auth/application/dtos/issue-token.dto";
import type { IssueTokenRequestDto } from "@/modules/auth/application/dtos/issue-token-request.dto";
import type { SessionTokenClaims } from "@/modules/auth/application/dtos/session-token.claims";
import { SESSION_DURATION_SEC } from "@/modules/auth/domain/policies/session.policy";
import { DecryptPayloadSchema } from "@/modules/auth/domain/schemas/auth-session.schema";
import { createSessionJwtAdapter } from "@/modules/auth/infrastructure/adapters/session-jwt.adapter";
import { toJwtClaims } from "@/modules/auth/infrastructure/mappers/to-jwt-claims.mapper";
import { toSessionTokenClaims } from "@/modules/auth/infrastructure/mappers/to-session-token-claims.mapper";
import {
  nowInSeconds,
  secondsToMilliseconds,
} from "@/shared/constants/time.constants";
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
  async issue(
    input: IssueTokenRequestDto,
  ): Promise<Result<IssuedTokenDto, AppError>> {
    const nowSec = nowInSeconds();
    const expiresAtSec = nowSec + SESSION_DURATION_SEC;

    const jwtClaims = toJwtClaims(input, expiresAtSec, nowSec);

    const encodedResult = await this.codec.encode(jwtClaims, expiresAtSec);

    if (!encodedResult.ok) {
      return Err(encodedResult.error);
    }

    return Ok({
      expiresAtMs: secondsToMilliseconds(expiresAtSec),
      token: encodedResult.value,
    });
  }

  /**
   * Decodes a token and returns the raw payload.
   */
  async decode(token: string): Promise<Result<SessionTokenClaims, AppError>> {
    const result = await this.codec.decode(token);
    if (!result.ok) {
      return result;
    }
    return toSessionTokenClaims(result.value);
  }

  /**
   * Validates decoded claims against the schema.
   *
   * todo: why is this not an async function?
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

    return toSessionTokenClaims(parsed.data);
  }
}

/**
 * Factory function for creating SessionTokenAdapter instances.
 */
export function createSessionTokenAdapter(): SessionTokenServiceContract {
  return new SessionTokenAdapter(createSessionJwtAdapter());
}
