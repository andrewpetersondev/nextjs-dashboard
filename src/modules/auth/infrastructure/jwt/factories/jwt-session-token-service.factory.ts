import "server-only";
import type { SessionTokenServiceContract } from "@/modules/auth/application/contracts/session-token-service.contract";
import { JwtSessionTokenServiceAdapter } from "@/modules/auth/infrastructure/jwt/adapters/jwt-session-token-service.adapter";
import { createSessionTokenCodec } from "@/modules/auth/infrastructure/jwt/factories/jose-session-token-codec.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

/**
 * Factory for the session token service.
 *
 * Returns the application-facing contract to avoid leaking implementation details.
 */
export function createSessionTokenService(
  logger: LoggingClientContract,
): SessionTokenServiceContract {
  const tokenCodec = createSessionTokenCodec(logger);
  return new JwtSessionTokenServiceAdapter(tokenCodec);
}
