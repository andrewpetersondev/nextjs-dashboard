import "server-only";
import { type JWTPayload, jwtVerify, SignJWT } from "jose";
import {
  JWT_ALG_HS256,
  JWT_TYP_JWT,
  MIN_HS256_KEY_LENGTH,
} from "@/modules/auth/infrastructure/session/config/session-jwt.constants";
import { SESSION_TOKEN_CLOCK_TOLERANCE_SEC } from "@/modules/auth/infrastructure/session/config/session-token.constants";
import type { SessionJwtCryptoStrategy } from "@/modules/auth/infrastructure/session/strategies/session-jwt-crypto.strategy";
import type { SessionJwtClaimsTransport } from "@/modules/auth/infrastructure/session/types/session-jwt-claims.transport";
import type { SessionJwtVerifyOptionsTransport } from "@/modules/auth/infrastructure/session/types/session-jwt-verify-options.transport";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import { makeUnexpectedError } from "@/shared/core/errors/factories/app-error.factory";
import { Err, Ok } from "@/shared/core/results/result";
import type { Result } from "@/shared/core/results/result.types";
import type { LoggingClientContract } from "@/shared/telemetry/logging/core/logging-client.contract";

const encoder: TextEncoder = new TextEncoder();

/**
 * Jose-specific implementation of JWT signing and verification.
 * Handles jose library mechanics, key management, and verification options.
 *
 * Responsibility: "How" to sign/verify JWTs using the jose library.
 *
 * @implements {SessionJwtCryptoStrategy}
 */
export class JoseSessionJwtCryptoService implements SessionJwtCryptoStrategy {
  private readonly audience: string | undefined;
  private readonly encodedKey: Uint8Array;
  private readonly issuer: string | undefined;
  private readonly logger: LoggingClientContract;
  private readonly verifyOptions: SessionJwtVerifyOptionsTransport;

  /**
   * Initializes the jose session JWT crypto service.
   *
   * @param logger - The logging client.
   * @param secret - The secret key for signing and verification.
   * @param issuer - The expected issuer of the token.
   * @param audience - The expected audience of the token.
   */
  constructor(
    logger: LoggingClientContract,
    secret: string,
    issuer?: string,
    audience?: string,
  ) {
    this.logger = logger;
    this.encodedKey = this.initializeKey(secret);
    this.issuer = issuer;
    this.audience = audience;
    this.verifyOptions = this.buildVerifyOptions(issuer, audience);
  }

  /**
   * Signs a set of claims into a JWT.
   *
   * @param claims - The claims to sign.
   * @returns A promise resolving to a {@link Result} containing the signed JWT or an {@link AppError}.
   */
  async sign(
    claims: SessionJwtClaimsTransport,
  ): Promise<Result<string, AppError>> {
    try {
      let signer = new SignJWT(claims satisfies JWTPayload)
        .setProtectedHeader({ alg: JWT_ALG_HS256, typ: JWT_TYP_JWT })
        .setIssuedAt(claims.iat)
        .setExpirationTime(claims.exp);

      if (this.issuer) {
        signer = signer.setIssuer(this.issuer);
      }
      if (this.audience) {
        signer = signer.setAudience(this.audience);
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
          overrideMetadata: { expiresAtSec: claims.exp },
        }),
      );
    }
  }

  /**
   * Verifies a JWT and extracts its claims.
   *
   * @param token - The JWT token to verify.
   * @returns A promise resolving to a {@link Result} containing the verified claims or an {@link AppError}.
   */
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
          overrideMetadata: {},
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
      clockTolerance: SESSION_TOKEN_CLOCK_TOLERANCE_SEC,
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
