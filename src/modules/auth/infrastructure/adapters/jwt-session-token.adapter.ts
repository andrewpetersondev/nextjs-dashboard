import "server-only";

import type { SessionTokenCodecContract } from "@/modules/auth/application/contracts/session-token-codec.contract";
import type { SessionTokenServiceContract } from "@/modules/auth/application/contracts/session-token-service.contract";
import type { IssuedTokenDto } from "@/modules/auth/application/dtos/issue-token.dto";
import type { IssueTokenRequestDto } from "@/modules/auth/application/dtos/issue-token-request.dto";
import type { SessionTokenClaimsDto } from "@/modules/auth/application/dtos/session-token-claims.dto";
import {
  SessionTokenClaimsSchema,
  userIdCodec,
} from "@/modules/auth/application/schemas/session-token-claims.schema";
import { SESSION_DURATION_SEC } from "@/modules/auth/domain/policies/session.policy";
import { createJoseSessionTokenCodecAdapter } from "@/modules/auth/infrastructure/adapters/jose-session-token-codec.adapter";
import { toSessionTokenClaimsDto } from "@/modules/auth/infrastructure/mappers/to-session-token-claims-dto.mapper";
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
export class JwtSessionTokenAdapter implements SessionTokenServiceContract {
  private readonly codec: SessionTokenCodecContract;

  constructor(codec: SessionTokenCodecContract) {
    this.codec = codec;
  }

  /**
   * Decodes a token and returns the application-level claims.
   */
  async decode(
    token: string,
  ): Promise<Result<SessionTokenClaimsDto, AppError>> {
    // Implementation now satisfies the contract directly
    return await this.codec.decode(token);
  }

  /**
   * Issues a new session token with the provided claims.
   */
  async issue(
    input: IssueTokenRequestDto,
  ): Promise<Result<IssuedTokenDto, AppError>> {
    const nowSec = nowInSeconds();
    const expiresAtSec = nowSec + SESSION_DURATION_SEC;

    // Use a mapper to create the Application DTO first
    const claims: SessionTokenClaimsDto = {
      exp: expiresAtSec,
      iat: nowSec,
      role: input.role,
      sub: userIdCodec.encode(input.userId),
    };

    // TODO: .encode() should only accept claims parameter. the expiresAtSec parameter is redundant since exp is in the
    // claim
    const encodedResult = await this.codec.encode(claims, expiresAtSec);

    if (!encodedResult.ok) {
      return Err(encodedResult.error);
    }

    return Ok({
      expiresAtMs: secondsToMilliseconds(expiresAtSec),
      token: encodedResult.value,
    });
  }

  /**
   * Validates decoded claims against the schema.
   */
  // biome-ignore lint/suspicious/useAwait: keep it as async to unify contracts
  async validate(
    claims: unknown,
  ): Promise<Result<SessionTokenClaimsDto, AppError>> {
    const parsed = SessionTokenClaimsSchema.safeParse(claims);

    if (!parsed.success) {
      return Err(
        makeAppError(APP_ERROR_KEYS.validation, {
          cause: parsed.error,
          message: "session.claims.invalid",
          metadata: {},
        }),
      );
    }

    return toSessionTokenClaimsDto(parsed.data);
  }
}

/**
 * Factory function for creating JwtSessionTokenAdapter instances.
 */
export function createJwtSessionTokenAdapter(): SessionTokenServiceContract {
  return new JwtSessionTokenAdapter(createJoseSessionTokenCodecAdapter());
}
