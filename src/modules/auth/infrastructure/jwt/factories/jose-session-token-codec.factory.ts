import "server-only";
import { JoseSessionTokenCodecAdapter } from "@/modules/auth/infrastructure/jwt/adapters/jose-session-token-codec.adapter";
import { JoseSessionJwtCryptoService } from "@/modules/auth/infrastructure/jwt/services/jose-session-jwt-crypto.service";
import {
  SESSION_AUDIENCE,
  SESSION_ISSUER,
  SESSION_SECRET,
} from "@/server/config/env-server";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

/**
 * Factory for JoseSessionTokenCodecAdapter with its jose JWT crypto implementation.
 */
export function createJoseSessionTokenCodecAdapter(
  logger: LoggingClientContract,
): JoseSessionTokenCodecAdapter {
  if (!SESSION_SECRET) {
    throw new Error("SESSION_SECRET is not defined");
  }

  const jwtCrypto = new JoseSessionJwtCryptoService(
    logger,
    SESSION_SECRET,
    SESSION_ISSUER,
    SESSION_AUDIENCE,
  );

  return new JoseSessionTokenCodecAdapter(logger, jwtCrypto);
}
