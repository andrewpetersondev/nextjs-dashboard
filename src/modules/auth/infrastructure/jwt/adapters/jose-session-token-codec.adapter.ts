import "server-only";
import type { SessionTokenCodecContract } from "@/modules/auth/application/contracts/session-token-codec.contract";
import type { SessionTokenClaimsDto } from "@/modules/auth/application/dtos/session-token-claims.dto";
import { SessionTokenClaimsSchema } from "@/modules/auth/application/schemas/session-token-claims.schema";
import type { SessionJwtCryptoContract } from "@/modules/auth/infrastructure/jwt/contracts/session-jwt-crypto.contract";
import { jwtToSessionTokenClaimsDto } from "@/modules/auth/infrastructure/jwt/mappers/jwt-to-session-token-claims-dto.mapper";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeUnexpectedError } from "@/shared/errors/factories/app-error.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * Adapter for encoding and decoding session JWTs.
 *
 * Responsibility: Transforms Application layer DTOs to/from JWT tokens.
 * Delegates jose-specific mechanics to the strategy.
 */
export class JoseSessionTokenCodecAdapter implements SessionTokenCodecContract {
  private readonly logger: LoggingClientContract;
  private readonly jwtCrypto: SessionJwtCryptoContract;

  constructor(
    logger: LoggingClientContract,
    jwtCrypto: SessionJwtCryptoContract,
  ) {
    this.logger = logger;
    this.jwtCrypto = jwtCrypto;
  }

  /**
   * Decodes and verifies a JWT token, returning Application layer claims.
   */
  async decode(
    token: string,
  ): Promise<Result<SessionTokenClaimsDto, AppError>> {
    const jwtCryptoResult = await this.jwtCrypto.verify(token);

    if (!jwtCryptoResult.ok) {
      return Err(jwtCryptoResult.error);
    }

    const parsed = SessionTokenClaimsSchema.safeParse(jwtCryptoResult.value);

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

    return Ok(jwtToSessionTokenClaimsDto(parsed.data));
  }

  /**
   * Encodes session claims into a signed JWT.
   */
  async encode(
    claims: SessionTokenClaimsDto,
  ): Promise<Result<string, AppError>> {
    const jwtClaims = {
      exp: claims.exp,
      iat: claims.iat,
      role: claims.role,
      sub: claims.sub,
    };

    return await this.jwtCrypto.sign(jwtClaims);
  }
}
