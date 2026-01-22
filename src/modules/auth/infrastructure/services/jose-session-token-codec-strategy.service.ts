import "server-only";
import { type JWTPayload, jwtVerify, SignJWT } from "jose";
import type { SessionTokenCodecStrategyContract } from "@/modules/auth/application/contracts/session-token-codec-strategy.contract";
import {
  CLOCK_TOLERANCE_SEC,
  JWT_ALG_HS256,
  JWT_TYP_JWT,
  MIN_HS256_KEY_LENGTH,
} from "@/modules/auth/infrastructure/constants/session-jwt.constants";
import type { SessionJwtClaimsTransport } from "@/modules/auth/infrastructure/types/session-jwt-claims.transport";
import type { SessionJwtVerifyOptionsTransport } from "@/modules/auth/infrastructure/types/session-jwt-verify-options.transport";
import { SESSION_AUDIENCE, SESSION_ISSUER } from "@/server/config/env-server";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeUnexpectedError } from "@/shared/errors/factories/app-error.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

const encoder = new TextEncoder();

/**
 * Jose-specific implementation of JWT encoding/decoding.
 * Handles all jose library mechanics, key management, and verification options.
 *
 * Responsibility: "How" to encode/decode using the jose library.
 *
 * BUG: this class accepts `issuer` and `audience` but it also imports and uses `SESSION_ISSUER` and
 * `SESSION_AUDIENCE` indicating a subtle bug and drift.
 */
export class JoseSessionTokenCodecStrategyService
  implements SessionTokenCodecStrategyContract
{
  private readonly encodedKey: Uint8Array;
  private readonly logger: LoggingClientContract;
  private readonly verifyOptions: SessionJwtVerifyOptionsTransport;

  constructor(
    logger: LoggingClientContract,
    secret: string,
    issuer?: string,
    audience?: string,
  ) {
    this.logger = logger;
    this.encodedKey = this.initializeKey(secret);
    this.verifyOptions = this.buildVerifyOptions(issuer, audience);
  }

  async sign(
    claims: SessionJwtClaimsTransport,
  ): Promise<Result<string, AppError>> {
    try {
      let signer = new SignJWT(claims satisfies JWTPayload)
        .setProtectedHeader({ alg: JWT_ALG_HS256, typ: JWT_TYP_JWT })
        .setIssuedAt()
        .setExpirationTime(claims.exp);

      if (SESSION_ISSUER) {
        signer = signer.setIssuer(SESSION_ISSUER);
      }
      if (SESSION_AUDIENCE) {
        signer = signer.setAudience(SESSION_AUDIENCE);
      }
      const token = await signer.sign(this.encodedKey);
      return Ok(token);
    } catch (error: unknown) {
      this.logger.error("JWT signing failed", {
        error: String(error),
      });
      return Err(
        makeUnexpectedError(error, {
          message: "jwt.sign.failed",
          metadata: { expiresAtSec: claims.exp },
        }),
      );
    }
  }

  async verify(
    token: string,
  ): Promise<Result<SessionJwtClaimsTransport, AppError>> {
    try {
      const { payload } = await jwtVerify<SessionJwtClaimsTransport>(
        token,
        this.encodedKey,
        this.verifyOptions,
      );
      return Ok(payload);
    } catch (error: unknown) {
      this.logger.warn("JWT verification failed", {
        error: String(error),
      });
      return Err(
        makeUnexpectedError(error, {
          message: "jwt.verify.failed",
          metadata: {},
        }),
      );
    }
  }

  private buildVerifyOptions(
    issuer?: string,
    audience?: string,
  ): SessionJwtVerifyOptionsTransport {
    return {
      algorithms: [JWT_ALG_HS256],
      ...(audience ? { audience } : {}),
      clockTolerance: CLOCK_TOLERANCE_SEC,
      ...(issuer ? { issuer } : {}),
    };
  }

  private initializeKey(secret: string): Uint8Array {
    if (secret.length < MIN_HS256_KEY_LENGTH) {
      throw new Error("Weak SESSION_SECRET: must be at least 32 characters");
    }
    return encoder.encode(secret);
  }
}
