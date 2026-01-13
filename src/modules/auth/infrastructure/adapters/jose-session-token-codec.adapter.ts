import "server-only";
import { type JWTPayload, jwtVerify, SignJWT } from "jose";
import type { SessionTokenCodecContract } from "@/modules/auth/application/contracts/session-token-codec.contract";
import type { SessionTokenClaimsDto } from "@/modules/auth/application/dtos/session-token-claims.dto";
import { SessionTokenClaimsSchema } from "@/modules/auth/application/schemas/session-token-claims.schema";
import {
  CLOCK_TOLERANCE_SEC,
  JWT_ALG_HS256,
  JWT_TYP_JWT,
  MIN_HS256_KEY_LENGTH,
} from "@/modules/auth/infrastructure/constants/session-jwt.constants";
import { toSessionTokenClaimsDto } from "@/modules/auth/infrastructure/mappers/to-session-token-claims-dto.mapper";
import type { SessionJwtClaimsTransport } from "@/modules/auth/infrastructure/types/session-jwt-claims.transport";
import type { SessionJwtVerifyOptionsTransport } from "@/modules/auth/infrastructure/types/session-jwt-verify-options.transport";
import { SESSION_AUDIENCE, SESSION_ISSUER } from "@/server/config/env-server";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeUnexpectedError } from "@/shared/errors/factories/app-error.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

const encoder: Readonly<{ encode: (s: string) => Uint8Array }> =
  new TextEncoder();

/**
 * Adapter for encoding and decoding session JWTs.
 * Uses HS256 algorithm with configured secret, issuer, and audience.
 *
 * Key features:
 * - Validates secret strength on initialization
 * - Caches encoded key and verify options for performance
 * - Handles both expected and unexpected JWT errors gracefully
 */
export class JoseSessionTokenCodecAdapter implements SessionTokenCodecContract {
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

  private initializeKey(secret: string): Uint8Array {
    if (secret.length < MIN_HS256_KEY_LENGTH) {
      throw new Error("Weak SESSION_SECRET: must be at least 32 characters");
    }
    return encoder.encode(secret);
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

  /**
   * Decodes and verifies a JWT token.
   *
   * @param token - The JWT token string to decode
   * @returns `Ok(payload)` if verification succeeds, `Err(appError)` otherwise
   */
  async decode(
    token: string,
  ): Promise<Result<SessionTokenClaimsDto, AppError>> {
    try {
      const { payload } = await jwtVerify<SessionJwtClaimsTransport>(
        token,
        this.encodedKey,
        this.verifyOptions,
      );

      const parsed = SessionTokenClaimsSchema.safeParse(payload);

      if (!parsed.success) {
        this.logger.warn("JWT payload validation failed", {
          errors: parsed.error.flatten().fieldErrors,
        });

        return Err(
          makeUnexpectedError(parsed.error, {
            message: "jwt.validation.failed",
            metadata: { token: token.slice(0, 10) },
          }),
        );
      }

      // Infrastructure performs the mapping to Application DTO before returning
      return Ok(toSessionTokenClaimsDto(parsed.data));
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

  /**
   * Encodes session claims into a signed JWT.
   *
   * @param claims - The session payload to encode
   * @returns Signed JWT token string
   * @throws Error if signing fails (e.g., invalid claims, crypto errors)
   */
  async encode(
    claims: SessionTokenClaimsDto,
  ): Promise<Result<string, AppError>> {
    try {
      // Map Application DTO -> Infrastructure JWT shape
      const jwtClaims: SessionJwtClaimsTransport = {
        exp: claims.exp,
        iat: claims.iat,
        role: claims.role,
        sub: claims.sub,
      };
      let signer = new SignJWT(jwtClaims satisfies JWTPayload)
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
}
