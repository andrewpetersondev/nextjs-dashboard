import "server-only";
import type { SessionTokenCodecContract } from "@/modules/auth/application/contracts/session-token-codec.contract";
import type { SessionTokenClaimsDto } from "@/modules/auth/application/dtos/session-token-claims.dto";
import type { SessionJwtCryptoStrategy } from "@/modules/auth/infrastructure/session-token/strategies/session-jwt-crypto.strategy";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * Adapter for encoding and decoding session JWTs.
 *
 * Responsibility: Transforms Application layer DTOs to/from JWT tokens.
 * Delegates jose-specific mechanics to the strategy.
 *
 * @implements {SessionTokenCodecContract}
 */
export class SessionTokenCodecAdapter implements SessionTokenCodecContract {
  private readonly jwtCrypto: SessionJwtCryptoStrategy;

  /**
   * Initializes the session token codec adapter.
   *
   * @param jwtCrypto - The strategy for JWT cryptography operations.
   */
  constructor(jwtCrypto: SessionJwtCryptoStrategy) {
    this.jwtCrypto = jwtCrypto;
  }

  /**
   * Decodes and verifies a JWT token, returning Application layer claims.
   *
   * @param token - The JWT token to decode.
   * @returns A promise resolving to a {@link Result} containing the decoded claims or an {@link AppError}.
   */
  async decode(token: string): Promise<Result<unknown, AppError>> {
    const jwtCryptoResult = await this.jwtCrypto.verify(token);

    if (!jwtCryptoResult.ok) {
      return Err(jwtCryptoResult.error);
    }

    return Ok(jwtCryptoResult.value);
  }

  /**
   * Encodes session claims into a signed JWT.
   *
   * @param claims - The session claims to encode.
   * @returns A promise resolving to a {@link Result} containing the signed JWT string or an {@link AppError}.
   */
  async encode(
    claims: SessionTokenClaimsDto,
  ): Promise<Result<string, AppError>> {
    const jwtClaims = {
      exp: claims.exp,
      iat: claims.iat,
      jti: claims.jti,
      nbf: claims.nbf,
      role: claims.role,
      sid: claims.sid,
      sub: claims.sub,
    };

    return await this.jwtCrypto.sign(jwtClaims);
  }
}
