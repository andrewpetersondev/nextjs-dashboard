import "server-only";
import type { SessionTokenCodecContract } from "@/modules/auth/application/session/contracts/session-token-codec.contract";
import type { SessionTokenServiceContract } from "@/modules/auth/application/session/contracts/session-token-service.contract";
import type { IssueRotatedTokenRequestDto } from "@/modules/auth/application/session/dtos/requests/issue-rotated-token-request.dto";
import type { IssueTokenRequestDto } from "@/modules/auth/application/session/dtos/requests/issue-token-request.dto";
import type { IssuedTokenDto } from "@/modules/auth/application/session/dtos/responses/issue-token.dto";
import type { SessionTokenClaimsDto } from "@/modules/auth/application/session/dtos/responses/session-token-claims.dto";
import { toSessionTokenClaimsDto } from "@/modules/auth/application/session/mappers/to-session-token-claims-dto.mapper";
import { SessionTokenClaimsSchema } from "@/modules/auth/application/session/schemas/session-token-claims.schema";
import { SESSION_DURATION_SEC } from "@/modules/auth/domain/shared/constants/session-config.constants";
import { SESSION_TOKEN_CLOCK_TOLERANCE_SEC } from "@/modules/auth/infrastructure/session/config/session-token.constants";
import { jwtToSessionTokenClaimsDto } from "@/modules/auth/infrastructure/session/mappers/jwt-to-session-token-claims-dto.mapper";
import {
  nowInSeconds,
  secondsToMilliseconds,
} from "@/shared/constants/time.constants";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

function validateSessionTokenClaimsSemantics(
  claims: Readonly<{ exp: number; iat: number; nbf: number }>,
  nowSec: number,
): Result<void, AppError> {
  // These checks are intentionally *not* part of the Zod schema so we can
  // distinguish schema-shape failures from semantic/time-window failures.
  if (claims.iat > nowSec + SESSION_TOKEN_CLOCK_TOLERANCE_SEC) {
    return Err(
      makeAppError(APP_ERROR_KEYS.validation, {
        cause: "iat_in_future",
        message: "session.claims.invalid_semantics",
        metadata: { policy: "session", reason: "iat_in_future" },
      }),
    );
  }

  if (claims.nbf > nowSec + SESSION_TOKEN_CLOCK_TOLERANCE_SEC) {
    return Err(
      makeAppError(APP_ERROR_KEYS.validation, {
        cause: "nbf_in_future",
        message: "session.claims.invalid_semantics",
        metadata: { policy: "session", reason: "nbf_in_future" },
      }),
    );
  }

  if (claims.exp <= claims.iat) {
    return Err(
      makeAppError(APP_ERROR_KEYS.validation, {
        cause: "exp_before_iat",
        message: "session.claims.invalid_semantics",
        metadata: { policy: "session", reason: "exp_before_iat" },
      }),
    );
  }

  if (claims.nbf > claims.exp) {
    return Err(
      makeAppError(APP_ERROR_KEYS.validation, {
        cause: "nbf_after_exp",
        message: "session.claims.invalid_semantics",
        metadata: { policy: "session", reason: "nbf_after_exp" },
      }),
    );
  }

  if (claims.nbf > claims.iat) {
    return Err(
      makeAppError(APP_ERROR_KEYS.validation, {
        cause: "nbf_after_iat",
        message: "session.claims.invalid_semantics",
        metadata: { policy: "session", reason: "nbf_after_iat" },
      }),
    );
  }

  return Ok(undefined);
}

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
   * Decodes and cryptographically verifies a token.
   *
   * @remarks
   * Contract: this returns decoded-but-untrusted payload. Call `validate()` to
   * enforce schema/invariants and obtain application-level claims.
   *
   * @param token - The token to decode.
   * @returns A promise resolving to a {@link Result} containing the decoded payload or an {@link AppError}.
   */
  async decode(token: string): Promise<Result<unknown, AppError>> {
    return await this.codec.decode(token);
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
          message: "session.claims.invalid_schema",
          metadata: { policy: "session", reason: "invalid_schema" },
        }),
      );
    }

    const nowSec = nowInSeconds();
    const semanticValidation = validateSessionTokenClaimsSemantics(
      {
        exp: parsed.data.exp,
        iat: parsed.data.iat,
        nbf: parsed.data.nbf,
      },
      nowSec,
    );

    if (!semanticValidation.ok) {
      return Err(semanticValidation.error);
    }

    return Ok(jwtToSessionTokenClaimsDto(parsed.data));
  }
}
