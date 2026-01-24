import "server-only";
import type { SessionTokenServiceContract } from "@/modules/auth/application/contracts/session-token-service.contract";
import { SessionTokenServiceAdapter } from "@/modules/auth/infrastructure/session-token/adapters/session-token-service.adapter";
import { sessionTokenCodecFactory } from "@/modules/auth/infrastructure/session-token/factories/session-token-codec.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

/**
 * Factory for the session token service.
 *
 * Returns the application-facing contract to avoid leaking implementation details.
 */
export function sessionTokenServiceFactory(
  logger: LoggingClientContract,
): SessionTokenServiceContract {
  const tokenCodec = sessionTokenCodecFactory(logger);
  return new SessionTokenServiceAdapter(tokenCodec);
}
