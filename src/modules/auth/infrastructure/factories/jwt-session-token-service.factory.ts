import "server-only";

import { JwtSessionTokenServiceAdapter } from "@/modules/auth/infrastructure/adapters/jwt-session-token-service.adapter";
import { createJoseSessionTokenCodecAdapter } from "@/modules/auth/infrastructure/factories/jose-session-token-codec.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

/**
 * Factory for JwtSessionTokenServiceAdapter.
 */
export function createJwtSessionTokenServiceAdapter(
  logger: LoggingClientContract,
): JwtSessionTokenServiceAdapter {
  const codec = createJoseSessionTokenCodecAdapter(logger);
  return new JwtSessionTokenServiceAdapter(codec);
}
