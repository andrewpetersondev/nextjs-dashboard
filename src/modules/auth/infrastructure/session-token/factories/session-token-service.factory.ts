import "server-only";
import type { SessionTokenServiceContract } from "@/modules/auth/application/contracts/session-token-service.contract";
import { sessionTokenCodecFactory } from "@/modules/auth/infrastructure/session-token/factories/session-token-codec.factory";
import { SessionTokenService } from "@/modules/auth/infrastructure/session-token/services/session-token.service";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

/**
 * Factory for creating the session token service.
 *
 * @param logger - The logging client.
 * @returns An implementation of the {@link SessionTokenServiceContract}.
 */
export function sessionTokenServiceFactory(
  logger: LoggingClientContract,
): SessionTokenServiceContract {
  const tokenCodec = sessionTokenCodecFactory(logger);
  return new SessionTokenService(tokenCodec);
}
