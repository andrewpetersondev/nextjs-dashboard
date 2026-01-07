import "server-only";

import { type JWTPayload, jwtVerify, SignJWT } from "jose";
import type { SessionTokenClaims } from "@/modules/auth/application/dtos/session-token.claims";
import { DecryptPayloadSchema } from "@/modules/auth/domain/schemas/auth-session.schema";
import {
  CLOCK_TOLERANCE_SEC,
  JWT_ALG_HS256,
  JWT_TYP_JWT,
  MIN_HS256_KEY_LENGTH,
} from "@/modules/auth/infrastructure/adapters/session-jwt-adapter.constants";
import {
  SESSION_AUDIENCE,
  SESSION_ISSUER,
  SESSION_SECRET,
} from "@/server/config/env-server";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeUnexpectedError } from "@/shared/errors/factories/app-error.factory";
import { logger } from "@/shared/logging/infrastructure/logging.client";
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
export class SessionJwtAdapter {
  private readonly encodedKey: Uint8Array;
  private readonly verifyOptions: Parameters<typeof jwtVerify>[2];

  constructor() {
    this.encodedKey = this.initializeKey();
    this.verifyOptions = this.buildVerifyOptions();
  }

  private initializeKey(): Uint8Array {
    const secret = SESSION_SECRET;
    if (!secret) {
      throw new Error("SESSION_SECRET is not defined");
    }
    if (secret.length < MIN_HS256_KEY_LENGTH) {
      throw new Error("Weak SESSION_SECRET: must be at least 32 characters");
    }
    return encoder.encode(secret);
  }

  private buildVerifyOptions(): Parameters<typeof jwtVerify>[2] {
    return {
      algorithms: [JWT_ALG_HS256],
      ...(SESSION_AUDIENCE ? { audience: SESSION_AUDIENCE } : {}),
      clockTolerance: CLOCK_TOLERANCE_SEC,
      ...(SESSION_ISSUER ? { issuer: SESSION_ISSUER } : {}),
    };
  }

  /**
   * Encodes session claims into a signed JWT.
   *
   * @param claims - The session payload to encode
   * @param expiresAtMs - Unix timestamp in milliseconds when the token expires
   * @returns Signed JWT token string
   * @throws Error if signing fails (e.g., invalid claims, crypto errors)
   */
  async encode(
    claims: SessionTokenClaims,
    expiresAtMs: number,
  ): Promise<Result<string, AppError>> {
    try {
      let signer = new SignJWT(claims satisfies JWTPayload)
        .setProtectedHeader({ alg: JWT_ALG_HS256, typ: JWT_TYP_JWT })
        .setIssuedAt()
        .setExpirationTime(new Date(expiresAtMs));

      if (SESSION_ISSUER) {
        signer = signer.setIssuer(SESSION_ISSUER);
      }
      if (SESSION_AUDIENCE) {
        signer = signer.setAudience(SESSION_AUDIENCE);
      }
      const token = await signer.sign(this.encodedKey);
      return Ok(token);
    } catch (error: unknown) {
      logger.error("JWT signing failed", {
        error: String(error),
      });

      return Err(
        makeUnexpectedError(error, {
          message: "jwt.sign.failed",
          metadata: { expiresAtMs },
        }),
      );
    }
  }

  /**
   * Decodes and verifies a JWT token.
   *
   * @param token - The JWT token string to decode
   * @returns `Ok(payload)` if verification succeeds, `Err(appError)` otherwise
   */
  async decode(token: string): Promise<Result<SessionTokenClaims, AppError>> {
    try {
      const { payload } = await jwtVerify<SessionTokenClaims>(
        token,
        this.encodedKey,
        this.verifyOptions,
      );

      const parsed = DecryptPayloadSchema.safeParse(payload);

      if (!parsed.success) {
        logger.warn("JWT payload validation failed", {
          errors: parsed.error.flatten().fieldErrors,
        });

        return Err(
          makeUnexpectedError(parsed.error, {
            message: "jwt.validation.failed",
            metadata: { token: token.slice(0, 10) },
          }),
        );
      }

      return Ok(parsed.data);
    } catch (error: unknown) {
      logger.warn("JWT verification failed", {
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
}

// Factory function
export function createSessionJwtAdapter(): SessionJwtAdapter {
  return new SessionJwtAdapter();
}
