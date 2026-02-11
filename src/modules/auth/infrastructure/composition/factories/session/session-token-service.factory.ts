import "server-only";
import type { SessionTokenServiceContract } from "@/modules/auth/application/session/contracts/session-token-service.contract";
import { sessionTokenCodecFactory } from "@/modules/auth/infrastructure/composition/factories/session/session-token-codec.factory";
import { SessionTokenService } from "@/modules/auth/infrastructure/session/services/session-token.service";
import type { LoggingClientContract } from "@/shared/telemetry/logging/core/logging-client.contract";

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
