import "server-only";
import type { SessionTokenCodecContract } from "@/modules/auth/application/contracts/session-token-codec.contract";
import { SessionTokenCodecAdapter } from "@/modules/auth/infrastructure/session-token/adapters/session-token-codec.adapter";
import { JoseSessionJwtCryptoService } from "@/modules/auth/infrastructure/session-token/services/jose-session-jwt-crypto.service";
import {
  SESSION_AUDIENCE,
  SESSION_ISSUER,
  SESSION_SECRET,
} from "@/server/config/env-server";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

/**
 * Factory for the session token codec.
 *
 * Returns the application-facing contract to avoid leaking implementation details.
 */
export function sessionTokenCodecFactory(
  logger: LoggingClientContract,
): SessionTokenCodecContract {
  if (!SESSION_SECRET) {
    throw new Error("SESSION_SECRET is not defined");
  }

  const jwtCrypto = new JoseSessionJwtCryptoService(
    logger,
    SESSION_SECRET,
    SESSION_ISSUER,
    SESSION_AUDIENCE,
  );

  return new SessionTokenCodecAdapter(logger, jwtCrypto);
}
