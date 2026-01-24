import "server-only";
import type { SessionTokenCodecContract } from "@/modules/auth/application/contracts/session-token-codec.contract";
import type { SessionTokenServiceContract } from "@/modules/auth/application/contracts/session-token-service.contract";
import type { IssuedTokenDto } from "@/modules/auth/application/dtos/issue-token.dto";
import type { IssueTokenRequestDto } from "@/modules/auth/application/dtos/issue-token-request.dto";
import type { SessionTokenClaimsDto } from "@/modules/auth/application/dtos/session-token-claims.dto";
import { toSessionTokenClaimsDtoFromRequest } from "@/modules/auth/application/mappers/to-session-token-claims-dto-from-request.mapper";
import { SessionTokenClaimsSchema } from "@/modules/auth/application/schemas/session-token-claims.schema";
import { SESSION_DURATION_SEC } from "@/modules/auth/domain/policies/session.policy";
import { jwtToSessionTokenClaimsDto } from "@/modules/auth/infrastructure/session-token/mappers/jwt-to-session-token-claims-dto.mapper";
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
 * Concrete infrastructure implementation of SessionTokenServiceContract.
 *
 * Responsibility: token issuance + validation behavior.
 * Delegates encoding/decoding mechanics to SessionTokenCodecContract.
 */
export class SessionTokenService implements SessionTokenServiceContract {
  private readonly codec: SessionTokenCodecContract;

  constructor(codec: SessionTokenCodecContract) {
    this.codec = codec;
  }

  /**
   * Decodes a token and returns the application-level claims.
   *
   * @remarks
   * Canonical path: decode/verify via codec, then validate via this service
   * so all consumers get consistent schema + error behavior.
   */
  async decode(
    token: string,
  ): Promise<Result<SessionTokenClaimsDto, AppError>> {
    const decodedResult = await this.codec.decode(token);

    if (!decodedResult.ok) {
      return Err(decodedResult.error);
    }

    return await this.validate(decodedResult.value);
  }

  /**
   * Issues a new session token with the provided claims.
   */
  async issue(
    input: IssueTokenRequestDto,
  ): Promise<Result<IssuedTokenDto, AppError>> {
    const nowSec = nowInSeconds();
    const expiresAtSec = nowSec + SESSION_DURATION_SEC;

    const claims = toSessionTokenClaimsDtoFromRequest(
      input,
      nowSec,
      expiresAtSec,
    );

    const encodedResult = await this.codec.encode(claims);

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

    return Ok(jwtToSessionTokenClaimsDto(parsed.data));
  }
}
