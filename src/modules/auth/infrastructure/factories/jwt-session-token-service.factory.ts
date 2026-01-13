import "server-only";

import { JwtSessionTokenServiceAdapter } from "@/modules/auth/infrastructure/adapters/jwt-session-token-service.adapter";
import { makeJoseSessionTokenCodecAdapter } from "@/modules/auth/infrastructure/factories/jose-session-token-codec.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

/**
 * Factory for JwtSessionTokenServiceAdapter.
 */
export function makeJwtSessionTokenServiceAdapter(
  logger: LoggingClientContract,
): JwtSessionTokenServiceAdapter {
  const codec = makeJoseSessionTokenCodecAdapter(logger);
  return new JwtSessionTokenServiceAdapter(codec);
}
