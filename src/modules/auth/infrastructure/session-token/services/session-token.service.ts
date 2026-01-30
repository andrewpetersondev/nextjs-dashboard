import "server-only";
import type { SessionTokenCodecContract } from "@/modules/auth/application/contracts/session-token-codec.contract";
import type { SessionTokenServiceContract } from "@/modules/auth/application/contracts/session-token-service.contract";
import type { IssueRotatedTokenRequestDto } from "@/modules/auth/application/dtos/issue-rotated-token-request.dto";
import type { IssuedTokenDto } from "@/modules/auth/application/dtos/issue-token.dto";
import type { IssueTokenRequestDto } from "@/modules/auth/application/dtos/issue-token-request.dto";
import type { SessionTokenClaimsDto } from "@/modules/auth/application/dtos/session-token-claims.dto";
import { toSessionTokenClaimsDto } from "@/modules/auth/application/mappers/to-session-token-claims-dto.mapper";
import { SessionTokenClaimsSchema } from "@/modules/auth/application/schemas/session-token-claims.schema";
import { SESSION_DURATION_SEC } from "@/modules/auth/domain/constants/session-config.constants";
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
 *
 * @implements {SessionTokenServiceContract}
 */
export class SessionTokenService implements SessionTokenServiceContract {
  private readonly codec: SessionTokenCodecContract;

  /**
   * Initializes the session token service.
   *
   * @param codec - The codec used for encoding and decoding tokens.
   */
  constructor(codec: SessionTokenCodecContract) {
    this.codec = codec;
  }

  /**
   * Decodes a token and returns the application-level claims.
   *
   * @remarks
   * Canonical path: decode/verify via codec, then validate via this service
   * so all consumers get consistent schema + error behavior.
   *
   * @param token - The token to decode.
   * @returns A promise resolving to a {@link Result} containing the decoded claims or an {@link AppError}.
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
   *
   * @remarks
   * This method generates unique identifiers for the session (sid) and the token (jti),
   * sets the issued-at (iat) and expiration (exp) times, and encodes the claims into a token string.
   *
   * @param input - The request containing user data for the token.
   * @returns A promise resolving to a {@link Result} containing the {@link IssuedTokenDto} (token + expiration) or an {@link AppError}.
   */
  async issue(
    input: IssueTokenRequestDto,
  ): Promise<Result<IssuedTokenDto, AppError>> {
    const nowSec = nowInSeconds();
    const expiresAtSec = nowSec + SESSION_DURATION_SEC;

    const sid = crypto.randomUUID();
    const jti = crypto.randomUUID();

    const claims = toSessionTokenClaimsDto(input, {
      exp: expiresAtSec,
      iat: nowSec,
      jti,
      sid,
    });

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
   * Issues a rotated session token.
   *
   * @param input - The request containing existing session data for rotation.
   * @returns A promise resolving to a {@link Result} containing the issued token DTO or an {@link AppError}.
   */
  async issueRotated(
    input: IssueRotatedTokenRequestDto,
  ): Promise<Result<IssuedTokenDto, AppError>> {
    const nowSec = nowInSeconds();
    const expiresAtSec = nowSec + SESSION_DURATION_SEC;

    const jti = crypto.randomUUID();

    const claims = toSessionTokenClaimsDto(
      { role: input.role, userId: input.userId },
      {
        exp: expiresAtSec,
        iat: nowSec,
        jti,
        sid: input.sid,
      },
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
   * Validates decoded claims against the session token claims schema.
   *
   * @param claims - The claims to validate.
   * @returns A promise resolving to a {@link Result} containing the validated claims DTO or an {@link AppError}.
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
